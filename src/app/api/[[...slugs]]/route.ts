import { redis } from "@/lib/redis";
import { Elysia } from "elysia";
import { nanoid } from "nanoid";
import { authMiddleware } from "./auth";
import z from "zod";
import { Message, realtime } from "@/lib/realtime";

const ROOM_TTL_SECONDS = 60 * 10; // 10 minutes

const rooms = new Elysia({ prefix: "/room" })
  .post(
    "/create",
    async ({ body }) => {
      const { created_by } = body;
      const room_id = nanoid();

      await redis.hset(`meta:${room_id}`, {
        connected: [],
        created_at: Date.now(),
        created_by: created_by,
      });

      // self destruct
      await redis.expire(`meta:${room_id}`, ROOM_TTL_SECONDS);

      return { room_id };
    },
    {
      body: z.object({
        created_by: z.string(),
      }),
    },
  )
  .use(authMiddleware)
  .get(
    "/ttl",
    async ({ auth }) => {
      const { room_id } = auth;
      const ttl = await redis.ttl(`meta:${room_id}`);

      return { ttl: ttl > 0 ? ttl : 0 };
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
    },
  )
  .delete(
    "/",
    async ({ auth }) => {
      const { room_id } = auth;

      await realtime
        .channel(room_id)
        .emit("chat.destroy", { is_destroyed: true });

      await Promise.all([
        redis.del(room_id),
        redis.del(`meta:${room_id}`),
        redis.del(`messages:${room_id}`),
      ]);
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
    },
  );

const messages = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ auth, body }) => {
      const { sender, text } = body;
      const { room_id, token, connected } = auth;

      const room_exists = await redis.exists(`meta:${room_id}`);

      if (!room_exists) {
        throw new Error("Room does not exist");
      }

      const message: Message = {
        id: nanoid(),
        sender,
        text,
        timestamp: Date.now(),
        room_id,
      };

      // add message to history
      await redis.rpush(`messages:${room_id}`, { ...message, token });

      await realtime.channel(room_id).emit("chat.message", message);

      // housekeeping
      const remaining_ttl = await redis.ttl(`meta:${room_id}`);
      await redis.expire(`messages:${room_id}`, remaining_ttl);
      await redis.expire(room_id, remaining_ttl);
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
      body: z.object({
        sender: z.string().max(100),
        text: z.string().max(1000),
      }),
    },
  )
  .get(
    "/",
    async ({ auth }) => {
      const { room_id } = auth;

      const messages = await redis.lrange<Message>(
        `messages:${room_id}`,
        0,
        -1,
      );

      return {
        messages: messages.map((m) => ({
          ...m,
          token: m.token === auth.token ? auth.token : undefined,
        })),
      };
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
    },
  );

const app = new Elysia({ prefix: "/api" }).use(rooms).use(messages);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;

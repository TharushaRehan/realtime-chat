import { redis } from "@/lib/redis";
import { Elysia, t } from "elysia";
import { nanoid } from "nanoid";

const ROOM_TTL_SECONDS = 60 * 10; // 10 minutes

const rooms = new Elysia({ prefix: "/room" }).post("/create", async () => {
  const room_id = nanoid();

  await redis.hset(`meta:${room_id}`, {
    connected: [],
    created_at: Date.now(),
  });

  // self destruct
  await redis.expire(`meta:${room_id}`, ROOM_TTL_SECONDS);

  return { room_id };
});

const app = new Elysia({ prefix: "/api" }).use(rooms);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;

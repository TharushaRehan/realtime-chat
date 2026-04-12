import Elysia from "elysia";
import { RoomService } from "./room.service";
import { createRoomSchema } from "@/schema/room";
import { authMiddleware } from "@/app/api/[[...slugs]]/auth";
import z from "zod";

export const RoomController = new Elysia({ prefix: "/room" })
  .post(
    "/create",
    async ({ body }) => {
      const { connected, created_at, created_by } = body;

      return RoomService.createRoom({
        connected,
        created_at,
        created_by,
      });
    },
    {
      body: createRoomSchema,
      detail: {
        summary: "Create a new chat room",
        tags: ["Room"],
      },
    },
  )
  .use(authMiddleware)
  .get(
    "/ttl",
    async ({ auth }) => {
      const { room_id } = auth;
      return RoomService.getRoomTTL(room_id);
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
      detail: {
        summary: "Get the remaining time-to-live (TTL) for a chat room",
        tags: ["Room"],
      },
    },
  )
  .delete(
    "/",
    async ({ auth }) => {
      const { room_id } = auth;
      await RoomService.deleteRoom(room_id);
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
      detail: {
        summary: "Delete a chat room",
        tags: ["Room"],
      },
    },
  );

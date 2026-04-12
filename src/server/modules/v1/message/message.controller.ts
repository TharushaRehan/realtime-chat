import Elysia from "elysia";
import { authMiddleware } from "@/app/api/[[...slugs]]/auth";
import z from "zod";
import { createMessageSchema } from "@/schema/message";
import { MessageService } from "./message.service";

export const MessageController = new Elysia({ prefix: "/messages" })
  .use(authMiddleware)
  .post(
    "/",
    async ({ auth, body }) => {
      const { sender, text } = body;
      const { room_id, token } = auth;

      await MessageService.sendMessage({
        sender,
        text,
        room_id,
        token,
      });
    },
    {
      query: z.object({
        room_id: z.string(),
      }),
      body: createMessageSchema,
      detail: {
        summary: "Send a message to a chat room",
        tags: ["Message"],
      },
    },
  )
  .get(
    "/",
    async ({ auth }) => {
      const { room_id, token } = auth;

      const messages = await MessageService.getMessages(room_id, token);

      return messages;
    },
    {
      detail: {
        summary: "Get messages for a chat room",
        tags: ["Message"],
      },
    },
  );

import { Elysia } from "elysia";
import z from "zod";
import { openapi } from "@elysiajs/openapi";
import { cors } from "@elysiajs/cors";
import { RoomModule } from "@/server/modules/v1/room/room.module";
import { MessageModule } from "@/server/modules/v1/message/message.module";

const app = new Elysia({ prefix: "/api" })
  .use(
    openapi({
      mapJsonSchema: {
        zod: z.toJSONSchema,
      },
      documentation: {
        info: {
          title: "Nym API",
          description: "API documentation for Nym application",
          version: "1.0.0",
        },
      },
    }),
  )
  .use(cors())
  .use(RoomModule)
  .use(MessageModule);

export type App = typeof app;

export const GET = app.fetch;
export const POST = app.fetch;
export const DELETE = app.fetch;
export const PATCH = app.fetch;

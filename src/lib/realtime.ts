import { InferRealtimeEvents, Realtime } from "@upstash/realtime";
import z from "zod";
import { redis } from "./redis";
import { createMessageSchema } from "@/schema/message";

const schema = {
  chat: {
    message: createMessageSchema,
    destroy: z.object({
      is_destroyed: z.literal(true),
    }),
  },
};

export const realtime = new Realtime({
  schema,
  redis,
});

export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

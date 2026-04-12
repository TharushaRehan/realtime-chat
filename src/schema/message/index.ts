import z from "zod";

export const messageSchema = z.object({
  id: z.string(),
  sender: z.string(),
  text: z.string(),
  timestamp: z.number(),
  room_id: z.string(),
  token: z.string().optional(),
});

export const createMessageSchema = z.object({
  sender: z.string(),
  text: z.string(),
  room_id: z.string(),
  token: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;
export type CreateMessage = z.infer<typeof createMessageSchema>;

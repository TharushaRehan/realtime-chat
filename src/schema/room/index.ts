import z from "zod";

export const createRoomSchema = z.object({
  connected: z.array(z.string()),
  created_at: z.number(),
  created_by: z.string(),
});

export type CreateRoom = z.infer<typeof createRoomSchema>;

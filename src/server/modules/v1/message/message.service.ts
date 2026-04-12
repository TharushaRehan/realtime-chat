import { realtime } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { CreateMessage, Message } from "@/schema/message";
import { nanoid } from "nanoid";

export const MessageService = {
  sendMessage: async (data: CreateMessage): Promise<void> => {
    const { sender, text, room_id, token } = data;

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
      token,
    };

    // add message to history
    await redis.rpush(`messages:${room_id}`, { ...message, token });

    await realtime.channel(room_id).emit("chat.message", message);

    // housekeeping
    const remaining_ttl = await redis.ttl(`meta:${room_id}`);
    await redis.expire(`messages:${room_id}`, remaining_ttl);
    await redis.expire(room_id, remaining_ttl);
  },
  getMessages: async (
    room_id: string,
    token: string,
  ): Promise<{ messages: Message[] }> => {
    const messages = await redis.lrange<Message>(`messages:${room_id}`, 0, -1);

    return {
      messages: messages.map((m) => ({
        ...m,
        token: m.token === token ? token : undefined,
      })),
    };
  },
};

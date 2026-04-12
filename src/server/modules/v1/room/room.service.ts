import { FREE_ROOM_TTL_SECONDS } from "@/constants";
import { realtime } from "@/lib/realtime";
import { redis } from "@/lib/redis";
import { CreateRoom } from "@/schema/room";
import { nanoid } from "nanoid";

export const RoomService = {
  createRoom: async (data: CreateRoom): Promise<{ room_id: string }> => {
    let room_id = nanoid();

    const room_exists = await redis.exists(`meta:${room_id}`);

    if (room_exists) {
      room_id = nanoid();
    }

    const t = redis.multi();
    t.hset(`meta:${room_id}`, {
      connected: data.connected,
      created_at: data.created_at,
      created_by: data.created_by,
    });
    t.expire(`meta:${room_id}`, FREE_ROOM_TTL_SECONDS);
    await t.exec();

    return { room_id };
  },
  getRoomTTL: async (room_id: string): Promise<{ ttl: number }> => {
    const ttl = await redis.ttl(`meta:${room_id}`);
    return { ttl: ttl > 0 ? ttl : 0 };
  },
  deleteRoom: async (room_id: string): Promise<void> => {
    await realtime
      .channel(room_id)
      .emit("chat.destroy", { is_destroyed: true });

    await Promise.all([
      redis.del(room_id),
      redis.del(`meta:${room_id}`),
      redis.del(`messages:${room_id}`),
    ]);
  },
};

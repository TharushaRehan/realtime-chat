import { redis } from "@/lib/redis";
import Elysia from "elysia";

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authMiddleware = new Elysia({
  name: "auth",
})
  .error({ AuthError })
  .onError(({ code, set }) => {
    if (code === "AuthError") {
      set.status = 401;
      return {
        error: "Unauthorized",
      };
    }
  })
  .derive({ as: "scoped" }, async ({ query, cookie }) => {
    const room_id = query.room_id;
    const token = cookie["x-auth-token"].value as string | undefined;

    if (!room_id || !token) {
      throw new AuthError("Missing room_id or token");
    }

    const connected = await redis.hget<string[]>(
      `meta:${room_id}`,
      "connected",
    );

    if (!connected?.includes(token)) {
      throw new AuthError("Invalid token for this room");
    }

    return {
      auth: {
        room_id,
        token,
        connected, // for potential future use, like showing who is connected in the room or handling disconnections
      },
    };
  });

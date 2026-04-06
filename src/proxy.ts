import { NextRequest, NextResponse } from "next/server";
import { redis } from "./lib/redis";
import { nanoid } from "nanoid";

export const proxy = async (req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  const room_id_match = pathname.match(/^\/room\/([^/]+)$/);

  if (!room_id_match) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const room_id = room_id_match[1];

  const meta = await redis.hgetall<{ connected: string[]; created_at: number }>(
    `meta:${room_id}`,
  );

  if (!meta) {
    return NextResponse.redirect(new URL("/?error=room_not_found", req.url));
  }

  const existing_tokens = req.cookies.get("x-auth-token")?.value;

  // USER is allowed to JOIN room
  if (existing_tokens && meta.connected.includes(existing_tokens)) {
    return NextResponse.next();
  }

  // USER is not allowed to JOIN room
  if (meta.connected.length >= 2) {
    return NextResponse.redirect(new URL("/?error=room_full", req.url));
  }

  const response = NextResponse.next();

  const token = nanoid();

  response.cookies.set("x-auth-token", token, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  await redis.hset(`meta:${room_id}`, {
    connected: [...meta.connected, token],
  });

  return response;
};

// run proxy when user visits /room/:room_id and all subpaths, so that we can handle the self destruct timer and other room related logic in the proxy instead of the client
export const config = {
  matcher: "/room/:path*",
};

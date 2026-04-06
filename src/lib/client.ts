import { treaty } from "@elysiajs/eden";
import type { App } from "../app/api/[[...slugs]]/route";

export const client = treaty<App>("realtime-chat-omega-eight.vercel.app").api;

import Elysia from "elysia";
import { MessageController } from "./message.controller";

export const MessageModule = new Elysia().use(MessageController);

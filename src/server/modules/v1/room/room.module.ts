import Elysia from "elysia";
import { RoomController } from "./room.controller";

export const RoomModule = new Elysia().use(RoomController);

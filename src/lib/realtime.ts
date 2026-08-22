import { Server as IOServer } from "socket.io";

let io: IOServer | null = null;

export function getIO(): IOServer | null {
  return io;
}
export function setIO(server: IOServer) {
  io = server;
}
export function emit(event: string, data: unknown) {
  io?.emit(event, data);
}

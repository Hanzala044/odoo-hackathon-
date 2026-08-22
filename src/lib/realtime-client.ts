"use client";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
export function getSocket(): Socket {
  if (!socket) socket = io({ path: "/api/socket" });
  return socket;
}
export function useRealtime(event: string, handler: (data: unknown) => void) {
  useEffect(() => {
    const s = getSocket();
    s.on(event, handler);
    return () => { s.off(event, handler); };
  }, [event, handler]);
}

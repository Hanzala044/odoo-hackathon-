"use client";
import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/realtime-client";

export function RealtimeRefresher() {
  const router = useRouter();
  useRealtime("leaves:update", () => router.refresh());
  useRealtime("attendance:update", () => router.refresh());
  return null;
}

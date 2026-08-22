"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import type { ActionState } from "./auth";

function todayUtcMidnight() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function checkInAction(): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const date = todayUtcMidnight();
  const existing = await prisma.attendance.findUnique({
    where: { userId_date: { userId: session.id, date } },
  });
  if (existing?.checkIn) return { error: "You have already checked in today." };

  await prisma.attendance.upsert({
    where: { userId_date: { userId: session.id, date } },
    create: { userId: session.id, date, checkIn: new Date(), status: "PRESENT", breaks: [], breakStart: null, totalMinutes: null },
    update: { checkIn: new Date(), status: "PRESENT", breaks: [], breakStart: null, totalMinutes: null },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/attendance");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("attendance:update", { userId: session.id, type: "checkIn" }); } catch {}
  return null;
}

export async function checkOutAction(): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const date = todayUtcMidnight();
  const record = await prisma.attendance.findUnique({
    where: { userId_date: { userId: session.id, date } },
  });
  if (!record?.checkIn) return { error: "You need to check in first." };
  if (record.checkOut) return { error: "You have already checked out today." };

  const now = new Date();
  // if on break, close break first
  let breaks: Array<{ start: string; end: string | null }> = Array.isArray(record.breaks) ? (record.breaks as any) : [];
  let breakStart: Date | null = record.breakStart as Date | null;
  if (breakStart) {
    breaks = [...breaks, { start: new Date(breakStart).toISOString(), end: now.toISOString() }];
    breakStart = null;
  }
  const breakMs = breaks.reduce((acc: number, b: any) => {
    if (!b.start || !b.end) return acc;
    return acc + (new Date(b.end).getTime() - new Date(b.start).getTime());
  }, 0);
  const workMs = now.getTime() - new Date(record.checkIn).getTime() - breakMs;
  const workHours = workMs / (1000 * 60 * 60);
  const totalMinutes = Math.max(0, Math.floor(workMs / 60000));

  await prisma.attendance.update({
    where: { id: record.id },
    data: {
      checkOut: now,
      breaks: breaks as any,
      breakStart: null,
      totalMinutes,
      status: workHours < 4 ? "HALF_DAY" : "PRESENT",
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/attendance");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("attendance:update", { userId: session.id, type: "checkOut" }); } catch {}
  return null;
}

export async function startBreakAction(): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  const date = todayUtcMidnight();
  const record = await prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date } } });
  if (!record?.checkIn) return { error: "You need to check in first." };
  if (record.checkOut) return { error: "Day already completed." };
  if (record.breakStart) return { error: "Already on break." };
  await prisma.attendance.update({ where: { id: record.id }, data: { breakStart: new Date() } });
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("attendance:update", { userId: session.id, type: "breakStart" }); } catch {}
  return null;
}

export async function endBreakAction(): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };
  const date = todayUtcMidnight();
  const record = await prisma.attendance.findUnique({ where: { userId_date: { userId: session.id, date } } });
  if (!record?.breakStart) return { error: "Not on break." };
  const breaks: Array<{ start: string; end: string | null }> = Array.isArray(record.breaks) ? (record.breaks as any) : [];
  const now = new Date();
  const updatedBreaks = [...breaks, { start: new Date(record.breakStart as Date).toISOString(), end: now.toISOString() }];
  await prisma.attendance.update({ where: { id: record.id }, data: { breaks: updatedBreaks as any, breakStart: null } });
  revalidatePath("/attendance");
  revalidatePath("/dashboard");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("attendance:update", { userId: session.id, type: "breakEnd" }); } catch {}
  return null;
}

export async function markAttendanceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };

  const userId = String(formData.get("userId") || "");
  const status = String(formData.get("status") || "PRESENT");
  const dateStr = String(formData.get("date") || "");
  if (!userId || !dateStr) return { error: "Employee and date are required." };
  if (!["PRESENT", "ABSENT", "HALF_DAY", "LEAVE"].includes(status)) return { error: "Invalid status." };
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (!target || target.companyId !== session.companyId) return { error: "Forbidden." };

  const date = new Date(`${dateStr}T00:00:00.000Z`);
  await prisma.attendance.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, status },
    update: { status },
  });

  revalidatePath("/admin/attendance");
  return null;
}

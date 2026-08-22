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
    create: { userId: session.id, date, checkIn: new Date(), status: "PRESENT" },
    update: { checkIn: new Date(), status: "PRESENT" },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
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

  const workHours = (Date.now() - new Date(record.checkIn).getTime()) / (1000 * 60 * 60);
  await prisma.attendance.update({
    where: { id: record.id },
    data: {
      checkOut: new Date(),
      status: workHours < 4 ? "HALF_DAY" : "PRESENT",
    },
  });

  revalidatePath("/attendance");
  revalidatePath("/dashboard");
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

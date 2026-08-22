"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { leaveApplySchema, leaveReviewSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function applyLeaveAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const parsed = leaveApplySchema.safeParse({
    type: formData.get("type"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    remarks: formData.get("remarks"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const start = new Date(`${parsed.data.startDate}T00:00:00.000Z`);
  const end = new Date(`${parsed.data.endDate}T00:00:00.000Z`);

  // prevent overlapping pending/approved requests
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      userId: session.id,
      status: { in: ["PENDING", "APPROVED"] },
      startDate: { lte: end },
      endDate: { gte: start },
    },
  });
  if (overlap) return { error: "You already have a request overlapping those dates." };

  await prisma.leaveRequest.create({
    data: {
      userId: session.id,
      type: parsed.data.type,
      startDate: start,
      endDate: end,
      remarks: parsed.data.remarks || null,
    },
  });

  revalidatePath("/leaves");
  revalidatePath("/admin/leaves");
  revalidatePath("/dashboard");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("leaves:update", { userId: session.id }); } catch {}
  return { success: "Leave request submitted." };
}

export async function reviewLeaveAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };

  const parsed = leaveReviewSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    adminComment: formData.get("adminComment"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const target = await prisma.leaveRequest.findUnique({
    where: { id: parsed.data.id },
    select: { user: { select: { companyId: true } } },
  });
  if (!target || target.user.companyId !== session.companyId) return { error: "Forbidden." };

  await prisma.leaveRequest.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      adminComment: parsed.data.adminComment || null,
      reviewedBy: session.id,
    },
  });

  revalidatePath("/admin/leaves");
  revalidatePath("/leaves");
  revalidatePath("/dashboard");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("leaves:update", { id: parsed.data.id, status: parsed.data.status }); } catch {}
  return { success: `Request ${parsed.data.status === "APPROVED" ? "approved" : "rejected"}.` };
}

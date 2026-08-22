"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { payrollSchema, profileUpdateSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

export async function updateOwnProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const parsed = profileUpdateSchema.safeParse({
    phone: formData.get("phone"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  await prisma.profile.update({
    where: { userId: session.id },
    data: {
      phone: parsed.data.phone ?? null,
      address: parsed.data.address ?? null,
    },
  });

  revalidatePath("/profile");
  return null;
}

export async function adminUpdateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };

  const userId = String(formData.get("userId") || "");
  if (!userId) return { error: "Missing employee." };

  const parsed = profileUpdateSchema.safeParse({
    phone: formData.get("phone"),
    address: formData.get("address"),
    jobTitle: formData.get("jobTitle"),
    department: formData.get("department"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (!target || target.companyId !== session.companyId) return { error: "Forbidden." };

  try {
    await prisma.profile.update({
      where: { userId },
      data: {
        phone: parsed.data.phone ?? null,
        address: parsed.data.address ?? null,
        jobTitle: parsed.data.jobTitle ?? null,
        department: parsed.data.department ?? null,
      },
    });
  } catch {
    return { error: "Profile not found for this employee." };
  }

  revalidatePath(`/admin/employees/${userId}`);
  return null;
}

export async function updatePayrollAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };

  const parsed = payrollSchema.safeParse({
    userId: formData.get("userId"),
    salaryBase: formData.get("salaryBase"),
    salaryBonus: formData.get("salaryBonus"),
  });
  if (!parsed.success) return { error: "Salary values must be non-negative numbers." };

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId }, select: { companyId: true } });
  if (!target || target.companyId !== session.companyId) return { error: "Forbidden." };

  try {
    await prisma.profile.update({
      where: { userId: parsed.data.userId },
      data: {
        salaryBase: parsed.data.salaryBase,
        salaryBonus: parsed.data.salaryBonus,
      },
    });
  } catch {
    return { error: "Profile not found for this employee." };
  }

  revalidatePath(`/admin/employees/${parsed.data.userId}`);
  return null;
}

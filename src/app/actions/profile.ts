"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import { payrollSchema, profileSelfUpdateSchema, profileUpdateSchema } from "@/lib/validations";
import type { ActionState } from "./auth";

function parseDateOrNull(v: string | null | undefined): Date | null {
  if (!v || v === "") return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export async function updateOwnProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session) return { error: "Not signed in." };

  const parsed = profileSelfUpdateSchema.safeParse({
    phone: formData.get("phone"),
    address: formData.get("address"),
    personalEmail: formData.get("personalEmail"),
    dateOfBirth: formData.get("dateOfBirth"),
    nationality: formData.get("nationality"),
    gender: formData.get("gender"),
    maritalStatus: formData.get("maritalStatus"),
    location: formData.get("location"),
    bankAccount: formData.get("bankAccount"),
    bankName: formData.get("bankName"),
    ifscCode: formData.get("ifscCode"),
    panNo: formData.get("panNo"),
    uanNo: formData.get("uanNo"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let profilePic: string | undefined;
  const picFile = formData.get("profilePic");
  if (picFile instanceof File && picFile.size > 0) {
    if (picFile.size > 4 * 1024 * 1024) return { error: "Profile picture must be under 4MB." };
    const buf = Buffer.from(await picFile.arrayBuffer());
    profilePic = `data:${picFile.type};base64,${buf.toString("base64")}`;
  }

  const data: Record<string, unknown> = {
    phone: parsed.data.phone?.trim() || null,
    address: parsed.data.address?.trim() || null,
    personalEmail: parsed.data.personalEmail?.trim() || null,
    nationality: parsed.data.nationality?.trim() || null,
    gender: parsed.data.gender?.trim() || null,
    maritalStatus: parsed.data.maritalStatus?.trim() || null,
    location: parsed.data.location?.trim() || null,
    bankAccount: parsed.data.bankAccount?.trim() || null,
    bankName: parsed.data.bankName?.trim() || null,
    ifscCode: parsed.data.ifscCode?.trim() || null,
    panNo: parsed.data.panNo?.trim() || null,
    uanNo: parsed.data.uanNo?.trim() || null,
  };
  const dob = parseDateOrNull(parsed.data.dateOfBirth as string | null);
  if (parsed.data.dateOfBirth) data.dateOfBirth = dob;
  if (profilePic !== undefined) data.profilePic = profilePic;
  // allow clearing picture if requested
  if (formData.get("clearPic") === "1") data.profilePic = null;

  try {
    await prisma.profile.update({
      where: { userId: session.id },
      data,
    });
  } catch {
    return { error: "Profile not found." };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("profile:update", { userId: session.id }); } catch {}
  return { success: "Profile updated." };
}

export async function adminUpdateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };

  const userId = String(formData.get("userId") || "");
  if (!userId) return { error: "Missing employee." };

  const parsed = profileUpdateSchema.safeParse({
    phone: formData.get("phone"),
    address: formData.get("address"),
    personalEmail: formData.get("personalEmail"),
    dateOfBirth: formData.get("dateOfBirth"),
    nationality: formData.get("nationality"),
    gender: formData.get("gender"),
    maritalStatus: formData.get("maritalStatus"),
    location: formData.get("location"),
    bankAccount: formData.get("bankAccount"),
    bankName: formData.get("bankName"),
    ifscCode: formData.get("ifscCode"),
    panNo: formData.get("panNo"),
    uanNo: formData.get("uanNo"),
    jobTitle: formData.get("jobTitle"),
    department: formData.get("department"),
    manager: formData.get("manager"),
    empCode: formData.get("empCode"),
    monthlyWage: formData.get("monthlyWage"),
    workingDaysPerWeek: formData.get("workingDaysPerWeek"),
    breakHours: formData.get("breakHours"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { companyId: true } });
  if (!target || target.companyId !== session.companyId) return { error: "Forbidden." };

  let profilePic: string | undefined;
  const picFile = formData.get("profilePic");
  if (picFile instanceof File && picFile.size > 0) {
    if (picFile.size > 4 * 1024 * 1024) return { error: "Profile picture must be under 4MB." };
    const buf = Buffer.from(await picFile.arrayBuffer());
    profilePic = `data:${picFile.type};base64,${buf.toString("base64")}`;
  }

  const dob = parseDateOrNull(parsed.data.dateOfBirth as string | null);
  const doj = parseDateOrNull(String(formData.get("dateOfJoining") || ""));

  const data: Record<string, unknown> = {
    phone: parsed.data.phone?.trim() || null,
    address: parsed.data.address?.trim() || null,
    personalEmail: (parsed.data.personalEmail as string | null)?.trim() || null,
    nationality: parsed.data.nationality?.trim() || null,
    gender: parsed.data.gender?.trim() || null,
    maritalStatus: parsed.data.maritalStatus?.trim() || null,
    location: parsed.data.location?.trim() || null,
    bankAccount: parsed.data.bankAccount?.trim() || null,
    bankName: parsed.data.bankName?.trim() || null,
    ifscCode: parsed.data.ifscCode?.trim() || null,
    panNo: parsed.data.panNo?.trim() || null,
    uanNo: parsed.data.uanNo?.trim() || null,
    jobTitle: parsed.data.jobTitle?.trim() || null,
    department: parsed.data.department?.trim() || null,
    manager: (parsed.data.manager as string | null)?.trim() || null,
    empCode: (parsed.data.empCode as string | null)?.trim() || null,
  };
  if (dob !== undefined) data.dateOfBirth = dob;
  if (doj) data.dateOfJoining = doj;
  if (parsed.data.monthlyWage != null) data.monthlyWage = parsed.data.monthlyWage;
  if (parsed.data.workingDaysPerWeek != null) data.workingDaysPerWeek = parsed.data.workingDaysPerWeek;
  if (parsed.data.breakHours != null) data.breakHours = parsed.data.breakHours;
  if (profilePic !== undefined) data.profilePic = profilePic;
  if (formData.get("clearPic") === "1") data.profilePic = null;

  try {
    await prisma.profile.update({
      where: { userId },
      data,
    });
  } catch {
    return { error: "Profile not found for this employee." };
  }

  revalidatePath(`/admin/employees/${userId}`);
  revalidatePath(`/admin/employees`);
  revalidatePath(`/admin/dashboard`);
  revalidatePath(`/employees/${userId}`);
  revalidatePath(`/dashboard`);
  return { success: "Profile updated." };
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
  return { success: "Salary updated." };
}

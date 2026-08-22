"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";
import { buildLoginId, generatePassword } from "@/lib/loginId";

export type ActionState = { error?: string; success?: string; generatedId?: string; generatedPassword?: string } | null;

async function nextLoginId(companyId: string, companyName: string, firstName: string, lastName: string): Promise<string> {
  const year = new Date().getFullYear();
  const counter = await prisma.joinCounter.upsert({
    where: { companyId_year: { companyId, year } },
    update: { count: { increment: 1 } },
    create: { companyId, year, count: 1 },
  });
  // upsert with increment returns previous; if created count=1 else incremented — need fresh value
  const fresh = await prisma.joinCounter.findUnique({ where: { companyId_year: { companyId, year } } });
  const serial = fresh!.count;
  return buildLoginId(companyName, firstName, lastName, year, serial);
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter Login ID/Email and password." };
  const user = await verifyCredentials(parsed.data.identifier, parsed.data.password);
  if (!user) return { error: "Invalid Login ID/Email or password." };
  await createSession({ id: user.id, email: user.email, role: user.role });
  if (user.mustChangePassword) redirect("/change-password");
  redirect("/dashboard");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    companyName: formData.get("companyName"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { companyName, name, email, phone, password } = parsed.data;
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(" ") || parts[0];

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already registered." };

  const company = await prisma.company.create({ data: { name: companyName } });
  const loginId = await nextLoginId(company.id, companyName, firstName, lastName);

  const user = await prisma.user.create({
    data: {
      employeeId: loginId,
      email,
      password: await bcrypt.hash(password, 10),
      role: "ADMIN",
      companyId: company.id,
      profile: { create: { firstName, lastName, phone: phone || null, dateOfJoining: new Date() } },
    },
  });
  await createSession({ id: user.id, email: user.email, role: user.role });
  redirect("/dashboard");
}

// HR/Admin creates employee -> auto ID + auto password
export async function createEmployeeAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireAdmin } = await import("@/lib/auth");
  const session = await requireAdmin();
  const me = await prisma.user.findUnique({ where: { id: session.id } });
  if (!me?.companyId) return { error: "No company found." };
  const company = await prisma.company.findUnique({ where: { id: me.companyId } });

  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  if (!firstName || !lastName || !email) return { error: "First name, last name and email required." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Email already exists." };

  const loginId = await nextLoginId(me.companyId, company!.name, firstName, lastName);
  const rawPassword = generatePassword(10);

  await prisma.user.create({
    data: {
      employeeId: loginId,
      email,
      password: await bcrypt.hash(rawPassword, 10),
      role: "EMPLOYEE",
      mustChangePassword: true,
      companyId: me.companyId,
      profile: { create: { firstName, lastName, phone: phone || null, dateOfJoining: new Date() } },
    },
  });
  return { success: `Employee created. Login ID: ${loginId} | Password: ${rawPassword}`, generatedId: loginId, generatedPassword: rawPassword };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { requireUser } = await import("@/lib/auth");
  const session = await requireUser();
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  if (next !== confirm) return { error: "Passwords do not match." };
  const user = await prisma.user.findUnique({ where: { id: session.id } });
  if (!user || !(await bcrypt.compare(current, user.password))) return { error: "Current password incorrect." };
  await prisma.user.update({ where: { id: session.id }, data: { password: await bcrypt.hash(next, 10), mustChangePassword: false } });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

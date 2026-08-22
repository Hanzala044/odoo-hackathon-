"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { loginSchema, registerSchema } from "@/lib/validations";

export type ActionState = { error?: string } | null;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Invalid email or password." };

  await createSession({ id: user.id, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    employeeId: formData.get("employeeId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid input.";
    return { error: msg === "Invalid input." ? "All fields are required (password min 8 chars)." : msg };
  }

  const { employeeId, firstName, lastName, email, password } = parsed.data;
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { employeeId }] },
  });
  if (existing) return { error: "A user with that email or employee ID already exists." };

  const user = await prisma.user.create({
    data: {
      employeeId,
      email,
      password: await bcrypt.hash(password, 10),
      role: "EMPLOYEE",
      profile: { create: { firstName, lastName } },
    },
  });

  await createSession({ id: user.id, email: user.email, role: user.role });
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

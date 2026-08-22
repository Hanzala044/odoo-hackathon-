"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, isAdmin } from "@/lib/auth";
import type { ActionState } from "./auth";

export async function updateCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !isAdmin(session.role)) return { error: "Forbidden." };
  if (!session.companyId) return { error: "No company found." };

  const name = String(formData.get("companyName") || "").trim();
  if (name && (name.length < 2 || name.length > 80)) return { error: "Company name must be 2-80 chars." };

  let logo: string | undefined = undefined;
  const logoFile = formData.get("logo");
  if (logoFile instanceof File && logoFile.size > 0) {
    if (logoFile.size > 4 * 1024 * 1024) return { error: "Logo must be under 4MB." };
    const buf = Buffer.from(await logoFile.arrayBuffer());
    logo = `data:${logoFile.type};base64,${buf.toString("base64")}`;
  }

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (logo !== undefined) data.logo = logo;
  // allow clearing? if no file and explicit clear flag
  if (formData.get("clearLogo") === "1") data.logo = null;

  if (Object.keys(data).length === 0) return { error: "Nothing to update." };

  await prisma.company.update({ where: { id: session.companyId }, data });
  revalidatePath("/dashboard");
  revalidatePath("/admin/dashboard");
  revalidatePath("/admin/employees");
  revalidatePath("/profile");
  try { (globalThis as unknown as { __io?: { emit: (e: string, d: unknown) => void } }).__io?.emit("company:update", { companyId: session.companyId }); } catch {}
  return { success: "Company updated." };
}

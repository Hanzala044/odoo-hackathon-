import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE_NAME,
  serializeSession,
  deserializeSessionToken,
  type SessionUser,
} from "@/lib/session";

export type { SessionUser };
export { SESSION_COOKIE_NAME };

const MAX_AGE = 60 * 60 * 24 * 7;

export async function createSession(user: SessionUser) {
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, await serializeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return deserializeSessionToken(token);
}

export function isAdmin(role?: string | null) {
  return role === "ADMIN" || role === "HR";
}

export async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (!isAdmin(session.role)) throw new Error("FORBIDDEN");
  return session;
}

export async function verifyCredentials(identifier: string, password: string) {
  const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { employeeId: identifier }] } });
  if (!user) return null;
  const bcrypt = await import("bcryptjs");
  if (!(await bcrypt.compare(password, user.password))) return null;
  return user;
}

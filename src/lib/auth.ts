import crypto from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "dayflow_session";
// Custom HMAC-signed cookie session secret (legacy env name was NEXTAUTH_SECRET — this project does not use NextAuth).
const SECRET = process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret";
const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  role: string;
};

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("base64url");
}

function serialize(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function deserialize(token: string): SessionUser | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return { id: data.id, email: data.email, role: data.role };
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE_NAME, serialize(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return deserialize(token);
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

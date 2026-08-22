// Session token serialization/verification shared by server code (src/lib/auth.ts)
// and the Edge-runtime middleware. Uses Web Crypto + pure-JS base64url so it runs
// in both the Node.js and Edge runtimes (no Node globals).

export const SESSION_COOKIE_NAME = "dayflow_session";

const MAX_AGE = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  role: string;
  companyId?: string | null;
  mustChangePassword?: boolean;
};

function getSecret(): string {
  // Legacy env name was NEXTAUTH_SECRET — this project does not use NextAuth; it's a custom HMAC-signed cookie session.
  return process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array<ArrayBuffer> {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function utf8Encode(s: string): Uint8Array<ArrayBuffer> {
  const src = new TextEncoder().encode(s);
  const bytes = new Uint8Array(new ArrayBuffer(src.length));
  bytes.set(src);
  return bytes;
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

async function hmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    utf8Encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function signPayload(payload: string): Promise<string> {
  const sig = await crypto.subtle.sign("HMAC", await hmacKey(), utf8Encode(payload));
  return bytesToBase64Url(new Uint8Array(sig));
}

export async function serializeSession(user: SessionUser): Promise<string> {
  const payload = bytesToBase64Url(utf8Encode(JSON.stringify({ ...user, exp: Date.now() + MAX_AGE * 1000 })));
  return `${payload}.${await signPayload(payload)}`;
}

export async function deserializeSessionToken(token: string): Promise<SessionUser | null> {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = await signPayload(payload);
  if (!timingSafeEqualStr(sig, expected)) return null;
  try {
    const data = JSON.parse(utf8Decode(base64UrlToBytes(payload)));
    if (!data.exp || data.exp < Date.now()) return null;
    return {
      id: data.id,
      email: data.email,
      role: data.role,
      companyId: data.companyId ?? null,
      mustChangePassword: Boolean(data.mustChangePassword),
    };
  } catch {
    return null;
  }
}

import { cookies } from "next/headers";

const SESSION_COOKIE = "hotdam_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  dropboxAccountId: string;
  dropboxAccessToken: string;
  dropboxRefreshToken?: string;
  baseFolder?: string;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE);
  if (!sessionCookie?.value) return null;

  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) return null;

    const [payload, signature] = sessionCookie.value.split(".");
    const expectedSig = await hmac(secret, payload);
    if (signature !== expectedSig) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionData;
    return data;
  } catch {
    return null;
  }
}

export async function setSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(data), "utf-8").toString(
    "base64url"
  );
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET not configured");
  const signature = await hmac(secret, payload);
  const value = `${payload}.${signature}`;

  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data)
  );
  return Buffer.from(sig).toString("base64url");
}

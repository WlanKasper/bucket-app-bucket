import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { requireEnv } from "@/lib/env";
import type { SessionUser } from "@/lib/types";

export const SESSION_COOKIE = "bucket_session";

function getSecret() {
  return new TextEncoder().encode(requireEnv("SESSION_SECRET"));
}

export async function createSessionToken(user: SessionUser) {
  return await new SignJWT({
    telegramUserId: user.telegramUserId,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    isDev: user.isDev ?? false,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
}

export function clearSessionCookie() {
  cookies().delete(SESSION_COOKIE);
}

export async function readSessionCookie(): Promise<SessionUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    return {
      telegramUserId: String(payload.telegramUserId),
      username: String(payload.username),
      firstName: payload.firstName ? String(payload.firstName) : null,
      lastName: payload.lastName ? String(payload.lastName) : null,
      isDev: payload.isDev === true,
    };
  } catch {
    return null;
  }
}

import { ACCESS_COOKIE } from "@/features/auth/constants";
import { forbidden, unauthorized } from "@/lib/errors";
import { readCookie } from "./cookies";
import { type AccessTokenPayload, verifyAccessToken } from "./tokens";

export async function getSession(): Promise<AccessTokenPayload | null> {
  const token = await readCookie(ACCESS_COOKIE);
  return token ? verifyAccessToken(token) : null;
}

export async function requireSession(): Promise<AccessTokenPayload> {
  const session = await getSession();
  if (!session) {
    throw unauthorized();
  }
  return session;
}

export async function requireAdmin(): Promise<AccessTokenPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw forbidden();
  }
  return session;
}
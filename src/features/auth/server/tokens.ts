import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/generated/prisma/client";
import { durationToSeconds } from "@/lib/duration";
import { getEnv } from "@/lib/env";

export interface AccessTokenPayload {
  sub: string;
  role: Role;
}

export interface IssuedRefreshToken {
  token: string;
  expiresAt: Date;
}

const encoder = new TextEncoder();

function isRole(value: unknown): value is Role {
  return value === "USER" || value === "ADMIN";
}

export function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  const env = getEnv();
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_EXPIRES_IN)
    .sign(encoder.encode(env.JWT_ACCESS_SECRET));
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(getEnv().JWT_ACCESS_SECRET), {
      algorithms: ["HS256"],
    });
    if (typeof payload.sub !== "string" || !isRole(payload.role)) {
      return null;
    }
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function signRefreshToken(userId: string): Promise<IssuedRefreshToken> {
  const env = getEnv();
  const expiresAt = new Date(Date.now() + durationToSeconds(env.REFRESH_TOKEN_EXPIRES_IN) * 1000);
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(crypto.randomUUID())
    .setIssuedAt()
    .setExpirationTime(env.REFRESH_TOKEN_EXPIRES_IN)
    .sign(encoder.encode(env.JWT_REFRESH_SECRET));
  return { token, expiresAt };
}

export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, encoder.encode(getEnv().JWT_REFRESH_SECRET), {
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
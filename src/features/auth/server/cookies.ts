import { cookies } from "next/headers";
import { durationToSeconds } from "@/lib/duration";
import { getEnv } from "@/lib/env";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/features/auth/constants";

interface BaseCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: string;
}

function baseOptions(): BaseCookieOptions {
  return {
    httpOnly: true,
    secure: getEnv().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}

export async function setAuthCookies(accessToken: string, refreshToken: string): Promise<void> {
  const env = getEnv();
  const store = await cookies();
  store.set(ACCESS_COOKIE, accessToken, {
    ...baseOptions(),
    maxAge: durationToSeconds(env.ACCESS_TOKEN_EXPIRES_IN),
  });
  store.set(REFRESH_COOKIE, refreshToken, {
    ...baseOptions(),
    maxAge: durationToSeconds(env.REFRESH_TOKEN_EXPIRES_IN),
  });
}

export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function readCookie(name: string): Promise<string | undefined> {
  const store = await cookies();
  return store.get(name)?.value;
}
import { type NextRequest, NextResponse } from "next/server";
import { REFRESH_COOKIE } from "@/features/auth/constants";
import { refresh } from "@/features/auth/server/auth.service";
import { clearAuthCookies, readCookie, setAuthCookies } from "@/features/auth/server/cookies";
import { ok } from "@/lib/api-response";
import { safeRedirectPath } from "@/lib/redirect";
import { withErrorHandling } from "@/lib/route-handler";

export const POST = withErrorHandling(async () => {
  const { user, accessToken, refreshToken } = await refresh(await readCookie(REFRESH_COOKIE));
  await setAuthCookies(accessToken, refreshToken);
  return ok({ user });
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next"));
  try {
    const { accessToken, refreshToken } = await refresh(await readCookie(REFRESH_COOKIE));
    await setAuthCookies(accessToken, refreshToken);
    return NextResponse.redirect(new URL(next, request.url));
  } catch (error: unknown) {
    console.error(error);
    await clearAuthCookies();
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
  }
}
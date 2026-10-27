import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/features/auth/constants";
import { verifyAccessToken } from "@/features/auth/server/tokens";

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  const session = accessToken ? await verifyAccessToken(accessToken) : null;

  if (!session) {
    const next = `${pathname}${request.nextUrl.search}`;
    if (request.cookies.has(REFRESH_COOKIE)) {
      return NextResponse.redirect(new URL(`/api/auth/refresh?next=${encodeURIComponent(next)}`, request.url));
    }
    return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, request.url));
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};

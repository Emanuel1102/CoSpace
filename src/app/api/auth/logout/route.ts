import { REFRESH_COOKIE } from "@/features/auth/constants";
import { logout } from "@/features/auth/server/auth.service";
import { clearAuthCookies, readCookie } from "@/features/auth/server/cookies";
import { noContent } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/route-handler";

export const POST = withErrorHandling(async () => {
  await logout(await readCookie(REFRESH_COOKIE));
  await clearAuthCookies();
  return noContent();
});
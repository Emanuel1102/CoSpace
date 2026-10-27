import { loginSchema } from "@/features/auth/schemas";
import { login } from "@/features/auth/server/auth.service";
import { setAuthCookies } from "@/features/auth/server/cookies";
import { ok } from "@/lib/api-response";
import { parseJsonBody, withErrorHandling } from "@/lib/route-handler";

export const POST = withErrorHandling(async (request) => {
  const input = await parseJsonBody(request, loginSchema);
  const { user, accessToken, refreshToken } = await login(input);
  await setAuthCookies(accessToken, refreshToken);
  return ok({ user });
});
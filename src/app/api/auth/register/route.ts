import { registerSchema } from "@/features/auth/schemas";
import { register } from "@/features/auth/server/auth.service";
import { setAuthCookies } from "@/features/auth/server/cookies";
import { created } from "@/lib/api-response";
import { parseJsonBody, withErrorHandling } from "@/lib/route-handler";

export const POST = withErrorHandling(async (request) => {
  const input = await parseJsonBody(request, registerSchema);
  const { user, accessToken, refreshToken } = await register(input);
  await setAuthCookies(accessToken, refreshToken);
  return created({ user });
});
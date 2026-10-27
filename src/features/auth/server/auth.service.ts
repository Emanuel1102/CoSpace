import type { Role, User } from "@/generated/prisma/client";
import type { LoginInput, RegisterInput } from "@/features/auth/schemas";
import { conflict, unauthorized } from "@/lib/errors";
import { isUniqueViolation } from "@/lib/prisma-errors";
import {
  createRefreshToken,
  createUser,
  findUserByEmail,
  findUserById,
  revokeActiveRefreshToken,
} from "./auth.repository";
import { hashPassword, verifyPassword } from "./password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "./tokens";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

function toAuthUser(user: User): AuthUser {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

async function issueSession(user: User): Promise<AuthResult> {
  const accessToken = await signAccessToken({ sub: user.id, role: user.role });
  const refresh = await signRefreshToken(user.id);
  await createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refresh.token),
    expiresAt: refresh.expiresAt,
  });
  return { user: toAuthUser(user), accessToken, refreshToken: refresh.token };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const passwordHash = await hashPassword(input.password);
  try {
    const user = await createUser({ name: input.name, email: input.email, passwordHash });
    return await issueSession(user);
  } catch (error: unknown) {
    if (isUniqueViolation(error)) {
      throw conflict("Email already registered");
    }
    throw error;
  }
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await findUserByEmail(input.email);
  const validPassword = user ? await verifyPassword(input.password, user.passwordHash) : false;
  if (!user || !validPassword) {
    throw unauthorized("Invalid credentials");
  }
  return issueSession(user);
}

export async function refresh(refreshToken: string | undefined): Promise<AuthResult> {
  if (!refreshToken) {
    throw unauthorized("Missing refresh token");
  }
  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) {
    throw unauthorized("Invalid refresh token");
  }
  const claimed = await revokeActiveRefreshToken(hashToken(refreshToken));
  if (!claimed) {
    throw unauthorized("Refresh token revoked or expired");
  }
  const user = await findUserById(userId);
  if (!user) {
    throw unauthorized("User not found");
  }
  return issueSession(user);
}

export async function logout(refreshToken: string | undefined): Promise<void> {
  if (refreshToken) {
    await revokeActiveRefreshToken(hashToken(refreshToken));
  }
}
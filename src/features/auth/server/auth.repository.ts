import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export interface NewUser {
  name: string;
  email: string;
  passwordHash: string;
}

export interface NewRefreshToken {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function createUser(data: NewUser): Promise<User> {
  return prisma.user.create({ data });
}

export async function createRefreshToken(data: NewRefreshToken): Promise<void> {
  await prisma.refreshToken.create({ data });
}

export async function revokeActiveRefreshToken(tokenHash: string): Promise<boolean> {
  const result = await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
    data: { revokedAt: new Date() },
  });
  return result.count === 1;
}
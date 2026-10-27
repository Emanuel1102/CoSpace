import type { Space } from "@/generated/prisma/client";
import type {
  CreateSpaceInput,
  ListSpacesQuery,
  UpdateSpaceInput,
} from "@/features/spaces/schemas";
import { prisma } from "@/lib/prisma";

export function findSpaces(filters: ListSpacesQuery): Promise<Space[]> {
  return prisma.space.findMany({
    where: {
      type: filters.type,
      isActive: filters.includeInactive ? undefined : true,
    },
    orderBy: { name: "asc" },
  });
}

export function findSpaceById(id: string): Promise<Space | null> {
  return prisma.space.findUnique({ where: { id } });
}

export function insertSpace(data: CreateSpaceInput): Promise<Space> {
  return prisma.space.create({ data });
}

export function patchSpace(id: string, data: UpdateSpaceInput): Promise<Space> {
  return prisma.space.update({ where: { id }, data });
}

export function setSpaceInactive(id: string): Promise<Space> {
  return prisma.space.update({ where: { id }, data: { isActive: false } });
}

export function countFutureConfirmedBookings(spaceId: string): Promise<number> {
  return prisma.booking.count({
    where: { spaceId, status: "CONFIRMED", endsAt: { gt: new Date() } },
  });
}
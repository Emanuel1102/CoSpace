import type { Space } from "@/generated/prisma/client";
import type {
  CreateSpaceInput,
  ListSpacesQuery,
  UpdateSpaceInput,
} from "@/features/spaces/schemas";
import { conflict, notFound } from "@/lib/errors";
import * as repo from "./spaces.repository";

export function listSpaces(filters: ListSpacesQuery): Promise<Space[]> {
  return repo.findSpaces(filters);
}

export async function getSpace(id: string, canSeeInactive: boolean): Promise<Space> {
  const space = await repo.findSpaceById(id);
  if (!space || (!space.isActive && !canSeeInactive)) {
    throw notFound("Space not found");
  }
  return space;
}

export function createSpace(input: CreateSpaceInput): Promise<Space> {
  return repo.insertSpace(input);
}

export async function updateSpace(id: string, input: UpdateSpaceInput): Promise<Space> {
  await getSpace(id, true);
  return repo.patchSpace(id, input);
}

export async function deactivateSpace(id: string): Promise<Space> {
  const space = await getSpace(id, true);
  if (!space.isActive) {
    return space;
  }
  const pendingBookings = await repo.countFutureConfirmedBookings(id);
  if (pendingBookings > 0) {
    throw conflict("Space has future confirmed bookings");
  }
  return repo.setSpaceInactive(id);
}
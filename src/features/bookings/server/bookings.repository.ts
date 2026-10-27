import type { Booking, BookingStatus, Space } from "@/generated/prisma/client";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;

interface CreateBookingRecord {
  userId: string;
  spaceId: string;
  startsAt: Date;
  endsAt: Date;
  now: Date;
}

export type CreateBookingResult =
  | { kind: "created"; booking: Booking }
  | { kind: "space-not-found" }
  | { kind: "space-inactive" }
  | { kind: "space-overlap" }
  | { kind: "user-overlap" }
  | { kind: "booking-limit" };

export function findUserBookings(
  userId: string,
  status?: BookingStatus,
): Promise<Array<Booking & { space: Space }>> {
  return prisma.booking.findMany({
    where: { userId, status },
    include: { space: true },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }],
  });
}

export function findBookingById(id: string): Promise<Booking | null> {
  return prisma.booking.findUnique({ where: { id } });
}

export function createBookingIfAvailable(
  input: CreateBookingRecord,
): Promise<CreateBookingResult> {
  return prisma.$transaction(
    async (transaction) => {
      const space = await transaction.space.findUnique({ where: { id: input.spaceId } });
      if (!space) {
        return { kind: "space-not-found" };
      }
      if (!space.isActive) {
        return { kind: "space-inactive" };
      }

      const overlappingSpaceBooking = await transaction.booking.findFirst({
        where: {
          spaceId: input.spaceId,
          status: "CONFIRMED",
          startsAt: { lt: input.endsAt },
          endsAt: { gt: input.startsAt },
        },
        select: { id: true },
      });
      if (overlappingSpaceBooking) {
        return { kind: "space-overlap" };
      }

      const overlappingUserBooking = await transaction.booking.findFirst({
        where: {
          userId: input.userId,
          status: "CONFIRMED",
          startsAt: { lt: input.endsAt },
          endsAt: { gt: input.startsAt },
        },
        select: { id: true },
      });
      if (overlappingUserBooking) {
        return { kind: "user-overlap" };
      }

      const futureBookingCount = await transaction.booking.count({
        where: {
          userId: input.userId,
          status: "CONFIRMED",
          startsAt: { gt: input.now },
        },
      });
      if (futureBookingCount >= 3) {
        return { kind: "booking-limit" };
      }

      const durationInHours =
        (input.endsAt.getTime() - input.startsAt.getTime()) / HOUR_IN_MILLISECONDS;
      const booking = await transaction.booking.create({
        data: {
          userId: input.userId,
          spaceId: input.spaceId,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          totalPrice: durationInHours * space.pricePerHour,
        },
      });

      return { kind: "created", booking };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function cancelConfirmedBooking(id: string, cancelledAt: Date): Promise<Booking | null> {
  await prisma.booking.updateMany({
    where: { id, status: "CONFIRMED" },
    data: { status: "CANCELLED", cancelledAt },
  });
  return prisma.booking.findUnique({ where: { id } });
}

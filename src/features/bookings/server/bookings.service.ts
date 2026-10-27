import { Prisma, type Role } from "@/generated/prisma/client";
import type { Booking } from "@/generated/prisma/client";
import type {
  CreateBookingInput,
  ListBookingsQuery,
} from "@/features/bookings/schemas";
import { badRequest, conflict, forbidden, notFound } from "@/lib/errors";
import * as repo from "./bookings.repository";

const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
const MAX_ADVANCE_IN_MILLISECONDS = 30 * 24 * HOUR_IN_MILLISECONDS;
const CANCELLATION_CUTOFF_IN_MILLISECONDS = 2 * HOUR_IN_MILLISECONDS;
const BUSINESS_TIME_ZONE = "America/Bogota";

const businessTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

interface LocalTime {
  hour: number;
  minute: number;
  second: number;
}

function getLocalTime(date: Date): LocalTime {
  const parts = businessTimeFormatter.formatToParts(date);
  const getPart = (type: "hour" | "minute" | "second"): number => {
    const part = parts.find((item) => item.type === type);
    if (!part) {
      throw new Error(`Missing ${type} in formatted booking time`);
    }
    return Number(part.value);
  };

  return {
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function validateBookingTime(input: CreateBookingInput, now: Date): void {
  const duration = input.endsAt.getTime() - input.startsAt.getTime();
  if (
    duration < HOUR_IN_MILLISECONDS ||
    duration > 4 * HOUR_IN_MILLISECONDS ||
    duration % HOUR_IN_MILLISECONDS !== 0
  ) {
    throw badRequest("A booking must last between one and four full hours");
  }

  const start = getLocalTime(input.startsAt);
  const end = getLocalTime(input.endsAt);
  if (
    input.startsAt.getUTCMilliseconds() !== 0 ||
    input.endsAt.getUTCMilliseconds() !== 0 ||
    start.minute !== 0 ||
    start.second !== 0 ||
    end.minute !== 0 ||
    end.second !== 0 ||
    start.hour < 7 ||
    end.hour > 21
  ) {
    throw badRequest("Bookings must use full hours between 07:00 and 21:00 in America/Bogota");
  }

  const startsAt = input.startsAt.getTime();
  if (startsAt <= now.getTime()) {
    throw badRequest("A booking cannot start in the past");
  }
  if (startsAt > now.getTime() + MAX_ADVANCE_IN_MILLISECONDS) {
    throw badRequest("A booking cannot be made more than 30 days in advance");
  }
}

function isSerializationConflict(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034";
}

export function listBookings(
  userId: string,
  filters: ListBookingsQuery = {},
): Promise<Array<Booking & { space: import("@/generated/prisma/client").Space }>> {
  return repo.findUserBookings(userId, filters.status);
}

export async function createBooking(
  userId: string,
  input: CreateBookingInput,
): Promise<Booking> {
  const now = new Date();
  validateBookingTime(input, now);

  let result: repo.CreateBookingResult;
  try {
    result = await repo.createBookingIfAvailable({ userId, ...input, now });
  } catch (error: unknown) {
    if (isSerializationConflict(error)) {
      throw conflict("Booking availability changed; please try again");
    }
    throw error;
  }

  switch (result.kind) {
    case "created":
      return result.booking;
    case "space-not-found":
    case "space-inactive":
      throw notFound("Active space not found");
    case "space-overlap":
      throw conflict("The space is already booked for this time");
    case "user-overlap":
      throw conflict("You already have a booking that overlaps this time");
    case "booking-limit":
      throw conflict("You can have at most three future confirmed bookings");
  }
}

export async function cancelBooking(
  bookingId: string,
  userId: string,
  role: Role,
): Promise<Booking> {
  const booking = await repo.findBookingById(bookingId);
  if (!booking) {
    throw notFound("Booking not found");
  }
  if (booking.userId !== userId && role !== "ADMIN") {
    throw forbidden("You cannot cancel another user's booking");
  }
  if (booking.status === "CANCELLED") {
    return booking;
  }

  const now = new Date();
  if (
    role !== "ADMIN" &&
    now.getTime() > booking.startsAt.getTime() - CANCELLATION_CUTOFF_IN_MILLISECONDS
  ) {
    throw conflict("Bookings can only be cancelled at least two hours before they start");
  }

  const cancelledBooking = await repo.cancelConfirmedBooking(bookingId, now);
  if (!cancelledBooking) {
    throw notFound("Booking not found");
  }
  return cancelledBooking;
}

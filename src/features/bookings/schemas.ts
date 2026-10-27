import { BookingStatus } from "@/generated/prisma/client";
import { z } from "zod";

const bookingDateTimeSchema = z.iso.datetime({ offset: true }).transform((value) => new Date(value));

export const createBookingSchema = z
  .object({
    spaceId: z.string().uuid(),
    startsAt: bookingDateTimeSchema,
    endsAt: bookingDateTimeSchema,
  })
  .superRefine(({ startsAt, endsAt }, context) => {
    const duration = endsAt.getTime() - startsAt.getTime();
    const hourInMilliseconds = 60 * 60 * 1000;

    if (
      duration < hourInMilliseconds ||
      duration > 4 * hourInMilliseconds ||
      duration % hourInMilliseconds !== 0
    ) {
      context.addIssue({
        code: "custom",
        message: "A booking must last between one and four full hours",
        path: ["endsAt"],
      });
    }
  });

export const listBookingsQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ListBookingsQuery = z.infer<typeof listBookingsQuerySchema>;

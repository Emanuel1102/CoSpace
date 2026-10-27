import { requireSession } from "@/features/auth/server/guards";
import {
  createBookingSchema,
  listBookingsQuerySchema,
} from "@/features/bookings/schemas";
import { createBooking, listBookings } from "@/features/bookings/server/bookings.service";
import { created, ok } from "@/lib/api-response";
import { parseJsonBody, withErrorHandling } from "@/lib/route-handler";

export const GET = withErrorHandling(async (request) => {
  const session = await requireSession();
  const filters = listBookingsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  const bookings = await listBookings(session.sub, filters);
  return ok({ bookings });
});

export const POST = withErrorHandling(async (request) => {
  const session = await requireSession();
  const input = await parseJsonBody(request, createBookingSchema);
  const booking = await createBooking(session.sub, input);
  return created({ booking });
});

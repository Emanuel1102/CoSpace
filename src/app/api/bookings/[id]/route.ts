import { requireSession } from "@/features/auth/server/guards";
import { cancelBooking } from "@/features/bookings/server/bookings.service";
import { ok } from "@/lib/api-response";
import { withErrorHandling } from "@/lib/route-handler";

interface BookingRouteParams {
  id: string;
}

export const DELETE = withErrorHandling<BookingRouteParams>(async (_request, { params }) => {
  const session = await requireSession();
  const { id } = await params;
  const booking = await cancelBooking(id, session.sub, session.role);
  return ok({ booking });
});

import { getSession, requireAdmin } from "@/features/auth/server/guards";
import { updateSpaceSchema } from "@/features/spaces/schemas";
import { deactivateSpace, getSpace, updateSpace } from "@/features/spaces/server/spaces.service";
import { ok } from "@/lib/api-response";
import { parseJsonBody, withErrorHandling } from "@/lib/route-handler";

interface SpaceRouteParams {
  id: string;
}

export const GET = withErrorHandling<SpaceRouteParams>(async (_request, { params }) => {
  const { id } = await params;
  const session = await getSession();
  const space = await getSpace(id, session?.role === "ADMIN");
  return ok({ space });
});

export const PATCH = withErrorHandling<SpaceRouteParams>(async (request, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const input = await parseJsonBody(request, updateSpaceSchema);
  const space = await updateSpace(id, input);
  return ok({ space });
});

export const DELETE = withErrorHandling<SpaceRouteParams>(async (_request, { params }) => {
  await requireAdmin();
  const { id } = await params;
  const space = await deactivateSpace(id);
  return ok({ space });
});
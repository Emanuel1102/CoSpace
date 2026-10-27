import { requireAdmin } from "@/features/auth/server/guards";
import { createSpaceSchema, listSpacesQuerySchema } from "@/features/spaces/schemas";
import { createSpace, listSpaces } from "@/features/spaces/server/spaces.service";
import { created, ok } from "@/lib/api-response";
import { parseJsonBody, withErrorHandling } from "@/lib/route-handler";

export const GET = withErrorHandling(async (request) => {
  const query = listSpacesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
  if (query.includeInactive) {
    await requireAdmin();
  }
  const spaces = await listSpaces(query);
  return ok({ spaces });
});

export const POST = withErrorHandling(async (request) => {
  await requireAdmin();
  const input = await parseJsonBody(request, createSpaceSchema);
  const space = await createSpace(input);
  return created({ space });
});
import { requireAdmin } from "@/features/auth/server/guards";
import { created } from "@/lib/api-response";
import { badRequest } from "@/lib/errors";
import { withErrorHandling } from "@/lib/route-handler";
import { subirFoto } from "../../../../lib/s3/upload";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSIONES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const POST = withErrorHandling(async (request) => {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw badRequest("Debes enviar una imagen en el campo 'file'.");
  }

  const extension = EXTENSIONES[file.type];
  if (!extension) {
    throw badRequest("Solo se permiten imágenes JPG, PNG o WEBP.");
  }

  if (file.size > MAX_BYTES) {
    throw badRequest("La imagen no puede superar los 5 MB.");
  }

  const body = Buffer.from(await file.arrayBuffer());
  const key = await subirFoto({ body, contentType: file.type, extension });

  return created({ key });
});
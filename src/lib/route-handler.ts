import type { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { errorResponse } from "@/lib/api-response";
import { AppError, badRequest } from "@/lib/errors";

export type RouteContext<P> = { params: Promise<P> };

type Handler<P> = (request: NextRequest, context: RouteContext<P>) => Promise<NextResponse>;

function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({
      path: issue.path.map(String).join("."),
      message: issue.message,
    }));
    return badRequest("Validation failed", details);
  }
  console.error(error);
  return new AppError(500, "INTERNAL", "Internal server error");
}

export function withErrorHandling<P = Record<string, string>>(handler: Handler<P>): Handler<P> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error: unknown) {
      return errorResponse(toAppError(error));
    }
  };
}

export async function parseJsonBody<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw badRequest("Invalid JSON body");
  }
  return schema.parse(raw);
}
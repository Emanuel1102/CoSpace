import { z } from "zod";
import { SpaceType } from "@/generated/prisma/client";

const imageUrlSchema = z.union([z.string().trim().url(), z.string().trim().startsWith("/")]);

export const createSpaceSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: z.nativeEnum(SpaceType),
  description: z.string().trim().min(10).max(1000),
  capacity: z.number().int().min(1).max(100),
  pricePerHour: z.number().int().min(1).max(1_000_000),
  imageUrl: imageUrlSchema.nullable().optional(),
});

export const updateSpaceSchema = createSpaceSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const listSpacesQuerySchema = z.object({
  type: z.nativeEnum(SpaceType).optional(),
  includeInactive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type ListSpacesQuery = z.infer<typeof listSpacesQuerySchema>;
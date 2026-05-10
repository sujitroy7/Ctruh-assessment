import { z } from "zod";

export const apiErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
});

export const apiValidationErrorSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.record(z.string(), z.array(z.string())),
});

export const apiMessageSchema = z.object({
  success: z.literal(true),
  message: z.string(),
});

export function apiSuccessSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
  });
}

export function jsonContent<T extends z.ZodType>(schema: T, description: string) {
  return {
    description,
    content: { "application/json": { schema } },
  };
}

export function jsonBody<T extends z.ZodType>(schema: T) {
  return {
    content: { "application/json": { schema } },
    required: true as const,
  };
}

export const authErrorResponses = {
  401: jsonContent(apiErrorSchema, "Not authenticated"),
  403: jsonContent(apiErrorSchema, "Forbidden — Unauthorized"),
};

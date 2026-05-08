import { z } from "zod";

const messageSchema = z.object({ message: z.string() });

export const authErrorResponses = {
  401: {
    description: "Not authenticated",
    content: { "application/json": { schema: messageSchema } },
  },
  403: {
    description: "Forbidden — Unauthorized",
    content: { "application/json": { schema: messageSchema } },
  },
};

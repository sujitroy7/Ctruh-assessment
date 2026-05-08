import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const ownerRegistry = new OpenAPIRegistry();

export const PublicOwnerSchema = ownerRegistry.register(
  "Owner",
  z.object({
    id: z.string(),
    email: z.string().email(),
  }),
);

export const RegisterOwnerBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

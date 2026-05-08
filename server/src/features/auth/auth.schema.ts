import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const authRegistry = new OpenAPIRegistry();

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["owner", "customer"]),
});

export const TokenResponseSchema = authRegistry.register(
  "TokenResponse",
  z.object({ message: z.string() }),
);

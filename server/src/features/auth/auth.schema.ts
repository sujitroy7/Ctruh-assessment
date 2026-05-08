import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const authRegistry = new OpenAPIRegistry();

export const LoginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["owner", "customer"]).default("customer"),
});

export const TokenResponseSchema = authRegistry.register(
  "TokenResponse",
  z.object({
    user: z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
      role: z.enum(["owner", "customer"]),
    }),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number().int().describe("Seconds until access token expires"),
  }),
);

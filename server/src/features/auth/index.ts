import { Router } from "express";
import { z } from "zod";
import {
  authRegistry,
  LoginBodySchema,
  TokenResponseSchema,
} from "./auth.schema";
import { login, refresh, logout } from "./auth.controller";

const router = Router();

// ======================================================
// ROUTE: LOGIN
// ======================================================
authRegistry.registerPath({
  method: "post",
  path: "/auth/login",
  summary: "Login (owner or customer)",
  description: "Defaults to `role: customer` if omitted. Sets tokens as HttpOnly cookies and returns them in the response body.",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: LoginBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Logged in — user info and tokens returned in body; tokens also set as cookies",
      content: { "application/json": { schema: TokenResponseSchema } },
    },
    401: {
      description: "Invalid credentials",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    422: {
      description: "Validation failed",
      content: {
        "application/json": {
          schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }),
        },
      },
    },
  },
});
router.post("/login", login);

// ======================================================
// ROUTE: REFRESH TOKEN
// ======================================================
authRegistry.registerPath({
  method: "post",
  path: "/auth/refresh",
  summary: "Rotate refresh token",
  description:
    "Reads `refresh_token` from cookie and `X-Refresh-Token` header. Both must be present and identical (double-submit check). Issues new cookies on success.",
  tags: ["Auth"],
  request: {
    headers: z.object({ "x-refresh-token": z.string() }),
  },
  responses: {
    200: {
      description: "Tokens rotated — new cookies issued",
      content: { "application/json": { schema: TokenResponseSchema } },
    },
    401: {
      description: "Missing, mismatched, or expired refresh token",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
  },
});
router.post("/refresh", refresh);

// ======================================================
// ROUTE: LOGOUT
// ======================================================
authRegistry.registerPath({
  method: "post",
  path: "/auth/logout",
  summary: "Logout (revoke refresh token)",
  description:
    "Reads `refresh_token` from cookie and `X-Refresh-Token` header (both required for cross-verification). Revokes the token and clears both cookies.",
  tags: ["Auth"],
  request: {
    headers: z.object({ "x-refresh-token": z.string() }),
  },
  responses: {
    204: { description: "Logged out — cookies cleared" },
  },
});
router.post("/logout", logout);

export default router;

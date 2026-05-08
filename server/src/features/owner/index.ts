import { Router } from "express";
import { z } from "zod";
import { ownerRegistry, RegisterOwnerBodySchema } from "./owner.schema";
import { registerOwnerHandler } from "./owner.controller";

const router = Router();

// ======================================================
// ROUTE: REGISTER OWNER (one-time setup)
// ======================================================
ownerRegistry.registerPath({
  method: "post",
  path: "/owner/register",
  summary: "Register the platform owner (one-time)",
  description: "Self-sealing: returns 409 if an owner already exists.",
  tags: ["Owner"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterOwnerBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Owner registered successfully",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    409: {
      description: "Owner already registered",
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
router.post("/register", registerOwnerHandler);

export default router;

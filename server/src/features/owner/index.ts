import { Router } from "express";
import { ownerRegistry, RegisterOwnerBodySchema } from "./owner.schema";
import { registerOwnerHandler } from "./owner.controller";
import {
  jsonContent,
  jsonBody,
  apiMessageSchema,
  apiErrorSchema,
  apiValidationErrorSchema,
} from "../../utils/openapi";

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
    body: jsonBody(RegisterOwnerBodySchema),
  },
  responses: {
    201: jsonContent(apiMessageSchema, "Owner registered successfully"),
    409: jsonContent(apiErrorSchema, "Owner already registered"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
  },
});
router.post("/register", registerOwnerHandler);

export default router;

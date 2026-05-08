import { Router } from "express";
import { z } from "zod";
import { customersRegistry, RegisterCustomerBodySchema } from "./customer.schema";
import { TokenResponseSchema } from "../auth/auth.schema";
import { registerCustomerHandler } from "./customer.controller";

const router = Router();

// ======================================================
// ROUTE: REGISTER CUSTOMER
// ======================================================
customersRegistry.registerPath({
  method: "post",
  path: "/customers/register",
  summary: "Register a new customer",
  tags: ["Customers"],
  request: {
    body: {
      content: { "application/json": { schema: RegisterCustomerBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Customer registered and tokens issued",
      content: { "application/json": { schema: TokenResponseSchema } },
    },
    409: {
      description: "Email already in use",
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
router.post("/register", registerCustomerHandler);

export default router;

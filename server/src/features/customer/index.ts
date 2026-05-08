import { Router } from "express";
import { z } from "zod";
import {
  customersRegistry,
  RegisterCustomerBodySchema,
  AddressBodySchema,
  UpdateAddressBodySchema,
  AddressZodSchema,
} from "./customer.schema";
import {
  registerCustomerHandler,
  addAddressHandler,
  listAddressesHandler,
  updateAddressHandler,
  deleteAddressHandler,
} from "./customer.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { authErrorResponses } from "../../utils/openapi";

const router = Router();

const customerOnly = [requireAuth, requireRole("customer")];
const errorSchema = z.object({ message: z.string() });
const validationErrorSchema = z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) });

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
      description: "Customer registered successfully",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    409: {
      description: "Email already in use",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
  },
});
router.post("/register", registerCustomerHandler);

// ======================================================
// ROUTE: ADD ADDRESS
// ======================================================
customersRegistry.registerPath({
  method: "post",
  path: "/customers/me/addresses",
  summary: "Add a shipping address",
  description: "Adds a new address to the authenticated customer's address list.",
  tags: ["Addresses"],
  security: [{ cookieAuth: [] }],
  request: {
    body: { content: { "application/json": { schema: AddressBodySchema } }, required: true },
  },
  responses: {
    201: {
      description: "Address added",
      content: { "application/json": { schema: AddressZodSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    ...authErrorResponses,
  },
});
router.post("/me/addresses", ...customerOnly, addAddressHandler);

// ======================================================
// ROUTE: LIST ADDRESSES
// ======================================================
customersRegistry.registerPath({
  method: "get",
  path: "/customers/me/addresses",
  summary: "List my addresses",
  description: "Returns all saved addresses for the authenticated customer.",
  tags: ["Addresses"],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "List of addresses",
      content: { "application/json": { schema: z.array(AddressZodSchema) } },
    },
    ...authErrorResponses,
  },
});
router.get("/me/addresses", ...customerOnly, listAddressesHandler);

// ======================================================
// ROUTE: UPDATE ADDRESS
// ======================================================
customersRegistry.registerPath({
  method: "patch",
  path: "/customers/me/addresses/{addressId}",
  summary: "Update an address",
  description: "Partially updates a saved address. At least one field must be provided.",
  tags: ["Addresses"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ addressId: z.string() }),
    body: { content: { "application/json": { schema: UpdateAddressBodySchema } }, required: true },
  },
  responses: {
    200: {
      description: "Updated address",
      content: { "application/json": { schema: AddressZodSchema } },
    },
    400: {
      description: "Invalid ID",
      content: { "application/json": { schema: errorSchema } },
    },
    404: {
      description: "Customer or address not found",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    ...authErrorResponses,
  },
});
router.patch("/me/addresses/:addressId", ...customerOnly, updateAddressHandler);

// ======================================================
// ROUTE: DELETE ADDRESS
// ======================================================
customersRegistry.registerPath({
  method: "delete",
  path: "/customers/me/addresses/{addressId}",
  summary: "Delete an address",
  description: "Removes a saved address from the authenticated customer's list.",
  tags: ["Addresses"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ addressId: z.string() }),
  },
  responses: {
    204: { description: "Address deleted" },
    400: {
      description: "Invalid ID",
      content: { "application/json": { schema: errorSchema } },
    },
    404: {
      description: "Customer or address not found",
      content: { "application/json": { schema: errorSchema } },
    },
    ...authErrorResponses,
  },
});
router.delete("/me/addresses/:addressId", ...customerOnly, deleteAddressHandler);

export default router;

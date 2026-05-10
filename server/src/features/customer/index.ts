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
import {
  jsonContent,
  jsonBody,
  apiSuccessSchema,
  apiMessageSchema,
  apiErrorSchema,
  apiValidationErrorSchema,
  authErrorResponses,
} from "../../utils/openapi";

const router = Router();

const customerOnly = [requireAuth, requireRole("customer")];

// ======================================================
// ROUTE: REGISTER CUSTOMER
// ======================================================
customersRegistry.registerPath({
  method: "post",
  path: "/customers/register",
  summary: "Register a new customer",
  tags: ["Customers"],
  request: {
    body: jsonBody(RegisterCustomerBodySchema),
  },
  responses: {
    201: jsonContent(apiMessageSchema, "Customer registered successfully"),
    409: jsonContent(apiErrorSchema, "Email already in use"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    body: jsonBody(AddressBodySchema),
  },
  responses: {
    201: jsonContent(apiSuccessSchema(AddressZodSchema), "Address added"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    200: jsonContent(apiSuccessSchema(z.array(AddressZodSchema)), "List of addresses"),
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
    body: jsonBody(UpdateAddressBodySchema),
  },
  responses: {
    200: jsonContent(apiSuccessSchema(AddressZodSchema), "Updated address"),
    400: jsonContent(apiErrorSchema, "Invalid ID"),
    404: jsonContent(apiErrorSchema, "Customer or address not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    400: jsonContent(apiErrorSchema, "Invalid ID"),
    404: jsonContent(apiErrorSchema, "Customer or address not found"),
    ...authErrorResponses,
  },
});
router.delete("/me/addresses/:addressId", ...customerOnly, deleteAddressHandler);

export default router;

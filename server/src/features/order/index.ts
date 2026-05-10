import { Router } from "express";
import { z } from "zod";
import {
  orderRegistry,
  OrderZodSchema,
  OrderListZodSchema,
  CreateOrderBodySchema,
  UpdateOrderStatusBodySchema,
  UpdatePaymentStatusBodySchema,
  OrderListQuerySchema,
} from "./order.schema";
import {
  createOrderHandler,
  getMyOrdersHandler,
  getMyOrderByIdHandler,
  listAllOrdersHandler,
  updateOrderStatusHandler,
  updatePaymentStatusHandler,
} from "./order.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import {
  jsonContent,
  jsonBody,
  apiSuccessSchema,
  apiErrorSchema,
  apiValidationErrorSchema,
  authErrorResponses,
} from "../../utils/openapi";

const router = Router();

const customerOnly = [requireAuth, requireRole("customer")];
const ownerOnly = [requireAuth, requireRole("owner")];

// ======================================================
// ROUTE: CREATE ORDER
// ======================================================
orderRegistry.registerPath({
  method: "post",
  path: "/orders",
  summary: "Place an order",
  description: "Creates an order from the customer's active cart items and snapshots the shipping address. Cart items are atomically marked as purchased.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: {
    body: jsonBody(CreateOrderBodySchema),
  },
  responses: {
    201: jsonContent(apiSuccessSchema(OrderZodSchema), "Order created"),
    422: jsonContent(apiErrorSchema, "Cart is empty / product unavailable / no shipping address"),
    ...authErrorResponses,
  },
});
router.post("/", ...customerOnly, createOrderHandler);

// ======================================================
// ROUTE: GET MY ORDERS
// ======================================================
orderRegistry.registerPath({
  method: "get",
  path: "/orders/me",
  summary: "List my orders",
  description: "Returns a paginated list of orders for the authenticated customer, newest first.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: { params: OrderListQuerySchema },
  responses: {
    200: jsonContent(apiSuccessSchema(OrderListZodSchema), "Paginated order list"),
    ...authErrorResponses,
  },
});
router.get("/me", ...customerOnly, getMyOrdersHandler);

// ======================================================
// ROUTE: GET MY ORDER BY ID
// ======================================================
orderRegistry.registerPath({
  method: "get",
  path: "/orders/me/{orderId}",
  summary: "Get a single order",
  description: "Returns a specific order belonging to the authenticated customer.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ orderId: z.string() }) },
  responses: {
    200: jsonContent(apiSuccessSchema(OrderZodSchema), "Order details"),
    400: jsonContent(apiErrorSchema, "Invalid order ID"),
    404: jsonContent(apiErrorSchema, "Order not found"),
    ...authErrorResponses,
  },
});
router.get("/me/:orderId", ...customerOnly, getMyOrderByIdHandler);

// ======================================================
// ROUTE: LIST ALL ORDERS (owner)
// ======================================================
orderRegistry.registerPath({
  method: "get",
  path: "/orders",
  summary: "List all orders",
  description: "Returns a paginated list of all orders. Supports filtering by status and payment status.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: { params: OrderListQuerySchema },
  responses: {
    200: jsonContent(apiSuccessSchema(OrderListZodSchema), "Paginated order list"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
    ...authErrorResponses,
  },
});
router.get("/", ...ownerOnly, listAllOrdersHandler);

// ======================================================
// ROUTE: UPDATE ORDER STATUS (owner)
// ======================================================
orderRegistry.registerPath({
  method: "patch",
  path: "/orders/{orderId}/status",
  summary: "Update order status",
  description: "Transitions an order to a new status. Enforces valid state machine transitions. Optionally sets tracking_number when transitioning to 'shipped'.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ orderId: z.string() }),
    body: jsonBody(UpdateOrderStatusBodySchema),
  },
  responses: {
    200: jsonContent(apiSuccessSchema(OrderZodSchema), "Updated order"),
    400: jsonContent(apiErrorSchema, "Invalid order ID"),
    404: jsonContent(apiErrorSchema, "Order not found"),
    422: jsonContent(apiErrorSchema, "Invalid status transition or validation failure"),
    ...authErrorResponses,
  },
});
router.patch("/:orderId/status", ...ownerOnly, updateOrderStatusHandler);

// ======================================================
// ROUTE: UPDATE PAYMENT STATUS (owner)
// ======================================================
orderRegistry.registerPath({
  method: "patch",
  path: "/orders/{orderId}/payment-status",
  summary: "Update payment status",
  description: "Updates the payment status of an order independently of its fulfillment status.",
  tags: ["Orders"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ orderId: z.string() }),
    body: jsonBody(UpdatePaymentStatusBodySchema),
  },
  responses: {
    200: jsonContent(apiSuccessSchema(OrderZodSchema), "Updated order"),
    400: jsonContent(apiErrorSchema, "Invalid order ID"),
    404: jsonContent(apiErrorSchema, "Order not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
    ...authErrorResponses,
  },
});
router.patch("/:orderId/payment-status", ...ownerOnly, updatePaymentStatusHandler);

export default router;

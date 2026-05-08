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
import { authErrorResponses } from "../../utils/openapi";

const router = Router();

const customerOnly = [requireAuth, requireRole("customer")];
const ownerOnly = [requireAuth, requireRole("owner")];

const errorSchema = z.object({ message: z.string() });
const validationErrorSchema = z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) });

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
    body: { content: { "application/json": { schema: CreateOrderBodySchema } }, required: true },
  },
  responses: {
    201: {
      description: "Order created",
      content: { "application/json": { schema: OrderZodSchema } },
    },
    422: {
      description: "Cart is empty / product unavailable / no shipping address",
      content: { "application/json": { schema: errorSchema } },
    },
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
    200: {
      description: "Paginated order list",
      content: { "application/json": { schema: OrderListZodSchema } },
    },
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
    200: {
      description: "Order details",
      content: { "application/json": { schema: OrderZodSchema } },
    },
    400: {
      description: "Invalid order ID",
      content: { "application/json": { schema: errorSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: errorSchema } },
    },
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
    200: {
      description: "Paginated order list",
      content: { "application/json": { schema: OrderListZodSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
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
    body: { content: { "application/json": { schema: UpdateOrderStatusBodySchema } }, required: true },
  },
  responses: {
    200: {
      description: "Updated order",
      content: { "application/json": { schema: OrderZodSchema } },
    },
    400: {
      description: "Invalid order ID",
      content: { "application/json": { schema: errorSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Invalid status transition or validation failure",
      content: { "application/json": { schema: errorSchema } },
    },
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
    body: { content: { "application/json": { schema: UpdatePaymentStatusBodySchema } }, required: true },
  },
  responses: {
    200: {
      description: "Updated order",
      content: { "application/json": { schema: OrderZodSchema } },
    },
    400: {
      description: "Invalid order ID",
      content: { "application/json": { schema: errorSchema } },
    },
    404: {
      description: "Order not found",
      content: { "application/json": { schema: errorSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: validationErrorSchema } },
    },
    ...authErrorResponses,
  },
});
router.patch("/:orderId/payment-status", ...ownerOnly, updatePaymentStatusHandler);

export default router;

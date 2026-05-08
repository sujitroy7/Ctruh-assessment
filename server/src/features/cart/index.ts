import { Router } from "express";
import { z } from "zod";
import { cartRegistry, CartItemSchema, AddToCartBodySchema } from "./cart.schema";
import { getCartHandler, addToCartHandler, removeFromCartHandler } from "./cart.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const router = Router();

const customerOnly = [requireAuth, requireRole("customer")];

const authErrorResponses = {
  401: {
    description: "Not authenticated",
    content: { "application/json": { schema: z.object({ message: z.string() }) } },
  },
  403: {
    description: "Forbidden — customer role required",
    content: { "application/json": { schema: z.object({ message: z.string() }) } },
  },
};

// ======================================================
// ROUTE: GET CART
// ======================================================
cartRegistry.registerPath({
  method: "get",
  path: "/cart",
  summary: "Get cart",
  description: "Returns all active (unpurchased) cart items for the authenticated customer.",
  tags: ["Cart"],
  security: [{ cookieAuth: [] }],
  responses: {
    200: {
      description: "List of cart items",
      content: { "application/json": { schema: z.array(CartItemSchema) } },
    },
    ...authErrorResponses,
  },
});
router.get("/", ...customerOnly, getCartHandler);

// ======================================================
// ROUTE: ADD ITEM TO CART
// ======================================================
cartRegistry.registerPath({
  method: "post",
  path: "/cart/items",
  summary: "Add item to cart",
  description: "Adds a product variant to the cart. If the variant is already in the cart, its quantity is incremented.",
  tags: ["Cart"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: AddToCartBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Item added to cart",
      content: { "application/json": { schema: CartItemSchema } },
    },
    200: {
      description: "Item already in cart — quantity incremented",
      content: { "application/json": { schema: CartItemSchema } },
    },
    404: {
      description: "Product variant not found",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } },
    },
    ...authErrorResponses,
  },
});
router.post("/items", ...customerOnly, addToCartHandler);

// ======================================================
// ROUTE: REMOVE ITEM FROM CART
// ======================================================
cartRegistry.registerPath({
  method: "delete",
  path: "/cart/items/{itemId}",
  summary: "Remove item from cart",
  description: "Soft-deletes a cart item. The record is retained for analytics (abandoned item tracking).",
  tags: ["Cart"],
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ itemId: z.string() }) },
  responses: {
    204: { description: "Item removed" },
    400: {
      description: "Invalid cart item ID",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: "Cart item not found",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    ...authErrorResponses,
  },
});
router.delete("/items/:itemId", ...customerOnly, removeFromCartHandler);

export default router;

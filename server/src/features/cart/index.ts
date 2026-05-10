import { Router } from "express";
import { z } from "zod";
import { cartRegistry, CartItemSchema, AddToCartBodySchema } from "./cart.schema";
import { getCartHandler, addToCartHandler, removeFromCartHandler } from "./cart.controller";
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
    200: jsonContent(apiSuccessSchema(z.array(CartItemSchema)), "List of cart items"),
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
    body: jsonBody(AddToCartBodySchema),
  },
  responses: {
    201: jsonContent(apiSuccessSchema(CartItemSchema), "Item added to cart"),
    200: jsonContent(apiSuccessSchema(CartItemSchema), "Item already in cart — quantity incremented"),
    404: jsonContent(apiErrorSchema, "Product variant not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    400: jsonContent(apiErrorSchema, "Invalid cart item ID"),
    404: jsonContent(apiErrorSchema, "Cart item not found"),
    ...authErrorResponses,
  },
});
router.delete("/items/:itemId", ...customerOnly, removeFromCartHandler);

export default router;

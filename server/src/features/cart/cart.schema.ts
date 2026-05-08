import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const cartRegistry = new OpenAPIRegistry();

export const CartItemSchema = cartRegistry.register(
  "CartItem",
  z.object({
    id: z.string(),
    customer_id: z.string(),
    product_item_id: z.string(),
    item_qty: z.number().int().min(1),
    purchased: z.boolean().default(false),
    is_deleted: z.boolean().default(false),
  }),
);

export const AddToCartBodySchema = z.object({
  product_item_id: z.string().min(1),
  item_qty: z.number().int().min(1).default(1),
});

export const UpdateCartItemBodySchema = z.object({
  item_qty: z.number().int().min(1),
});

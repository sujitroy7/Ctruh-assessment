import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const orderRegistry = new OpenAPIRegistry();

export const ShippingAddressZodSchema = orderRegistry.register(
  "ShippingAddress",
  z.object({
    full_name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
);

export const OrderItemZodSchema = orderRegistry.register(
  "OrderItem",
  z.object({
    id: z.string(),
    product_item_id: z.string(),
    product_name: z.string(),
    gender: z.string(),
    type: z.string(),
    color: z.string(),
    unit_price: z.number().nonnegative(),
    item_qty: z.number().int().min(1),
    thumbnail_url: z.string().optional(),
  }),
);

export const OrderZodSchema = orderRegistry.register(
  "Order",
  z.object({
    id: z.string(),
    customer_id: z.string(),
    items: z.array(OrderItemZodSchema),
    shipping_address: ShippingAddressZodSchema,
    status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    payment_status: z.enum(["unpaid", "paid", "refunded", "partially_refunded"]),
    total_amount: z.number().nonnegative(),
    idempotency_key: z.string(),
    tracking_number: z.string().optional(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  }),
);

export const OrderListZodSchema = z.object({
  data: z.array(OrderZodSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const CreateOrderBodySchema = z.object({
  idempotency_key: z.string().min(1).openapi({
    description: "Client-generated unique key to deduplicate order creation requests",
  }),
  address_id: z.string().min(1).openapi({
    description: "ID of the saved address subdocument to ship to",
  }),
});

export const UpdateOrderStatusBodySchema = z.object({
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
  tracking_number: z.string().min(1).optional().openapi({
    description: "Required when transitioning status to 'shipped'",
  }),
});

export const UpdatePaymentStatusBodySchema = z.object({
  payment_status: z.enum(["unpaid", "paid", "refunded", "partially_refunded"]),
});

export const OrderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  payment_status: z.enum(["unpaid", "paid", "refunded", "partially_refunded"]).optional(),
});

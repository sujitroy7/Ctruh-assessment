import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const productsRegistry = new OpenAPIRegistry();

export const ProductSchema = productsRegistry.register(
  "Product",
  z.object({
    id: z.string(),
    name: z.string(),
    gender: z.string(),
    type: z.string(),
    color: z.string(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    images: z.array(z.string()).default([]),
    is_deleted: z.boolean().default(false),
    idempotency_key: z.string().optional().openapi({ description: "Client-generated key used to deduplicate create requests" }),
  }),
);

export const ProductListSchema = z.object({
  data: z.array(ProductSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const CreateProductBodySchema = z.object({
  idempotency_key: z.string().min(1).openapi({ description: "Client-generated unique key (e.g. UUID). Re-sending the same key returns the original product instead of creating a duplicate." }),
  name: z.string().min(1),
  gender: z.string().min(1),
  type: z.string().min(1),
  color: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string()).default([]),
});

export const UpdateProductBodySchema = CreateProductBodySchema.partial();

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  gender: z.string().optional().openapi({ description: "Filter by gender (e.g. men, women, unisex)" }),
  type: z.string().optional().openapi({ description: "Filter by product type (e.g. polo, shirt)" }),
  color: z.string().optional().openapi({ description: "Filter by color (e.g. green, blue)" }),
  minPrice: z.coerce.number().nonnegative().optional().openapi({ description: "Minimum price (inclusive)" }),
  maxPrice: z.coerce.number().nonnegative().optional().openapi({ description: "Maximum price (inclusive)" }),
  search: z.string().optional().openapi({ description: "Free-text search across name, type, and gender (e.g. green polo)" }),
});

import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const productsRegistry = new OpenAPIRegistry();

// ── Static type catalogue ────────────────────────────────────────────────────

const PRODUCT_TYPE_IDS = [
  "tee",
  "polo",
  "sweatshirt",
  "hoodie",
  "dress",
  "trousers",
  "shorts",
  "jacket",
] as const;

export type ProductTypeId = (typeof PRODUCT_TYPE_IDS)[number];

export const PRODUCT_TYPES: { id: ProductTypeId; title: string }[] = [
  { id: "tee", title: "T-Shirt" },
  { id: "polo", title: "Polo" },
  { id: "sweatshirt", title: "Sweatshirt" },
  { id: "hoodie", title: "Hoodie" },
  { id: "dress", title: "Dress" },
  { id: "trousers", title: "Trousers" },
  { id: "shorts", title: "Shorts" },
  { id: "jacket", title: "Jacket" },
];

const productTypeIdEnum = z.enum(PRODUCT_TYPE_IDS);

// ── OpenAPI schemas ──────────────────────────────────────────────────────────

export const ProductTypeSchema = productsRegistry.register(
  "ProductType",
  z.object({
    id: productTypeIdEnum,
    title: z.string(),
  }),
);

export const ProductItemSchema = productsRegistry.register(
  "ProductItem",
  z.object({
    id: z.string(),
    gender: z.string(),
    color: z.string(),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative(),
    images: z.array(z.string()).default([]),
    is_deleted: z.boolean().default(false),
  }),
);

export const ProductSchema = productsRegistry.register(
  "Product",
  z.object({
    id: z.string(),
    name: z.string(),
    type: productTypeIdEnum,
    idempotency_key: z.string().optional(),
    is_deleted: z.boolean().default(false),
    items: z.array(ProductItemSchema),
  }),
);

export const ProductListSchema = z.object({
  data: z.array(ProductSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export const CreateProductItemBodySchema = z.object({
  idempotency_key: z.string().min(1).optional().openapi({
    description: "Client-generated unique key to deduplicate item creation requests",
  }),
  gender: z.string().min(1),
  color: z.string().min(1),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string()).default([]),
});

export const CreateProductBodySchema = z.object({
  idempotency_key: z.string().min(1).optional().openapi({
    description: "Client-generated unique key to deduplicate product creation requests",
  }),
  name: z.string().min(1),
  type: productTypeIdEnum.openapi({
    description: `Product type. Must be one of: ${PRODUCT_TYPE_IDS.join(", ")}`,
  }),
  items: z.array(CreateProductItemBodySchema).min(1).openapi({
    description: "At least one variant is required when creating a product",
  }),
});

export const ProductItemsUpdateEntrySchema = z.union([
  z.object({ id: z.string(), _delete: z.literal(true) }).openapi({ description: "Remove an existing variant" }),
  z.object({
    id: z.string(),
    gender: z.string().min(1).optional(),
    color: z.string().min(1).optional(),
    price: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().optional(),
    images: z.array(z.string()).optional(),
  }).openapi({ description: "Update an existing variant" }),
  z.object({
    gender: z.string().min(1),
    color: z.string().min(1),
    price: z.number().nonnegative(),
    stock: z.number().int().nonnegative().default(0),
    images: z.array(z.string()).default([]),
    idempotency_key: z.string().min(1).optional(),
  }).openapi({ description: "Create a new variant" }),
]);

export const UpdateProductBodySchema = z.object({
  name: z.string().min(1).optional(),
  type: productTypeIdEnum.optional().openapi({
    description: `Product type. Must be one of: ${PRODUCT_TYPE_IDS.join(", ")}`,
  }),
  items: z.array(ProductItemsUpdateEntrySchema).optional().openapi({
    description: "Manage variants inline: omit id to create, include id to update fields, include id + _delete:true to remove",
  }),
});

export const UpdateProductItemBodySchema = z.object({
  gender: z.string().min(1).optional(),
  color: z.string().min(1).optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  images: z.array(z.string()).optional(),
});

export const ProductFiltersSchema = productsRegistry.register(
  "ProductFilters",
  z.object({
    genders: z.array(z.string()),
    colors: z.array(z.string()),
    types: z.array(z.string()),
    min_price: z.number().nonnegative().nullable(),
    max_price: z.number().nonnegative().nullable(),
  }),
);

export const ProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  gender: z.string().optional().openapi({ description: "Filter by gender (e.g. men, women, unisex)" }),
  type: productTypeIdEnum.optional().openapi({ description: `Filter by product type. One of: ${PRODUCT_TYPE_IDS.join(", ")}` }),
  color: z.string().optional().openapi({ description: "Filter by color (e.g. green, blue)" }),
  minPrice: z.coerce.number().nonnegative().optional().openapi({ description: "Minimum price (inclusive)" }),
  maxPrice: z.coerce.number().nonnegative().optional().openapi({ description: "Maximum price (inclusive)" }),
  search: z.string().optional().openapi({ description: "Free-text search across product name, type, and gender" }),
});

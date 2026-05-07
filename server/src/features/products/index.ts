import { Router, Request, Response } from "express";
import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const productsRegistry = new OpenAPIRegistry();

// ── Schemas ──────────────────────────────────────────────────────────────────

const ProductSchema = productsRegistry.register(
  "Product",
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price: z.number().nonnegative(),
    category: z.string(),
    inStock: z.boolean(),
    imageUrl: z.url().optional(),
  }),
);

const ProductListSchema = z.object({
  data: z.array(ProductSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

// ── OpenAPI path registrations ────────────────────────────────────────────────

productsRegistry.registerPath({
  method: "get",
  path: "/products",
  summary: "Get all products",
  tags: ["Products"],
  request: {
    query: z.object({
      page: z.coerce.number().int().min(1).default(1).optional(),
      limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
    }),
  },
  responses: {
    200: {
      description: "A paginated list of products",
      content: { "application/json": { schema: ProductListSchema } },
    },
  },
});

productsRegistry.registerPath({
  method: "get",
  path: "/products/{id}",
  summary: "Get a product by ID",
  tags: ["Products"],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "A single product",
      content: { "application/json": { schema: ProductSchema } },
    },
    404: {
      description: "Product not found",
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
    },
  },
});

// ── Mock data ─────────────────────────────────────────────────────────────────

const mockProducts: z.infer<typeof ProductSchema>[] = [
  {
    id: "1",
    name: "Wireless Headphones",
    description: "Premium noise-cancelling over-ear headphones",
    price: 299.99,
    category: "Electronics",
    inStock: true,
    imageUrl: "https://placehold.co/400x400?text=Headphones",
  },
  {
    id: "2",
    name: "Mechanical Keyboard",
    description: "Compact TKL mechanical keyboard with RGB lighting",
    price: 149.99,
    category: "Electronics",
    inStock: true,
    imageUrl: "https://placehold.co/400x400?text=Keyboard",
  },
  {
    id: "3",
    name: "Standing Desk",
    description: "Height-adjustable electric standing desk",
    price: 599.0,
    category: "Furniture",
    inStock: false,
    imageUrl: "https://placehold.co/400x400?text=Desk",
  },
  {
    id: "4",
    name: "Ergonomic Chair",
    description: "Lumbar-support mesh office chair",
    price: 449.0,
    category: "Furniture",
    inStock: true,
    imageUrl: "https://placehold.co/400x400?text=Chair",
  },
  {
    id: "5",
    name: "USB-C Hub",
    description: "7-in-1 multiport adapter with 4K HDMI",
    price: 59.99,
    category: "Electronics",
    inStock: true,
    imageUrl: "https://placehold.co/400x400?text=Hub",
  },
];

// ── Router ────────────────────────────────────────────────────────────────────

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const start = (page - 1) * limit;
  const data = mockProducts.slice(start, start + limit);

  res.json({ data, total: mockProducts.length, page, limit });
});

router.get("/:id", (req: Request, res: Response) => {
  const product = mockProducts.find((p) => p.id === req.params.id);

  if (!product) {
    res.status(404).json({ message: `Product with id '${req.params.id}' not found` });
    return;
  }

  res.json(product);
});

export default router;

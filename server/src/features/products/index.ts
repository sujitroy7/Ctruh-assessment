import { Router } from "express";
import { z } from "zod";
import {
  CreateProductBodySchema,
  ProductListQuerySchema,
  ProductListSchema,
  ProductSchema,
  UpdateProductBodySchema,
  productsRegistry,
} from "./product.schema";
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from "./product.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";

const router = Router();

const ownerOnly = [requireAuth, requireRole("owner")];

const authErrorResponses = {
  401: {
    description: "Not authenticated",
    content: { "application/json": { schema: z.object({ message: z.string() }) } },
  },
  403: {
    description: "Forbidden — owner role required",
    content: { "application/json": { schema: z.object({ message: z.string() }) } },
  },
};

// ======================================================
// ROUTE: GET ALL PRODUCTS
// ======================================================
productsRegistry.registerPath({
  method: "get",
  path: "/products",
  summary: "Get all products",
  tags: ["Products"],
  request: {
    query: ProductListQuerySchema,
  },
  responses: {
    200: {
      description: "A paginated list of products",
      content: { "application/json": { schema: ProductListSchema } },
    },
  },
});
router.get("/", listProducts);

// ======================================================
// ROUTE: GET PRODUCT BY ID
// ======================================================
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
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
  },
});
router.get("/:id", getProduct);

// ======================================================
// ROUTE: CREATE PRODUCT
// ======================================================
productsRegistry.registerPath({
  method: "post",
  path: "/products",
  summary: "Create a product",
  tags: ["Products"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateProductBodySchema } },
      required: true,
    },
  },
  responses: {
    201: {
      description: "Product created",
      content: { "application/json": { schema: ProductSchema } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } },
    },
    ...authErrorResponses,
  },
});
router.post("/", ...ownerOnly, createProductHandler);

// ======================================================
// ROUTE: UPDATE PRODUCT
// ======================================================
productsRegistry.registerPath({
  method: "patch",
  path: "/products/{id}",
  summary: "Update a product",
  tags: ["Products"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateProductBodySchema } },
      required: true,
    },
  },
  responses: {
    200: {
      description: "Product updated",
      content: { "application/json": { schema: ProductSchema } },
    },
    400: {
      description: "Invalid product ID",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: "Product not found",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    422: {
      description: "Validation failed",
      content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } },
    },
    ...authErrorResponses,
  },
});
router.patch("/:id", ...ownerOnly, updateProductHandler);

// ======================================================
// ROUTE: DELETE PRODUCT
// ======================================================
productsRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  summary: "Delete a product",
  tags: ["Products"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    204: { description: "Product deleted" },
    400: {
      description: "Invalid product ID",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    404: {
      description: "Product not found",
      content: { "application/json": { schema: z.object({ message: z.string() }) } },
    },
    ...authErrorResponses,
  },
});
router.delete("/:id", ...ownerOnly, deleteProductHandler);

export default router;

import { Router } from "express";
import { z } from "zod";
import {
  CreateProductBodySchema,
  CreateProductItemBodySchema,
  ProductListQuerySchema,
  ProductListSchema,
  ProductSchema,
  ProductItemSchema,
  UpdateProductBodySchema,
  UpdateProductItemBodySchema,
  productsRegistry,
} from "./product.schema";
import {
  listProducts,
  getProduct,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
  addProductItemHandler,
  updateProductItemHandler,
  deleteProductItemHandler,
} from "./product.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import { authErrorResponses } from "../../utils/openapi";

const router = Router();

const ownerOnly = [requireAuth, requireRole("owner")];

// ======================================================
// ROUTE: GET ALL PRODUCTS
// ======================================================
productsRegistry.registerPath({
  method: "get",
  path: "/products",
  summary: "Get all products",
  description: "Returns paginated products with their variants. Filters (gender, type, color, price) apply to variants. Search matches product name, type, or gender.",
  tags: ["Products"],
  request: { query: ProductListQuerySchema },
  responses: {
    200: {
      description: "A paginated list of products with their variants",
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
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "Product with all its variants",
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
  description: "Creates a product and its initial variants in one request.",
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
  description: "Updates the product name. To manage variants use the /items sub-routes.",
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
    400: { description: "Invalid product ID", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    404: { description: "Product not found", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    422: { description: "Validation failed", content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } } },
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
  description: "Soft-deletes the product and all its variants.",
  tags: ["Products"],
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: "Product deleted" },
    400: { description: "Invalid product ID", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    404: { description: "Product not found", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    ...authErrorResponses,
  },
});
router.delete("/:id", ...ownerOnly, deleteProductHandler);

// ======================================================
// ROUTE: ADD PRODUCT ITEM (VARIANT)
// ======================================================
productsRegistry.registerPath({
  method: "post",
  path: "/products/{id}/items",
  summary: "Add a variant to a product",
  tags: ["Product Items"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: CreateProductItemBodySchema } },
      required: true,
    },
  },
  responses: {
    201: { description: "Variant created", content: { "application/json": { schema: ProductItemSchema } } },
    200: { description: "Duplicate idempotency_key — existing variant returned", content: { "application/json": { schema: ProductItemSchema } } },
    400: { description: "Invalid product ID", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    404: { description: "Product not found", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    422: { description: "Validation failed", content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } } },
    ...authErrorResponses,
  },
});
router.post("/:id/items", ...ownerOnly, addProductItemHandler);

// ======================================================
// ROUTE: UPDATE PRODUCT ITEM
// ======================================================
productsRegistry.registerPath({
  method: "patch",
  path: "/products/{id}/items/{itemId}",
  summary: "Update a product variant",
  tags: ["Product Items"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string(), itemId: z.string() }),
    body: {
      content: { "application/json": { schema: UpdateProductItemBodySchema } },
      required: true,
    },
  },
  responses: {
    200: { description: "Variant updated", content: { "application/json": { schema: ProductItemSchema } } },
    400: { description: "Invalid ID", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    404: { description: "Variant not found", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    422: { description: "Validation failed", content: { "application/json": { schema: z.object({ message: z.string(), errors: z.record(z.string(), z.array(z.string())) }) } } },
    ...authErrorResponses,
  },
});
router.patch("/:id/items/:itemId", ...ownerOnly, updateProductItemHandler);

// ======================================================
// ROUTE: DELETE PRODUCT ITEM
// ======================================================
productsRegistry.registerPath({
  method: "delete",
  path: "/products/{id}/items/{itemId}",
  summary: "Delete a product variant",
  tags: ["Product Items"],
  security: [{ cookieAuth: [] }],
  request: { params: z.object({ id: z.string(), itemId: z.string() }) },
  responses: {
    204: { description: "Variant deleted" },
    400: { description: "Invalid ID", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    404: { description: "Variant not found", content: { "application/json": { schema: z.object({ message: z.string() }) } } },
    ...authErrorResponses,
  },
});
router.delete("/:id/items/:itemId", ...ownerOnly, deleteProductItemHandler);

export default router;

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

const router = Router();

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
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
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
  },
});
router.post("/", createProductHandler);

// ======================================================
// ROUTE: UPDATE PRODUCT
// ======================================================
productsRegistry.registerPath({
  method: "patch",
  path: "/products/{id}",
  summary: "Update a product",
  tags: ["Products"],
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
  },
});
router.patch("/:id", updateProductHandler);

// ======================================================
// ROUTE: DELETE PRODUCT
// ======================================================
productsRegistry.registerPath({
  method: "delete",
  path: "/products/{id}",
  summary: "Delete a product",
  tags: ["Products"],
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
  },
});
router.delete("/:id", deleteProductHandler);

export default router;

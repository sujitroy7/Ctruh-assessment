import { Router } from "express";
import { z } from "zod";
import {
  CreateProductBodySchema,
  CreateProductItemBodySchema,
  ProductListQuerySchema,
  ProductListSchema,
  ProductSchema,
  ProductItemSchema,
  ProductTypeSchema,
  UpdateProductBodySchema,
  UpdateProductItemBodySchema,
  productsRegistry,
} from "./product.schema";
import {
  listProductTypes,
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
import {
  jsonContent,
  jsonBody,
  apiSuccessSchema,
  apiErrorSchema,
  apiValidationErrorSchema,
  authErrorResponses,
} from "../../utils/openapi";

const router = Router();

const ownerOnly = [requireAuth, requireRole("owner")];

// ======================================================
// ROUTE: GET PRODUCT TYPES
// ======================================================
productsRegistry.registerPath({
  method: "get",
  path: "/products/types",
  summary: "Get all product types",
  description: "Returns the static list of supported product types.",
  tags: ["Products"],
  responses: {
    200: jsonContent(apiSuccessSchema(z.array(ProductTypeSchema)), "List of product types"),
  },
});
router.get("/types", listProductTypes);

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
    200: jsonContent(apiSuccessSchema(ProductListSchema), "A paginated list of products with their variants"),
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
    200: jsonContent(apiSuccessSchema(ProductSchema), "Product with all its variants"),
    400: jsonContent(apiErrorSchema, "Invalid product ID"),
    404: jsonContent(apiErrorSchema, "Product not found"),
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
    body: jsonBody(CreateProductBodySchema),
  },
  responses: {
    201: jsonContent(apiSuccessSchema(ProductSchema), "Product created"),
    200: jsonContent(apiSuccessSchema(ProductSchema), "Duplicate idempotency_key — existing product returned"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
  description: "Updates product metadata and optionally manages its variants inline (create / update / remove). To manage variants individually use the /items sub-routes.",
  tags: ["Products"],
  security: [{ cookieAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: jsonBody(UpdateProductBodySchema),
  },
  responses: {
    200: jsonContent(apiSuccessSchema(ProductSchema), "Product updated"),
    400: jsonContent(apiErrorSchema, "Invalid product ID"),
    404: jsonContent(apiErrorSchema, "Product not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    400: jsonContent(apiErrorSchema, "Invalid product ID"),
    404: jsonContent(apiErrorSchema, "Product not found"),
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
    body: jsonBody(CreateProductItemBodySchema),
  },
  responses: {
    201: jsonContent(apiSuccessSchema(ProductItemSchema), "Variant created"),
    200: jsonContent(apiSuccessSchema(ProductItemSchema), "Duplicate idempotency_key — existing variant returned"),
    400: jsonContent(apiErrorSchema, "Invalid product ID"),
    404: jsonContent(apiErrorSchema, "Product not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    body: jsonBody(UpdateProductItemBodySchema),
  },
  responses: {
    200: jsonContent(apiSuccessSchema(ProductItemSchema), "Variant updated"),
    400: jsonContent(apiErrorSchema, "Invalid ID"),
    404: jsonContent(apiErrorSchema, "Variant not found"),
    422: jsonContent(apiValidationErrorSchema, "Validation failed"),
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
    400: jsonContent(apiErrorSchema, "Invalid ID"),
    404: jsonContent(apiErrorSchema, "Variant not found"),
    ...authErrorResponses,
  },
});
router.delete("/:id/items/:itemId", ...ownerOnly, deleteProductItemHandler);

export default router;

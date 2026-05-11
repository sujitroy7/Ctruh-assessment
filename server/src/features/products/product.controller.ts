import { Request, Response, NextFunction } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductItem,
  updateProductItem,
  deleteProductItem,
  getProductFilters,
} from "./product.service";
import {
  CreateProductBodySchema,
  UpdateProductBodySchema,
  CreateProductItemBodySchema,
  UpdateProductItemBodySchema,
  PRODUCT_TYPES,
} from "./product.schema";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response";

export async function listProductFilters(_req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, await getProductFilters());
  } catch (err) {
    next(err);
  }
}

export function listProductTypes(_req: Request, res: Response) {
  sendSuccess(res, PRODUCT_TYPES);
}

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

    sendSuccess(res,
      await getProducts({
        page,
        limit,
        gender: req.query.gender as string | undefined,
        type: req.query.type as string | undefined,
        color: req.query.color as string | undefined,
        minPrice: minPrice !== undefined && !isNaN(minPrice) ? minPrice : undefined,
        maxPrice: maxPrice !== undefined && !isNaN(maxPrice) ? maxPrice : undefined,
        search: req.query.search as string | undefined,
      }),
    );
  } catch (err) {
    next(err);
  }
}

export async function getProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getProductById(req.params.id);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid product ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product '${req.params.id}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateProductBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await createProduct(parsed.data);
    sendSuccess(res, result.data, result.created ? 201 : 200);
  } catch (err) {
    next(err);
  }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateProductBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await updateProduct(req.params.id, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid product ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product '${req.params.id}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteProduct(req.params.id);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid product ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product '${req.params.id}' not found`, 404);
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addProductItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateProductItemBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await addProductItem(req.params.id, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid product ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product '${req.params.id}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data, result.created ? 201 : 200);
  } catch (err) {
    next(err);
  }
}

export async function updateProductItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateProductItemBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await updateProductItem(req.params.id, req.params.itemId, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product item '${req.params.itemId}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteProductItem(req.params.id, req.params.itemId);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Product item '${req.params.itemId}' not found`, 404);
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

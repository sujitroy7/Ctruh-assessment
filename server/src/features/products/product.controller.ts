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
} from "./product.service";
import {
  CreateProductBodySchema,
  UpdateProductBodySchema,
  CreateProductItemBodySchema,
  UpdateProductItemBodySchema,
} from "./product.schema";

export async function listProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const minPrice = req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined;
    const maxPrice = req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined;

    res.json(
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
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product '${req.params.id}' not found` });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function createProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateProductBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await createProduct(parsed.data);
    res.status(201).json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function updateProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateProductBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await updateProduct(req.params.id, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product '${req.params.id}' not found` });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteProduct(req.params.id);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product '${req.params.id}' not found` });
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
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await addProductItem(req.params.id, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid product ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product '${req.params.id}' not found` });
      return;
    }

    res.status(result.created ? 201 : 200).json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function updateProductItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateProductItemBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await updateProductItem(req.params.id, req.params.itemId, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product item '${req.params.itemId}' not found` });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteProductItemHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteProductItem(req.params.id, req.params.itemId);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Product item '${req.params.itemId}' not found` });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

import { Request, Response, NextFunction } from "express";
import { getCart, addToCart, removeFromCart } from "./cart.service";
import { AddToCartBodySchema } from "./cart.schema";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response";

export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getCart(req.user!.sub);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid customer ID", 400);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function addToCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = AddToCartBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await addToCart(req.user!.sub, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid ID", 400);
      return;
    }
    if (result.error === "product_not_found") {
      sendError(res, `Product item '${parsed.data.product_item_id}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data, result.created ? 201 : 200);
  } catch (err) {
    next(err);
  }
}

export async function removeFromCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await removeFromCart(req.user!.sub, req.params.itemId);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid cart item ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Cart item '${req.params.itemId}' not found`, 404);
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

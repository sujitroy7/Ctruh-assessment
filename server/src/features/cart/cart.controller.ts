import { Request, Response, NextFunction } from "express";
import { getCart, addToCart, removeFromCart } from "./cart.service";
import { AddToCartBodySchema } from "./cart.schema";

export async function getCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getCart(req.user!.sub);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid customer ID" });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function addToCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = AddToCartBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await addToCart(req.user!.sub, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    if (result.error === "product_not_found") {
      res.status(404).json({ message: `Product item '${parsed.data.product_item_id}' not found` });
      return;
    }

    res.status(result.created ? 201 : 200).json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function removeFromCartHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await removeFromCart(req.user!.sub, req.params.itemId);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid cart item ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: `Cart item '${req.params.itemId}' not found` });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

import { isValidObjectId } from "mongoose";
import { Cart } from "./cart.model";
import { ProductItem } from "../products/product.model";

export async function getCart(customerId: string) {
  if (!isValidObjectId(customerId)) return { error: "invalid_id" as const };

  const items = await Cart.find({ customer_id: customerId, is_deleted: false, purchased: false }).lean();
  return { data: items };
}

export async function addToCart(customerId: string, body: { product_item_id: string; item_qty: number }) {
  if (!isValidObjectId(customerId) || !isValidObjectId(body.product_item_id)) {
    return { error: "invalid_id" as const };
  }

  const productItem = await ProductItem.findOne({ _id: body.product_item_id, is_deleted: false }).lean();
  if (!productItem) return { error: "product_not_found" as const };

  const existing = await Cart.findOne({
    customer_id: customerId,
    product_item_id: body.product_item_id,
    is_deleted: false,
    purchased: false,
  }).lean();

  const item = await Cart.findOneAndUpdate(
    { customer_id: customerId, product_item_id: body.product_item_id, is_deleted: false, purchased: false },
    { $inc: { item_qty: body.item_qty } },
    { upsert: true, new: true },
  ).lean();

  return { data: item, created: !existing };
}

export async function removeFromCart(customerId: string, cartItemId: string) {
  if (!isValidObjectId(customerId) || !isValidObjectId(cartItemId)) {
    return { error: "invalid_id" as const };
  }

  const item = await Cart.findOneAndUpdate(
    { _id: cartItemId, customer_id: customerId, is_deleted: false, purchased: false },
    { $set: { is_deleted: true } },
    { new: true },
  ).lean();

  if (!item) return { error: "not_found" as const };

  return { data: null };
}

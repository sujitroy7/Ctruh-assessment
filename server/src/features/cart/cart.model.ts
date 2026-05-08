import { Schema, model, Document, Types } from "mongoose";

export interface ICart extends Document {
  customer_id: Types.ObjectId;
  product_item_id: Types.ObjectId;
  item_qty: number;
  purchased: boolean;
  is_deleted: boolean;
}

const CartSchema = new Schema<ICart>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true, index: true },
    product_item_id: { type: Schema.Types.ObjectId, ref: "ProductItem", required: true },
    item_qty: { type: Number, required: true, min: 1, default: 1 },
    purchased: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Prevent duplicate active cart entries for the same product variant
CartSchema.index(
  { customer_id: 1, product_item_id: 1 },
  { unique: true, partialFilterExpression: { is_deleted: false, purchased: false } },
);

export const Cart = model<ICart>("Cart", CartSchema);

import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
  name: string;
  is_deleted: boolean;
}

export interface IProductItem extends Document {
  product_id: Types.ObjectId;
  gender: string;
  type: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
  idempotency_key?: string;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ProductItemSchema = new Schema<IProductItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    gender: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    is_deleted: { type: Boolean, default: false },
    idempotency_key: { type: String, sparse: true, unique: true },
  },
  { timestamps: true },
);

export const Product = model<IProduct>("Product", ProductSchema);
export const ProductItem = model<IProductItem>("ProductItem", ProductItemSchema, "product_items");

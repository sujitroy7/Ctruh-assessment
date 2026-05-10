import { Schema, model, Document, Types } from "mongoose";

export interface IProductItem {
  _id: Types.ObjectId;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
  idempotency_key?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct extends Document {
  name: string;
  type: string;
  idempotency_key?: string;
  is_deleted: boolean;
  items: IProductItem[];
}

const ProductItemSchema = new Schema<IProductItem>(
  {
    gender: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    is_deleted: { type: Boolean, default: false },
    idempotency_key: { type: String },
  },
  { timestamps: true },
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    idempotency_key: { type: String },
    is_deleted: { type: Boolean, default: false },
    items: { type: [ProductItemSchema], default: [] },
  },
  { timestamps: true },
);

ProductSchema.index({ idempotency_key: 1 }, { unique: true, sparse: true });

// Enforce uniqueness of idempotency_key across all embedded items
ProductSchema.index({ "items.idempotency_key": 1 }, { unique: true, sparse: true });

export const Product = model<IProduct>("Product", ProductSchema);

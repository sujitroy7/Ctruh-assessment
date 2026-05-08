import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
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

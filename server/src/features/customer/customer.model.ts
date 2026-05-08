import { Schema, model, Document, Types } from "mongoose";

export interface IAddress {
  _id: Types.ObjectId;
  idempotency_key: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface ICustomer extends Document {
  email: string;
  f_name: string;
  l_name: string;
  password_hash: string;
  is_deleted: boolean;
  addresses: Types.DocumentArray<IAddress>;
}

const AddressSubdocSchema = new Schema<IAddress>(
  {
    idempotency_key: { type: String, required: true },
    full_name: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postal_code: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: true },
);

const CustomerSchema = new Schema<ICustomer>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    f_name: { type: String, required: true, trim: true },
    l_name: { type: String, required: true, trim: true },
    password_hash: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
    addresses: { type: [AddressSubdocSchema], default: [] },
  },
  { timestamps: true },
);

export const Customer = model<ICustomer>("Customer", CustomerSchema);

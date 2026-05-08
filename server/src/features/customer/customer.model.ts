import { Schema, model, Document, Types } from "mongoose";

export interface ICustomer extends Document {
  email: string;
  f_name: string;
  l_name: string;
  password_hash: string;
  is_deleted: boolean;
  address_id: Types.ObjectId;
}

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
    address_id: { type: Schema.Types.ObjectId, ref: "Address" },
  },
  { timestamps: true },
);

export const Customer = model<ICustomer>("Customer", CustomerSchema);

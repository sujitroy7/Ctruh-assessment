import { Schema, model, Document } from "mongoose";

export interface IOwner extends Document {
  email: string;
  password_hash: string;
  is_deleted: boolean;
}

const OwnerSchema = new Schema<IOwner>(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password_hash: { type: String, required: true },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Owner = model<IOwner>("Owner", OwnerSchema);

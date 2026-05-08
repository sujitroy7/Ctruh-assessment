import { Schema, model, Document, Types } from "mongoose";

export type Role = "owner" | "customer";

const REFRESH_TOKEN_TTL_DAYS = 15;

export interface IRefreshToken extends Document {
  subject_id: Types.ObjectId;
  role: Role;
  token: string;
  expires_at: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    subject_id: { type: Schema.Types.ObjectId, required: true, index: true },
    role: { type: String, enum: ["owner", "customer"] as Role[], required: true },
    token: { type: String, required: true, unique: true },
    expires_at: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true },
);

export const RefreshToken = model<IRefreshToken>("RefreshToken", RefreshTokenSchema);

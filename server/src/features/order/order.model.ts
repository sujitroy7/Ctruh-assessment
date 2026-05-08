import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "partially_refunded";

export interface IOrderItem {
  _id: Types.ObjectId;
  product_item_id: Types.ObjectId;
  product_name: string;
  gender: string;
  type: string;
  color: string;
  unit_price: number;
  item_qty: number;
  thumbnail_url?: string;
}

export interface IShippingAddress {
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}

export interface IOrder extends Document {
  customer_id: Types.ObjectId;
  items: IOrderItem[];
  shipping_address: IShippingAddress;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  idempotency_key: string;
  tracking_number?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product_item_id: { type: Schema.Types.ObjectId, required: true },
  product_name: { type: String, required: true },
  gender: { type: String, required: true },
  type: { type: String, required: true },
  color: { type: String, required: true },
  unit_price: { type: Number, required: true, min: 0 },
  item_qty: { type: Number, required: true, min: 1 },
  thumbnail_url: { type: String },
});

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    full_name: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false },
);

const ORDER_STATUSES: OrderStatus[] = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "paid", "refunded", "partially_refunded"];

const OrderSchema = new Schema<IOrder>(
  {
    customer_id: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
    items: { type: [OrderItemSchema], required: true },
    shipping_address: { type: ShippingAddressSchema, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "pending" },
    payment_status: { type: String, enum: PAYMENT_STATUSES, default: "unpaid" },
    total_amount: { type: Number, required: true, min: 0 },
    idempotency_key: { type: String, required: true },
    tracking_number: { type: String },
  },
  { timestamps: true },
);

OrderSchema.index({ customer_id: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ idempotency_key: 1 }, { unique: true, sparse: true });
OrderSchema.index({ payment_status: 1 });
OrderSchema.index({ "items.product_item_id": 1 });

export const Order = model<IOrder>("Order", OrderSchema);

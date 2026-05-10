export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "refunded"
  | "partially_refunded";

export type OrderItem = {
  id: string;
  product_item_id: string;
  product_name: string;
  gender: string;
  type: string;
  color: string;
  unit_price: number;
  item_qty: number;
  thumbnail_url?: string;
};

export type Order = {
  id: string;
  customer_id: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total_amount: number;
  idempotency_key: string;
  tracking_number?: string;
  createdAt: string;
  updatedAt: string;
};

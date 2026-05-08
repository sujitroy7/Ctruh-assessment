import mongoose, { isValidObjectId } from "mongoose";
import { Cart } from "../cart/cart.model";
import { Product } from "../products/product.model";
import { Customer } from "../customer/customer.model";
import { Order, IOrderItem, IShippingAddress, OrderStatus, PaymentStatus } from "./order.model";
import { isDuplicateKeyError } from "../../utils/mongoose";

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

export async function createOrder(customerId: string, body: { idempotency_key: string; address_id: string }) {
  if (!isValidObjectId(customerId)) return { error: "invalid_id" as const };

  const cartItems = await Cart.find({ customer_id: customerId, is_deleted: false, purchased: false }).lean();
  if (cartItems.length === 0) return { error: "cart_empty" as const };

  const orderItems: Omit<IOrderItem, "_id">[] = [];
  for (const cartItem of cartItems) {
    const product = await Product.findOne({
      is_deleted: false,
      items: { $elemMatch: { _id: cartItem.product_item_id, is_deleted: false } },
    }).lean();
    if (!product) return { error: "product_unavailable" as const };

    const item = product.items.find((i) => i._id.toString() === cartItem.product_item_id.toString());
    if (!item || item.stock < cartItem.item_qty) return { error: "product_unavailable" as const };

    orderItems.push({
      product_item_id: cartItem.product_item_id,
      product_name: product.name,
      gender: item.gender,
      type: item.type,
      color: item.color,
      unit_price: item.price,
      item_qty: cartItem.item_qty,
      thumbnail_url: item.images[0],
    });
  }

  const total_amount = orderItems.reduce((sum, i) => sum + i.unit_price * i.item_qty, 0);

  const customer = await Customer.findById(customerId).lean();
  const address = customer?.addresses?.find((a) => a._id.toString() === body.address_id);
  if (!address) return { error: "no_address" as const };

  const shipping_address: IShippingAddress = {
    full_name: address.full_name,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postal_code: address.postal_code,
    country: address.country,
    phone: address.phone,
  };

  const cartItemIds = cartItems.map((c) => c._id);
  const session = await mongoose.startSession();
  try {
    let created: any;
    await session.withTransaction(async () => {
      [created] = await Order.create(
        [{ customer_id: customerId, items: orderItems, shipping_address, total_amount, idempotency_key: body.idempotency_key }],
        { session },
      );
      await Cart.updateMany({ _id: { $in: cartItemIds } }, { $set: { purchased: true } }, { session });
    });
    return { data: created };
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      const existing = await Order.findOne({ idempotency_key: body.idempotency_key }).lean();
      return { data: existing! };
    }
    throw err;
  } finally {
    await session.endSession();
  }
}

export async function getOrdersByCustomer(customerId: string, page: number, limit: number) {
  if (!isValidObjectId(customerId)) return { error: "invalid_id" as const };

  const [data, total] = await Promise.all([
    Order.find({ customer_id: customerId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Order.countDocuments({ customer_id: customerId }),
  ]);

  return { data: { data, total, page, limit } };
}

export async function getOrderById(orderId: string, customerId: string) {
  if (!isValidObjectId(orderId) || !isValidObjectId(customerId)) {
    return { error: "invalid_id" as const };
  }

  const order = await Order.findOne({ _id: orderId, customer_id: customerId }).lean();
  if (!order) return { error: "not_found" as const };

  return { data: order };
}

export async function listAllOrders(filters: {
  page: number;
  limit: number;
  status?: OrderStatus;
  payment_status?: PaymentStatus;
}) {
  const query: Record<string, unknown> = {};
  if (filters.status) query.status = filters.status;
  if (filters.payment_status) query.payment_status = filters.payment_status;

  const [data, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  return { data: { data, total, page: filters.page, limit: filters.limit } };
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, tracking_number?: string) {
  if (!isValidObjectId(orderId)) return { error: "invalid_id" as const };

  const order = await Order.findById(orderId).lean();
  if (!order) return { error: "not_found" as const };

  if (!VALID_TRANSITIONS[order.status].includes(status)) {
    return { error: "invalid_transition" as const };
  }

  const update: Record<string, unknown> = { status };
  if (tracking_number) update.tracking_number = tracking_number;

  const updated = await Order.findByIdAndUpdate(orderId, { $set: update }, { new: true }).lean();
  return { data: updated! };
}

export async function updatePaymentStatus(orderId: string, payment_status: PaymentStatus) {
  if (!isValidObjectId(orderId)) return { error: "invalid_id" as const };

  const order = await Order.findByIdAndUpdate(orderId, { $set: { payment_status } }, { new: true }).lean();
  if (!order) return { error: "not_found" as const };

  return { data: order };
}

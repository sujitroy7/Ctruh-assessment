import { Request, Response, NextFunction } from "express";
import {
  createOrder,
  getOrdersByCustomer,
  getOrderById,
  listAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
} from "./order.service";
import {
  CreateOrderBodySchema,
  UpdateOrderStatusBodySchema,
  UpdatePaymentStatusBodySchema,
  OrderListQuerySchema,
} from "./order.schema";
import { OrderStatus, PaymentStatus } from "./order.model";
import { sendSuccess, sendError, sendValidationError } from "../../utils/response";

export async function createOrderHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = CreateOrderBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await createOrder(req.user!.sub, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid customer ID", 400);
      return;
    }
    if (result.error === "cart_empty") {
      sendError(res, "Cart is empty", 422);
      return;
    }
    if (result.error === "product_unavailable") {
      sendError(res, "One or more products are unavailable or out of stock", 422);
      return;
    }
    if (result.error === "no_address") {
      sendError(res, "No shipping address on file — add an address before placing an order", 422);
      return;
    }

    sendSuccess(res, result.data, 201);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = OrderListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const { page = 1, limit = 10 } = parsed.data;
    const result = await getOrdersByCustomer(req.user!.sub, page, limit);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid customer ID", 400);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function getMyOrderByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getOrderById(req.params.orderId, req.user!.sub);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid order ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Order '${req.params.orderId}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function listAllOrdersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = OrderListQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const { page = 1, limit = 10, status, payment_status } = parsed.data;
    const result = await listAllOrders({
      page,
      limit,
      status: status as OrderStatus | undefined,
      payment_status: payment_status as PaymentStatus | undefined,
    });

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateOrderStatusBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await updateOrderStatus(req.params.orderId, parsed.data.status, parsed.data.tracking_number);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid order ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Order '${req.params.orderId}' not found`, 404);
      return;
    }
    if (result.error === "invalid_transition") {
      sendError(res, `Cannot transition order to '${parsed.data.status}' from its current status`, 422);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function updatePaymentStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdatePaymentStatusBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await updatePaymentStatus(req.params.orderId, parsed.data.payment_status);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid order ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, `Order '${req.params.orderId}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

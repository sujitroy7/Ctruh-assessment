import { ApiResponse } from "@/types/api";
import { Order } from "@/types/orders";
import api from ".";

export interface CreateOrderPayload {
  idempotency_key: string;
  address_id: string;
}

type CreateOrderResponse = ApiResponse<Order>;
export const createOrder = async (data: CreateOrderPayload) => {
  const response = await api.post<CreateOrderResponse>("/orders", data);
  return response.data;
};

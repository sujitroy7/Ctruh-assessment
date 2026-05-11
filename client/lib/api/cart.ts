import { ApiResponse } from "@/types/api";
import api from ".";

export interface BackendCartItem {
  _id: string;
  customer_id: string;
  product_item_id: string;
  item_qty: number;
  purchased: boolean;
  is_deleted: boolean;
}

type GetCartResponse = ApiResponse<BackendCartItem[]>;
export const getCart = async () => {
  const response = await api.get<GetCartResponse>("/cart");
  return response.data;
};

type AddToCartResponse = ApiResponse<BackendCartItem>;
export const addCartItem = async (productItemId: string, qty: number) => {
  const response = await api.post<AddToCartResponse>("/cart/items", {
    product_item_id: productItemId,
    item_qty: qty,
  });
  return response.data;
};

type UpdateCartItemResponse = ApiResponse<BackendCartItem>;
export const updateCartItemQty = async (cartItemId: string, qty: number) => {
  const response = await api.patch<UpdateCartItemResponse>(
    `/cart/items/${cartItemId}`,
    { item_qty: qty },
  );
  return response.data;
};

export const removeCartItem = async (cartItemId: string) => {
  await api.delete(`/cart/items/${cartItemId}`);
};

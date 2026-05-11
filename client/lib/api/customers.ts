import { ApiResponse } from "@/types/api";
import { Address, ShippingAddress } from "@/types/address";
import api from ".";

type AddressResponse = ApiResponse<Address>;
type AddressListResponse = ApiResponse<Address[]>;

export const listAddresses = async () => {
  const response = await api.get<AddressListResponse>("/customers/me/addresses");
  return response.data;
};

export const addAddress = async (
  data: ShippingAddress & { idempotency_key: string },
) => {
  const response = await api.post<AddressResponse>(
    "/customers/me/addresses",
    data,
  );
  return response.data;
};

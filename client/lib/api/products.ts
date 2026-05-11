import {
  ApiResponse,
  IdempotencyKey,
  PaginatedResponse,
  PaginationReqeustParams,
} from "@/types/api";
import { Product, ProductType } from "@/types/products";
import api from ".";

interface ProductItemPayload {
  idempotency_key?: string;
  gender: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
}

export interface CreateProductPayload extends IdempotencyKey {
  name: string;
  type: string;
  items: ProductItemPayload[];
}

type UpdateItemEntry =
  | { id: string; _delete: true }
  | { id: string; gender?: string; color?: string; price?: number; stock?: number; images?: string[] }
  | ProductItemPayload;

export interface UpdateProductPayload {
  name?: string;
  type?: string;
  items?: UpdateItemEntry[];
}

// ----- GET PRODUCT TYPES -----
type GetProductTypesResponse = ApiResponse<ProductType[]>;
export const getProductTypes = async () => {
  const response = await api.get<GetProductTypesResponse>("/products/types");

  return response.data;
};

// ----- GET PRODUCT FILTERS -----
type GetFilterResponse = ApiResponse<{
  genders: string[];
  colors: string[];
  types: string[];
  min_price: number;
  max_price: number;
}>;
export const getFilters = async () => {
  const response = await api.get<GetFilterResponse>("/products/filters");
  return response.data;
};

// ----- GET ALL PRODUCTS -----
interface GetAllProductsParams extends PaginationReqeustParams {
  type?: string;
  gender?: string;
  color?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
}
type GetAllProductsResponse = ApiResponse<PaginatedResponse<Product>>;
export const getAllProducts = async (params?: GetAllProductsParams) => {
  const response = await api.get<GetAllProductsResponse>("/products", {
    params,
  });

  return response.data;
};

// ----- GET PRODUCT BY ID -----
type GetProductByIdResponse = ApiResponse<Product>;
export const getProductById = async (id: string) => {
  const response = await api.get<GetProductByIdResponse>(`/products/${id}`);

  return response.data;
};

// ----- CREATE NEW PRODUCT -----
type CreateProductResponse = ApiResponse<Product>;
export const createProduct = async (data: CreateProductPayload) => {
  const response = await api.post<CreateProductResponse>("/products", data);

  return response.data;
};

// ----- UPDATE PRODUCT BY ID -----
type UpdateProductResponse = ApiResponse<Product>;
export const updateProduct = async (id: string, data: UpdateProductPayload) => {
  const response = await api.patch<UpdateProductResponse>(
    `/products/${id}`,
    data,
  );

  return response.data;
};

export type Gender = "male" | "female" | "unisex";

export type ProductType = {
  id: string;
  title: string;
};

export interface ProductItem {
  id: string;
  gender: Gender;
  color: string;
  price: number;
  stock: number;
  images?: string[];
  is_deleted?: boolean;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  items: ProductItem[];
  is_deleted?: boolean;
}

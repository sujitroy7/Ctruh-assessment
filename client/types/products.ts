export type Gender = "male" | "female" | "unisex";

export type ProductType = {
  id: string;
  title: string;
};

export interface ProductItem {
  _id: string;
  gender: Gender;
  color: string;
  price: number;
  stock: number;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  type: ProductType;
  items: ProductItem[];
}

import { FilterQuery } from "mongoose";
import { isValidObjectId } from "mongoose";
import { Product, IProduct } from "./product.model";
import { isDuplicateKeyError } from "../../utils/mongoose";

export interface ProductFilters {
  page: number;
  limit: number;
  gender?: string;
  type?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export async function getProducts(filters: ProductFilters) {
  const { page, limit, gender, type, color, minPrice, maxPrice, search } = filters;

  const query: FilterQuery<IProduct> = { is_deleted: false };

  if (gender) query.gender = gender;
  if (type) query.type = type;
  if (color) query.color = color;

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  if (search) {
    const re = new RegExp(search, "i");
    query.$or = [{ name: re }, { type: re }, { gender: re }];
  }

  const [data, total] = await Promise.all([
    Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  return { data, total, page, limit };
}

export async function getProductById(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOne({
    _id: id,
    is_deleted: false,
  }).lean();

  if (!product) return { error: "not_found" as const };

  return { data: product };
}

export async function createProduct(body: {
  idempotency_key: string;
  name: string;
  gender: string;
  type: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
}) {
  try {
    const product = await Product.create(body);
    return { data: product.toObject(), created: true };
  } catch (err: unknown) {
    // Duplicate idempotency_key — return the previously created product
    if (isDuplicateKeyError(err)) {
      const existing = await Product.findOne({ idempotency_key: body.idempotency_key }).lean();
      if (existing) return { data: existing, created: false };
    }
    throw err;
  }
}

export async function updateProduct(
  id: string,
  body: Partial<{
    name: string;
    gender: string;
    type: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  }>,
) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: body },
    { new: true },
  ).lean();

  if (!product) return { error: "not_found" as const };

  return { data: product };
}

export async function deleteProduct(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: { is_deleted: true } },
    { new: true },
  ).lean();

  if (!product) return { error: "not_found" as const };

  return { data: null };
}

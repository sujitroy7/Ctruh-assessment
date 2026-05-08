import { FilterQuery } from "mongoose";
import { isValidObjectId } from "mongoose";
import { Product, ProductItem, IProduct, IProductItem } from "./product.model";
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

  const itemQuery: FilterQuery<IProductItem> = { is_deleted: false };
  if (gender) itemQuery.gender = gender;
  if (type) itemQuery.type = type;
  if (color) itemQuery.color = color;
  if (minPrice !== undefined || maxPrice !== undefined) {
    itemQuery.price = {};
    if (minPrice !== undefined) itemQuery.price.$gte = minPrice;
    if (maxPrice !== undefined) itemQuery.price.$lte = maxPrice;
  }

  // When search is provided, match product name OR item type/gender
  let productIdsFromSearch: string[] | null = null;
  if (search) {
    const re = new RegExp(search, "i");
    const [itemMatches, productMatches] = await Promise.all([
      ProductItem.distinct("product_id", { ...itemQuery, $or: [{ type: re }, { gender: re }] }),
      Product.distinct("_id", { is_deleted: false, name: re }),
    ]);
    productIdsFromSearch = [
      ...new Set([
        ...itemMatches.map((id: unknown) => id!.toString()),
        ...productMatches.map((id: unknown) => id!.toString()),
      ]),
    ];
  }

  // Find product IDs that have at least one matching item
  const matchingProductIds = await ProductItem.distinct("product_id", itemQuery);

  const productQuery: FilterQuery<IProduct> = {
    _id: { $in: matchingProductIds },
    is_deleted: false,
  };
  if (productIdsFromSearch !== null) {
    productQuery._id = { $in: matchingProductIds.filter((id: unknown) => productIdsFromSearch!.includes(id!.toString())) };
  }

  const [products, total] = await Promise.all([
    Product.find(productQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(productQuery),
  ]);

  const pageProductIds = products.map((p) => p._id);
  const items = await ProductItem.find({ ...itemQuery, product_id: { $in: pageProductIds } }).lean();

  const itemsByProduct = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.product_id.toString();
    if (!itemsByProduct.has(key)) itemsByProduct.set(key, []);
    itemsByProduct.get(key)!.push(item);
  }

  const data = products.map((p) => ({
    ...p,
    items: itemsByProduct.get(p._id.toString()) ?? [],
  }));

  return { data, total, page, limit };
}

export async function getProductById(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOne({ _id: id, is_deleted: false }).lean();
  if (!product) return { error: "not_found" as const };

  const items = await ProductItem.find({ product_id: id, is_deleted: false }).lean();
  return { data: { ...product, items } };
}

export async function createProduct(body: {
  name: string;
  items: Array<{
    idempotency_key?: string;
    gender: string;
    type: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  }>;
}) {
  const product = await Product.create({ name: body.name });

  const items = await ProductItem.insertMany(
    body.items.map((item) => ({ ...item, product_id: product._id })),
    { ordered: false },
  );

  return { data: { ...product.toObject(), items: items.map((i) => i.toObject()) } };
}

export async function updateProduct(id: string, body: { name?: string }) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: body },
    { new: true },
  ).lean();

  if (!product) return { error: "not_found" as const };

  const items = await ProductItem.find({ product_id: id, is_deleted: false }).lean();
  return { data: { ...product, items } };
}

export async function deleteProduct(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: { is_deleted: true } },
    { new: true },
  ).lean();

  if (!product) return { error: "not_found" as const };

  await ProductItem.updateMany({ product_id: id }, { $set: { is_deleted: true } });

  return { data: null };
}

export async function addProductItem(
  productId: string,
  body: {
    idempotency_key?: string;
    gender: string;
    type: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  },
) {
  if (!isValidObjectId(productId)) return { error: "invalid_id" as const };

  const product = await Product.findOne({ _id: productId, is_deleted: false }).lean();
  if (!product) return { error: "not_found" as const };

  try {
    const item = await ProductItem.create({ ...body, product_id: productId });
    return { data: item.toObject(), created: true };
  } catch (err: unknown) {
    if (isDuplicateKeyError(err) && body.idempotency_key) {
      const existing = await ProductItem.findOne({ idempotency_key: body.idempotency_key }).lean();
      if (existing) return { data: existing, created: false };
    }
    throw err;
  }
}

export async function updateProductItem(
  productId: string,
  itemId: string,
  body: Partial<{
    gender: string;
    type: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  }>,
) {
  if (!isValidObjectId(productId) || !isValidObjectId(itemId)) return { error: "invalid_id" as const };

  const item = await ProductItem.findOneAndUpdate(
    { _id: itemId, product_id: productId, is_deleted: false },
    { $set: body },
    { new: true },
  ).lean();

  if (!item) return { error: "not_found" as const };

  return { data: item };
}

export async function deleteProductItem(productId: string, itemId: string) {
  if (!isValidObjectId(productId) || !isValidObjectId(itemId)) return { error: "invalid_id" as const };

  const item = await ProductItem.findOneAndUpdate(
    { _id: itemId, product_id: productId, is_deleted: false },
    { $set: { is_deleted: true } },
    { new: true },
  ).lean();

  if (!item) return { error: "not_found" as const };

  return { data: null };
}

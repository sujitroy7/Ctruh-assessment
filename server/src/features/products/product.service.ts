import { FilterQuery, isValidObjectId, Types } from "mongoose";
import { Product, IProduct, IProductItem } from "./product.model";
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

type ItemFilter = Record<string, unknown>;

function buildItemMatch(filters: Omit<ProductFilters, "page" | "limit" | "search" | "type">): ItemFilter {
  const match: ItemFilter = { is_deleted: false };
  if (filters.gender) match.gender = filters.gender;
  if (filters.color) match.color = filters.color;
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const price: Record<string, number> = {};
    if (filters.minPrice !== undefined) price.$gte = filters.minPrice;
    if (filters.maxPrice !== undefined) price.$lte = filters.maxPrice;
    match.price = price;
  }
  return match;
}

function itemPassesFilter(item: IProductItem, filter: ItemFilter): boolean {
  if (item.is_deleted) return false;
  if (filter.gender && item.gender !== filter.gender) return false;
  if (filter.color && item.color !== filter.color) return false;
  if (filter.price) {
    const p = filter.price as { $gte?: number; $lte?: number };
    if (p.$gte !== undefined && item.price < p.$gte) return false;
    if (p.$lte !== undefined && item.price > p.$lte) return false;
  }
  return true;
}

export async function getProducts(filters: ProductFilters) {
  const { page, limit, search, type, ...rest } = filters;
  const itemMatch = buildItemMatch(rest);

  const productQuery: FilterQuery<IProduct> = {
    is_deleted: false,
    items: { $elemMatch: itemMatch },
  };

  if (type) productQuery.type = type;

  if (search) {
    const re = new RegExp(search, "i");
    productQuery.$or = [
      { name: re },
      { type: re },
      { items: { $elemMatch: { ...itemMatch, gender: re } } },
    ];
  }

  const [products, total] = await Promise.all([
    Product.find(productQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Product.countDocuments(productQuery),
  ]);

  const data = products.map((p) => ({
    ...p,
    items: p.items.filter((item) => itemPassesFilter(item, itemMatch)),
  }));

  return { data, total, page, limit };
}

export async function getProductById(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOne({ _id: id, is_deleted: false }).lean();
  if (!product) return { error: "not_found" as const };

  return { data: { ...product, items: product.items.filter((i) => !i.is_deleted) } };
}

export async function createProduct(body: {
  idempotency_key?: string;
  name: string;
  type: string;
  items: Array<{
    idempotency_key?: string;
    gender: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  }>;
}) {
  try {
    const product = await Product.create({
      idempotency_key: body.idempotency_key,
      name: body.name,
      type: body.type,
      items: body.items,
    });

    return { data: product.toObject(), created: true };
  } catch (err: unknown) {
    if (isDuplicateKeyError(err) && body.idempotency_key) {
      const existing = await Product.findOne({ idempotency_key: body.idempotency_key, is_deleted: false }).lean();
      if (existing) return { data: existing, created: false };
    }

    if (isDuplicateKeyError(err)) {
      const itemIdempotencyKeys = body.items
        .map((item) => item.idempotency_key)
        .filter((key): key is string => Boolean(key));

      if (itemIdempotencyKeys.length > 0) {
        const existing = await Product.findOne({
          name: body.name,
          type: body.type,
          is_deleted: false,
          "items.idempotency_key": { $all: itemIdempotencyKeys },
        }).lean();

        if (existing) return { data: existing, created: false };
      }
    }

    throw err;
  }
}

type ItemUpdateEntry =
  | { id: string; _delete: true }
  | { id: string; _delete?: false; gender?: string; color?: string; price?: number; stock?: number; images?: string[] }
  | { id?: undefined; gender: string; color: string; price: number; stock?: number; images?: string[]; idempotency_key?: string };

export async function updateProduct(id: string, body: { name?: string; type?: string; items?: ItemUpdateEntry[] }) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOne({ _id: id, is_deleted: false });
  if (!product) return { error: "not_found" as const };

  if (body.name !== undefined) product.name = body.name;
  if (body.type !== undefined) product.type = body.type;

  if (body.items) {
    for (const entry of body.items) {
      if (entry.id !== undefined) {
        const item = product.items.find((i) => i._id.toString() === entry.id && !i.is_deleted);
        if (!item) continue;

        if (entry._delete === true) {
          item.is_deleted = true;
        } else {
          if (entry.gender !== undefined) item.gender = entry.gender;
          if (entry.color !== undefined) item.color = entry.color;
          if (entry.price !== undefined) item.price = entry.price;
          if (entry.stock !== undefined) item.stock = entry.stock;
          if (entry.images !== undefined) item.images = entry.images;
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        product.items.push(entry as any);
      }
    }
  }

  await product.save();
  const saved = product.toObject();
  return { data: { ...saved, items: saved.items.filter((i) => !i.is_deleted) } };
}

export async function deleteProduct(id: string) {
  if (!isValidObjectId(id)) return { error: "invalid_id" as const };

  const product = await Product.findOneAndUpdate(
    { _id: id, is_deleted: false },
    { $set: { is_deleted: true, "items.$[].is_deleted": true } },
  ).lean();

  if (!product) return { error: "not_found" as const };

  return { data: null };
}

export async function addProductItem(
  productId: string,
  body: {
    idempotency_key?: string;
    gender: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  },
) {
  if (!isValidObjectId(productId)) return { error: "invalid_id" as const };

  try {
    const product = await Product.findOneAndUpdate(
      { _id: productId, is_deleted: false },
      { $push: { items: body } },
      { new: true },
    ).lean();

    if (!product) return { error: "not_found" as const };

    const addedItem = body.idempotency_key
      ? product.items.find((i) => i.idempotency_key === body.idempotency_key)!
      : product.items[product.items.length - 1];

    return { data: addedItem, created: true };
  } catch (err: unknown) {
    if (isDuplicateKeyError(err) && body.idempotency_key) {
      const existing = await Product.findOne({ "items.idempotency_key": body.idempotency_key }).lean();
      if (existing) {
        const existingItem = existing.items.find((i) => i.idempotency_key === body.idempotency_key);
        if (existingItem) return { data: existingItem, created: false };
      }
    }
    throw err;
  }
}

export async function updateProductItem(
  productId: string,
  itemId: string,
  body: Partial<{
    gender: string;
    color: string;
    price: number;
    stock: number;
    images: string[];
  }>,
) {
  if (!isValidObjectId(productId) || !isValidObjectId(itemId)) return { error: "invalid_id" as const };

  const setFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    setFields[`items.$[elem].${key}`] = value;
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, is_deleted: false },
    { $set: setFields },
    {
      new: true,
      arrayFilters: [{ "elem._id": new Types.ObjectId(itemId), "elem.is_deleted": false }],
    },
  ).lean();

  if (!product) return { error: "not_found" as const };

  const item = product.items.find((i) => i._id.toString() === itemId && !i.is_deleted);
  if (!item) return { error: "not_found" as const };

  return { data: item };
}

export async function deleteProductItem(productId: string, itemId: string) {
  if (!isValidObjectId(productId) || !isValidObjectId(itemId)) return { error: "invalid_id" as const };

  const item = await Product.findOneAndUpdate(
    {
      _id: productId,
      is_deleted: false,
      items: { $elemMatch: { _id: new Types.ObjectId(itemId), is_deleted: false } },
    },
    { $set: { "items.$[elem].is_deleted": true } },
    { arrayFilters: [{ "elem._id": new Types.ObjectId(itemId) }] },
  ).lean();

  if (!item) return { error: "not_found" as const };

  return { data: null };
}

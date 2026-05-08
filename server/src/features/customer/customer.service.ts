import { isValidObjectId, Types } from "mongoose";
import { Customer } from "./customer.model";
import { hashPassword } from "../auth/auth.service";
import { isDuplicateKeyError } from "../../utils/mongoose";

export async function registerCustomer(
  email: string,
  f_name: string,
  l_name: string,
  password: string,
) {
  const password_hash = await hashPassword(password);
  try {
    const customer = await Customer.create({ email, f_name, l_name, password_hash });
    return { data: customer.toObject() };
  } catch (err) {
    if (isDuplicateKeyError(err)) return { error: "email_taken" as const };
    throw err;
  }
}

export async function addAddress(customerId: string, data: {
  idempotency_key: string;
  full_name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
}) {
  if (!isValidObjectId(customerId)) return { error: "invalid_id" as const };

  const newId = new Types.ObjectId();

  // Only push if no address with this key exists yet — atomic deduplication.
  const customer = await Customer.findOneAndUpdate(
    { _id: customerId, "addresses.idempotency_key": { $ne: data.idempotency_key } },
    { $push: { addresses: { _id: newId, ...data } } },
    { new: true, runValidators: true },
  ).lean();

  if (customer) {
    const address = customer.addresses.find((a) => a._id.toString() === newId.toString());
    return { data: address! };
  }

  // Push was skipped — either customer doesn't exist or key already exists.
  const existing = await Customer.findById(customerId).lean();
  if (!existing) return { error: "not_found" as const };

  const duplicate = existing.addresses.find((a) => a.idempotency_key === data.idempotency_key);
  return { data: duplicate! };
}

export async function listAddresses(customerId: string) {
  if (!isValidObjectId(customerId)) return { error: "invalid_id" as const };

  const customer = await Customer.findById(customerId).lean();
  if (!customer) return { error: "not_found" as const };

  return { data: customer.addresses };
}

export async function updateAddress(
  customerId: string,
  addressId: string,
  data: Partial<{
    full_name: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  }>,
) {
  if (!isValidObjectId(customerId) || !isValidObjectId(addressId)) {
    return { error: "invalid_id" as const };
  }

  const setFields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) setFields[`addresses.$[addr].${key}`] = value;
  }

  const customer = await Customer.findByIdAndUpdate(
    customerId,
    { $set: setFields },
    { arrayFilters: [{ "addr._id": new Types.ObjectId(addressId) }], new: true },
  ).lean();

  if (!customer) return { error: "not_found" as const };

  const address = customer.addresses.find((a) => a._id.toString() === addressId);
  if (!address) return { error: "address_not_found" as const };

  return { data: address };
}

export async function deleteAddress(customerId: string, addressId: string) {
  if (!isValidObjectId(customerId) || !isValidObjectId(addressId)) {
    return { error: "invalid_id" as const };
  }

  const before = await Customer.findById(customerId).lean();
  if (!before) return { error: "not_found" as const };

  const exists = before.addresses.some((a) => a._id.toString() === addressId);
  if (!exists) return { error: "address_not_found" as const };

  await Customer.findByIdAndUpdate(
    customerId,
    { $pull: { addresses: { _id: new Types.ObjectId(addressId) } } },
  );

  return { data: null };
}

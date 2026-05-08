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

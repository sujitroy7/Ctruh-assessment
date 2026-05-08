import { Owner } from "./owner.model";
import { hashPassword } from "../auth/auth.service";

export async function registerOwner(email: string, password: string) {
  const existing = await Owner.countDocuments();
  if (existing > 0) return { error: "already_exists" as const };

  const password_hash = await hashPassword(password);
  const owner = await Owner.create({ email, password_hash });
  return { data: owner.toObject() };
}

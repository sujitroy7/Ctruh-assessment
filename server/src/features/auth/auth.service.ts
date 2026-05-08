import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { RefreshToken, Role } from "./auth.model";

const BCRYPT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(sub: string, role: Role): string {
  return jwt.sign({ sub, role }, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAccessToken(token: string): { sub: string; role: Role } | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: Role };
    return { sub: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}

export async function issueTokens(sub: string, role: Role) {
  const rawToken = crypto.randomBytes(64).toString("hex");
  await RefreshToken.create({ subject_id: sub, role, token: rawToken });
  return { access_token: signAccessToken(sub, role), refresh_token: rawToken };
}

export async function rotateRefreshToken(oldToken: string) {
  const record = await RefreshToken.findOneAndDelete({ token: oldToken });
  if (!record) return { error: "invalid" as const };
  return issueTokens(String(record.subject_id), record.role);
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await RefreshToken.deleteOne({ token });
}

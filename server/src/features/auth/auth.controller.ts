import { Request, Response, NextFunction } from "express";
import { Owner } from "../owner/owner.model";
import { Customer } from "../customer/customer.model";
import { comparePassword, issueTokens, rotateRefreshToken, revokeRefreshToken } from "./auth.service";
import { LoginBodySchema } from "./auth.schema";
import { env } from "../../config/env";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: env.COOKIE_SECURE,
};

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 15 * 24 * 60 * 60 * 1000;

function setTokenCookies(res: Response, access_token: string, refresh_token: string) {
  res.cookie("access_token", access_token, {
    ...COOKIE_OPTS,
    maxAge: ACCESS_TOKEN_TTL_MS,
  });
  res.cookie("refresh_token", refresh_token, {
    ...COOKIE_OPTS,
    maxAge: REFRESH_TOKEN_TTL_MS,
    path: "/api/auth",
  });
}

function clearTokenCookies(res: Response) {
  res.clearCookie("access_token", COOKIE_OPTS);
  res.clearCookie("refresh_token", { ...COOKIE_OPTS, path: "/api/auth" });
}

function extractRefreshToken(req: Request): string | null {
  const fromCookie: string | undefined = req.cookies?.refresh_token;
  const fromHeader = req.headers["x-refresh-token"];
  const headerVal = Array.isArray(fromHeader) ? fromHeader[0] : fromHeader;

  if (!fromCookie || !headerVal) return null;
  if (fromCookie !== headerVal) return null;

  return fromCookie;
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = LoginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, password, role } = parsed.data;

    const subject =
      role === "owner"
        ? await Owner.findOne({ email, is_deleted: false }).lean()
        : await Customer.findOne({ email, is_deleted: false }).lean();

    if (!subject || !(await comparePassword(password, subject.password_hash))) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const { access_token, refresh_token } = await issueTokens(String(subject._id), role);
    setTokenCookies(res, access_token, refresh_token);
    res.json({ message: "Logged in" });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractRefreshToken(req);
    if (!token) {
      res.status(401).json({ message: "Missing or mismatched refresh token" });
      return;
    }

    const result = await rotateRefreshToken(token);
    if ("error" in result) {
      clearTokenCookies(res);
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    setTokenCookies(res, result.access_token, result.refresh_token);
    res.json({ message: "Tokens refreshed" });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractRefreshToken(req);
    if (token) {
      await revokeRefreshToken(token);
    }
    clearTokenCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

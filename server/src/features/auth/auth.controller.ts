import { Request, Response, NextFunction } from "express";
import { Owner } from "../owner/owner.model";
import { Customer } from "../customer/customer.model";
import {
  comparePassword,
  issueTokens,
  rotateRefreshToken,
  revokeRefreshToken,
} from "./auth.service";
import { LoginBodySchema } from "./auth.schema";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../../utils/response";
import {
  clearTokenCookies,
  extractRefreshToken,
  setTokenCookies,
} from "./auth.utils";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = LoginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const { email, password, role } = parsed.data;

    const subject =
      role === "owner"
        ? await Owner.findOne({ email, is_deleted: false }).lean()
        : await Customer.findOne({ email, is_deleted: false }).lean();

    if (!subject || !(await comparePassword(password, subject.password_hash))) {
      sendError(res, "Invalid credentials", 401);
      return;
    }

    const { access_token, refresh_token } = await issueTokens(
      String(subject._id),
      role,
    );
    setTokenCookies(res, access_token, refresh_token);

    const name =
      "f_name" in subject ? `${subject.f_name} ${subject.l_name}`.trim() : "";

    sendSuccess(res, {
      user: { id: String(subject._id), name, email: subject.email, role },
      access_token,
      refresh_token,
      expires_in: ACCESS_TOKEN_TTL_MS / 1000,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = extractRefreshToken(req);
    if (!token) {
      sendError(res, "Missing or mismatched refresh token", 401);
      return;
    }

    const result = await rotateRefreshToken(token);
    if ("error" in result) {
      clearTokenCookies(res);
      sendError(res, "Invalid or expired refresh token", 401);
      return;
    }

    setTokenCookies(res, result.access_token, result.refresh_token);
    sendSuccess(res, {
      access_token: result.access_token,
      refresh_token: result.refresh_token,
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token: string | undefined = req.cookies?.refresh_token;
    if (token) {
      await revokeRefreshToken(token);
    }
    clearTokenCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

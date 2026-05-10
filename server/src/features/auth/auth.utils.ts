import { Request, Response } from "express";
import { env } from "../../config/env";

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: env.COOKIE_SECURE,
};
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 15 * 24 * 60 * 60 * 1000;

/**
 * Sets authentication token cookies on the response.
 *
 * @param res - Express response object
 * @param access_token - Signed JWT access token
 * @param refresh_token - Signed JWT refresh token
 */
export function setTokenCookies(
  res: Response,
  access_token: string,
  refresh_token: string,
) {
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

/**
 * Clears authentication token cookies from the response.
 *
 * Removes:
 * - `access_token`
 * - `refresh_token`
 *
 * Cookie options must match the original cookie configuration.
 *
 * @param res - Express response object
 */
export function clearTokenCookies(res: Response) {
  res.clearCookie("access_token", COOKIE_OPTS);
  res.clearCookie("refresh_token", { ...COOKIE_OPTS, path: "/api/auth" });
}

/**
 * Extracts and validates a refresh token from both cookies and headers.
 *
 * The token is considered valid only if:
 * - `refresh_token` exists in cookies
 * - `x-refresh-token` header exists
 * - both values match exactly
 *
 * @param req - Express request object
 * @returns The validated refresh token, or `null` if validation fails
 */
export function extractRefreshToken(req: Request): string | null {
  const fromCookie: string | undefined = req.cookies?.refresh_token;
  const fromHeader = req.headers["x-refresh-token"];
  const headerVal = Array.isArray(fromHeader) ? fromHeader[0] : fromHeader;

  if (!fromCookie || !headerVal) return null;
  if (fromCookie !== headerVal) return null;

  return fromCookie;
}

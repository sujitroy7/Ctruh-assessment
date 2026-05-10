import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.service";
import { Role } from "./auth.model";
import { sendError } from "../../utils/response";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.access_token;
  if (!token) {
    sendError(res, "Not authenticated", 401);
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    sendError(res, "Invalid or expired access token", 401);
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendError(res, "Forbidden", 403);
      return;
    }
    next();
  };
}

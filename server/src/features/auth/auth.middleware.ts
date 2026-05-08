import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./auth.service";
import { Role } from "./auth.model";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    res.status(401).json({ message: "Invalid or expired access token" });
    return;
  }

  req.user = payload;
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}

import { Request, Response, NextFunction } from "express";
import { RegisterOwnerBodySchema } from "./owner.schema";
import { registerOwner } from "./owner.service";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../../utils/response";

export async function registerOwnerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = RegisterOwnerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await registerOwner(parsed.data.email, parsed.data.password);

    if (result.error === "already_exists") {
      sendError(res, "Owner already registered", 409);
      return;
    }

    sendSuccess(res, null, 201, "Owner registered successfully");
  } catch (err) {
    next(err);
  }
}

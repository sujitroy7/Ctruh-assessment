import { Request, Response, NextFunction } from "express";
import { RegisterOwnerBodySchema } from "./owner.schema";
import { registerOwner } from "./owner.service";
import { issueTokens } from "../auth/auth.service";

export async function registerOwnerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RegisterOwnerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await registerOwner(parsed.data.email, parsed.data.password);

    if (result.error === "already_exists") {
      res.status(409).json({ message: "Owner already registered" });
      return;
    }

    const tokens = await issueTokens(String(result.data._id), "owner");
    res.status(201).json(tokens);
  } catch (err) {
    next(err);
  }
}

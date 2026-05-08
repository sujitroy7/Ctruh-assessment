import { Request, Response, NextFunction } from "express";
import { RegisterOwnerBodySchema } from "./owner.schema";
import { registerOwner } from "./owner.service";

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

    res.status(201).json({ message: "Owner registered successfully" });
  } catch (err) {
    next(err);
  }
}

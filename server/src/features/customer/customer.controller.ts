import { Request, Response, NextFunction } from "express";
import { RegisterCustomerBodySchema } from "./customer.schema";
import { registerCustomer } from "./customer.service";
import { issueTokens } from "../auth/auth.service";

export async function registerCustomerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = RegisterCustomerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const { email, f_name, l_name, password } = parsed.data;
    const result = await registerCustomer(email, f_name, l_name, password);

    if (result.error === "email_taken") {
      res.status(409).json({ message: "Email already in use" });
      return;
    }

    const tokens = await issueTokens(String(result.data._id), "customer");
    res.status(201).json(tokens);
  } catch (err) {
    next(err);
  }
}

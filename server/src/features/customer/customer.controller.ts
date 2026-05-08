import { Request, Response, NextFunction } from "express";
import { RegisterCustomerBodySchema, AddressBodySchema, UpdateAddressBodySchema } from "./customer.schema";
import { registerCustomer, addAddress, listAddresses, updateAddress, deleteAddress } from "./customer.service";

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

    res.status(201).json({ message: "Customer registered successfully" });
  } catch (err) {
    next(err);
  }
}

export async function addAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = AddressBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await addAddress(req.user!.sub, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid customer ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.status(201).json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function listAddressesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await listAddresses(req.user!.sub);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid customer ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function updateAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpdateAddressBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(422).json({ message: "Validation failed", errors: parsed.error.flatten().fieldErrors });
      return;
    }

    const result = await updateAddress(req.user!.sub, req.params.addressId, parsed.data);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    if (result.error === "address_not_found") {
      res.status(404).json({ message: `Address '${req.params.addressId}' not found` });
      return;
    }

    res.json(result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteAddressHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await deleteAddress(req.user!.sub, req.params.addressId);

    if (result.error === "invalid_id") {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }
    if (result.error === "not_found") {
      res.status(404).json({ message: "Customer not found" });
      return;
    }
    if (result.error === "address_not_found") {
      res.status(404).json({ message: `Address '${req.params.addressId}' not found` });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

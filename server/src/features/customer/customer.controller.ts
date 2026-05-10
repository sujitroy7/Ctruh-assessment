import { Request, Response, NextFunction } from "express";
import {
  RegisterCustomerBodySchema,
  AddressBodySchema,
  UpdateAddressBodySchema,
} from "./customer.schema";
import {
  registerCustomer,
  addAddress,
  listAddresses,
  updateAddress,
  deleteAddress,
} from "./customer.service";
import {
  sendSuccess,
  sendError,
  sendValidationError,
} from "../../utils/response";

export async function registerCustomerHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = RegisterCustomerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const { email, f_name, l_name, password } = parsed.data;
    const result = await registerCustomer(email, f_name, l_name, password);

    if (result.error === "email_taken") {
      sendError(res, "Email already in use", 409);
      return;
    }

    sendSuccess(res, undefined, 201, "Customer registered successfully");
  } catch (err) {
    next(err);
  }
}

export async function addAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = AddressBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await addAddress(req.user!.sub, parsed.data);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid customer ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, "Customer not found", 404);
      return;
    }

    sendSuccess(res, result.data, 201);
  } catch (err) {
    next(err);
  }
}

export async function listAddressesHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await listAddresses(req.user!.sub);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid customer ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, "Customer not found", 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function updateAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const parsed = UpdateAddressBodySchema.safeParse(req.body);
    if (!parsed.success) {
      sendValidationError(res, parsed.error.flatten().fieldErrors);
      return;
    }

    const result = await updateAddress(
      req.user!.sub,
      req.params.addressId,
      parsed.data,
    );

    if (result.error === "invalid_id") {
      sendError(res, "Invalid ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, "Customer not found", 404);
      return;
    }
    if (result.error === "address_not_found") {
      sendError(res, `Address '${req.params.addressId}' not found`, 404);
      return;
    }

    sendSuccess(res, result.data);
  } catch (err) {
    next(err);
  }
}

export async function deleteAddressHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await deleteAddress(req.user!.sub, req.params.addressId);

    if (result.error === "invalid_id") {
      sendError(res, "Invalid ID", 400);
      return;
    }
    if (result.error === "not_found") {
      sendError(res, "Customer not found", 404);
      return;
    }
    if (result.error === "address_not_found") {
      sendError(res, `Address '${req.params.addressId}' not found`, 404);
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

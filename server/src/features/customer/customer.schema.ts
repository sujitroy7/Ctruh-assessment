import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const customersRegistry = new OpenAPIRegistry();

export const AddressZodSchema = customersRegistry.register(
  "Address",
  z.object({
    id: z.string(),
    idempotency_key: z.string(),
    full_name: z.string(),
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
    phone: z.string().optional(),
  }),
);

export const AddressBodySchema = z.object({
  idempotency_key: z.string().min(1).openapi({
    description: "Client-generated unique key to deduplicate address creation requests",
  }),
  full_name: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postal_code: z.string().min(1),
  country: z.string().min(1),
  phone: z.string().optional(),
});

export const UpdateAddressBodySchema = AddressBodySchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field must be provided" },
);

export const PublicCustomerSchema = customersRegistry.register(
  "Customer",
  z.object({
    id: z.string(),
    email: z.string().email(),
    f_name: z.string(),
    l_name: z.string(),
    is_deleted: z.boolean().default(false),
    addresses: z.array(AddressZodSchema),
  }),
);

export const RegisterCustomerBodySchema = z.object({
  email: z.string().email(),
  f_name: z.string().min(1),
  l_name: z.string().min(1),
  password: z.string().min(8),
});

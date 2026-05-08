import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const customersRegistry = new OpenAPIRegistry();

export const PublicCustomerSchema = customersRegistry.register(
  "Customer",
  z.object({
    id: z.string(),
    email: z.string().email(),
    f_name: z.string(),
    l_name: z.string(),
    is_deleted: z.boolean().default(false),
  }),
);

export const RegisterCustomerBodySchema = z.object({
  email: z.string().email(),
  f_name: z.string().min(1),
  l_name: z.string().min(1),
  password: z.string().min(8),
});

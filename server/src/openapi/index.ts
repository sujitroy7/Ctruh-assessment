import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { productsRegistry } from "../features/products/product.schema";
import { authRegistry } from "../features/auth/auth.schema";
import { ownerRegistry } from "../features/owner/owner.schema";
import { customersRegistry } from "../features/customer/customer.schema";
import { cartRegistry } from "../features/cart/cart.schema";

const registries: OpenAPIRegistry[] = [
  productsRegistry,
  authRegistry,
  ownerRegistry,
  customersRegistry,
  cartRegistry,
];

export function generateOpenApiSpec() {
  const combinedRegistry = new OpenAPIRegistry(registries);

  combinedRegistry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "access_token",
  });

  const generator = new OpenApiGeneratorV3(combinedRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Ctruh API", version: "1.0.0" },
    servers: [{ url: "/api" }],
  });
}

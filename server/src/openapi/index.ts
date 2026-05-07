import { OpenApiGeneratorV3, OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { productsRegistry } from "../features/products";

const registries: OpenAPIRegistry[] = [productsRegistry];

export function generateOpenApiSpec() {
  const combinedRegistry = new OpenAPIRegistry(registries);
  const generator = new OpenApiGeneratorV3(combinedRegistry.definitions);

  return generator.generateDocument({
    openapi: "3.0.3",
    info: { title: "Ctruh API", version: "1.0.0" },
    servers: [{ url: "/api" }],
  });
}

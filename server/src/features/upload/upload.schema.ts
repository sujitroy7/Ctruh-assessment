import { z } from "zod";
import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

export const uploadRegistry = new OpenAPIRegistry();

export const UploadResponseSchema = uploadRegistry.register(
  "UploadResponse",
  z.object({
    url: z.string().url().openapi({ description: "Cloudflare Images delivery URL" }),
  }),
);

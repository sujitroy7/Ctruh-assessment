import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { uploadRegistry, UploadResponseSchema } from "./upload.schema";
import { uploadImageHandler } from "./upload.controller";
import { requireAuth, requireRole } from "../auth/auth.middleware";
import {
  jsonContent,
  apiSuccessSchema,
  apiErrorSchema,
  authErrorResponses,
} from "../../utils/openapi";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

// ======================================================
// ROUTE: UPLOAD IMAGE
// ======================================================
uploadRegistry.registerPath({
  method: "post",
  path: "/upload/image",
  summary: "Upload a product image",
  description: "Uploads an image to Cloudflare Images and returns the delivery URL. Max file size: 10 MB. Accepted types: image/*.",
  tags: ["Upload"],
  security: [{ cookieAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: z.object({
            image: z.string().openapi({ type: "string", format: "binary", description: "Image file (max 10 MB)" }),
          }),
        },
      },
      required: true,
    },
  },
  responses: {
    201: jsonContent(apiSuccessSchema(UploadResponseSchema), "Image uploaded — Cloudflare delivery URL returned"),
    400: jsonContent(apiErrorSchema, "No file provided or invalid file type"),
    413: jsonContent(apiErrorSchema, "File exceeds 10 MB limit"),
    502: jsonContent(apiErrorSchema, "Cloudflare Images API error"),
    ...authErrorResponses,
  },
});
router.post("/image", requireAuth, requireRole("owner"), upload.single("image"), uploadImageHandler);

export default router;

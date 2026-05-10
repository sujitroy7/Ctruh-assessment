import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import { z } from "zod";

// Must be called before any feature imports — feature files run module-level
// registry code on import, so the .openapi() extension must already be in place.
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);

import productsRouter from "./features/products";
import authRouter from "./features/auth";
import ownerRouter from "./features/owner";
import customersRouter from "./features/customer";
import cartRouter from "./features/cart";
import orderRouter from "./features/order";
import uploadRouter from "./features/upload";
import { generateOpenApiSpec } from "./openapi";
import { env } from "./config/env";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter";

const app = express();

app.use(cors({ credentials: true }));
app.use(cookieParser());
app.use(express.json());

// Generate spec once at startup from all feature registries.
// Add new feature registries in src/openapi/index.ts.
const openApiSpec = generateOpenApiSpec();

// Serves raw spec — consumed by Swagger UI, Postman, or client code generators.
app.get("/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

// Interactive API docs — useful during development.
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Rate limiting — applied before feature routers.
app.use("/api/auth", authLimiter);  // strict: 10 req burst, ~10 req/min
app.use("/api", apiLimiter);        // general: 60 req burst, 60 req/min

// Feature routers — each feature owns its schemas, registry, and routes.
app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/customers", customersRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/upload", uploadRouter);

// Catch-all error handler — must have all four params for Express to treat it as an error handler.
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500).json({ message: err.message });
});

mongoose
  .connect(env.MONGO_URI, {
    minPoolSize: 5,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(env.PORT, () =>
      console.log(`Server running on port ${env.PORT}`),
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

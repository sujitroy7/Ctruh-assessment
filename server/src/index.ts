import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

mongoose
  .connect(env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

import { Request, Response, NextFunction } from "express";
import { uploadImage } from "./upload.service";

export async function uploadImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No image file provided" });
      return;
    }

    const result = await uploadImage(req.file.buffer, req.file.mimetype);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

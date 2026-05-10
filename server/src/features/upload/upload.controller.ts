import { Request, Response, NextFunction } from "express";
import { uploadImage } from "./upload.service";
import { sendSuccess, sendError } from "../../utils/response";

export async function uploadImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      sendError(res, "No image file provided", 400);
      return;
    }

    const result = await uploadImage(req.file.buffer, req.file.mimetype);

    sendSuccess(res, result, 201);
  } catch (err) {
    next(err);
  }
}

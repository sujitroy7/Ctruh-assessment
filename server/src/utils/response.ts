import { Response } from "express";
import { ApiErrorResponse } from "../types/response";

/**
 * Sends a successful JSON response using the shared API response shape.
 *
 * The response body always includes `success: true`. `data` and `message` are
 * only included when their values are not `undefined`.
 *
 * @typeParam T - Type of the response payload.
 * @param res - Express response object used to send the JSON payload.
 * @param data - Payload to send as response data.
 * @param statusCode - HTTP status code to send. Defaults to `200`.
 * @param message - Optional, readable success message.
 * @returns The Express response returned by `res.status().json()`.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  message?: string,
): Response {
  const response: any = {
    success: true,
  };

  if (data !== undefined) {
    response.data = data;
  }
  if (message !== undefined) {
    response.message = message;
  }
  return res.status(statusCode).json(response);
}

/**
 * Sends an error JSON response using the shared API error response shape.
 *
 * The response body always includes `success: false` and `message`. Field-level
 * validation details are included in `errors` when provided.
 *
 * @param res - Express response object used to send the JSON payload.
 * @param message - Human-readable error message.
 * @param statusCode - HTTP status code to send. Defaults to `400`.
 * @param errors - Optional map of field names to validation error messages.
 * @returns The Express response returned by `res.status().json()`.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  errors?: Record<string, string[]>,
): Response {
  const response: ApiErrorResponse = {
    success: false,
    message,
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

/**
 * Sends a standardized validation error response.
 *
 * This is a convenience wrapper around {@link sendError} that sends the
 * `"Validation failed"` message with HTTP status `422`.
 *
 * @param res - Express response object used to send the JSON payload.
 * @param errors - Map of field names to validation error messages.
 * @returns The Express response returned by `res.status().json()`.
 */
export function sendValidationError(
  res: Response,
  errors: Record<string, string[]>,
): Response {
  return sendError(res, "Validation failed", 422, errors);
}

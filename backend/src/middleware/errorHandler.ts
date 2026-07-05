import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/apiResponse.js";
import { AppError } from "../utils/appError.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 400, "VALIDATION_ERROR", err.flatten());
  }

  // Intentional, typed errors carry their own status + code and safe message.
  if (err instanceof AppError) {
    return sendError(res, err.message, err.status, err.code);
  }

  // Legacy string-based signals (kept for any callers still throwing these).
  if (err.name === "UnauthorizedError" || err.message === "Unauthorized") {
    return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
  }
  if (err.message === "Forbidden") {
    return sendError(res, "Forbidden", 403, "FORBIDDEN");
  }

  // Anything else is unexpected: log the full error server-side, but never leak
  // internal messages (e.g. Prisma details) to clients in production.
  console.error(err);
  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "Internal server error";
  return sendError(res, message, 500, "INTERNAL_ERROR");
}

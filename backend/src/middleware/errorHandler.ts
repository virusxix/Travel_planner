import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { sendError } from "../utils/apiResponse.js";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err instanceof ZodError) {
    return sendError(res, "Validation failed", 400, "VALIDATION_ERROR", err.flatten());
  }

  if (err.name === "UnauthorizedError" || err.message === "Unauthorized") {
    return sendError(res, "Unauthorized", 401, "UNAUTHORIZED");
  }

  if (err.message === "Forbidden") {
    return sendError(res, "Forbidden", 403, "FORBIDDEN");
  }

  return sendError(res, err.message || "Internal server error", 500, "INTERNAL_ERROR");
}

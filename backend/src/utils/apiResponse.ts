import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: Record<string, unknown>
) {
  return res.status(status).json({
    success: true,
    data,
    ...(meta && { meta }),
  });
}

export function sendError(
  res: Response,
  message: string,
  status = 400,
  code = "ERROR",
  details?: unknown
) {
  return res.status(status).json({
    success: false,
    error: { code, message, details },
  });
}

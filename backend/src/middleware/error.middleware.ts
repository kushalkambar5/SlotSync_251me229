import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { toApiError } from "../utils/errors.js";

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: { code: "NOT_FOUND", message: "Route not found." },
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const api = toApiError(err);
  if (api.statusCode >= 500) logger.error(err);
  res.status(api.statusCode).json({
    success: false,
    error: { code: api.code, message: api.message },
  });
}

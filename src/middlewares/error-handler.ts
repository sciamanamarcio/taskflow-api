import type { ErrorRequestHandler, RequestHandler } from "express";
import { AppError } from "../lib/errors";

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(new AppError(404, "NOT_FOUND", "Route not found"));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details },
    });
    return;
  }

  if (err?.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "INVALID_JSON", message: "Malformed JSON body" } });
    return;
  }

  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } });
};

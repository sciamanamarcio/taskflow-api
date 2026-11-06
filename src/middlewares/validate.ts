import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { AppError } from "../lib/errors";

type Source = "body" | "query" | "params";

export const validate =
  (schema: ZodTypeAny, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(
        new AppError(400, "VALIDATION_ERROR", "Invalid request data", result.error.flatten().fieldErrors),
      );
    }

    req[source] = result.data;
    next();
  };

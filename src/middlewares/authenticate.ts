import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../lib/errors";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Missing authentication token"));
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);
    if (typeof payload === "string" || !payload.sub) throw new Error("Invalid payload");
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

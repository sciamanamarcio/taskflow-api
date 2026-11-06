import type { NextFunction, Request, RequestHandler, Response } from "express";

// Express 4 não captura erros de funções async; este wrapper resolve isso.
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

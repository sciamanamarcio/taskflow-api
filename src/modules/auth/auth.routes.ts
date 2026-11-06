import { Router } from "express";
import rateLimit from "express-rate-limit";
import { env } from "../../config/env";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.schemas";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === "test",
});

export const authRoutes = Router();

authRoutes.post("/register", authLimiter, validate(registerSchema), controller.register);
authRoutes.post("/login", authLimiter, validate(loginSchema), controller.login);
authRoutes.get("/me", authenticate, controller.me);

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler";
import { authRoutes } from "./modules/auth/auth.routes";
import { taskRoutes } from "./modules/tasks/task.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", authRoutes);

  app.use("/tasks", taskRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

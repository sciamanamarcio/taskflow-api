import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import * as controller from "./task.controller";
import { createTaskSchema, listTasksQuerySchema, updateTaskSchema } from "./task.schemas";

export const taskRoutes = Router();

taskRoutes.use(authenticate);

taskRoutes.get("/", validate(listTasksQuerySchema, "query"), controller.list);
taskRoutes.post("/", validate(createTaskSchema), controller.create);
taskRoutes.get("/:id", controller.getOne);
taskRoutes.patch("/:id", validate(updateTaskSchema), controller.update);
taskRoutes.delete("/:id", controller.remove);

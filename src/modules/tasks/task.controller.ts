import { asyncHandler } from "../../lib/async-handler";
import type { ListTasksQuery } from "./task.schemas";
import * as taskService from "./task.service";

export const list = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(req.userId!, req.query as unknown as ListTasksQuery);
  res.json(result);
});

export const getOne = asyncHandler(async (req, res) => {
  res.json(await taskService.getTask(req.userId!, req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json(await taskService.createTask(req.userId!, req.body));
});

export const update = asyncHandler(async (req, res) => {
  res.json(await taskService.updateTask(req.userId!, req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await taskService.deleteTask(req.userId!, req.params.id);
  res.status(204).send();
});

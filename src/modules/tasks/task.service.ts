import type { Prisma } from "@prisma/client";
import { AppError } from "../../lib/errors";
import { prisma } from "../../lib/prisma";
import type { CreateTaskInput, ListTasksQuery, UpdateTaskInput } from "./task.schemas";

export async function listTasks(userId: string, { status, page, limit }: ListTasksQuery) {
  const where: Prisma.TaskWhereInput = { userId, ...(status && { status }) };

  const [data, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getTask(userId: string, id: string) {
  // Filtra por userId: um usuário nunca enxerga tarefas de outro
  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) throw new AppError(404, "TASK_NOT_FOUND", "Task not found");
  return task;
}

export async function createTask(userId: string, input: CreateTaskInput) {
  return prisma.task.create({ data: { ...input, userId } });
}

export async function updateTask(userId: string, id: string, input: UpdateTaskInput) {
  await getTask(userId, id);
  return prisma.task.update({ where: { id }, data: input });
}

export async function deleteTask(userId: string, id: string) {
  await getTask(userId, id);
  await prisma.task.delete({ where: { id } });
}

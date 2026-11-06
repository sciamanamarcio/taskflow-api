import request from "supertest";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";

export const app = createApp();

export async function resetDb() {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

export async function registerUser(email = "john@example.com") {
  const res = await request(app)
    .post("/auth/register")
    .send({ name: "John Doe", email, password: "password123" });

  return { token: res.body.token as string, user: res.body.user };
}

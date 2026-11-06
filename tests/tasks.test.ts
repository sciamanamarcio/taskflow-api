import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { app, registerUser, resetDb } from "./helpers";

describe("Tasks", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  it("requires authentication", async () => {
    const res = await request(app).get("/tasks");
    expect(res.status).toBe(401);
  });

  it("creates and lists tasks with pagination", async () => {
    const { token } = await registerUser();

    for (let i = 1; i <= 3; i++) {
      const res = await request(app)
        .post("/tasks")
        .set(auth(token))
        .send({ title: `Task ${i}` });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe("TODO");
    }

    const res = await request(app).get("/tasks?page=1&limit=2").set(auth(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ total: 3, totalPages: 2, page: 1, limit: 2 });
  });

  it("filters by status", async () => {
    const { token } = await registerUser();
    await request(app).post("/tasks").set(auth(token)).send({ title: "A", status: "DONE" });
    await request(app).post("/tasks").set(auth(token)).send({ title: "B" });

    const res = await request(app).get("/tasks?status=DONE").set(auth(token));

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe("A");
  });

  it("updates and deletes a task", async () => {
    const { token } = await registerUser();
    const created = await request(app).post("/tasks").set(auth(token)).send({ title: "Old" });
    const id = created.body.id;

    const updated = await request(app)
      .patch(`/tasks/${id}`)
      .set(auth(token))
      .send({ title: "New", status: "IN_PROGRESS" });
    expect(updated.status).toBe(200);
    expect(updated.body).toMatchObject({ title: "New", status: "IN_PROGRESS" });

    const deleted = await request(app).delete(`/tasks/${id}`).set(auth(token));
    expect(deleted.status).toBe(204);

    const after = await request(app).get(`/tasks/${id}`).set(auth(token));
    expect(after.status).toBe(404);
  });

  it("does not let a user access another user's tasks", async () => {
    const owner = await registerUser("owner@example.com");
    const intruder = await registerUser("intruder@example.com");

    const created = await request(app)
      .post("/tasks")
      .set(auth(owner.token))
      .send({ title: "Private" });

    const res = await request(app).get(`/tasks/${created.body.id}`).set(auth(intruder.token));
    expect(res.status).toBe(404);
  });

  it("rejects an empty update", async () => {
    const { token } = await registerUser();
    const created = await request(app).post("/tasks").set(auth(token)).send({ title: "X" });

    const res = await request(app).patch(`/tasks/${created.body.id}`).set(auth(token)).send({});
    expect(res.status).toBe(400);
  });
});

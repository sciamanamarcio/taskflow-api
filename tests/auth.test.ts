import request from "supertest";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../src/lib/prisma";
import { app, registerUser, resetDb } from "./helpers";

describe("Auth", () => {
  beforeEach(resetDb);
  afterAll(() => prisma.$disconnect());

  it("registers a new user and never exposes the password hash", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Jane", email: "jane@example.com", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf("string");
    expect(res.body.user.email).toBe("jane@example.com");
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects duplicate emails", async () => {
    await registerUser("dup@example.com");
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Dup", email: "dup@example.com", password: "password123" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("EMAIL_IN_USE");
  });

  it("validates input", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "A", email: "not-an-email", password: "123" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("logs in with correct credentials", async () => {
    await registerUser("login@example.com");
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "login@example.com", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf("string");
  });

  it("rejects wrong password", async () => {
    await registerUser("wrong@example.com");
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "wrong@example.com", password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("returns the current user on /auth/me", async () => {
    const { token } = await registerUser("me@example.com");
    const res = await request(app).get("/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("me@example.com");
  });

  it("blocks /auth/me without a token", async () => {
    const res = await request(app).get("/auth/me");
    expect(res.status).toBe(401);
  });
});

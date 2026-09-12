// src/app.test.ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { buildApp } from "./app.js";
import type { Task } from "./types/task.js";

const app = buildApp();

describe("app routes", () => {
  it("GET /health returns 200 and status ok", async () => {
    const res = await request(app).get("/health");
    const body = res.body as { status: string; uptimeSeconds: number };

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
  });

  it("POST /tasks with valid title returns 201", async () => {
    const res = await request(app).post("/tasks").send({ title: "integration test task" });
    const body = res.body as Task;

    expect(res.status).toBe(201);
    expect(body.title).toBe("integration test task");
  });

  it("POST /tasks with missing title returns 400", async () => {
    const res = await request(app).post("/tasks").send({});
    expect(res.status).toBe(400);
  });

  it("GET /tasks/:id with unknown id returns 404", async () => {
    const res = await request(app).get("/tasks/nonexistent-id");
    expect(res.status).toBe(404);
  });

  it("GET /nonexistent-route returns 404 fallback", async () => {
    const res = await request(app).get("/does-not-exist");
    expect(res.status).toBe(404);
  });
});

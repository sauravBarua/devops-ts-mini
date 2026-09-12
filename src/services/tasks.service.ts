// src/services/tasks.service.ts
import { randomUUID } from "node:crypto";
import type { Task, CreateTaskInput } from "../types/task.js";

// In-memory store. Deliberately not a database yet — Phase 1 is about
// structure and tooling, not persistence. A real DB is a later phase.
const tasks: Task[] = [];

export function listTasks(): Task[] {
  return tasks;
}

export function createTask(input: CreateTaskInput): Task {
  const task: Task = {
    id: randomUUID(),
    title: input.title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  return task;
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find((t) => t.id === id);
}

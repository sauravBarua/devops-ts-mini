// src/services/tasks.service.test.ts
import { describe, it, expect } from "vitest";
import { createTask, listTasks, getTaskById } from "./tasks.service.js";

describe("tasks.service", () => {
    it("creates a task with a generated id and timestamp", () => {
        const task = createTask({ title: "write tutorial" });

        expect(task.id).toBeTypeOf("string");
        expect(task.title).toBe("write tutorial");
        expect(task.completed).toBe(false);
        expect(task.createdAt).toBeTypeOf("string");
    });

    it("lists all created tasks", () => {
        const before = listTasks().length;
        createTask({ title: "task A" });
        createTask({ title: "task B" });
        expect(listTasks().length).toBe(before + 2);
    });

    it("retrieves a task by id", () => {
        const created = createTask({ title: "findable task" });
        const found = getTaskById(created.id);
        expect(found).toEqual(created);
    });

    it("returns undefined for a nonexistent id", () => {
        expect(getTaskById("does-not-exist")).toBeUndefined();
    });
});
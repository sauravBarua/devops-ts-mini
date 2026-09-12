// src/routes/tasks.route.ts
import { Router } from "express";
import { listTasks, createTask, getTaskById } from "../services/tasks.service.js";

export const tasksRouter = Router();

tasksRouter.get("/tasks", (_req, res) => {
    res.status(200).json(listTasks());
});

tasksRouter.post("/tasks", (req, res) => {
    const { title } = req.body as { title?: unknown };

    if (typeof title !== "string" || title.trim().length === 0) {
        res.status(400).json({ error: "title must be a non-empty string" });
        return;
    }

    const task = createTask({ title });
    res.status(201).json(task);
});

tasksRouter.get("/tasks/:id", (req, res) => {
    const task = getTaskById(req.params.id);

    if (!task) {
        res.status(404).json({ error: "task not found" });
        return;
    }

    res.status(200).json(task);
});
// src/app.ts
import express, { type Express } from "express";
import { healthRouter } from "./routes/health.route.js";
import { tasksRouter } from "./routes/tasks.route.js";

export function buildApp(): Express {
  const app = express();

  app.use(express.json());

  app.use(healthRouter);
  app.use(tasksRouter);

  // Fallback 404 for anything unmatched
  app.use((_req, res) => {
    res.status(404).json({ error: "not found" });
  });

  return app;
}

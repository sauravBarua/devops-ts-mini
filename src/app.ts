// src/app.ts
import express, { type Express } from "express";
import { randomUUID } from "node:crypto";
import { logger } from "./logger.js";
import { healthRouter } from "./routes/health.route.js";
import { tasksRouter } from "./routes/tasks.route.js";
import { metricsRegistry, httpRequestDuration, httpRequestsTotal } from "./metrics.js";
import { pinoHttp } from "pino-http";

export function buildApp(): Express {
  const app = express();

  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => {
        const existingId = req.headers["x-request-id"];
        if (typeof existingId === "string") return existingId;
        const id = randomUUID();
        res.setHeader("x-request-id", id);
        return id;
      },
      autoLogging: {
        ignore: (req) => req.url === "/health" || req.url === "/metrics",
      },
    }),
  );

  // Metrics middleware: records duration and count for every request.
  // Placed after pino-http (so request logging fires) but before routes
  // (so it wraps every route uniformly, without repeating this logic
  // in each route handler).
  app.use((req, res, next) => {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;
      // req.route is only populated AFTER Express matches a route, and
      // only inside route handlers — by the time "finish" fires it's
      // available on req if a route matched, else we fall back to the
      // raw path so unmatched requests (404s) are still tracked.
      const route = req.route?.path ?? req.path;
      const labels = { method: req.method, route, status_code: String(res.statusCode) };

      httpRequestDuration.observe(labels, durationSeconds);
      httpRequestsTotal.inc(labels);
    });

    next();
  });

  app.use(express.json());

  app.use(healthRouter);
  app.use(tasksRouter);

  app.get("/metrics", (_req, res) => {
    metricsRegistry
      .metrics()
      .then((metrics) => {
        res.set("Content-Type", metricsRegistry.contentType);
        res.send(metrics);
      })
      .catch((err: unknown) => {
        res.status(500).json({ error: "failed to collect metrics" });
        throw err;
      });
  });

  app.use((_req, res) => {
    res.status(404).json({ error: "not found" });
  });

  return app;
}
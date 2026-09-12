// src/logger.ts
import pino from "pino";
import { config } from "./config.js";

// In development, pipe through pino-pretty for human-readable colored
// output. In production, emit raw JSON — this is what log aggregators
// (CloudWatch, Loki, Datadog, etc.) expect to parse.
const transport =
  config.nodeEnv === "development"
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname",
        },
      }
    : undefined;

export const logger = pino({
  level: config.nodeEnv === "test" ? "silent" : "info",
  transport,
});

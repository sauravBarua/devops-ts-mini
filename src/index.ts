// src/index.ts
import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./logger.js";

const app = buildApp();

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, nodeEnv: config.nodeEnv }, "server started");
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server");
  server.close(() => {
    logger.info("server closed");
    process.exit(0);
  });
});

// Catch anything that would otherwise crash the process silently or
// with an unhelpful native stack trace. This is genuinely important in
// production: an unhandled rejection with no logging means the process
// exits (or hangs) with zero indication of why.
process.on("unhandledRejection", (reason) => {
  logger.error({ err: reason }, "unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error({ err }, "uncaught exception");
  process.exit(1);
});

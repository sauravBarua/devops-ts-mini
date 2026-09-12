// src/index.ts
import { buildApp } from "./app.js";
import { config } from "./config.js";

const app = buildApp();

const server = app.listen(config.port, () => {
  console.log(`[boot] listening on port ${config.port} (env: ${config.nodeEnv})`);
});

// Graceful shutdown: important for containers. When Docker/Kubernetes
// stops a container, it sends SIGTERM and waits a grace period before
// SIGKILL. If we don't handle SIGTERM, in-flight requests get dropped
// mid-response instead of finishing cleanly.
process.on("SIGTERM", () => {
  console.log("[shutdown] SIGTERM received, closing server");
  server.close(() => {
    console.log("[shutdown] server closed");
    process.exit(0);
  });
});

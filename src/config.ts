// src/config.ts

interface Config {
    port: number;
    nodeEnv: "development" | "production" | "test";
}

function loadConfig(): Config {
    const port = Number(process.env.PORT ?? "3000");

    if (Number.isNaN(port) || port <= 0) {
        throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
    }

    const nodeEnv = process.env.NODE_ENV ?? "development";
    if (nodeEnv !== "development" && nodeEnv !== "production" && nodeEnv !== "test") {
        throw new Error(`Invalid NODE_ENV value: "${nodeEnv}"`);
    }

    return { port, nodeEnv };
}

export const config = loadConfig();
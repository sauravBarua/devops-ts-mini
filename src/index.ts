// Note the ".js" extension on a relative import to a ".ts" file.
// This looks wrong but is required under NodeNext module resolution:
// TypeScript checks the .ts file but emits an import path that must
// resolve correctly at runtime, where only the compiled .js exists.
// We don't have other local modules yet, so this is just documented
// here for when Phase 1 adds them.

function main(): void {
    const port = process.env.PORT ?? "3000";
    console.log(`[boot] devops-ts-mini starting up`);
    console.log(`[boot] configured port: ${port}`);
    console.log(`[boot] node env: ${process.env.NODE_ENV ?? "development"}`);
}

main();


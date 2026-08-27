import { startServer } from "./index";

void startServer().catch((error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Unknown startup error";
  console.error(`RetailLens failed to start: ${message}`);
  process.exitCode = 1;
});

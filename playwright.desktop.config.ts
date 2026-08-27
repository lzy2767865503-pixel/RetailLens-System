import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/desktop",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  reporter: "line",
  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  }
});

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(
      process.env.npm_package_version ?? "1.1.0"
    )
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": "http://127.0.0.1:8787"
    }
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
    strictPort: true
  },
  build: {
    sourcemap: false,
    target: "es2022"
  },
  test: {
    environment: "node",
    fileParallelism: false,
    hookTimeout: 20_000,
    testTimeout: 20_000
  }
});

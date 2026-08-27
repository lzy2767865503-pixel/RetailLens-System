import path from "node:path";
import { rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

rmSync(path.join(projectRoot, "dist-electron"), {
  recursive: true,
  force: true
});

await build({
  absWorkingDir: projectRoot,
  entryPoints: ["electron/main.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  target: "node22",
  external: ["electron"],
  define: {
    "import.meta.url": JSON.stringify(
      "file:///__retaillens_bundle__/server/index.js"
    )
  },
  outfile: "dist-electron/main.cjs",
  logLevel: "info",
  sourcemap: false
});

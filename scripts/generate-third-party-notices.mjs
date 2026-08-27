import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const outputPath = path.join(projectRoot, "THIRD_PARTY_NOTICES.txt");
const packageJson = JSON.parse(
  readFileSync(path.join(projectRoot, "package.json"), "utf8")
);

function runPnpm(args) {
  const entrypointCandidates = [
    process.env.npm_execpath,
    process.env.PNPM_HOME
      ? path.resolve(process.env.PNPM_HOME, "..", "pnpm", "bin", "pnpm.cjs")
      : undefined
  ];
  const pnpmEntrypoint = entrypointCandidates.find(
    (candidate) => candidate && existsSync(candidate)
  );
  if (pnpmEntrypoint) {
    return execFileSync(process.execPath, [pnpmEntrypoint, ...args], {
      cwd: projectRoot,
      encoding: "utf8"
    });
  }
  if (process.platform === "win32") {
    throw new Error(
      "pnpm JavaScript entrypoint is unavailable; refusing to spawn a .cmd shim on Windows"
    );
  }
  return execFileSync("pnpm", args, { cwd: projectRoot, encoding: "utf8" });
}

function findLicenseText(packagePath) {
  const candidates = [
    "LICENSE",
    "LICENSE.md",
    "LICENSE.txt",
    "LICENCE",
    "LICENCE.md",
    "COPYING"
  ];

  for (const candidate of candidates) {
    const licensePath = path.join(packagePath, candidate);
    if (existsSync(licensePath)) {
      return readFileSync(licensePath, "utf8").trim();
    }
  }

  return "No standalone license text was present in the installed package.";
}

function collectPackages() {
  const raw = runPnpm(["licenses", "list", "--prod", "--json"]);
  const byLicense = JSON.parse(raw);
  const packages = [];

  for (const entries of Object.values(byLicense)) {
    for (const entry of entries) {
      const versions = [...entry.versions].sort();
      packages.push({
        name: entry.name,
        versions,
        license: entry.license ?? "NOASSERTION",
        homepage: entry.homepage ?? "",
        licenseText: findLicenseText(entry.paths[0])
      });
    }
  }

  const electronPath = path.join(projectRoot, "node_modules", "electron");
  const electronPackage = JSON.parse(
    readFileSync(path.join(electronPath, "package.json"), "utf8")
  );
  packages.push({
    name: electronPackage.name,
    versions: [electronPackage.version],
    license: electronPackage.license,
    homepage: electronPackage.repository,
    licenseText: findLicenseText(electronPath)
  });

  return packages.sort((left, right) =>
    `${left.name}@${left.versions.join(",")}`.localeCompare(
      `${right.name}@${right.versions.join(",")}`
    )
  );
}

function generateNotices() {
  const sections = collectPackages().map((entry) => {
    const homepage = entry.homepage
      ? `\nProject: ${entry.homepage}`
      : "";
    return [
      "=".repeat(78),
      `${entry.name}@${entry.versions.join(", ")}`,
      `Declared license: ${entry.license}${homepage}`,
      "-".repeat(78),
      entry.licenseText
    ].join("\n");
  });

  return [
    "Retail Decision Studio by LAI ZEYU Third-Party Notices",
    "Source project: RetailLens",
    "Designed and authored by: LAI ZEYU（来泽宇）",
    `Application version: ${packageJson.version}`,
    "",
    "This file covers JavaScript production dependencies and the Electron runtime.",
    "Packaged Electron distributions also include Chromium's generated",
    "LICENSES.chromium.html alongside the executable; that file is authoritative for",
    "Chromium and its bundled components.",
    "",
    ...sections,
    ""
  ].join("\n");
}

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

const expected = normalizeNewlines(generateNotices());
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const actual = existsSync(outputPath)
    ? normalizeNewlines(readFileSync(outputPath, "utf8"))
    : "";
  if (actual !== expected) {
    console.error(
      "THIRD_PARTY_NOTICES.txt is missing or stale. Run pnpm metadata:notices."
    );
    process.exitCode = 1;
  } else {
    console.log("THIRD_PARTY_NOTICES.txt matches installed dependencies.");
  }
} else {
  writeFileSync(outputPath, expected, "utf8");
  console.log("Generated THIRD_PARTY_NOTICES.txt.");
}

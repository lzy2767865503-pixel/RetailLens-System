import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const packageJson = JSON.parse(
  readFileSync(path.join(projectRoot, "package.json"), "utf8")
);
const outputDirectory = path.join(projectRoot, "release", "metadata");
const outputPath = path.join(
  outputDirectory,
  `retaillens-${packageJson.version}.spdx.json`
);

function spdxId(name, version) {
  return `SPDXRef-Package-${name}-${version}`.replace(
    /[^A-Za-z0-9.-]/g,
    "-"
  );
}

function declaredLicense(packagePath) {
  try {
    const metadata = JSON.parse(
      readFileSync(path.join(packagePath, "package.json"), "utf8")
    );
    return typeof metadata.license === "string"
      ? metadata.license
      : "NOASSERTION";
  } catch {
    return "NOASSERTION";
  }
}

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

function walkDependencies(dependencies, packages, relationships, parentId) {
  for (const [name, dependency] of Object.entries(dependencies ?? {})) {
    if (!dependency.version) continue;

    const id = spdxId(name, dependency.version);
    if (!packages.has(id)) {
      packages.set(id, {
        SPDXID: id,
        name,
        versionInfo: dependency.version,
        downloadLocation: dependency.resolved ?? "NOASSERTION",
        filesAnalyzed: false,
        licenseConcluded: "NOASSERTION",
        licenseDeclared: declaredLicense(dependency.path),
        copyrightText: "NOASSERTION"
      });
    }

    relationships.add(`${parentId}|${id}`);
    walkDependencies(
      dependency.dependencies,
      packages,
      relationships,
      id
    );
  }
}

const rawTree = runPnpm(["list", "--prod", "--json", "--depth", "Infinity"]);
const [rootTree] = JSON.parse(rawTree);
const rootId = "SPDXRef-Package-RetailLens";
const packages = new Map([
  [
    rootId,
    {
      SPDXID: rootId,
      name: packageJson.name,
      versionInfo: packageJson.version,
      downloadLocation:
        "https://github.com/lzy2767865503-pixel/RetailLens-System",
      filesAnalyzed: false,
      licenseConcluded: packageJson.license,
      licenseDeclared: packageJson.license,
      copyrightText: "Copyright 2026 LAI ZEYU（来泽宇）"
    }
  ]
]);
const relationshipPairs = new Set();

walkDependencies(
  rootTree.dependencies,
  packages,
  relationshipPairs,
  rootId
);

const electronMetadata = JSON.parse(
  readFileSync(
    path.join(projectRoot, "node_modules", "electron", "package.json"),
    "utf8"
  )
);
const electronId = spdxId("electron", electronMetadata.version);
packages.set(electronId, {
  SPDXID: electronId,
  name: "electron",
  versionInfo: electronMetadata.version,
  downloadLocation: `https://registry.npmjs.org/electron/-/electron-${electronMetadata.version}.tgz`,
  filesAnalyzed: false,
  licenseConcluded: "NOASSERTION",
  licenseDeclared: electronMetadata.license,
  copyrightText: "NOASSERTION"
});
relationshipPairs.add(`${rootId}|${electronId}`);

const created = process.env.SOURCE_DATE_EPOCH
  ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1_000)
  : new Date();
const document = {
  spdxVersion: "SPDX-2.3",
  dataLicense: "CC0-1.0",
  SPDXID: "SPDXRef-DOCUMENT",
  name: `RetailLens-${packageJson.version}`,
  documentNamespace: `https://github.com/lzy2767865503-pixel/RetailLens-System/sbom/${packageJson.version}`,
  creationInfo: {
    created: created.toISOString().replace(/\.\d{3}Z$/, "Z"),
    creators: ["Tool: RetailLens generate-sbom.mjs"]
  },
  documentDescribes: [rootId],
  packages: [...packages.values()].sort((left, right) =>
    left.SPDXID.localeCompare(right.SPDXID)
  ),
  relationships: [...relationshipPairs]
    .sort()
    .map((pair) => {
      const [from, to] = pair.split("|");
      return {
        spdxElementId: from,
        relationshipType: "DEPENDS_ON",
        relatedSpdxElement: to
      };
    })
};

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(projectRoot, outputPath)}.`);

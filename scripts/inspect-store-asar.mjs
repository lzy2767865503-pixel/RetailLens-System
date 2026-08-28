import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { extractFile, listPackage, statFile } from "@electron/asar";

const [archiveArgument, evidenceArgument] = process.argv.slice(2);
if (!archiveArgument || !evidenceArgument) {
  throw new Error(
    "Usage: node scripts/inspect-store-asar.mjs <app.asar> <evidence.json>"
  );
}

const archivePath = path.resolve(archiveArgument);
const evidencePath = path.resolve(evidenceArgument);
const entries = listPackage(archivePath);
const requiredEntries = [
  "/LICENSE",
  "/THIRD_PARTY_NOTICES.txt",
  "/dist-electron/main.cjs",
  "/dist/index.html",
  "/package.json"
];

for (const requiredEntry of requiredEntries) {
  if (entries.filter((entry) => entry === requiredEntry).length !== 1) {
    throw new Error(`Packaged app.asar must contain exactly one ${requiredEntry}.`);
  }
}
if (new Set(entries).size !== entries.length) {
  throw new Error("Packaged app.asar contains duplicate inventory entries.");
}
if (
  entries.some(
    (entry) =>
      /(?:^|\/)(?:\.env(?:\.|$)|.*\.(?:pfx|p12|pem|key|cer|crt))$/i.test(entry) ||
      /(?:^|\/)(?:id_rsa|id_ed25519)$/i.test(entry)
  )
) {
  throw new Error("Packaged app.asar contains forbidden secret or certificate material.");
}

const packageMetadata = JSON.parse(
  extractFile(archivePath, "package.json").toString("utf8")
);
if (
  packageMetadata.name !== "retaillens-system" ||
  packageMetadata.version !== "1.1.0" ||
  packageMetadata.author?.name !== "LAI ZEYU（来泽宇）" ||
  packageMetadata.main !== "dist-electron/main.cjs" ||
  packageMetadata.license !== "MIT"
) {
  throw new Error("Packaged app.asar metadata is not the reviewed product and author identity.");
}

const notices = extractFile(
  archivePath,
  "THIRD_PARTY_NOTICES.txt"
).toString("utf8");
if (
  !notices.includes("Retail Decision Studio by LAI ZEYU Third-Party Notices") ||
  !notices.includes("Designed and authored by: LAI ZEYU（来泽宇）") ||
  !notices.includes("Application version: 1.1.0")
) {
  throw new Error("Packaged third-party notices lost exact product, version, or authorship metadata.");
}

const license = extractFile(archivePath, "LICENSE").toString("utf8");
if (!license.includes("MIT License") || !license.includes("LAI ZEYU")) {
  throw new Error("Packaged MIT license is missing or does not retain LAI ZEYU attribution.");
}

const inventory = entries
  .filter((entry) => {
    const record = statFile(archivePath, entry.slice(1));
    return typeof record.size === "number";
  })
  .sort((left, right) => left.localeCompare(right, "en"))
  .map((entry) => {
    const record = statFile(archivePath, entry.slice(1));
    if (
      record.integrity?.algorithm !== "SHA256" ||
      !/^[a-f0-9]{64}$/.test(record.integrity.hash) ||
      !Number.isSafeInteger(record.size) ||
      record.size < 0
    ) {
      throw new Error(`Packaged app.asar entry lacks exact SHA-256 integrity metadata: ${entry}`);
    }
    return {
      path: entry,
      bytes: record.size,
      sha256: record.integrity.hash
    };
  });

if (inventory.length < 10 || inventory.length > 20_000) {
  throw new Error(`Packaged app.asar file count is outside the reviewed bound: ${inventory.length}`);
}
const canonicalInventory = `${inventory
  .map((entry) => `${entry.sha256}  ${entry.bytes}  ${entry.path}`)
  .join("\n")}\n`;
const archiveBytes = readFileSync(archivePath);
const evidence = {
  schemaVersion: 1,
  product: "Retail Decision Studio by LAI ZEYU",
  author: "LAI ZEYU（来泽宇）",
  version: "1.1.0",
  asarSha256: createHash("sha256").update(archiveBytes).digest("hex"),
  inventorySha256: createHash("sha256")
    .update(canonicalInventory, "utf8")
    .digest("hex"),
  fileCount: inventory.length,
  requiredEntries
};

writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx"
});
console.log(
  `Packaged app.asar inspection passed: ${evidence.asarSha256} (${inventory.length} files).`
);

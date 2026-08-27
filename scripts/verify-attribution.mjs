import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
export const requiredAttribution = "LAI ZEYU（来泽宇）";
export const requiredFiles = [
  "package.json",
  "electron-builder.config.cjs",
  "src/App.tsx",
  "src/components/AboutPrivacyDialog.tsx",
  "README.md",
  "LICENSE",
  "CITATION.cff",
  "THIRD_PARTY_NOTICES.txt",
  "docs/PRIVACY.md",
  "docs/CERTIFICATION_NOTES.template.md",
  "docs/STORE_LISTING.en.md",
  "docs/STORE_LISTING.zh.md",
  "docs/WINDOWS_RELEASE.md",
  "electron/readiness.ts",
  "scripts/generate-third-party-notices.mjs",
  "scripts/generate-sbom.mjs",
  "scripts/windows-release-policy.json",
  "scripts/windows-signer-policy.ps1",
  "scripts/windows-signer-policy.test.ps1",
  "scripts/windows-verify-authenticode.ps1",
  "scripts/windows-verify-pe-metadata.ps1"
];

export function findMissingAttribution(
  root = projectRoot,
  files = requiredFiles
) {
  return files.filter((relativePath) => {
    const contents = readFileSync(
      path.join(root, relativePath),
      "utf8"
    );
    return !contents.includes(requiredAttribution);
  });
}

export function hasExpectedStructuredPackageAuthor(root = projectRoot) {
  const packageMetadata = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8")
  );
  return (
    packageMetadata.author !== null &&
    typeof packageMetadata.author === "object" &&
    packageMetadata.author.name === requiredAttribution
  );
}

export function runAttributionGate(root = projectRoot) {
  const missing = findMissingAttribution(root);
  if (!hasExpectedStructuredPackageAuthor(root)) {
    missing.push("package.json#author.name");
  }

  if (missing.length > 0) {
    console.error(
      `Required bilingual attribution ${requiredAttribution} is missing from: ${missing.join(", ")}`
    );
    return false;
  }

  console.log(
    `Attribution gate passed for ${requiredFiles.length} files: ${requiredAttribution}`
  );
  return true;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(path.resolve(process.argv[1])).href
  : "";

if (import.meta.url === invokedPath && !runAttributionGate()) {
  process.exitCode = 1;
}

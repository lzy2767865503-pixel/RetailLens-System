import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const policyPath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "windows-release-policy.json"
);

export const windowsReleasePolicy = Object.freeze(
  JSON.parse(readFileSync(policyPath, "utf8"))
);

export function isAllowedSignerSimpleName(value) {
  return (
    typeof value === "string" &&
    windowsReleasePolicy.allowedSignerSimpleNames.includes(value)
  );
}

export function isAuthorOwnedSignerIdentity(value) {
  if (!value || typeof value !== "object") return false;

  const { simpleName, commonName, organizationNames } = value;
  return (
    isAllowedSignerSimpleName(simpleName) &&
    isAllowedSignerSimpleName(commonName) &&
    Array.isArray(organizationNames) &&
    organizationNames.every(isAllowedSignerSimpleName)
  );
}

export function hasExpectedPeMetadata(value) {
  if (!value || typeof value !== "object") return false;

  const expected = windowsReleasePolicy.expectedPeMetadata;
  return (
    value.companyName === expected.companyName &&
    value.legalCopyright === expected.legalCopyright &&
    value.productName === expected.productName
  );
}

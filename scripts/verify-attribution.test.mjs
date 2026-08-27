import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  findMissingAttribution,
  hasExpectedStructuredPackageAuthor,
  requiredAttribution
} from "./verify-attribution.mjs";

const temporaryRoots = [];

function fixtureRoot() {
  const root = mkdtempSync(path.join(tmpdir(), "retaillens-attribution-"));
  temporaryRoots.push(root);
  return root;
}

function writeFixture(root, relativePath, value) {
  const outputPath = path.join(root, relativePath);
  mkdirSync(path.dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, value, "utf8");
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("bilingual authorship attribution gate", () => {
  it("passes only when every required surface contains the exact phrase", () => {
    const root = fixtureRoot();
    const files = ["package.json", "docs/PRIVACY.md"];
    for (const file of files) {
      writeFixture(root, file, requiredAttribution);
    }

    expect(findMissingAttribution(root, files)).toEqual([]);
  });

  it("fails a surface that substitutes ASCII parentheses", () => {
    const root = fixtureRoot();
    const files = ["docs/STORE_LISTING.en.md"];
    writeFixture(root, files[0], "LAI ZEYU (来泽宇)");

    expect(findMissingAttribution(root, files)).toEqual(files);
  });

  it("requires structured package author metadata so PE CompanyName stays bilingual", () => {
    const root = fixtureRoot();
    writeFixture(
      root,
      "package.json",
      JSON.stringify({ author: { name: requiredAttribution } })
    );
    expect(hasExpectedStructuredPackageAuthor(root)).toBe(true);

    writeFixture(
      root,
      "package.json",
      JSON.stringify({ author: `${requiredAttribution} (https://example.com)` })
    );
    expect(hasExpectedStructuredPackageAuthor(root)).toBe(false);
  });
});

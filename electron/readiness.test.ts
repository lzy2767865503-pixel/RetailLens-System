import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildStoreUiReadyEvidence,
  parseStoreUiProbe,
  rendererDomProofFailures,
  WINDOWS_AUTHOR_NAME,
  WINDOWS_PRODUCT_NAME
} from "./readiness";

const validDom = {
  rootContentLength: 500,
  titleMatches: true,
  productNameVisible: true,
  authorVisible: true,
  privacyEntryVisible: true
};

const validProbe = {
  schemaVersion: 2 as const,
  candidateSha256: "a".repeat(64),
  captureStoreScreenshots: false,
  nonce: "123e4567-e89b-42d3-a456-426614174000",
  screenshotRound: 0 as const,
  version: "1.1.0"
};

const windowsRound2Source = readFileSync(
  new URL("../scripts/windows-round2.ps1", import.meta.url),
  "utf8"
);

function extractPowerShellAssignment(variableName: string): string {
  const match = windowsRound2Source.match(
    new RegExp(`^\\s*\\$${variableName}\\s*=\\s*([^\\r\\n]+)\\s*$`, "m")
  );
  if (!match) {
    throw new Error(`windows-round2.ps1 lacks $${variableName}.`);
  }
  return match[1].trim();
}

function extractPowerShellStringArray(variableName: string): string[] {
  const match = windowsRound2Source.match(
    new RegExp(
      `\\$${variableName}\\s*=\\s*@\\((?<body>[\\s\\S]*?)\\r?\\n\\s*\\)`,
      "m"
    )
  );
  if (!match?.groups?.body) {
    throw new Error(`windows-round2.ps1 lacks $${variableName}.`);
  }
  const literals = Array.from(
    match.groups.body.matchAll(/"([A-Za-z][A-Za-z0-9]*)"/g),
    (entry) => entry[1]
  );
  if (literals.length === 0) {
    throw new Error(`windows-round2.ps1 $${variableName} has no string keys.`);
  }
  return literals;
}

function extractPortablePowerShellProbe(): Record<string, unknown> {
  const match = windowsRound2Source.match(
    /\$portableProbe\s*=\s*\[ordered\]@\{(?<body>[\s\S]*?)\r?\n\s*\}/m
  );
  if (!match?.groups?.body) {
    throw new Error("windows-round2.ps1 lacks the portable probe hashtable.");
  }
  const assignments = Object.fromEntries(
    match.groups.body
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const assignment = line.match(
          /^\s*([A-Za-z][A-Za-z0-9]*)\s*=\s*([^\r\n]+?)\s*$/
        );
        if (!assignment) {
          throw new Error(`Unparseable portable probe assignment: ${line}`);
        }
        return [assignment[1], assignment[2]];
      })
  );
  expect(assignments).toEqual({
    schemaVersion: "$portableReadinessSchemaVersion",
    candidateSha256: "$candidateHash",
    captureStoreScreenshots: "$portableCaptureStoreScreenshots",
    nonce: "$nonce",
    screenshotRound: "$portableScreenshotRound",
    version: "$version"
  });
  const schemaVersion = Number(
    extractPowerShellAssignment("portableReadinessSchemaVersion")
  );
  const screenshotRound = Number(
    extractPowerShellAssignment("portableScreenshotRound")
  );
  const captureToken = extractPowerShellAssignment(
    "portableCaptureStoreScreenshots"
  );
  if (captureToken !== "$false") {
    throw new Error("Portable screenshot capture must be the PowerShell false literal.");
  }
  return {
    schemaVersion,
    candidateSha256: validProbe.candidateSha256,
    captureStoreScreenshots: false,
    nonce: validProbe.nonce,
    screenshotRound,
    version: validProbe.version
  };
}

describe("packaged renderer readiness policy", () => {
  it("requires React content, product, author, title, and privacy entry", () => {
    expect(rendererDomProofFailures(validDom)).toEqual([]);
    expect(
      rendererDomProofFailures({
        ...validDom,
        rootContentLength: 0,
        authorVisible: false,
        privacyEntryVisible: false
      })
    ).toEqual([
      "React root content is missing or too short",
      "visible LAI ZEYU（来泽宇） authorship is missing",
      "About & privacy entry is missing"
    ]);
  });

  it("accepts only a strict version-bound candidate probe", () => {
    expect(parseStoreUiProbe(validProbe, "1.1.0")).toEqual(validProbe);
    expect(() =>
      parseStoreUiProbe(
        { ...validProbe, candidateSha256: "not-a-hash" },
        "1.1.0"
      )
    ).toThrow(/SHA-256/);
    expect(() =>
      parseStoreUiProbe(
        { ...validProbe, version: "1.1.1" },
        "1.1.0"
      )
    ).toThrow(/version/);
    expect(() =>
      parseStoreUiProbe(
        { ...validProbe, extra: "forbidden" },
        "1.1.0"
      )
    ).toThrow(/unexpected fields/);
    expect(() =>
      parseStoreUiProbe(
        {
          ...validProbe,
          captureStoreScreenshots: true,
          screenshotRound: 0
        },
        "1.1.0"
      )
    ).toThrow(/screenshot request/);
    expect(
      parseStoreUiProbe(
        {
          ...validProbe,
          captureStoreScreenshots: true,
          screenshotRound: 2
        },
        "1.1.0"
      )
    ).toMatchObject({ captureStoreScreenshots: true, screenshotRound: 2 });
  });

  it("emits author-owned evidence only after every DOM assertion passes", () => {
    const evidence = buildStoreUiReadyEvidence(
      validProbe,
      validDom,
      47824,
      "2026-08-27T00:00:00.000Z"
    );
    expect(evidence).toMatchObject({
      product: WINDOWS_PRODUCT_NAME,
      author: WINDOWS_AUTHOR_NAME,
      candidateSha256: validProbe.candidateSha256,
      nonce: validProbe.nonce,
      processId: 47824,
      dom: validDom
    });
    expect(() =>
      buildStoreUiReadyEvidence(
        validProbe,
        {
          ...validDom,
          productNameVisible: false
        },
        47824
      )
    ).toThrow(/visible product name is missing/);
    expect(() =>
      buildStoreUiReadyEvidence(validProbe, validDom, 0)
    ).toThrow(/process ID/);
  });

  it("binds the portable PowerShell probe and exact ready keys to the TypeScript schema", () => {
    const emittedProbe = extractPortablePowerShellProbe();
    const parsedProbe = parseStoreUiProbe(emittedProbe, validProbe.version);
    expect(parsedProbe).toEqual(validProbe);

    const ready = buildStoreUiReadyEvidence(
      parsedProbe,
      validDom,
      47824,
      "2026-08-27T00:00:00.000Z"
    );
    expect(extractPowerShellStringArray("portableReadyExpectedKeys").sort()).toEqual(
      Object.keys(ready).sort()
    );
    expect(extractPowerShellStringArray("portableDomExpectedKeys").sort()).toEqual(
      Object.keys(validDom).sort()
    );
    expect(windowsRound2Source).toContain(
      "[long]$ready.schemaVersion -ne $portableReadinessSchemaVersion"
    );
    expect(windowsRound2Source).toContain(
      "$ready.captureStoreScreenshots -ne $portableCaptureStoreScreenshots"
    );
    expect(windowsRound2Source).toContain(
      "[long]$ready.screenshotRound -ne $portableScreenshotRound"
    );
  });
});

export const WINDOWS_PRODUCT_NAME =
  "Retail Decision Studio by LAI ZEYU";
export const WINDOWS_AUTHOR_NAME = "LAI ZEYU（来泽宇）";

export interface RendererDomProof {
  rootContentLength: number;
  titleMatches: boolean;
  productNameVisible: boolean;
  authorVisible: boolean;
  privacyEntryVisible: boolean;
}

export interface StoreUiProbe {
  schemaVersion: 1;
  candidateSha256: string;
  nonce: string;
  version: string;
}

export interface StoreUiReadyEvidence extends StoreUiProbe {
  product: typeof WINDOWS_PRODUCT_NAME;
  author: typeof WINDOWS_AUTHOR_NAME;
  processId: number;
  readyAt: string;
  dom: RendererDomProof;
}

export function rendererDomProofFailures(
  value: unknown
): string[] {
  if (!value || typeof value !== "object") {
    return ["renderer proof is not an object"];
  }

  const proof = value as Partial<RendererDomProof>;
  const failures: string[] = [];
  if (
    typeof proof.rootContentLength !== "number" ||
    !Number.isInteger(proof.rootContentLength) ||
    proof.rootContentLength < 100
  ) {
    failures.push("React root content is missing or too short");
  }
  if (proof.titleMatches !== true) {
    failures.push("document title does not match the Windows product name");
  }
  if (proof.productNameVisible !== true) {
    failures.push("visible product name is missing");
  }
  if (proof.authorVisible !== true) {
    failures.push("visible LAI ZEYU（来泽宇） authorship is missing");
  }
  if (proof.privacyEntryVisible !== true) {
    failures.push("About & privacy entry is missing");
  }
  return failures;
}

export function parseStoreUiProbe(
  value: unknown,
  expectedVersion: string
): StoreUiProbe {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Store UI probe must be an object.");
  }

  const probe = value as Partial<StoreUiProbe>;
  const keys = Object.keys(value).sort();
  const expectedKeys = [
    "candidateSha256",
    "nonce",
    "schemaVersion",
    "version"
  ];
  if (JSON.stringify(keys) !== JSON.stringify(expectedKeys)) {
    throw new Error("Store UI probe contains missing or unexpected fields.");
  }
  if (probe.schemaVersion !== 1) {
    throw new Error("Store UI probe schema is unsupported.");
  }
  if (
    typeof probe.candidateSha256 !== "string" ||
    !/^[0-9a-f]{64}$/.test(probe.candidateSha256)
  ) {
    throw new Error("Store UI probe candidate SHA-256 is invalid.");
  }
  if (
    typeof probe.nonce !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      probe.nonce
    )
  ) {
    throw new Error("Store UI probe nonce is not a lowercase UUIDv4.");
  }
  if (probe.version !== expectedVersion) {
    throw new Error("Store UI probe version does not match the packaged app.");
  }

  return probe as StoreUiProbe;
}

export function buildStoreUiReadyEvidence(
  probe: StoreUiProbe,
  dom: RendererDomProof,
  processId: number,
  readyAt = new Date().toISOString()
): StoreUiReadyEvidence {
  const failures = rendererDomProofFailures(dom);
  if (failures.length > 0) {
    throw new Error(`Renderer DOM proof failed: ${failures.join("; ")}`);
  }
  if (!Number.isSafeInteger(processId) || processId <= 0) {
    throw new Error("Packaged renderer process ID is invalid.");
  }

  return {
    ...probe,
    product: WINDOWS_PRODUCT_NAME,
    author: WINDOWS_AUTHOR_NAME,
    processId,
    readyAt,
    dom
  };
}

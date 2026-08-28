import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const templatePath = path.join(
  projectRoot,
  "docs",
  "CERTIFICATION_NOTES.template.md"
);

const failures = [];
const requiredTrueAttestations = [
  "RETAILLENS_CERTIFICATION_NOTES_PRIVATE",
  "RETAILLENS_CERTIFICATION_DEDICATED_KEY_READY",
  "RETAILLENS_CERTIFICATION_KEY_LIMITED",
  "RETAILLENS_CERTIFICATION_KEY_REVOCABLE",
  "RETAILLENS_CERTIFICATION_CONNECTION_STEPS_READY",
  "RETAILLENS_CERTIFICATION_INTERPRETATION_STEPS_READY",
  "RETAILLENS_CERTIFICATION_LIVE_API_CHECK_REQUIRED",
  "RETAILLENS_GENERATIVE_AI_DECLARED",
  "RETAILLENS_AUTOMATIC_BACKUP_DISABLED"
];

for (const name of requiredTrueAttestations) {
  if (process.env[name]?.trim() !== "true") {
    failures.push(`${name} must be exactly true`);
  }
}

const endpoint =
  process.env.RETAILLENS_CERTIFICATION_OPENAI_ENDPOINT?.trim();
if (endpoint !== "https://api.openai.com/v1/responses") {
  failures.push(
    "RETAILLENS_CERTIFICATION_OPENAI_ENDPOINT must be exactly https://api.openai.com/v1/responses"
  );
}

const model =
  process.env.RETAILLENS_CERTIFICATION_OPENAI_MODEL?.trim();
const selectableModels = new Set([
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano"
]);
if (!model || !selectableModels.has(model)) {
  failures.push(
    "RETAILLENS_CERTIFICATION_OPENAI_MODEL must name one exact model selectable in the app"
  );
}

const connectionEndpoint =
  process.env.RETAILLENS_CERTIFICATION_OPENAI_CONNECTION_ENDPOINT?.trim();
const expectedConnectionEndpoint = model
  ? `https://api.openai.com/v1/models/${encodeURIComponent(model)}`
  : "";
if (
  !expectedConnectionEndpoint ||
  connectionEndpoint !== expectedConnectionEndpoint
) {
  failures.push(
    "RETAILLENS_CERTIFICATION_OPENAI_CONNECTION_ENDPOINT must be the exact /v1/models/{model} URL for the selected model"
  );
}

const expiration =
  process.env.RETAILLENS_CERTIFICATION_KEY_EXPIRES_ON?.trim();
if (!expiration || !/^\d{4}-\d{2}-\d{2}$/.test(expiration)) {
  failures.push(
    "RETAILLENS_CERTIFICATION_KEY_EXPIRES_ON must use YYYY-MM-DD"
  );
} else {
  const expirationTime = Date.parse(`${expiration}T23:59:59Z`);
  if (!Number.isFinite(expirationTime) || expirationTime <= Date.now()) {
    failures.push(
      "RETAILLENS_CERTIFICATION_KEY_EXPIRES_ON must be a future UTC date"
    );
  }
}

const template = readFileSync(templatePath, "utf8");
const requiredTemplateMarkers = [
  "{{PASTE_IN_PARTNER_CENTER_ONLY}}",
  "{{DESCRIBE_THE_REVIEW_ONLY_SPEND_OR_USAGE_LIMIT}}",
  "{{YYYY-MM-DD}}",
  "{{CONFIRM_THE_KEY_CAN_BE_REVOKED_IMMEDIATELY_AFTER_CERTIFICATION}}",
  "https://api.openai.com/v1/models/{{URL_ENCODED_EXACT_MODEL}}",
  "https://api.openai.com/v1/responses",
  "{{EXACT_MODEL_SHOWN_IN_THE_APP}}",
  "## Connection-test steps",
  "## Interpretation-test steps"
];
for (const marker of requiredTemplateMarkers) {
  if (!template.includes(marker)) {
    failures.push(
      `Certification-notes template is missing required marker: ${marker}`
    );
  }
}

if (/\bsk-[A-Za-z0-9_-]{20,240}\b/.test(template)) {
  failures.push(
    "Certification-notes template appears to contain an OpenAI API key"
  );
}

if (failures.length > 0) {
  console.error("Microsoft Store certification gate failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    "Microsoft Store certification gate passed without reading or storing the private reviewer key."
  );
}

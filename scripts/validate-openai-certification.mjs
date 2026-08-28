import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import OpenAI from "openai";

const publicSelectableModels = new Set([
  "gpt-5",
  "gpt-5-mini",
  "gpt-5-nano"
]);

const model =
  process.env.RETAILLENS_CERTIFICATION_OPENAI_MODEL?.trim();
const apiKey =
  process.env.RETAILLENS_CERTIFICATION_OPENAI_API_KEY?.trim();
const evidencePath = path.resolve(
  process.argv[2] ?? "release/metadata/OPENAI_CERTIFICATION.json"
);
const commitSha =
  process.env.RETAILLENS_CERTIFICATION_COMMIT_SHA?.trim().toLowerCase();
const candidateSha256 =
  process.env.RETAILLENS_CERTIFICATION_CANDIDATE_SHA256?.trim().toLowerCase();
const certificationRound =
  process.env.RETAILLENS_CERTIFICATION_ROUND?.trim().toLowerCase();

function fail(message) {
  console.error(`OpenAI certification gate blocked: ${message}`);
  process.exitCode = 1;
}

if (!commitSha || !/^[0-9a-f]{40}$/.test(commitSha)) {
  fail("RETAILLENS_CERTIFICATION_COMMIT_SHA must bind the probe to one exact Git commit");
} else if (!candidateSha256 || !/^[0-9a-f]{64}$/.test(candidateSha256)) {
  fail("RETAILLENS_CERTIFICATION_CANDIDATE_SHA256 must bind the probe to one exact candidate");
} else if (!certificationRound || !/^(1|2)$/.test(certificationRound)) {
  fail("RETAILLENS_CERTIFICATION_ROUND must be exactly 1 or 2");
} else if (!model || !publicSelectableModels.has(model)) {
  fail(
    "RETAILLENS_CERTIFICATION_OPENAI_MODEL must be an exact public model selectable in the app"
  );
} else if (!apiKey || !/^sk-[A-Za-z0-9_-]{20,240}$/.test(apiKey)) {
  fail(
    "a dedicated RETAILLENS_CERTIFICATION_OPENAI_API_KEY is required; no live capability is claimed without it"
  );
} else {
  const client = new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: 60_000,
    logLevel: "off"
  });
  const nonce = randomUUID().toLowerCase();

  try {
    // This is the same public GET /v1/models/{model} contract used by the
    // application's connection test. It proves access for this exact key and
    // model rather than inferring availability from a model-name string.
    const modelObject = await client.models.retrieve(model);
    if (modelObject.id !== model || modelObject.object !== "model") {
      throw new Error("model lookup returned a mismatched object");
    }

    // A successful model lookup does not prove that Responses API structured
    // output works. Make a minimal, real, non-stored round trip and require an
    // exact strict-schema echo. No business or user data is included.
    const response = await client.responses.create({
      model,
      store: false,
      // Leave enough room for model-internal reasoning plus the tiny strict
      // JSON payload. A 256-token ceiling can produce an incomplete response
      // even when the exact model/key/API capability is otherwise valid.
      max_output_tokens: 1024,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "Certification probe only. Return the exact supplied binding: " +
                `ok=true, nonce=${nonce}, commit_sha=${commitSha}, ` +
                `candidate_sha256=${candidateSha256}, round=${certificationRound}.`
            }
          ]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "retaillens_certification_probe",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              ok: { type: "boolean", enum: [true] },
              nonce: { type: "string", enum: [nonce] },
              commit_sha: { type: "string", enum: [commitSha] },
              candidate_sha256: {
                type: "string",
                enum: [candidateSha256]
              },
              round: { type: "string", enum: [certificationRound] }
            },
            required: [
              "ok",
              "nonce",
              "commit_sha",
              "candidate_sha256",
              "round"
            ]
          }
        }
      }
    });

    const parsed = JSON.parse(response.output_text);
    if (
      parsed.ok !== true ||
      parsed.nonce !== nonce ||
      parsed.commit_sha !== commitSha ||
      parsed.candidate_sha256 !== candidateSha256 ||
      parsed.round !== certificationRound
    ) {
      throw new Error(
        "structured Responses API result did not match the exact commit/candidate/round probe"
      );
    }
    if (typeof response.id !== "string" || response.id.length < 8) {
      throw new Error("structured Responses API result lacks a real response id");
    }

    const completedAt = new Date().toISOString();
    const evidence = {
      schemaVersion: 2,
      product: "Retail Decision Studio by LAI ZEYU",
      author: "LAI ZEYU（来泽宇）",
      commitSha,
      candidateSha256,
      certificationRound,
      model,
      modelEndpoint: `https://api.openai.com/v1/models/${encodeURIComponent(model)}`,
      responsesEndpoint: "https://api.openai.com/v1/responses",
      modelLookupPassed: true,
      structuredRoundTripPassed: true,
      nonceSha256: createHash("sha256").update(nonce).digest("hex"),
      responseIdSha256: createHash("sha256")
        .update(response.id)
        .digest("hex"),
      completedAt
    };
    await mkdir(path.dirname(evidencePath), { recursive: true });
    await writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, {
      encoding: "utf8",
      flag: "wx"
    });
    console.log(
      `Live OpenAI model lookup and strict structured round trip passed for ${model}, round ${certificationRound}, candidate ${candidateSha256}.`
    );
  } catch (error) {
    const status =
      error && typeof error === "object" && "status" in error
        ? String(error.status)
        : "unavailable";
    fail(`live /v1/models plus /v1/responses verification failed (status ${status})`);
  }
}

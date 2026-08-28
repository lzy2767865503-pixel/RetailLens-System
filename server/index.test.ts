import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { createDemoBusiness } from "../src/domain";
import type {
  InterpretBusinessArgs,
  TestAiConnectionArgs
} from "./ai";
import {
  createApp,
  OPENAI_KEY_HEADER,
  OPENAI_MODEL_HEADER
} from "./index";

const TestBusinessSchema = z
  .object({
    name: z.string().min(1),
    country: z.string().min(1),
    monthlyRevenue: z.number().nonnegative()
  })
  .strict();

const validRequest = {
  language: "en",
  business: {
    name: "Neighbourhood Market",
    country: "Malaysia",
    monthlyRevenue: 120_000
  }
} as const;

function deterministicScorer(business: unknown) {
  const parsed = TestBusinessSchema.parse(business);
  return {
    overallScore: 81,
    grade: "strong",
    inputsUsed: {
      country: parsed.country,
      monthlyRevenue: parsed.monthlyRevenue
    }
  };
}

function makeTestApiKey(label = "client"): string {
  return ["sk", label, "A".repeat(36)].join("-");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("RetailLens API", () => {
  it("rejects DNS-rebinding and cross-origin requests in desktop mode", async () => {
    const desktopApp = createApp({
      expectedOrigin: "http://127.0.0.1:47824"
    });

    await request(desktopApp)
      .get("/api/health")
      .set("Host", "127.0.0.1:47824")
      .expect(200);
    await request(desktopApp)
      .get("/api/health")
      .set("Host", "attacker.example:47824")
      .expect(421, {
        error: "unexpected_host",
        message: "The request host is not permitted."
      });
    await request(desktopApp)
      .get("/api/health")
      .set("Host", "127.0.0.1:47824")
      .set("Origin", "https://attacker.example")
      .expect(403, {
        error: "unexpected_origin",
        message: "The request origin is not permitted."
      });
    await request(desktopApp)
      .get("/api/health")
      .set("Host", "127.0.0.1:47824")
      .set("Sec-Fetch-Site", "cross-site")
      .expect(403, {
        error: "cross_site_request_denied",
        message: "Cross-site requests are not permitted."
      });

    const cliApp = createApp();
    await request(cliApp)
      .get("/api/health")
      .set("Host", "127.0.0.1:8787")
      .expect(200);
    await request(cliApp)
      .get("/api/health")
      .set("Host", "attacker.example:8787")
      .expect(421, {
        error: "unexpected_host",
        message: "The request host is not permitted."
      });
  });

  it("reports a safe health status when no API key is configured", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.stubEnv("OPENAI_MODEL", "gpt-5");
    const app = createApp({
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app).get("/api/health").expect(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "RetailLens API",
      processId: process.pid,
      languages: ["zh", "en"],
      ai: {
        provider: "openai",
        configured: false,
        serverConfigured: false,
        model: "gpt-5",
        clientManagedKeysSupported: true
      }
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "OPENAI_API_KEY"
    );
  });

  it("returns the locked deterministic result when AI is unavailable", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const app = createApp({
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app)
      .post("/api/analyze")
      .send(validRequest)
      .expect(200);

    expect(response.body.score).toEqual(
      deterministicScorer(validRequest.business)
    );
    expect(response.body.ai).toMatchObject({
      status: "unavailable",
      reason: "missing_api_key"
    });
  });

  it("passes locked consulting and theory workpapers to AI interpretation", async () => {
    const aiInterpreter = vi.fn(
      async (_args: InterpretBusinessArgs) => ({
        status: "unavailable" as const,
        model: "gpt-5",
        reason: "missing_api_key" as const
      })
    );
    const app = createApp({ aiInterpreter });

    await request(app)
      .post("/api/analyze")
      .send({
        language: "en",
        business: createDemoBusiness()
      })
      .expect(200);

    expect(aiInterpreter).toHaveBeenCalledTimes(1);
    expect(aiInterpreter.mock.calls[0]?.[0]).toMatchObject({
      lockedConsultingAssessment: {
        audit: {
          deterministic: true,
          aiMayAlterAssessment: false
        }
      },
      lockedEnterpriseTheoryAssessment: {
        audit: {
          deterministic: true,
          aiMayAlterAssessment: false
        }
      }
    });
  });

  it("passes header credentials only to the current analysis request", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const apiKey = makeTestApiKey();
    const aiInterpreter = vi.fn(
      async (args: InterpretBusinessArgs) => ({
        status: "unavailable" as const,
        // Simulate a faulty dependency trying to echo the credential.
        model: args.apiKey ?? args.model ?? "gpt-5",
        reason: "missing_api_key" as const
      })
    );
    const app = createApp({
      aiInterpreter,
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app)
      .post("/api/analyze")
      .set(OPENAI_KEY_HEADER, apiKey)
      .set(OPENAI_MODEL_HEADER, "gpt-5-mini")
      .send(validRequest)
      .expect(200);

    expect(aiInterpreter.mock.calls[0]?.[0]).toMatchObject({
      apiKey,
      model: "gpt-5-mini"
    });
    expect(response.body.score.overallScore).toBe(81);
    expect(JSON.stringify(response.body)).not.toContain(apiKey);
    expect(process.env.OPENAI_API_KEY).toBe("");

    await request(app)
      .post("/api/analyze")
      .send(validRequest)
      .expect(200);

    expect(aiInterpreter.mock.calls[1]?.[0].apiKey).toBeUndefined();
    expect(aiInterpreter.mock.calls[1]?.[0].model).toBeUndefined();
  });

  it("rejects invalid key and model headers without echoing them", async () => {
    const aiInterpreter = vi.fn(
      async (_args: InterpretBusinessArgs) => ({
        status: "unavailable" as const,
        model: "gpt-5",
        reason: "missing_api_key" as const
      })
    );
    const app = createApp({
      aiInterpreter,
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });
    const invalidKey = "invalid-client-credential";
    const invalidModel = "../../unsafe-model";

    const keyResponse = await request(app)
      .post("/api/analyze")
      .set(OPENAI_KEY_HEADER, invalidKey)
      .send(validRequest)
      .expect(400);
    const modelResponse = await request(app)
      .post("/api/analyze")
      .set(OPENAI_MODEL_HEADER, invalidModel)
      .send(validRequest)
      .expect(400);

    expect(keyResponse.body.error).toBe("invalid_openai_api_key");
    expect(modelResponse.body.error).toBe("invalid_openai_model");
    expect(JSON.stringify(keyResponse.body)).not.toContain(invalidKey);
    expect(JSON.stringify(modelResponse.body)).not.toContain(
      invalidModel
    );
    expect(aiInterpreter).not.toHaveBeenCalled();
  });

  it("tests a client key without retaining or returning it", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const apiKey = makeTestApiKey("connection");
    const aiConnectionTester = vi.fn(
      async (args: TestAiConnectionArgs) => ({
        status: "ok" as const,
        model: args.model ?? "gpt-5"
      })
    );
    const app = createApp({
      aiConnectionTester,
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app)
      .post("/api/ai/test")
      .set(OPENAI_KEY_HEADER, apiKey)
      .set(OPENAI_MODEL_HEADER, "gpt-5-mini")
      .expect(200);

    expect(aiConnectionTester).toHaveBeenCalledWith({
      apiKey,
      model: "gpt-5-mini"
    });
    expect(response.body).toEqual({
      status: "ok",
      provider: "openai",
      model: "gpt-5-mini"
    });
    expect(JSON.stringify(response.body)).not.toContain(apiKey);
    expect(process.env.OPENAI_API_KEY).toBe("");

    const missingResponse = await request(app)
      .post("/api/ai/test")
      .expect(401);

    expect(missingResponse.body.reason).toBe("missing_api_key");
    expect(aiConnectionTester).toHaveBeenCalledTimes(1);
  });

  it("sanitizes connection-test provider failures", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
    const apiKey = makeTestApiKey("failure");
    const app = createApp({
      aiConnectionTester: async () => {
        throw new Error(`provider rejected ${apiKey}`);
      },
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app)
      .post("/api/ai/test")
      .set(OPENAI_KEY_HEADER, apiKey)
      .expect(502);

    expect(response.body).toMatchObject({
      status: "error",
      reason: "provider_error"
    });
    expect(JSON.stringify(response.body)).not.toContain(apiKey);
  });

  it("rejects incomplete data and unsupported languages", async () => {
    const app = createApp({
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const response = await request(app)
      .post("/api/score")
      .send({
        language: "ms",
        business: {
          name: "",
          monthlyRevenue: -1
        }
      })
      .expect(400);

    expect(response.body.error).toBe("validation_error");
    expect(response.body.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: "language" }),
        expect.objectContaining({ path: "business.name" }),
        expect.objectContaining({ path: "business.country" }),
        expect.objectContaining({
          path: "business.monthlyRevenue"
        })
      ])
    );
  });

  it("never calls AI from /score and prevents AI-side score mutation", async () => {
    const aiInterpreter = vi.fn(async (args: InterpretBusinessArgs) => {
      (
        args.lockedScore as {
          overallScore: number;
        }
      ).overallScore = 0;

      return {
        status: "unavailable" as const,
        model: "test-model",
        reason: "missing_api_key" as const
      };
    });
    const app = createApp({
      aiInterpreter,
      businessSchema: TestBusinessSchema,
      businessScorer: deterministicScorer
    });

    const scoreResponse = await request(app)
      .post("/api/score")
      .send(validRequest)
      .expect(200);

    expect(aiInterpreter).not.toHaveBeenCalled();

    const analyzeResponse = await request(app)
      .post("/api/analyze")
      .send(validRequest)
      .expect(200);

    expect(analyzeResponse.body.score).toEqual(scoreResponse.body.score);
    expect(analyzeResponse.body.score.overallScore).toBe(81);
    expect(aiInterpreter).toHaveBeenCalledTimes(1);
  });
});

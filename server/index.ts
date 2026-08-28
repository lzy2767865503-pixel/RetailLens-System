import path from "node:path";
import type { Server } from "node:http";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import express, {
  type ErrorRequestHandler,
  type NextFunction,
  type Request,
  type Response
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import {
  BusinessInputSchema,
  buildConsultingAssessment,
  buildEnterpriseTheoryAssessment,
  scoreBusiness
} from "../src/domain/index";
import type {
  BusinessInput,
  BusinessScore
} from "../src/domain/index";
import {
  getAiConfiguration,
  isAllowedOpenAiModel,
  isValidOpenAiApiKey,
  interpretBusinessWithAi,
  resolveOpenAiModel,
  testOpenAiConnection,
  type AiAnalysis,
  type AiConnectionTestResult,
  type InterpretBusinessArgs,
  type TestAiConnectionArgs
} from "./ai";
import {
  AiAnalysisSchema,
  SupportedLanguageSchema,
  type ValidationErrorBody
} from "./schemas";

const PROJECT_ROOT = process.env.RETAILLENS_PROJECT_ROOT
  ? path.resolve(process.env.RETAILLENS_PROJECT_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST_DIRECTORY = path.join(PROJECT_ROOT, "dist");

export const OPENAI_KEY_HEADER = "X-RetailLens-OpenAI-Key";
export const OPENAI_MODEL_HEADER = "X-RetailLens-OpenAI-Model";

dotenv.config({
  path: [
    path.join(PROJECT_ROOT, ".env.local"),
    path.join(PROJECT_ROOT, ".env")
  ],
  quiet: true
});

type AiInterpreter = (
  args: InterpretBusinessArgs
) => Promise<AiAnalysis>;

type AiConnectionTester = (
  args: TestAiConnectionArgs
) => Promise<AiConnectionTestResult>;

function defaultBusinessScorer(business: unknown): unknown {
  return scoreBusiness(BusinessInputSchema.parse(business));
}

export interface AppDependencies {
  aiInterpreter?: AiInterpreter;
  aiConnectionTester?: AiConnectionTester;
  businessSchema?: z.ZodType<unknown>;
  businessScorer?: (business: unknown) => unknown;
  expectedOrigin?: string;
}

function isPermittedLoopbackHost(host: string | undefined): boolean {
  if (!host) return false;

  const match = /^127\.0\.0\.1(?::([0-9]{1,5}))?$/.exec(host);
  if (!match) return false;

  if (match[1] === undefined) return true;
  const port = Number.parseInt(match[1], 10);
  return port > 0 && port <= 65_535;
}

function validationError(error: z.ZodError): ValidationErrorBody {
  return {
    error: "validation_error",
    message: "The request body is incomplete or invalid.",
    issues: error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message
    }))
  };
}

function cloneJsonValue<T>(value: T): T {
  return structuredClone(value);
}

function providerError(model = getAiConfiguration().model): AiAnalysis {
  return {
    status: "error",
    model,
    reason: "provider_error"
  };
}

type RequestAiConfiguration =
  | {
      success: true;
      apiKey?: string;
      model?: string;
    }
  | {
      success: false;
      error: string;
      message: string;
    };

function readRequestAiConfiguration(
  request: Request
): RequestAiConfiguration {
  const rawApiKey = request.get(OPENAI_KEY_HEADER);
  const rawModel = request.get(OPENAI_MODEL_HEADER);

  if (
    rawApiKey !== undefined &&
    !isValidOpenAiApiKey(rawApiKey)
  ) {
    return {
      success: false,
      error: "invalid_openai_api_key",
      message: "The provided OpenAI API key format is invalid."
    };
  }

  if (
    rawModel !== undefined &&
    !isAllowedOpenAiModel(rawModel)
  ) {
    return {
      success: false,
      error: "invalid_openai_model",
      message: "The requested OpenAI model is not allowed."
    };
  }

  return {
    success: true,
    apiKey: rawApiKey?.trim(),
    model: rawModel?.trim()
  };
}

const AiConnectionTestResultSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("ok"),
      model: z.string().refine(isAllowedOpenAiModel)
    })
    .strict(),
  z
    .object({
      status: z.literal("error"),
      model: z.string().refine(isAllowedOpenAiModel),
      reason: z.enum([
        "missing_api_key",
        "authentication_failed",
        "permission_denied",
        "model_unavailable",
        "rate_limited",
        "provider_error"
      ])
    })
    .strict()
]);

function aiTestHttpStatus(
  result: Extract<AiConnectionTestResult, { status: "error" }>
): number {
  switch (result.reason) {
    case "missing_api_key":
    case "authentication_failed":
      return 401;
    case "permission_denied":
      return 403;
    case "model_unavailable":
      return 404;
    case "rate_limited":
      return 429;
    default:
      return 502;
  }
}

export function createApp({
  aiInterpreter = interpretBusinessWithAi,
  aiConnectionTester = testOpenAiConnection,
  businessSchema = BusinessInputSchema,
  businessScorer = defaultBusinessScorer,
  expectedOrigin
}: AppDependencies = {}) {
  const app = express();
  const desktopOrigin = expectedOrigin
    ? new URL(expectedOrigin)
    : null;
  const apiRequestSchema = z
    .object({
      language: SupportedLanguageSchema,
      business: businessSchema
    })
    .strict();

  app.disable("x-powered-by");
  app.use((request, response, next) => {
    const requestHost = request.get("host");
    const requestOrigin = request.get("origin");
    const fetchSite = request.get("sec-fetch-site");
    const hostPermitted = desktopOrigin
      ? requestHost === desktopOrigin.host
      : isPermittedLoopbackHost(requestHost);

    if (!hostPermitted) {
      response.status(421).json({
        error: "unexpected_host",
        message: "The request host is not permitted."
      });
      return;
    }

    if (
      desktopOrigin &&
      requestOrigin !== undefined &&
      requestOrigin !== desktopOrigin.origin
    ) {
      response.status(403).json({
        error: "unexpected_origin",
        message: "The request origin is not permitted."
      });
      return;
    }

    if (
      desktopOrigin &&
      fetchSite !== undefined &&
      fetchSite !== "same-origin" &&
      fetchSite !== "none"
    ) {
      response.status(403).json({
        error: "cross_site_request_denied",
        message: "Cross-site requests are not permitted."
      });
      return;
    }

    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy:
        process.env.NODE_ENV === "production" ? undefined : false
    })
  );
  app.use(
    "/api",
    rateLimit({
      windowMs: 15 * 60 * 1_000,
      limit: 60,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      handler: (_request, response) => {
        response.status(429).json({
          error: "rate_limit_exceeded",
          message: "Too many requests. Please try again later."
        });
      }
    })
  );
  app.use("/api", (_request, response, next) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "256kb", strict: true }));

  app.get("/api/health", (_request, response) => {
    const config = getAiConfiguration();

    response.json({
      status: "ok",
      service: "RetailLens API",
      processId: process.pid,
      languages: ["zh", "en"],
      ai: {
        provider: "openai",
        configured: config.configured,
        serverConfigured: config.configured,
        model: config.model,
        clientManagedKeysSupported: true
      }
    });
  });

  app.post("/api/score", (request, response) => {
    const parsed = apiRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json(validationError(parsed.error));
      return;
    }

    const score = businessScorer(parsed.data.business);
    response.json({ score });
  });

  app.post("/api/analyze", async (request, response) => {
    const parsed = apiRequestSchema.safeParse(request.body);

    if (!parsed.success) {
      response.status(400).json(validationError(parsed.error));
      return;
    }

    const requestAiConfiguration =
      readRequestAiConfiguration(request);

    if (!requestAiConfiguration.success) {
      response.status(400).json({
        error: requestAiConfiguration.error,
        message: requestAiConfiguration.message
      });
      return;
    }

    const lockedScore = cloneJsonValue(
      businessScorer(parsed.data.business)
    );
    const fullBusiness = BusinessInputSchema.safeParse(
      parsed.data.business
    );
    const lockedConsultingAssessment = fullBusiness.success
      ? buildConsultingAssessment(
          fullBusiness.data as BusinessInput,
          lockedScore as BusinessScore
        )
      : undefined;
    const lockedEnterpriseTheoryAssessment = fullBusiness.success
      ? buildEnterpriseTheoryAssessment(
          fullBusiness.data as BusinessInput,
          lockedScore as BusinessScore
        )
      : undefined;

    let rawAiAnalysis: AiAnalysis;
    try {
      rawAiAnalysis = await aiInterpreter({
        language: parsed.data.language,
        businessInput: cloneJsonValue(parsed.data.business),
        lockedScore: cloneJsonValue(lockedScore),
        lockedConsultingAssessment: cloneJsonValue(
          lockedConsultingAssessment
        ),
        lockedEnterpriseTheoryAssessment: cloneJsonValue(
          lockedEnterpriseTheoryAssessment
        ),
        apiKey: requestAiConfiguration.apiKey,
        model: requestAiConfiguration.model
      });
    } catch {
      rawAiAnalysis = providerError(
        resolveOpenAiModel(requestAiConfiguration.model)
      );
    }

    const checkedAiAnalysis = AiAnalysisSchema.safeParse(rawAiAnalysis);
    const responseContainsRequestKey =
      checkedAiAnalysis.success &&
      requestAiConfiguration.apiKey !== undefined &&
      JSON.stringify(checkedAiAnalysis.data).includes(
        requestAiConfiguration.apiKey
      );
    const ai =
      checkedAiAnalysis.success &&
      isAllowedOpenAiModel(checkedAiAnalysis.data.model) &&
      !responseContainsRequestKey
        ? checkedAiAnalysis.data
        : providerError(
            resolveOpenAiModel(requestAiConfiguration.model)
          );

    response.json({
      score: lockedScore,
      ai
    });
  });

  app.post("/api/ai/test", async (request, response) => {
    const requestAiConfiguration =
      readRequestAiConfiguration(request);

    if (!requestAiConfiguration.success) {
      response.status(400).json({
        error: requestAiConfiguration.error,
        message: requestAiConfiguration.message
      });
      return;
    }

    if (
      requestAiConfiguration.apiKey === undefined &&
      !getAiConfiguration().configured
    ) {
      response.status(401).json({
        status: "error",
        provider: "openai",
        model: resolveOpenAiModel(requestAiConfiguration.model),
        reason: "missing_api_key",
        message: "No OpenAI API key was provided."
      });
      return;
    }

    let rawResult: AiConnectionTestResult;
    try {
      rawResult = await aiConnectionTester({
        apiKey: requestAiConfiguration.apiKey,
        model: requestAiConfiguration.model
      });
    } catch {
      rawResult = {
        status: "error",
        model: resolveOpenAiModel(requestAiConfiguration.model),
        reason: "provider_error"
      };
    }

    const parsedResult =
      AiConnectionTestResultSchema.safeParse(rawResult);
    const result: AiConnectionTestResult = parsedResult.success
      ? parsedResult.data
      : {
          status: "error",
          model: resolveOpenAiModel(requestAiConfiguration.model),
          reason: "provider_error"
        };

    if (result.status === "ok") {
      response.json({
        status: "ok",
        provider: "openai",
        model: result.model
      });
      return;
    }

    response.status(aiTestHttpStatus(result)).json({
      status: "error",
      provider: "openai",
      model: result.model,
      reason: result.reason,
      message: "The OpenAI connection test did not succeed."
    });
  });

  app.use("/api", (_request, response) => {
    response.status(404).json({
      error: "not_found",
      message: "API route not found."
    });
  });

  if (process.env.NODE_ENV === "production") {
    app.use(
      express.static(DIST_DIRECTORY, {
        index: false,
        maxAge: "1h"
      })
    );
    app.get(/^(?!\/api(?:\/|$)).*/, (_request, response, next) => {
      response.sendFile(
        path.join(DIST_DIRECTORY, "index.html"),
        (error) => {
          if (error) {
            next(error);
          }
        }
      );
    });
  }

  const errorHandler: ErrorRequestHandler = (
    error: unknown,
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    const bodyError = error as {
      status?: number;
      type?: string;
    };

    if (
      bodyError.status === 413 ||
      bodyError.type === "entity.too.large"
    ) {
      response.status(413).json({
        error: "payload_too_large",
        message: "The request body exceeds the allowed size."
      });
      return;
    }

    if (bodyError.type === "entity.parse.failed") {
      response.status(400).json({
        error: "invalid_json",
        message: "The request body must contain valid JSON."
      });
      return;
    }

    response.status(500).json({
      error: "internal_error",
      message: "The request could not be completed."
    });
  };

  app.use(errorHandler);

  return app;
}

export const app = createApp();

export interface StartServerOptions {
  /** Use 0 to ask the operating system for an unused ephemeral port. */
  port?: number;
  log?: boolean;
  expectedOrigin?: string;
}

function configuredPort(): number {
  const value = Number.parseInt(process.env.PORT ?? "8787", 10);
  return Number.isInteger(value) && value > 0 && value <= 65_535
    ? value
    : 8787;
}

export function startServer({
  port = configuredPort(),
  log = true,
  expectedOrigin
}: StartServerOptions = {}): Promise<Server> {
  const safePort =
    Number.isInteger(port) && port >= 0 && port <= 65_535
      ? port
      : configuredPort();

  return new Promise((resolve, reject) => {
    const serverApp = expectedOrigin
      ? createApp({ expectedOrigin })
      : app;
    const server = serverApp.listen(safePort, "127.0.0.1");

    server.once("error", reject);
    server.once("listening", () => {
      server.off("error", reject);

      if (log) {
        const address = server.address();
        const actualPort =
          address && typeof address !== "string"
            ? address.port
            : safePort;
        // Do not include environment variables or credential material in logs.
        console.log(
          `RetailLens API listening on http://127.0.0.1:${actualPort}`
        );
      }

      resolve(server);
    });
  });
}

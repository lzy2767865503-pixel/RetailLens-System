import type { Locale } from "./i18n";

export interface AiEvidence {
  framework: string;
  indicator: string;
  observedEvidence: string;
  connection: string;
}

export interface AiFinding {
  title: string;
  finding: string;
  evidence: AiEvidence[];
}

export interface AiAssumption {
  assumption: string;
  riskIfWrong: string;
  validationMethod: string;
}

export interface AiScenario {
  scenario: "downside" | "base" | "upside";
  conditions: string;
  likelyEffect: string;
  watchMetric: string;
}

export interface AiAction {
  priority: number;
  action: string;
  rationale: string;
  timeframe: string;
  kpis: Array<{
    name: string;
    target: string;
    measurement: string;
  }>;
  frameworkEvidence: AiEvidence[];
}

export type AiAnalysis =
  | {
      status: "complete";
      model: string;
      interpretation: {
        language: Locale;
        executiveSummary: string;
        strengths: AiFinding[];
        weaknesses: AiFinding[];
        assumptions: AiAssumption[];
        scenarioInsights: AiScenario[];
        prioritizedActions: AiAction[];
      };
    }
  | {
      status: "unavailable";
      model: string;
      reason: "missing_api_key";
    }
  | {
      status: "error";
      model: string;
      reason: "provider_error" | "invalid_response";
    };

export interface AnalysisResponse<TScore> {
  score: TScore;
  ai: AiAnalysis;
}

export interface HealthResponse {
  status: "ok";
  service: string;
  languages: Locale[];
  ai: {
    provider: "openai";
    configured: boolean;
    serverConfigured: boolean;
    model: string;
    clientManagedKeysSupported: boolean;
  };
}

interface ApiErrorBody {
  error?: string;
  message?: string;
  reason?: string;
  issues?: Array<{ path: string; message: string }>;
}

export interface ApiRequestConfig {
  apiKey: string;
  model: string;
}

export type AiConnectionTestCode =
  | "connected"
  | "invalid_key"
  | "unauthorized"
  | "model_unavailable"
  | "server_unavailable"
  | "rate_limited"
  | "unknown";

export interface AiConnectionTestResult {
  ok: boolean;
  code: AiConnectionTestCode;
}

export class RetailLensApiError extends Error {
  status: number;
  issues: Array<{ path: string; message: string }>;

  constructor(
    message: string,
    status: number,
    issues: Array<{ path: string; message: string }> = []
  ) {
    super(message);
    this.name = "RetailLensApiError";
    this.status = status;
    this.issues = issues;
  }
}

async function readJson<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => ({}))) as T & ApiErrorBody;

  if (!response.ok) {
    throw new RetailLensApiError(
      body.message || `Request failed with status ${response.status}.`,
      response.status,
      body.issues || []
    );
  }

  return body;
}

function aiRequestHeaders(
  config?: ApiRequestConfig
): Record<string, string> {
  if (!config) return {};

  return {
    "X-RetailLens-OpenAI-Key": config.apiKey.trim(),
    "X-RetailLens-OpenAI-Model": config.model.trim()
  };
}

export async function getHealth(
  signal?: AbortSignal
): Promise<HealthResponse> {
  const response = await fetch("/api/health", {
    signal,
    headers: { Accept: "application/json" }
  });
  return readJson<HealthResponse>(response);
}

export async function scoreBusiness<TBusiness, TScore>(
  language: Locale,
  business: TBusiness,
  signal?: AbortSignal
): Promise<TScore> {
  const response = await fetch("/api/score", {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ language, business })
  });

  const result = await readJson<{ score: TScore }>(response);
  return result.score;
}

export async function analyzeBusiness<TBusiness, TScore>(
  language: Locale,
  business: TBusiness,
  config?: ApiRequestConfig,
  signal?: AbortSignal
): Promise<AnalysisResponse<TScore>> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...aiRequestHeaders(config)
    },
    body: JSON.stringify({ language, business })
  });

  return readJson<AnalysisResponse<TScore>>(response);
}

export async function testAiConnection(
  config: ApiRequestConfig,
  signal?: AbortSignal
): Promise<AiConnectionTestResult> {
  let response: Response;

  try {
    response = await fetch("/api/ai/test", {
      method: "POST",
      signal,
      headers: {
        Accept: "application/json",
        ...aiRequestHeaders(config)
      }
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    return { ok: false, code: "server_unavailable" };
  }

  const body = (await response.json().catch(() => ({}))) as ApiErrorBody & {
    status?: "ok" | "error";
  };

  if (response.ok && body.status === "ok") {
    return { ok: true, code: "connected" };
  }

  if (
    body.error === "invalid_openai_api_key" ||
    body.reason === "missing_api_key"
  ) {
    return { ok: false, code: "invalid_key" };
  }
  if (
    body.reason === "authentication_failed" ||
    body.reason === "permission_denied" ||
    response.status === 401 ||
    response.status === 403
  ) {
    return { ok: false, code: "unauthorized" };
  }
  if (
    body.reason === "model_unavailable" ||
    body.error === "invalid_openai_model" ||
    response.status === 404
  ) {
    return { ok: false, code: "model_unavailable" };
  }
  if (body.reason === "rate_limited" || response.status === 429) {
    return { ok: false, code: "rate_limited" };
  }

  return { ok: false, code: "unknown" };
}

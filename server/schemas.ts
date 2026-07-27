import { z } from "zod";

export const SupportedLanguageSchema = z.enum(["zh", "en"]);

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const AiEvidenceSchema = z.object({
  framework: z.string().min(1).max(120),
  indicator: z.string().min(1).max(160),
  observedEvidence: z.string().min(1).max(700),
  connection: z.string().min(1).max(700)
});

export const AiFindingSchema = z.object({
  title: z.string().min(1).max(180),
  finding: z.string().min(1).max(900),
  evidence: z.array(AiEvidenceSchema).min(1).max(3)
});

export const AiAssumptionSchema = z.object({
  assumption: z.string().min(1).max(700),
  riskIfWrong: z.string().min(1).max(700),
  validationMethod: z.string().min(1).max(700)
});

export const AiScenarioSchema = z.object({
  scenario: z.enum(["downside", "base", "upside"]),
  conditions: z.string().min(1).max(700),
  likelyEffect: z.string().min(1).max(900),
  watchMetric: z.string().min(1).max(240)
});

export const AiKpiSchema = z.object({
  name: z.string().min(1).max(160),
  target: z.string().min(1).max(240),
  measurement: z.string().min(1).max(400)
});

export const AiActionSchema = z.object({
  priority: z.number().int().min(1).max(5),
  action: z.string().min(1).max(900),
  rationale: z.string().min(1).max(700),
  timeframe: z.string().min(1).max(160),
  kpis: z.array(AiKpiSchema).min(1).max(3),
  frameworkEvidence: z.array(AiEvidenceSchema).min(1).max(3)
});

const AiInterpretationBodySchema = z.object({
  executiveSummary: z.string().min(1).max(1_600),
  strengths: z.array(AiFindingSchema).min(1).max(5),
  weaknesses: z.array(AiFindingSchema).min(1).max(5),
  assumptions: z.array(AiAssumptionSchema).min(1).max(5),
  scenarioInsights: z.array(AiScenarioSchema).length(3),
  prioritizedActions: z.array(AiActionSchema).min(1).max(5)
});

export function createAiInterpretationSchema(language: SupportedLanguage) {
  return AiInterpretationBodySchema.extend({
    language: z.literal(language)
  });
}

export const AiInterpretationSchema = AiInterpretationBodySchema.extend({
  language: SupportedLanguageSchema
});

export type AiInterpretation = z.infer<typeof AiInterpretationSchema>;

export const AiAnalysisSchema = z.discriminatedUnion("status", [
  z
    .object({
      status: z.literal("complete"),
      model: z.string().min(1).max(160),
      interpretation: AiInterpretationSchema
    })
    .strict(),
  z
    .object({
      status: z.literal("unavailable"),
      model: z.string().min(1).max(160),
      reason: z.literal("missing_api_key")
    })
    .strict(),
  z
    .object({
      status: z.literal("error"),
      model: z.string().min(1).max(160),
      reason: z.enum(["provider_error", "invalid_response"])
    })
    .strict()
]);

export type AiAnalysisBody = z.infer<typeof AiAnalysisSchema>;

export const ValidationErrorSchema = z.object({
  error: z.literal("validation_error"),
  message: z.string(),
  issues: z.array(
    z.object({
      path: z.string(),
      message: z.string()
    })
  )
});

export type ValidationErrorBody = z.infer<typeof ValidationErrorSchema>;

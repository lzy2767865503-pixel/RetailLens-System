import { describe, expect, it } from "vitest";
import { createDemoBusiness } from "./demo";
import {
  buildConsultingAssessment,
  CONSULTING_METHODOLOGY_VERSION
} from "./consulting";
import { scoreBusiness } from "./scoring";
import type { BusinessInput, BusinessScore, DimensionId } from "./types";

function assess(input = createDemoBusiness()) {
  const score = scoreBusiness(input);
  return {
    score,
    assessment: buildConsultingAssessment(input, score)
  };
}

function passAllGates(input: BusinessInput) {
  for (const key of [
    "ownership",
    "licences",
    "productSafety",
    "privacyPayment",
    "labourSupplier",
    "fxTreasury",
    "infrastructure",
    "ethicsSanctions"
  ] as const) {
    input.compliance[key] = "pass";
  }
}

describe("deterministic consulting assessment", () => {
  it("returns an identical, AI-locked workpaper for identical input and score", () => {
    const input = createDemoBusiness();
    const score = scoreBusiness(input);
    const first = buildConsultingAssessment(input, score);
    const second = buildConsultingAssessment(input, score);

    expect(second).toEqual(first);
    expect(first.audit).toMatchObject({
      deterministic: true,
      aiMayAlterAssessment: false,
      methodologyVersion: CONSULTING_METHODOLOGY_VERSION,
      inputScoringVersion: "1.0"
    });
    expect(first.generatedAt).toBe(score.generatedAt);
  });

  it("uses a transparent weighted readiness calculation", () => {
    const { assessment } = assess();
    const expected = assessment.decisionReadiness.components.reduce(
      (sum, component) => sum + component.weightedContribution,
      0
    );

    expect(assessment.decisionReadiness.score).toBeCloseTo(expected, 1);
    expect(
      assessment.decisionReadiness.components.reduce(
        (sum, component) => sum + component.weight,
        0
      )
    ).toBe(100);
    expect(assessment.decisionReadiness.calculation).toContain(
      "35% commercial case"
    );
  });

  it("keeps the five-branch issue tree MECE over all ten dimensions", () => {
    const { assessment } = assess();
    const dimensions = assessment.issueTree.flatMap((branch) =>
      branch.hypotheses.map(({ dimensionId }) => dimensionId)
    );
    const expected: DimensionId[] = [
      "market_customer",
      "strategy_differentiation",
      "country_compliance",
      "channels_digital",
      "location_trade_area",
      "merchandise_supply_chain",
      "financial_unit_economics",
      "marketing_crm_service",
      "organization_execution",
      "risk_sustainability"
    ];

    expect(assessment.issueTree).toHaveLength(5);
    expect(new Set(dimensions).size).toBe(expected.length);
    expect([...dimensions].sort()).toEqual([...expected].sort());
  });

  it("retains the location hypothesis but marks it not applicable for digital-only retail", () => {
    const input = createDemoBusiness();
    input.model.type = "digital";
    const { assessment } = assess(input);
    const location = assessment.issueTree
      .flatMap(({ hypotheses }) => hypotheses)
      .find(({ dimensionId }) => dimensionId === "location_trade_area");

    expect(location).toMatchObject({
      status: "not_applicable",
      score: 0
    });
  });
});

describe("executive decision rules", () => {
  it("keeps the demo conditional because unresolved gates and downside economics cannot be averaged away", () => {
    const { assessment } = assess();

    expect(assessment.executiveDecision.recommendation).toBe("conditional");
    expect(assessment.executiveDecision.conditions.length).toBeGreaterThan(0);
    expect(
      assessment.executiveDecision.conditions.some(
        ({ id }) => id === "condition-downside-break-even"
      )
    ).toBe(true);
  });

  it("stops the current case when any hard gate fails despite a high aggregate score", () => {
    const input = createDemoBusiness();
    input.compliance.ownership = "fail";
    const { score, assessment } = assess(input);

    expect(score.overallScore).toBeGreaterThan(70);
    expect(score.gateOutcome).toBe("blocked");
    expect(assessment.executiveDecision.recommendation).toBe("stop");
  });

  it("stops when contribution margin is non-positive", () => {
    const input = createDemoBusiness();
    passAllGates(input);
    input.financial.monthlyCogs = input.financial.monthlyRevenue;
    const { assessment } = assess(input);

    expect(assessment.executiveDecision.recommendation).toBe("stop");
    expect(
      assessment.executiveDecision.conditions.some(
        ({ id }) => id === "condition-positive-contribution"
      )
    ).toBe(true);
  });

  it("pauses when a gate is unknown", () => {
    const input = createDemoBusiness();
    passAllGates(input);
    input.compliance.licences = "unknown";
    const { assessment } = assess(input);

    expect(assessment.executiveDecision.recommendation).toBe("pause");
  });

  it("proceeds only after hard gates and downside coverage both clear", () => {
    const input = createDemoBusiness();
    passAllGates(input);
    input.financial.downsideMonthlyRevenue = 120_000;
    const { assessment } = assess(input);

    expect(assessment.executiveDecision.recommendation).toBe("proceed");
    expect(assessment.executiveDecision.conditions).toEqual([]);
  });
});

describe("evidence, assumptions, and scenarios", () => {
  it("separates evidence quality from scoring confidence and disclaims external verification", () => {
    const { assessment } = assess();

    expect(assessment.evidence.qualityScore).toBeGreaterThan(0);
    expect(assessment.evidence.confidenceScore).toBeGreaterThan(0);
    expect(assessment.evidence.components).toHaveLength(4);
    expect(
      assessment.evidence.components.reduce(
        (sum, component) => sum + component.weight,
        0
      )
    ).toBe(100);
    expect(
      assessment.evidence.limitations.some(({ en }) =>
        en.includes("No external market benchmark")
      )
    ).toBe(true);
  });

  it("downgrades evidence deterministically when traceability is removed", () => {
    const input = createDemoBusiness();
    input.riskEvidence.evidenceConfidence = "low";
    input.riskEvidence.evidenceSource = "";
    input.riskEvidence.evidenceDate = "";
    input.compliance.currentEvidence = "";
    const { assessment } = assess(input);

    expect(assessment.evidence.level).toBe("low");
    expect(assessment.evidence.qualityScore).toBe(12.3);
    expect(assessment.evidence.limitations.length).toBeGreaterThanOrEqual(5);
  });

  it("does not award evidence-quality points for longer source prose", () => {
    const concise = createDemoBusiness();
    const verbose = createDemoBusiness();
    concise.riskEvidence.evidenceSource = "Source A";
    concise.compliance.currentEvidence = "Source B";
    verbose.riskEvidence.evidenceSource = "Source A ".repeat(80);
    verbose.compliance.currentEvidence = "Source B ".repeat(80);

    const conciseAssessment = assess(concise).assessment;
    const verboseAssessment = assess(verbose).assessment;

    expect(verboseAssessment.evidence).toEqual(
      conciseAssessment.evidence
    );
  });

  it("registers contradicted assumptions as P0 without allowing narrative to hide them", () => {
    const { assessment } = assess();
    const downside = assessment.assumptions.find(
      ({ id }) => id === "downside-viability"
    );

    expect(downside).toMatchObject({
      criticality: "P0",
      status: "contradicted"
    });
    expect(assessment.assumptions[0].criticality).toBe("P0");
  });

  it("calculates downside, base, and symmetric upside from submitted economics", () => {
    const { assessment } = assess();
    const downside = assessment.scenarios.find(
      ({ id }) => id === "downside"
    );
    const base = assessment.scenarios.find(({ id }) => id === "base");
    const upside = assessment.scenarios.find(({ id }) => id === "upside");

    expect(downside).toMatchObject({
      available: true,
      monthlyRevenue: 88_000,
      monthlyOperatingContribution: -2_600
    });
    expect(downside?.breakEvenCoverage).toBeCloseTo(0.91, 2);
    expect(base).toMatchObject({
      available: true,
      monthlyRevenue: 110_000,
      monthlyOperatingContribution: 4_000
    });
    expect(upside).toMatchObject({
      available: true,
      monthlyRevenue: 132_000,
      monthlyOperatingContribution: 10_600
    });
    expect(upside?.basis.en).toContain("not an external forecast");
  });

  it("does not invent scenario values when inputs are missing", () => {
    const input = createDemoBusiness();
    input.financial.monthlyRevenue = 0;
    input.financial.downsideMonthlyRevenue = 0;
    const { assessment } = assess(input);

    for (const scenario of assessment.scenarios) {
      expect(scenario.available).toBe(false);
      expect(scenario.monthlyRevenue).toBeNull();
      expect(scenario.monthlyOperatingContribution).toBeNull();
      expect(scenario.breakEvenCoverage).toBeNull();
    }
  });
});

describe("management KPIs, priorities, and source traceability", () => {
  it("selects three outcome KPIs with drivers, guardrails, owners, and explicit target bases", () => {
    const { assessment } = assess();

    expect(assessment.kpis).toHaveLength(3);
    for (const kpi of assessment.kpis) {
      expect(kpi.drivers.length).toBeGreaterThan(0);
      expect(kpi.guardrails.length).toBeGreaterThan(0);
      expect(kpi.owner.zh.length).toBeGreaterThan(0);
      expect(kpi.owner.en.length).toBeGreaterThan(0);
      expect([
        "mathematical_break_even",
        "submitted_plan",
        "management_target_required"
      ]).toContain(kpi.targetBasis);
    }
    expect(
      assessment.kpis.find(({ id }) => id === "supplier_service_level")
        ?.targetBasis
    ).toBe("management_target_required");
  });

  it("keeps priorities ranked by P0/P1/P2 and carries exit criteria and course handles", () => {
    const input = createDemoBusiness();
    input.compliance.ownership = "fail";
    const { assessment } = assess(input);
    const order = { P0: 0, P1: 1, P2: 2 };
    const numeric = assessment.priorities.map(
      ({ priority }) => order[priority]
    );

    expect(numeric).toEqual([...numeric].sort((a, b) => a - b));
    assessment.priorities.forEach((priority, index) => {
      expect(priority.rank).toBe(index + 1);
      expect(priority.exitCriteria.en.length).toBeGreaterThan(0);
      expect(priority.sourceHandles.length).toBeGreaterThan(0);
    });
  });

  it("deduplicates course handles and never presents them as current external proof", () => {
    const { assessment } = assess();
    const handles = assessment.courseSources.map(({ handle }) => handle);

    expect(new Set(handles).size).toBe(handles.length);
    expect(handles).toContain("RM11-C07");
    expect(handles).toContain("SM-ETH");
    expect(
      assessment.courseSources.every(({ note }) =>
        note.en.includes("not external fact")
      )
    ).toBe(true);
  });

  it("can consume an already persisted score without changing its timestamp or score fields", () => {
    const input = createDemoBusiness();
    const persistedScore: BusinessScore = {
      ...scoreBusiness(input),
      generatedAt: "2026-01-15T12:00:00.000Z"
    };
    const assessment = buildConsultingAssessment(input, persistedScore);

    expect(assessment.generatedAt).toBe("2026-01-15T12:00:00.000Z");
    expect(persistedScore.audit.aiMayAlterScore).toBe(false);
    expect(assessment.audit.aiMayAlterAssessment).toBe(false);
  });
});

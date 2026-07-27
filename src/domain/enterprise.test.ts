import { describe, expect, it } from "vitest";
import { createDemoBusiness } from "./demo";
import { buildEnterpriseTheoryAssessment } from "./enterprise";
import { scoreBusiness } from "./scoring";

function assess(
  mutate?: (input: ReturnType<typeof createDemoBusiness>) => void
) {
  const input = createDemoBusiness();
  mutate?.(input);
  const score = scoreBusiness(input);
  return buildEnterpriseTheoryAssessment(input, score);
}

describe("RetailLens enterprise theory engine", () => {
  it("converts Five Forces pressure to a disclosed internal attractiveness score", () => {
    const result = assess();

    expect(result.fiveForces.overallIntensity).toBe(3.6);
    expect(result.fiveForces.internalIndustryAttractiveness).toBe(35);
    expect(result.fiveForces.formula).toContain("100");
    expect(result.fiveForces.sourceHandles).toContain("SM-EXT");
  });

  it("calculates CPM totals and ranks competitors only relatively", () => {
    const result = assess();

    expect(result.cpm.weightTotal).toBe(1);
    expect(result.cpm.companies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "company",
          weightedTotal: 3.7,
          relativeRank: 1
        }),
        expect.objectContaining({
          id: "competitor_a",
          weightedTotal: 3.35
        }),
        expect.objectContaining({
          id: "competitor_b",
          weightedTotal: 3.3
        })
      ])
    );
    expect(result.cpm.relativeLeaderId).toBe("company");
    expect(result.cpm).not.toHaveProperty("absolutePass");
  });

  it("normalizes STP subscales without claiming an industry threshold", () => {
    const result = assess();

    expect(result.stp.segmentAttractiveness.internalNormalizedScore).toBe(70);
    expect(result.stp.rightToWin.internalNormalizedScore).toBe(62.5);
    expect(result.stp.positioningCompleteness.internalNormalizedScore).toBe(
      68.8
    );
    expect(result.stp.targeting.strategy).toBe("concentrated");
  });

  it("rejects a CPM whose factor weights do not total 1", () => {
    const result = assess((input) => {
      input.enterprise.cpm.factors[0].weight = 0.05;
    });

    expect(result.cpm.weightTotal).not.toBe(1);
    expect(result.cpm.weightValid).toBe(false);
    expect(result.cpm.status).toBe("invalid");
    expect(
      result.cpm.companies.every(({ weightedTotal }) => weightedTotal === null)
    ).toBe(true);
  });

  it("blocks entry-mode selection when a hard gate fails", () => {
    const result = assess((input) => {
      input.compliance.ownership = "fail";
    });

    expect(result.entryMode.hardGateOutcome).toBe("blocked");
    expect(result.entryMode.status).toBe("blocked");
    expect(result.entryMode.leadingModeId).toBeNull();
  });

  it("marks a top-two entry-mode gap below 5 points inconclusive", () => {
    const result = assess((input) => {
      input.enterprise.entryModes[1].fit = {
        ...input.enterprise.entryModes[0].fit
      };
    });

    expect(result.entryMode.weightTotal).toBe(100);
    expect(result.entryMode.scoreGap).toBe(0);
    expect(result.entryMode.status).toBe("inconclusive");
    expect(result.entryMode.leadingModeId).toBeNull();
  });

  it("calculates Strategic Profit Model ratios and annual GMROI", () => {
    const result = assess((input) => {
      input.financial.monthlyRevenue = 100;
      input.financial.monthlyCogs = 60;
      input.enterprise.financeProductivity.monthlyNetProfit = 10;
      input.enterprise.financeProductivity.totalAssets = 600;
      input.enterprise.financeProductivity.averageInventory = 120;
    });
    const metric = (id: string) =>
      result.financeProductivity.metrics.find((item) => item.id === id)?.value;

    expect(metric("net_margin")).toBe(10);
    expect(metric("asset_turnover")).toBe(2);
    expect(metric("return_on_assets")).toBe(20);
    expect(metric("annual_gmroi")).toBe(4);
    expect(result.financeProductivity.status).toBe("complete");
  });

  it("computes service quality gaps as perception minus expectation", () => {
    const result = assess((input) => {
      input.enterprise.serviceGaps.expectations = {
        reliability: 6,
        responsiveness: 6,
        assurance: 6,
        empathy: 6,
        tangibles: 6
      };
      input.enterprise.serviceGaps.perceptions = {
        reliability: 4,
        responsiveness: 4,
        assurance: 4,
        empathy: 4,
        tangibles: 4
      };
    });

    expect(
      result.serviceGaps.customerGaps.every(({ gap }) => gap === -2)
    ).toBe(true);
    expect(result.serviceGaps.averageCustomerGap).toBe(-2);
    expect(result.serviceGaps.negativeGapCount).toBe(5);
  });

  it("calculates inherent and residual risk without inventing a risk band", () => {
    const result = assess((input) => {
      input.enterprise.topRisk.likelihood = 4;
      input.enterprise.topRisk.impact = 5;
      input.enterprise.topRisk.controlEffectivenessPct = 50;
      input.enterprise.topRisk.kriDefined = true;
      input.enterprise.topRisk.triggerDefined = false;
      input.enterprise.topRisk.contingencyFunded = true;
    });

    expect(result.topRisk.inherentScore).toBe(20);
    expect(result.topRisk.residualScore).toBe(10);
    expect(result.topRisk.controlReadinessPct).toBeCloseTo(66.7, 1);
    expect(result.topRisk).not.toHaveProperty("riskBand");
  });

  it("reports control coverage as submitted without a universal pass line", () => {
    const result = assess();

    expect(result.organizationControl.averageCoveragePct).toBe(71.7);
    expect(result.organizationControl.reviewCadenceDays).toBe(7);
    expect(result.organizationControl.varianceTolerancePct).toBe(10);
    expect(
      result.organizationControl.internalRuleDisclaimer.en
    ).toContain("does not invent universal");
  });

  it("locks the theory assessment against AI modification", () => {
    const result = assess();

    expect(result.audit).toMatchObject({
      deterministic: true,
      aiMayAlterAssessment: false,
      methodologyVersion: "1.0"
    });
    expect(result.audit.sourceHandles.length).toBeGreaterThan(5);
  });
});

import { describe, expect, it } from "vitest";
import { createDemoBusiness } from "./demo";
import { scoreFrameworks } from "./frameworks";
import {
  DEFAULT_WEIGHTS,
  DIGITAL_WEIGHTS,
  scoreBusiness
} from "./scoring";

describe("RetailLens deterministic scoring", () => {
  it("keeps both weight profiles at 100 points", () => {
    expect(
      Object.values(DEFAULT_WEIGHTS).reduce((sum, value) => sum + value, 0)
    ).toBe(100);
    expect(
      Object.values(DIGITAL_WEIGHTS).reduce((sum, value) => sum + value, 0)
    ).toBe(100);
    expect(DIGITAL_WEIGHTS.location_trade_area).toBe(0);
  });

  it("returns the same score for identical inputs", () => {
    const input = createDemoBusiness();
    const first = scoreBusiness(input);
    const second = scoreBusiness(input);

    expect(second.overallScore).toBe(first.overallScore);
    expect(second.dimensions).toEqual(first.dimensions);
    expect(second.metrics).toEqual(first.metrics);
    expect(second.gates).toEqual(first.gates);
    expect(first.audit.aiMayAlterScore).toBe(false);
  });

  it("does not award a higher score for longer narrative text", () => {
    const concise = createDemoBusiness();
    const verbose = createDemoBusiness();
    concise.offer.valueProposition = "Clear value";
    verbose.offer.valueProposition = "Clear value ".repeat(80);

    const conciseScore = scoreBusiness(concise);
    const verboseScore = scoreBusiness(verbose);

    expect(verboseScore.overallScore).toBe(conciseScore.overallScore);
    expect(verboseScore.dimensions).toEqual(conciseScore.dimensions);
  });

  it("does not compensate a failed hard gate with performance", () => {
    const input = createDemoBusiness();
    input.compliance.ownership = "fail";

    const score = scoreBusiness(input);

    expect(score.gateOutcome).toBe("blocked");
    expect(
      score.gates.find(({ id }) => id === "ownership")?.status
    ).toBe("fail");
  });

  it("marks location not applicable for digital-only retail", () => {
    const input = createDemoBusiness();
    input.model.type = "digital";
    input.geography.catchment = "";
    input.channelLocation.siteType = "";

    const score = scoreBusiness(input);
    const location = score.dimensions.find(
      ({ id }) => id === "location_trade_area"
    );

    expect(location).toMatchObject({
      applicable: false,
      weight: 0,
      score: 0
    });
    expect(
      score.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0)
    ).toBe(100);
  });
});

describe("course framework calculations", () => {
  const factor = (
    id: string,
    weight: number,
    rating: number
  ) => ({
    id,
    label: { zh: id, en: id },
    weight,
    rating
  });

  it.each([
    [3.6, 3.2, "I"],
    [2.1, 3.5, "II"],
    [3.1, 2.1, "IV"],
    [1.8, 2.5, "VI"]
  ])(
    "places IFE %s and EFE %s in IE cell %s",
    (ifeScore, efeScore, expectedCell) => {
      const input = createDemoBusiness();
      input.frameworks.ife = [
        factor("ife-a", 0.5, ifeScore),
        factor("ife-b", 0.5, ifeScore)
      ];
      input.frameworks.efe = [
        factor("efe-a", 0.5, efeScore),
        factor("efe-b", 0.5, efeScore)
      ];

      expect(scoreFrameworks(input).ie.cell).toBe(expectedCell);
    }
  );

  it("uses QSPM TAS = weight × AS and ranks only relatively", () => {
    const result = scoreFrameworks(createDemoBusiness());

    expect(result.qspm.valid).toBe(true);
    expect(result.qspm.totals[0]).toBeCloseTo(3.55, 2);
    expect(result.qspm.totals[1]).toBeCloseTo(1.55, 2);
    expect(result.qspm.leadingStrategyIndex).toBe(0);
  });

  it("refuses incomplete EFE/IFE weighting", () => {
    const input = createDemoBusiness();
    input.frameworks.efe[0].weight = 0.1;

    const result = scoreFrameworks(input);

    expect(result.efe.valid).toBe(false);
    expect(result.efe.score).toBeNull();
    expect(result.ie.cell).toBeNull();
  });
});

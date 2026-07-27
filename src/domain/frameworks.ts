import type {
  BusinessInput,
  FrameworkResult,
  FrameworkScore,
  WeightedFactorInput
} from "./types";

const round = (value: number, precision = 2) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

function calculateWeightedMatrix(
  factors: WeightedFactorInput[],
  label: "EFE" | "IFE"
): FrameworkScore {
  const issues: string[] = [];

  if (factors.length === 0) {
    return {
      valid: false,
      score: null,
      weightTotal: 0,
      issues: [`${label}_FACTORS_MISSING`]
    };
  }

  const duplicateIds = factors
    .map(({ id }) => id)
    .filter((id, index, values) => values.indexOf(id) !== index);
  if (duplicateIds.length > 0) issues.push(`${label}_DUPLICATE_IDS`);

  const invalidRows = factors.some(
    ({ weight, rating }) =>
      !Number.isFinite(weight) ||
      weight < 0 ||
      weight > 1 ||
      !Number.isFinite(rating) ||
      rating < 1 ||
      rating > 4
  );
  if (invalidRows) issues.push(`${label}_INVALID_VALUES`);

  const weightTotal = factors.reduce((sum, factor) => sum + factor.weight, 0);
  if (Math.abs(weightTotal - 1) > 0.005) {
    issues.push(`${label}_WEIGHTS_MUST_TOTAL_1`);
  }

  const valid = issues.length === 0;
  return {
    valid,
    score: valid
      ? round(
          factors.reduce(
            (sum, factor) => sum + factor.weight * factor.rating,
            0
          )
        )
      : null,
    weightTotal: round(weightTotal, 3),
    issues
  };
}

function getIeCell(
  ifeScore: number | null,
  efeScore: number | null
): FrameworkResult["ie"] {
  if (ifeScore === null || efeScore === null) {
    return { cell: null, posture: null };
  }

  const column = ifeScore >= 3 ? 2 : ifeScore >= 2 ? 1 : 0;
  const row = efeScore >= 3 ? 0 : efeScore >= 2 ? 1 : 2;
  const cells = [
    [
      ["III", "hold"],
      ["II", "grow"],
      ["I", "grow"]
    ],
    [
      ["VI", "harvest"],
      ["V", "hold"],
      ["IV", "grow"]
    ],
    [
      ["IX", "harvest"],
      ["VIII", "harvest"],
      ["VII", "hold"]
    ]
  ] as const;
  const [cell, posture] = cells[row][column];

  return { cell, posture };
}

function calculateQspm(
  qspm: BusinessInput["frameworks"]["qspm"]
): FrameworkResult["qspm"] {
  const issues: string[] = [];
  const strategyCount = qspm.strategies.length;

  if (strategyCount < 2) issues.push("QSPM_REQUIRES_TWO_STRATEGIES");
  if (qspm.factors.length === 0) issues.push("QSPM_FACTORS_MISSING");

  const invalid = qspm.factors.some(
    ({ weight, attractivenessScores }) =>
      weight < 0 ||
      weight > 1 ||
      attractivenessScores.length !== strategyCount ||
      attractivenessScores.some(
        (score) =>
          score !== null &&
          (!Number.isInteger(score) || score < 1 || score > 4)
      )
  );
  if (invalid) issues.push("QSPM_INVALID_VALUES");

  const hasAnyAttractiveness = qspm.factors.some(({ attractivenessScores }) =>
    attractivenessScores.some((score) => score !== null)
  );
  if (!hasAnyAttractiveness) issues.push("QSPM_AS_MISSING");

  const totals = Array.from({ length: strategyCount }, (_, strategyIndex) =>
    round(
      qspm.factors.reduce((sum, factor) => {
        const score = factor.attractivenessScores[strategyIndex];
        return score === null || score === undefined
          ? sum
          : sum + factor.weight * score;
      }, 0)
    )
  );
  const valid = issues.length === 0;
  const leadingStrategyIndex =
    valid && totals.length > 0
      ? totals.reduce(
          (bestIndex, total, index, values) =>
            total > values[bestIndex] ? index : bestIndex,
          0
        )
      : null;

  return {
    valid,
    totals,
    leadingStrategyIndex,
    issues
  };
}

export function scoreFrameworks(input: BusinessInput): FrameworkResult {
  const efe = calculateWeightedMatrix(input.frameworks.efe, "EFE");
  const ife = calculateWeightedMatrix(input.frameworks.ife, "IFE");

  return {
    efe,
    ife,
    ie: getIeCell(ife.score, efe.score),
    qspm: calculateQspm(input.frameworks.qspm)
  };
}

import type {
  BilingualLabel,
  BusinessInput,
  BusinessScore,
  CpmFactorInput,
  EntryModeFitInput,
  FiveForcesInput,
  RaterInput,
  StpInput
} from "./types";

export const ENTERPRISE_THEORY_VERSION = "1.0" as const;

export type EnterpriseModuleStatus =
  | "complete"
  | "incomplete"
  | "invalid"
  | "blocked"
  | "inconclusive";

export interface EvidenceRequirement {
  id: string;
  label: BilingualLabel;
  acceptanceCriteria: BilingualLabel;
}

export interface EnterpriseModuleBase {
  status: EnterpriseModuleStatus;
  statusLabel: BilingualLabel;
  requiredEvidence: EvidenceRequirement[];
  sourceHandles: string[];
  internalRuleDisclaimer: BilingualLabel;
}

export type FiveForceId = keyof FiveForcesInput;

export interface FiveForceResult {
  id: FiveForceId;
  label: BilingualLabel;
  intensity: number | null;
  internalAttractivenessScore: number | null;
}

export interface FiveForcesAssessment extends EnterpriseModuleBase {
  forces: FiveForceResult[];
  overallIntensity: number | null;
  internalIndustryAttractiveness: number | null;
  scale: BilingualLabel;
  formula: string;
}

export interface CpmFactorResult {
  id: string;
  label: BilingualLabel;
  weight: number;
  ratings: {
    company: number;
    competitorA: number;
    competitorB: number;
  };
  weightedScores: {
    company: number | null;
    competitorA: number | null;
    competitorB: number | null;
  };
  ratingGapToBestCompetitor: number | null;
  weightedGapToCompetitorA: number | null;
  weightedGapToCompetitorB: number | null;
  weightedGapToBestCompetitor: number | null;
}

export interface CpmAssessment extends EnterpriseModuleBase {
  weightTotal: number;
  weightValid: boolean;
  ratingScale: BilingualLabel;
  companies: Array<{
    id: "company" | "competitor_a" | "competitor_b";
    name: string;
    weightedTotal: number | null;
    relativeRank: number | null;
  }>;
  factors: CpmFactorResult[];
  relativeLeaderId: "company" | "competitor_a" | "competitor_b" | null;
  tiedForLead: boolean;
  formula: string;
}

export interface StpCriterionResult {
  id: string;
  label: BilingualLabel;
  rating: number;
  weightPct: number;
  weightedRatingContribution: number | null;
}

export interface StpScorecard {
  criteria: StpCriterionResult[];
  weightedRating: number | null;
  internalNormalizedScore: number | null;
  formula: string;
}

export interface StpAssessment extends EnterpriseModuleBase {
  segmentAttractiveness: StpScorecard;
  rightToWin: StpScorecard;
  targeting: {
    strategy: StpInput["targetingStrategy"];
    label: BilingualLabel;
  };
  positioningCompleteness: StpScorecard;
}

export type EntryModeCriterionId = keyof EntryModeFitInput["fit"];

export interface EntryModeCriterionDefinition {
  id: EntryModeCriterionId;
  label: BilingualLabel;
  weightPct: number;
}

export interface EntryModeOptionResult {
  id: string;
  label: BilingualLabel;
  internalWeightedScore: number | null;
  rank: number | null;
  criteria: Array<{
    id: EntryModeCriterionId;
    label: BilingualLabel;
    rating: number;
    weightPct: number;
    weightedContribution: number | null;
  }>;
}

export interface EntryModeAssessment extends EnterpriseModuleBase {
  criteria: EntryModeCriterionDefinition[];
  weightTotal: number;
  options: EntryModeOptionResult[];
  hardGateOutcome: BusinessScore["gateOutcome"];
  leadingModeId: string | null;
  scoreGap: number | null;
  tieRule: BilingualLabel;
  formula: string;
}

export interface FinancialMetric {
  id:
    | "net_margin"
    | "asset_turnover"
    | "return_on_assets"
    | "annual_gmroi";
  label: BilingualLabel;
  value: number | null;
  unit: "%" | "x";
  formula: string;
}

export interface FinanceProductivityAssessment extends EnterpriseModuleBase {
  annualizedRevenue: number;
  annualizedNetProfit: number;
  annualizedGrossMargin: number;
  metrics: FinancialMetric[];
}

export type ServiceDimensionId = keyof RaterInput;

export interface ServiceGapResult {
  id: ServiceDimensionId;
  label: BilingualLabel;
  expectation: number;
  perception: number;
  gap: number | null;
}

export interface OrganizationGapResult {
  id: "knowledge" | "standards" | "delivery" | "communication";
  label: BilingualLabel;
  intensity: number;
}

export interface ServiceGapsAssessment extends EnterpriseModuleBase {
  customerGaps: ServiceGapResult[];
  averageCustomerGap: number | null;
  negativeGapCount: number;
  organizationGaps: OrganizationGapResult[];
  averageOrganizationGapIntensity: number | null;
  formula: string;
  interpretation: BilingualLabel;
}

export interface OrganizationControlAssessment extends EnterpriseModuleBase {
  coverage: Array<{
    id: "policy" | "process" | "kpi";
    label: BilingualLabel;
    coveragePct: number;
  }>;
  averageCoveragePct: number | null;
  reviewCadenceDays: number;
  varianceTolerancePct: number;
  cadenceLabel: BilingualLabel;
  varianceLabel: BilingualLabel;
}

export interface RiskControlFlag {
  id: "kri" | "trigger" | "contingency_funded";
  label: BilingualLabel;
  defined: boolean;
}

export interface TopRiskAssessment extends EnterpriseModuleBase {
  name: BilingualLabel;
  likelihood: number;
  impact: number;
  inherentScore: number | null;
  controlEffectivenessPct: number;
  residualScore: number | null;
  controlFlags: RiskControlFlag[];
  controlReadinessPct: number;
  formulas: {
    inherent: string;
    residual: string;
  };
}

export interface EnterpriseTheoryAssessment {
  version: "1.0";
  generatedAt: string;
  businessName: string;
  fiveForces: FiveForcesAssessment;
  cpm: CpmAssessment;
  stp: StpAssessment;
  entryMode: EntryModeAssessment;
  financeProductivity: FinanceProductivityAssessment;
  serviceGaps: ServiceGapsAssessment;
  organizationControl: OrganizationControlAssessment;
  topRisk: TopRiskAssessment;
  audit: {
    deterministic: true;
    aiMayAlterAssessment: false;
    methodologyVersion: typeof ENTERPRISE_THEORY_VERSION;
    inputScoringVersion: BusinessScore["version"];
    internalRules: BilingualLabel[];
    limitations: BilingualLabel[];
    sourceHandles: string[];
  };
}

const STATUS_LABELS: Record<EnterpriseModuleStatus, BilingualLabel> = {
  complete: { zh: "计算完整", en: "Calculation complete" },
  incomplete: { zh: "数据不完整", en: "Incomplete data" },
  invalid: { zh: "输入无效", en: "Invalid input" },
  blocked: { zh: "硬门槛阻断", en: "Blocked by hard gate" },
  inconclusive: { zh: "无明确优胜方案", en: "No conclusive winner" }
};

const FIVE_FORCE_LABELS: Record<FiveForceId, BilingualLabel> = {
  rivalry: { zh: "现有竞争强度", en: "Competitive rivalry" },
  newEntrants: { zh: "新进入者威胁", en: "Threat of new entrants" },
  substitutes: { zh: "替代品威胁", en: "Threat of substitutes" },
  buyerPower: { zh: "买方议价能力", en: "Buyer power" },
  supplierPower: { zh: "供应商议价能力", en: "Supplier power" }
};

const SERVICE_LABELS: Record<ServiceDimensionId, BilingualLabel> = {
  reliability: { zh: "可靠性", en: "Reliability" },
  responsiveness: { zh: "响应性", en: "Responsiveness" },
  assurance: { zh: "保证性", en: "Assurance" },
  empathy: { zh: "同理心", en: "Empathy" },
  tangibles: { zh: "有形性", en: "Tangibles" }
};

const ORGANIZATION_GAP_LABELS: Record<
  OrganizationGapResult["id"],
  BilingualLabel
> = {
  knowledge: { zh: "知识差距", en: "Knowledge gap" },
  standards: { zh: "标准差距", en: "Standards gap" },
  delivery: { zh: "交付差距", en: "Delivery gap" },
  communication: { zh: "沟通差距", en: "Communication gap" }
};

export const ENTRY_MODE_CRITERIA: EntryModeCriterionDefinition[] = [
  {
    id: "control",
    label: { zh: "控制权", en: "Control" },
    weightPct: 12
  },
  {
    id: "capitalEfficiency",
    label: { zh: "资本效率", en: "Capital efficiency" },
    weightPct: 12
  },
  {
    id: "speed",
    label: { zh: "进入速度", en: "Speed" },
    weightPct: 11
  },
  {
    id: "adaptation",
    label: { zh: "本地适配", en: "Adaptation" },
    weightPct: 12
  },
  {
    id: "ipProtection",
    label: { zh: "知识产权保护", en: "IP protection" },
    weightPct: 11
  },
  {
    id: "localKnowledge",
    label: { zh: "本地知识", en: "Local knowledge" },
    weightPct: 11
  },
  {
    id: "partnerFeasibility",
    label: { zh: "伙伴可行性", en: "Partner feasibility" },
    weightPct: 11
  },
  {
    id: "supplyAccess",
    label: { zh: "供应与场地获取", en: "Supply and site access" },
    weightPct: 10
  },
  {
    id: "exitFlexibility",
    label: { zh: "退出灵活性", en: "Exit flexibility" },
    weightPct: 10
  }
];

const COMMON_INTERNAL_DISCLAIMER: BilingualLabel = {
  zh: "本模块只执行 RetailLens 1.0 内部诊断计算；它不是教材、行业或咨询公司的通用评分线，必须结合当前、可追溯证据由负责人复核。",
  en: "This module applies RetailLens 1.0 internal diagnostic calculations only. It is not a universal course, industry, or consulting-firm threshold and requires owner review against current traceable evidence."
};

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function isInRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max;
}

function isIntegerInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max;
}

function base(
  status: EnterpriseModuleStatus,
  requiredEvidence: EvidenceRequirement[],
  sourceHandles: string[],
  internalRuleDisclaimer = COMMON_INTERNAL_DISCLAIMER
): EnterpriseModuleBase {
  return {
    status,
    statusLabel: STATUS_LABELS[status],
    requiredEvidence,
    sourceHandles,
    internalRuleDisclaimer
  };
}

function requirement(
  id: string,
  zh: string,
  en: string,
  acceptanceZh: string,
  acceptanceEn: string
): EvidenceRequirement {
  return {
    id,
    label: { zh, en },
    acceptanceCriteria: { zh: acceptanceZh, en: acceptanceEn }
  };
}

function buildFiveForces(input: BusinessInput): FiveForcesAssessment {
  const entries = Object.entries(input.enterprise.fiveForces) as Array<
    [FiveForceId, number]
  >;
  const valid = entries.every(([, intensity]) =>
    isIntegerInRange(intensity, 1, 5)
  );
  const forces = entries.map(([id, intensity]) => ({
    id,
    label: FIVE_FORCE_LABELS[id],
    intensity: isIntegerInRange(intensity, 1, 5) ? round(intensity) : null,
    internalAttractivenessScore: isIntegerInRange(intensity, 1, 5)
      ? round((100 * (5 - intensity)) / 4, 1)
      : null
  }));
  const rawOverallIntensity = valid
    ? mean(entries.map(([, intensity]) => intensity))
    : null;
  const overallIntensity =
    rawOverallIntensity === null ? null : round(rawOverallIntensity);

  return {
    ...base(
      valid ? "complete" : "invalid",
      [
        requirement(
          "force-driver-evidence",
          "每项力量的 3–6 个当前驱动因素",
          "Three to six current drivers per force",
          "每个驱动因素包含来源、日期、国家/市场、方向与证据负责人。",
          "Each driver has a source, date, market, direction, and evidence owner."
        ),
        requirement(
          "industry-boundary",
          "明确行业边界与替代品定义",
          "Defined industry boundary and substitutes",
          "行业、地域、顾客及评估期限与管理层决策范围一致。",
          "Industry, geography, customer, and horizon match the management decision scope."
        )
      ],
      ["SM-EXT"],
      {
        zh: "五力强度采用 1–5 输入；行业吸引力 = 100 × (5 − 平均强度) ÷ 4。该换算是 RetailLens 内部可视化规则，不是课程或行业通用阈值。",
        en: "Force intensity uses submitted 1–5 ratings; industry attractiveness = 100 × (5 − average intensity) ÷ 4. This conversion is a RetailLens internal visual rule, not a universal course or industry threshold."
      }
    ),
    forces,
    overallIntensity,
    internalIndustryAttractiveness:
      rawOverallIntensity === null
        ? null
        : round((100 * (5 - rawOverallIntensity)) / 4, 1),
    scale: {
      zh: "1 = 力量较弱；5 = 力量较强。强度并不等于企业应对能力。",
      en: "1 = weaker force; 5 = stronger force. Intensity is separate from the firm's response capability."
    },
    formula: "Internal industry attractiveness = 100 × (5 − mean force intensity) ÷ 4"
  };
}

function validCpmRating(value: number): boolean {
  return isIntegerInRange(value, 1, 4);
}

function cpmWeighted(
  factor: CpmFactorInput,
  key: "companyRating" | "competitorARating" | "competitorBRating"
): number | null {
  return validCpmRating(factor[key]) && isInRange(factor.weight, 0, 1)
    ? round(factor.weight * factor[key], 3)
    : null;
}

function buildCpm(input: BusinessInput): CpmAssessment {
  const cpm = input.enterprise.cpm;
  const weightTotal = round(
    cpm.factors.reduce((sum, factor) => sum + factor.weight, 0),
    4
  );
  const hasFactors = cpm.factors.length >= 3;
  const weightValid =
    hasFactors &&
    cpm.factors.every((factor) => isInRange(factor.weight, 0, 1)) &&
    Math.abs(weightTotal - 1) <= 0.001;
  const ratingsValid = cpm.factors.every(
    (factor) =>
      validCpmRating(factor.companyRating) &&
      validCpmRating(factor.competitorARating) &&
      validCpmRating(factor.competitorBRating)
  );
  const namesValid =
    cpm.competitorAName.trim().length > 0 &&
    cpm.competitorBName.trim().length > 0;
  const valid = weightValid && ratingsValid && namesValid;
  const status: EnterpriseModuleStatus = !hasFactors
    ? "incomplete"
    : valid
      ? "complete"
      : "invalid";

  const factors: CpmFactorResult[] = cpm.factors.map((factor) => {
    const company = cpmWeighted(factor, "companyRating");
    const competitorA = cpmWeighted(factor, "competitorARating");
    const competitorB = cpmWeighted(factor, "competitorBRating");
    const weightedScores = { company, competitorA, competitorB };
    const weightedBest =
      competitorA === null || competitorB === null
        ? null
        : Math.max(competitorA, competitorB);

    return {
      id: factor.id,
      label: { zh: factor.labelZh, en: factor.labelEn },
      weight: factor.weight,
      ratings: {
        company: factor.companyRating,
        competitorA: factor.competitorARating,
        competitorB: factor.competitorBRating
      },
      weightedScores,
      ratingGapToBestCompetitor:
        validCpmRating(factor.companyRating) &&
        validCpmRating(factor.competitorARating) &&
        validCpmRating(factor.competitorBRating)
          ? round(
              factor.companyRating -
                Math.max(
                  factor.competitorARating,
                  factor.competitorBRating
                ),
              2
            )
          : null,
      weightedGapToCompetitorA:
        company === null || competitorA === null
          ? null
          : round(company - competitorA, 3),
      weightedGapToCompetitorB:
        company === null || competitorB === null
          ? null
          : round(company - competitorB, 3),
      weightedGapToBestCompetitor:
        company === null || weightedBest === null
          ? null
          : round(company - weightedBest, 3)
    };
  });

  const totalFor = (
    key: keyof CpmFactorResult["weightedScores"]
  ): number | null =>
    valid
      ? round(
          factors.reduce(
            (sum, factor) => sum + (factor.weightedScores[key] ?? 0),
            0
          ),
          3
        )
      : null;

  const totals = {
    company: totalFor("company"),
    competitor_a: totalFor("competitorA"),
    competitor_b: totalFor("competitorB")
  };
  const ranked =
    valid &&
    totals.company !== null &&
    totals.competitor_a !== null &&
    totals.competitor_b !== null
      ? (
          [
            { id: "company" as const, total: totals.company },
            { id: "competitor_a" as const, total: totals.competitor_a },
            { id: "competitor_b" as const, total: totals.competitor_b }
          ] as const
        )
          .slice()
          .sort((left, right) => right.total - left.total)
      : [];
  const leadingTotal = ranked[0]?.total ?? null;
  const tiedForLead =
    leadingTotal !== null &&
    ranked.filter((item) => Math.abs(item.total - leadingTotal) <= 0.0001)
      .length > 1;
  const rankFor = (
    id: "company" | "competitor_a" | "competitor_b"
  ): number | null => {
    if (!valid) return null;
    const item = ranked.find((candidate) => candidate.id === id);
    if (!item) return null;
    return (
      1 +
      ranked.filter((candidate) => candidate.total > item.total + 0.0001)
        .length
    );
  };

  return {
    ...base(
      status,
      [
        requirement(
          "competitor-evidence",
          "两家当前直接竞争者的同口径证据",
          "Like-for-like current evidence for two direct competitors",
          "竞争者、时间、地域、口径与关键成功因素一致。",
          "Competitor, time, geography, definitions, and critical success factors are comparable."
        ),
        requirement(
          "factor-rationale",
          "关键成功因素及权重依据",
          "Critical success factors and weight rationale",
          "权重总和为 1；每个因素记录选择依据与审批人。",
          "Weights total 1; each factor records its selection rationale and approver."
        )
      ],
      ["SM-EXT-P51-P53"],
      {
        zh: "CPM 权重必须合计 1，评分采用 1–4，仅用于本企业与两家已提交竞争者的相对比较；总分不是绝对 go/no-go 线。",
        en: "CPM weights must total 1 and ratings use 1–4. Results compare only the company with the two submitted competitors; the total is not an absolute go/no-go threshold."
      }
    ),
    weightTotal,
    weightValid,
    ratingScale: {
      zh: "1 = 重大弱点；2 = 次要弱点；3 = 次要优势；4 = 重大优势。",
      en: "1 = major weakness; 2 = minor weakness; 3 = minor strength; 4 = major strength."
    },
    companies: [
      {
        id: "company",
        name: input.identity.name,
        weightedTotal: totals.company,
        relativeRank: rankFor("company")
      },
      {
        id: "competitor_a",
        name: cpm.competitorAName,
        weightedTotal: totals.competitor_a,
        relativeRank: rankFor("competitor_a")
      },
      {
        id: "competitor_b",
        name: cpm.competitorBName,
        weightedTotal: totals.competitor_b,
        relativeRank: rankFor("competitor_b")
      }
    ],
    factors,
    relativeLeaderId:
      valid && !tiedForLead ? (ranked[0]?.id ?? null) : null,
    tiedForLead,
    formula: "Weighted score = factor weight × rating; total = Σ weighted scores"
  };
}

function stpScorecard(
  values: Array<{
    id: string;
    label: BilingualLabel;
    rating: number;
  }>
): StpScorecard {
  const weightPct = 100 / values.length;
  const valid = values.every(({ rating }) =>
    isIntegerInRange(rating, 1, 5)
  );
  const weightedRating = valid
    ? round(
        values.reduce(
          (sum, { rating }) => sum + rating * (weightPct / 100),
          0
        ),
        2
      )
    : null;

  return {
    criteria: values.map(({ id, label, rating }) => ({
      id,
      label,
      rating,
      weightPct: round(weightPct, 2),
      weightedRatingContribution: isIntegerInRange(rating, 1, 5)
        ? round(rating * (weightPct / 100), 3)
        : null
    })),
    weightedRating,
    internalNormalizedScore:
      weightedRating === null
        ? null
        : round((100 * (weightedRating - 1)) / 4, 1),
    formula:
      "Internal normalized score = 100 × (equal-weighted rating − 1) ÷ 4"
  };
}

function buildStp(input: BusinessInput): StpAssessment {
  const stp = input.enterprise.stp;
  const segmentAttractiveness = stpScorecard([
    {
      id: "size_growth",
      label: { zh: "规模与增长", en: "Size and growth" },
      rating: stp.segmentAttractiveness.sizeGrowth
    },
    {
      id: "profitability",
      label: { zh: "盈利潜力", en: "Profitability" },
      rating: stp.segmentAttractiveness.profitability
    },
    {
      id: "accessibility",
      label: { zh: "可触达性", en: "Accessibility" },
      rating: stp.segmentAttractiveness.accessibility
    },
    {
      id: "measurability",
      label: { zh: "可衡量性", en: "Measurability" },
      rating: stp.segmentAttractiveness.measurability
    },
    {
      id: "strategic_fit",
      label: { zh: "战略适配", en: "Strategic fit" },
      rating: stp.segmentAttractiveness.strategicFit
    }
  ]);
  const rightToWin = stpScorecard([
    {
      id: "differentiation",
      label: { zh: "差异化", en: "Differentiation" },
      rating: stp.rightToWin.differentiation
    },
    {
      id: "capability",
      label: { zh: "能力基础", en: "Capability" },
      rating: stp.rightToWin.capability
    },
    {
      id: "channel_access",
      label: { zh: "渠道可达性", en: "Channel access" },
      rating: stp.rightToWin.channelAccess
    },
    {
      id: "credibility",
      label: { zh: "可信理由", en: "Credibility" },
      rating: stp.rightToWin.credibility
    }
  ]);
  const positioningCompleteness = stpScorecard([
    {
      id: "customer_clarity",
      label: { zh: "目标顾客清晰度", en: "Customer clarity" },
      rating: stp.position.customerClarity
    },
    {
      id: "competitor_distinctiveness",
      label: { zh: "相对竞争者区隔", en: "Competitor distinctiveness" },
      rating: stp.position.competitorDistinctiveness
    },
    {
      id: "evidence_strength",
      label: { zh: "证据强度", en: "Evidence strength" },
      rating: stp.position.evidenceStrength
    },
    {
      id: "delivery_consistency",
      label: { zh: "交付一致性", en: "Delivery consistency" },
      rating: stp.position.deliveryConsistency
    }
  ]);
  const targetingLabels: Record<
    StpInput["targetingStrategy"],
    BilingualLabel
  > = {
    undifferentiated: { zh: "无差异目标策略", en: "Undifferentiated targeting" },
    differentiated: { zh: "差异化目标策略", en: "Differentiated targeting" },
    concentrated: { zh: "集中目标策略", en: "Concentrated targeting" }
  };
  const targetingValid = Object.prototype.hasOwnProperty.call(
    targetingLabels,
    stp.targetingStrategy
  );
  const allValid = [
    segmentAttractiveness.weightedRating,
    rightToWin.weightedRating,
    positioningCompleteness.weightedRating
  ].every((value) => value !== null);

  return {
    ...base(
      allValid && targetingValid ? "complete" : "invalid",
      [
        requirement(
          "segment-economics",
          "分客群规模、增长、毛利与付费证据",
          "Segment-level size, growth, margin, and willingness-to-pay evidence",
          "数据具有当前日期、市场边界、单位、样本及来源。",
          "Data includes current date, market boundary, units, sample, and source."
        ),
        requirement(
          "position-proof",
          "相对竞争者的定位与购买理由证据",
          "Positioning and reason-to-buy evidence versus competitors",
          "定位包含目标、参照系、差异点和 reason to believe，并经客户验证。",
          "Positioning states target, frame of reference, point of difference, and reason to believe, with customer validation."
        )
      ],
      ["GM10-C07-S3-S30"],
      {
        zh: "STP 各子项采用等权 1–5 评分并换算为 0–100 内部诊断分；系统不把换算分当作课程或行业通用吸引力门槛。",
        en: "STP subcriteria use equal-weight 1–5 ratings converted to a 0–100 internal diagnostic score. The converted score is not a universal course or industry attractiveness threshold."
      }
    ),
    segmentAttractiveness,
    rightToWin,
    targeting: {
      strategy: stp.targetingStrategy,
      label:
        targetingLabels[stp.targetingStrategy] ?? {
          zh: "无效目标策略",
          en: "Invalid targeting strategy"
        }
    },
    positioningCompleteness
  };
}

function buildEntryMode(input: BusinessInput, score: BusinessScore): EntryModeAssessment {
  const uniqueOptionIds =
    new Set(input.enterprise.entryModes.map(({ id }) => id)).size ===
    input.enterprise.entryModes.length;
  const optionsValid =
    input.enterprise.entryModes.length === 2 &&
    uniqueOptionIds &&
    input.enterprise.entryModes.every(
      (option) =>
        option.id.trim().length > 0 &&
        option.label.zh.trim().length > 0 &&
        option.label.en.trim().length > 0 &&
        ENTRY_MODE_CRITERIA.every((criterion) =>
          isIntegerInRange(option.fit[criterion.id], 1, 5)
        )
    );
  const weightTotal = ENTRY_MODE_CRITERIA.reduce(
    (sum, criterion) => sum + criterion.weightPct,
    0
  );
  const options: EntryModeOptionResult[] = input.enterprise.entryModes.map(
    (option) => {
      const valid = ENTRY_MODE_CRITERIA.every((criterion) =>
        isIntegerInRange(option.fit[criterion.id], 1, 5)
      );
      const criteria = ENTRY_MODE_CRITERIA.map((criterion) => {
        const rating = option.fit[criterion.id];
        return {
          id: criterion.id,
          label: criterion.label,
          rating,
          weightPct: criterion.weightPct,
          weightedContribution: isIntegerInRange(rating, 1, 5)
            ? round((criterion.weightPct * rating) / 5, 2)
            : null
        };
      });
      return {
        id: option.id,
        label: option.label,
        internalWeightedScore: valid
          ? round(
              criteria.reduce(
                (sum, criterion) =>
                  sum + (criterion.weightedContribution ?? 0),
                0
              ),
              2
            )
          : null,
        rank: null,
        criteria
      };
    }
  );
  const ranked = optionsValid
    ? options
        .slice()
        .sort(
          (left, right) =>
            (right.internalWeightedScore ?? 0) -
            (left.internalWeightedScore ?? 0)
        )
    : [];
  if (optionsValid) {
    for (const option of options) {
      const optionScore = option.internalWeightedScore ?? 0;
      option.rank =
        1 +
        ranked.filter(
          (candidate) =>
            (candidate.internalWeightedScore ?? 0) > optionScore + 0.0001
        ).length;
    }
  }
  const scoreGap =
    optionsValid &&
    ranked[0]?.internalWeightedScore !== null &&
    ranked[0]?.internalWeightedScore !== undefined &&
    ranked[1]?.internalWeightedScore !== null &&
    ranked[1]?.internalWeightedScore !== undefined
      ? round(
          ranked[0].internalWeightedScore - ranked[1].internalWeightedScore,
          2
        )
      : null;
  const blocked = score.gateOutcome === "blocked";
  const status: EnterpriseModuleStatus = blocked
    ? "blocked"
    : !optionsValid
      ? "invalid"
      : scoreGap !== null && scoreGap < 5
        ? "inconclusive"
        : "complete";

  return {
    ...base(
      status,
      [
        requirement(
          "legal-gates",
          "所有权、许可、资金汇回、制裁与产品硬门槛",
          "Ownership, licensing, repatriation, sanctions, and product hard gates",
          "每项门槛由当前权威来源、法域、日期和负责人确认；任何 fail 阻断推荐。",
          "Each gate is confirmed by a current authoritative source, jurisdiction, date, and owner; any fail blocks a recommendation."
        ),
        requirement(
          "partner-diligence",
          "伙伴、资产、供应及退出条件尽调",
          "Partner, asset, supply, and exit-condition diligence",
          "两方案使用同口径商业条款、成本、周期、风险与可执行性证据。",
          "Both options use like-for-like evidence on terms, cost, timing, risk, and executability."
        )
      ],
      [
        "GM10-C09-S4-S24",
        "GM10-C12-S27",
        "IM12Q-C09-C10"
      ],
      {
        zh: "九项 RetailLens 内部 MCDA 权重固定合计 100；总分 = Σ(权重 × 1–5 适配评分 ÷ 5)。硬门槛 fail 时阻断；前两名差距小于 5 分时标为无明确优胜者。5 分不是课程或行业通用阈值。",
        en: "Nine RetailLens internal MCDA weights total 100; total = Σ(weight × 1–5 fit rating ÷ 5). A failed hard gate blocks the recommendation; a gap below 5 points is inconclusive. Five points is not a universal course or industry threshold."
      }
    ),
    criteria: ENTRY_MODE_CRITERIA,
    weightTotal,
    options,
    hardGateOutcome: score.gateOutcome,
    leadingModeId:
      status === "complete" ? (ranked[0]?.id ?? null) : null,
    scoreGap,
    tieRule: {
      zh: "前两名差距 < 5：无明确优胜者，需补证据或设计可逆试点。",
      en: "Top-two gap < 5: no conclusive winner; add evidence or run a reversible pilot."
    },
    formula: "Internal MCDA total = Σ(weight % × fit rating ÷ 5)"
  };
}

function buildFinanceProductivity(
  input: BusinessInput
): FinanceProductivityAssessment {
  const finance = input.enterprise.financeProductivity;
  const values = [
    input.financial.monthlyRevenue,
    input.financial.monthlyCogs,
    finance.monthlyNetProfit,
    finance.totalAssets,
    finance.averageInventory
  ];
  const valid =
    Number.isFinite(input.financial.monthlyRevenue) &&
    input.financial.monthlyRevenue >= 0 &&
    Number.isFinite(input.financial.monthlyCogs) &&
    input.financial.monthlyCogs >= 0 &&
    Number.isFinite(finance.monthlyNetProfit) &&
    Number.isFinite(finance.totalAssets) &&
    finance.totalAssets >= 0 &&
    Number.isFinite(finance.averageInventory) &&
    finance.averageInventory >= 0;
  const annualizedRevenue = round(input.financial.monthlyRevenue * 12, 2);
  const annualizedNetProfit = round(finance.monthlyNetProfit * 12, 2);
  const annualizedGrossMargin = round(
    (input.financial.monthlyRevenue - input.financial.monthlyCogs) * 12,
    2
  );
  const hasDenominators =
    input.financial.monthlyRevenue > 0 &&
    finance.totalAssets > 0 &&
    finance.averageInventory > 0;
  const netMargin =
    valid && input.financial.monthlyRevenue > 0
      ? round(
          (finance.monthlyNetProfit / input.financial.monthlyRevenue) * 100,
          2
        )
      : null;
  const assetTurnover =
    valid && finance.totalAssets > 0
      ? round(annualizedRevenue / finance.totalAssets, 3)
      : null;
  const roa =
    netMargin !== null && assetTurnover !== null
      ? round((netMargin / 100) * assetTurnover * 100, 2)
      : null;
  const annualGmroi =
    valid && finance.averageInventory > 0
      ? round(annualizedGrossMargin / finance.averageInventory, 3)
      : null;

  return {
    ...base(
      !valid ? "invalid" : hasDenominators ? "complete" : "incomplete",
      [
        requirement(
          "financial-statements",
          "同一期间的损益表与资产负债表",
          "Income statement and balance sheet for the same period",
          "经负责人复核，货币、期间、税费和一次性项目口径一致。",
          "Owner-reviewed with consistent currency, period, tax, and one-off treatment."
        ),
        requirement(
          "inventory-method",
          "平均库存计算底稿",
          "Average-inventory calculation workpaper",
          "记录期初/期末或日均/月均口径，并与毛利期间一致。",
          "Documents opening/closing or daily/monthly average method aligned with the gross-margin period."
        ),
        requirement(
          "asset-register",
          "总资产与租赁资产口径说明",
          "Total-asset and leased-asset definition",
          "资产范围与收入、利润口径一致并可追溯至台账。",
          "Asset scope aligns with revenue and profit and traces to the asset register."
        )
      ],
      ["RM11-C07-S4-S36", "RM11-C12-S58"],
      {
        zh: "净利率、资产周转率、ROA 与年度 GMROI 只按提交数据计算。课程材料没有给出跨业态通用通过线；必须与企业历史、预算及当前可比同业同口径比较。",
        en: "Net margin, asset turnover, ROA, and annual GMROI are calculated only from submitted data. The course material does not provide a universal cross-format pass line; compare like-for-like against company history, budget, and current peers."
      }
    ),
    annualizedRevenue,
    annualizedNetProfit,
    annualizedGrossMargin,
    metrics: [
      {
        id: "net_margin",
        label: { zh: "净利率", en: "Net profit margin" },
        value: netMargin,
        unit: "%",
        formula: "Monthly net profit ÷ monthly net sales × 100"
      },
      {
        id: "asset_turnover",
        label: { zh: "资产周转率", en: "Asset turnover" },
        value: assetTurnover,
        unit: "x",
        formula: "Annualized net sales ÷ total assets"
      },
      {
        id: "return_on_assets",
        label: { zh: "资产回报率", en: "Return on assets" },
        value: roa,
        unit: "%",
        formula: "Net profit margin × asset turnover"
      },
      {
        id: "annual_gmroi",
        label: { zh: "年度 GMROI", en: "Annual GMROI" },
        value: annualGmroi,
        unit: "x",
        formula: "Annualized gross margin ÷ average inventory"
      }
    ]
  };
}

function buildServiceGaps(input: BusinessInput): ServiceGapsAssessment {
  const service = input.enterprise.serviceGaps;
  const dimensions = Object.keys(SERVICE_LABELS) as ServiceDimensionId[];
  const customerValues = dimensions.flatMap((id) => [
    service.expectations[id],
    service.perceptions[id]
  ]);
  const organizationEntries = Object.entries(
    service.organizationGaps
  ) as Array<[OrganizationGapResult["id"], number]>;
  const valid =
    customerValues.every((value) => isIntegerInRange(value, 1, 7)) &&
    organizationEntries.every(([, value]) =>
      isIntegerInRange(value, 1, 5)
    );
  const customerGaps = dimensions.map((id) => {
    const expectation = service.expectations[id];
    const perception = service.perceptions[id];
    return {
      id,
      label: SERVICE_LABELS[id],
      expectation,
      perception,
      gap:
        isIntegerInRange(expectation, 1, 7) &&
        isIntegerInRange(perception, 1, 7)
          ? round(perception - expectation, 2)
          : null
    };
  });
  const availableGaps = customerGaps
    .map(({ gap }) => gap)
    .filter((gap): gap is number => gap !== null);
  const organizationGaps = organizationEntries.map(([id, intensity]) => ({
    id,
    label: ORGANIZATION_GAP_LABELS[id],
    intensity
  }));

  return {
    ...base(
      valid ? "complete" : "invalid",
      [
        requirement(
          "paired-sample",
          "按渠道与触点匹配的顾客期望和感知样本",
          "Matched expectation and perception sample by channel and touchpoint",
          "记录问卷版本、样本、日期、渠道、触点和原始分布，而不只记录均值。",
          "Records instrument version, sample, date, channel, touchpoint, and raw distributions rather than means alone."
        ),
        requirement(
          "operating-gap-evidence",
          "研究、标准、培训交付与外部承诺证据",
          "Research, standards, delivery capability, and external-promise evidence",
          "四个组织差距分别链接政策、SOP、培训/排班、质检和沟通材料。",
          "Each organizational gap links to policy, SOP, training/staffing, quality checks, and communication artifacts."
        )
      ],
      ["RM11-C18-S8-S33"],
      {
        zh: "顾客差距按 P − E 计算，负值表示感知低于期望；1–7 和组织差距 1–5 均为提交量表。系统不设置教材通用通过线。",
        en: "Customer gap is P − E; a negative value means perception is below expectation. The submitted scales are 1–7 for customers and 1–5 for organizational gaps. No universal course pass line is applied."
      }
    ),
    customerGaps,
    averageCustomerGap:
      valid && availableGaps.length === dimensions.length
        ? round(mean(availableGaps), 2)
        : null,
    negativeGapCount: availableGaps.filter((gap) => gap < 0).length,
    organizationGaps,
    averageOrganizationGapIntensity: valid
      ? round(mean(organizationGaps.map(({ intensity }) => intensity)), 2)
      : null,
    formula: "Customer service gap = perception (P) − expectation (E)",
    interpretation: {
      zh: "优先调查绝对负差距较大的触点，并用知识、标准、交付与沟通差距解释原因；数值本身不能证明因果。",
      en: "Investigate touchpoints with the largest negative gaps and use the knowledge, standards, delivery, and communication gaps to test causes; the scores alone do not establish causality."
    }
  };
}

function buildOrganizationControl(
  input: BusinessInput
): OrganizationControlAssessment {
  const control = input.enterprise.organizationControl;
  const coverage = [
    {
      id: "policy" as const,
      label: { zh: "政策覆盖", en: "Policy coverage" },
      coveragePct: control.policyCoveragePct
    },
    {
      id: "process" as const,
      label: { zh: "流程覆盖", en: "Process coverage" },
      coveragePct: control.processCoveragePct
    },
    {
      id: "kpi" as const,
      label: { zh: "KPI 覆盖", en: "KPI coverage" },
      coveragePct: control.kpiCoveragePct
    }
  ];
  const valid =
    coverage.every(({ coveragePct }) => isInRange(coveragePct, 0, 100)) &&
    Number.isInteger(control.reviewCadenceDays) &&
    control.reviewCadenceDays >= 1 &&
    control.reviewCadenceDays <= 3_650 &&
    isInRange(control.varianceTolerancePct, 0, 100);

  return {
    ...base(
      valid ? "complete" : "invalid",
      [
        requirement(
          "decision-rights",
          "按关键决策事项建立 RACI / 决策权矩阵",
          "RACI / decision-rights matrix by critical decision",
          "至少覆盖财务、定价、商品、营销、人力、供应商、数据和资本开支。",
          "Covers at least finance, pricing, assortment, marketing, HR, supplier, data, and capex."
        ),
        requirement(
          "control-register",
          "控制与例外升级登记册",
          "Control and exception-escalation register",
          "每项控制有负责人、leading/lagging KPI、频率、容忍区间、升级路径和纠正动作。",
          "Each control has an owner, leading/lagging KPI, cadence, tolerance, escalation route, and corrective action."
        )
      ],
      ["GM10-C17-S7-S15", "IM11-C11-S2-S23"],
      {
        zh: "平均覆盖率仅为三个已提交覆盖百分比的算术平均；复核频率和偏差容忍度按原值呈现。系统不发明适用于所有组织的覆盖率、频率或容忍度通过线。",
        en: "Average coverage is the arithmetic mean of the three submitted percentages; review cadence and variance tolerance are shown as submitted. The system does not invent universal coverage, cadence, or tolerance pass lines."
      }
    ),
    coverage,
    averageCoveragePct: valid
      ? round(mean(coverage.map(({ coveragePct }) => coveragePct)), 1)
      : null,
    reviewCadenceDays: control.reviewCadenceDays,
    varianceTolerancePct: control.varianceTolerancePct,
    cadenceLabel: {
      zh: `每 ${control.reviewCadenceDays} 天复核一次`,
      en: `Review every ${control.reviewCadenceDays} days`
    },
    varianceLabel: {
      zh: `提交的偏差容忍度：${control.varianceTolerancePct}%`,
      en: `Submitted variance tolerance: ${control.varianceTolerancePct}%`
    }
  };
}

function buildTopRisk(input: BusinessInput): TopRiskAssessment {
  const risk = input.enterprise.topRisk;
  const valid =
    isIntegerInRange(risk.likelihood, 1, 5) &&
    isIntegerInRange(risk.impact, 1, 5) &&
    isInRange(risk.controlEffectivenessPct, 0, 100);
  const inherentScore = valid
    ? round(risk.likelihood * risk.impact, 2)
    : null;
  const residualScore =
    inherentScore === null
      ? null
      : round(
          inherentScore * (1 - risk.controlEffectivenessPct / 100),
          2
        );
  const controlFlags: RiskControlFlag[] = [
    {
      id: "kri",
      label: { zh: "已定义 KRI", en: "KRI defined" },
      defined: risk.kriDefined
    },
    {
      id: "trigger",
      label: { zh: "已定义触发器", en: "Trigger defined" },
      defined: risk.triggerDefined
    },
    {
      id: "contingency_funded",
      label: { zh: "应急行动已获资金", en: "Contingency funded" },
      defined: risk.contingencyFunded
    }
  ];

  return {
    ...base(
      valid ? "complete" : "invalid",
      [
        requirement(
          "risk-statement",
          "cause–event–impact 风险陈述与负责人",
          "Cause–event–impact risk statement and owner",
          "风险名称链接原因、事件、财务/运营影响、时间范围和责任人。",
          "The risk links cause, event, financial/operating impact, horizon, and owner."
        ),
        requirement(
          "control-test",
          "控制有效性测试与残余风险依据",
          "Control-effectiveness test and residual-risk basis",
          "有效性百分比来自设计和运行测试，而非未经验证的自评。",
          "The effectiveness percentage comes from design and operating tests, not unvalidated self-assessment."
        ),
        requirement(
          "contingency-plan",
          "KRI、触发器、应急动作、预算与时限",
          "KRI, trigger, contingency action, budget, and deadline",
          "触发器可量化，应急动作有负责人、资金和完成期限。",
          "The trigger is measurable and the contingency action has an owner, funding, and deadline."
        )
      ],
      ["SM-MON-P5-P6", "IM11-C11-S8-S20"],
      {
        zh: "固有风险 = 可能性 × 影响；残余风险 = 固有风险 × (1 − 控制有效性%)。1–25 或残余分数不映射为通用颜色/通过线，除非组织另行批准并版本化。",
        en: "Inherent risk = likelihood × impact; residual risk = inherent risk × (1 − control effectiveness %). Neither the 1–25 nor residual score maps to a universal colour or pass line unless separately approved and versioned by the organization."
      }
    ),
    name: risk.name,
    likelihood: risk.likelihood,
    impact: risk.impact,
    inherentScore,
    controlEffectivenessPct: risk.controlEffectivenessPct,
    residualScore,
    controlFlags,
    controlReadinessPct: round(
      (controlFlags.filter(({ defined }) => defined).length /
        controlFlags.length) *
        100,
      1
    ),
    formulas: {
      inherent: "Likelihood × impact",
      residual: "Inherent risk × (1 − control effectiveness %)"
    }
  };
}

export function buildEnterpriseTheoryAssessment(
  input: BusinessInput,
  score: BusinessScore
): EnterpriseTheoryAssessment {
  const fiveForces = buildFiveForces(input);
  const cpm = buildCpm(input);
  const stp = buildStp(input);
  const entryMode = buildEntryMode(input, score);
  const financeProductivity = buildFinanceProductivity(input);
  const serviceGaps = buildServiceGaps(input);
  const organizationControl = buildOrganizationControl(input);
  const topRisk = buildTopRisk(input);
  const modules: EnterpriseModuleBase[] = [
    fiveForces,
    cpm,
    stp,
    entryMode,
    financeProductivity,
    serviceGaps,
    organizationControl,
    topRisk
  ];

  return {
    version: ENTERPRISE_THEORY_VERSION,
    generatedAt: score.generatedAt,
    businessName: input.identity.name,
    fiveForces,
    cpm,
    stp,
    entryMode,
    financeProductivity,
    serviceGaps,
    organizationControl,
    topRisk,
    audit: {
      deterministic: true,
      aiMayAlterAssessment: false,
      methodologyVersion: ENTERPRISE_THEORY_VERSION,
      inputScoringVersion: score.version,
      internalRules: [
        {
          zh: "所有计算只使用结构化输入和显式公式；自由文本长度与 AI 输出不会改变结果。",
          en: "All calculations use structured inputs and explicit formulas only; narrative length and AI output cannot change results."
        },
        {
          zh: "硬门槛 fail 会阻断进入模式推荐，不能被其他模块的高分抵消。",
          en: "A failed hard gate blocks the entry-mode recommendation and cannot be offset by high scores elsewhere."
        },
        {
          zh: "所有换算、权重与 5 分近似平局规则均为 RetailLens 1.0 内部、可版本化控制。",
          en: "All conversions, weights, and the five-point near-tie rule are versioned RetailLens 1.0 internal controls."
        }
      ],
      limitations: [
        {
          zh: "本引擎没有独立证据对象或实时外部数据，因此“计算完整”不等于“证据已验证”。",
          en: "This engine has no independent evidence objects or live external data, so calculation completeness does not mean evidence validation."
        },
        {
          zh: "课程中的历史公司、国家、市场与财务示例不得作为当前 benchmark。",
          en: "Historical company, country, market, and financial examples in the course materials must not be used as current benchmarks."
        },
        {
          zh: "行业、国家和企业结论须由具日期、法域、单位和负责人信息的当前来源复核。",
          en: "Industry, country, and company conclusions require current sources with date, jurisdiction, units, and owner."
        }
      ],
      sourceHandles: Array.from(
        new Set(modules.flatMap((module) => module.sourceHandles))
      )
    }
  };
}

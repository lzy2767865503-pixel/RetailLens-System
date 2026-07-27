import type {
  ActionResult,
  BilingualLabel,
  BusinessInput,
  BusinessScore,
  DimensionId,
  DimensionResult,
  MetricResult
} from "./types";

export const CONSULTING_METHODOLOGY_VERSION = "1.0" as const;

export type ExecutiveRecommendation =
  | "proceed"
  | "conditional"
  | "pause"
  | "stop";

export type ReadinessLevel = "ready" | "conditional" | "not_ready";
export type EvidenceLevel = "high" | "medium" | "low";
export type HypothesisStatus =
  | "supported"
  | "partially_supported"
  | "not_supported"
  | "insufficient_evidence"
  | "not_applicable";
export type AssumptionStatus =
  | "supported"
  | "partially_supported"
  | "unverified"
  | "contradicted";
export type Priority = "P0" | "P1" | "P2";
export type RiskLevel = "critical" | "high" | "medium";

export interface DecisionCondition {
  id: string;
  priority: Priority;
  label: BilingualLabel;
  test: BilingualLabel;
  sourceHandles: string[];
}

export interface ExecutiveDecision {
  recommendation: ExecutiveRecommendation;
  label: BilingualLabel;
  headline: BilingualLabel;
  rationale: BilingualLabel;
  rule: BilingualLabel;
  conditions: DecisionCondition[];
}

export interface ReadinessComponent {
  id:
    | "commercial_case"
    | "evidence_confidence"
    | "input_completeness"
    | "hard_gates";
  label: BilingualLabel;
  score: number;
  weight: number;
  weightedContribution: number;
  evidence: BilingualLabel;
}

export interface DecisionReadiness {
  score: number;
  level: ReadinessLevel;
  label: BilingualLabel;
  components: ReadinessComponent[];
  calculation: string;
}

export interface EvidenceComponent {
  id:
    | "declared_confidence"
    | "source_traceability"
    | "evidence_date"
    | "compliance_traceability";
  label: BilingualLabel;
  score: number;
  weight: number;
  weightedContribution: number;
  rule: BilingualLabel;
}

export interface EvidenceAssessment {
  qualityScore: number;
  confidenceScore: number;
  level: EvidenceLevel;
  label: BilingualLabel;
  evidenceCount: number;
  components: EvidenceComponent[];
  limitations: BilingualLabel[];
  rule: BilingualLabel;
}

export interface ConsultingHypothesis {
  id: string;
  dimensionId: DimensionId;
  statement: BilingualLabel;
  status: HypothesisStatus;
  statusLabel: BilingualLabel;
  score: number;
  test: BilingualLabel;
  evidenceHandles: string[];
}

export interface IssueTreeBranch {
  id:
    | "commercial_thesis"
    | "route_to_customer"
    | "operating_model"
    | "economics"
    | "feasibility_execution";
  question: BilingualLabel;
  score: number;
  status: HypothesisStatus;
  statusLabel: BilingualLabel;
  hypotheses: ConsultingHypothesis[];
}

export interface KeyAssumption {
  id: string;
  criticality: Priority;
  statement: BilingualLabel;
  submittedBasis: BilingualLabel;
  status: AssumptionStatus;
  statusLabel: BilingualLabel;
  validationTest: BilingualLabel;
  owner: BilingualLabel;
  trigger: BilingualLabel;
  sourceHandles: string[];
}

export interface ConsultingScenario {
  id: "downside" | "base" | "upside";
  label: BilingualLabel;
  available: boolean;
  monthlyRevenue: number | null;
  monthlyOperatingContribution: number | null;
  breakEvenCoverage: number | null;
  basis: BilingualLabel;
  trigger: BilingualLabel;
  managementAction: BilingualLabel;
  sourceHandles: string[];
}

export interface KpiLinkedMetric {
  id: string;
  label: BilingualLabel;
  currentValue: number | null;
  formattedValue: string;
  unit: string;
  formula: string;
  status: MetricResult["status"];
}

export interface OutcomeKpi {
  id:
    | "monthly_operating_contribution"
    | "downside_break_even_coverage"
    | "supplier_service_level";
  label: BilingualLabel;
  definition: BilingualLabel;
  formula: string;
  currentValue: number | null;
  formattedValue: string;
  unit: string;
  target: BilingualLabel;
  targetBasis:
    | "mathematical_break_even"
    | "submitted_plan"
    | "management_target_required";
  cadence: BilingualLabel;
  owner: BilingualLabel;
  drivers: KpiLinkedMetric[];
  guardrails: KpiLinkedMetric[];
  sourceHandles: string[];
}

export interface WorkstreamPriority {
  rank: number;
  priority: Priority;
  riskLevel: RiskLevel;
  workstream: BilingualLabel;
  risk: BilingualLabel;
  whyNow: BilingualLabel;
  nextStep: BilingualLabel;
  owner: BilingualLabel;
  horizon: BilingualLabel;
  exitCriteria: BilingualLabel;
  linkedDimension: DimensionId;
  sourceHandles: string[];
}

export interface CourseSource {
  handle: string;
  appliedTo: DimensionId[];
  note: BilingualLabel;
}

export interface ConsultingAssessment {
  version: "1.0";
  generatedAt: string;
  businessName: string;
  executiveDecision: ExecutiveDecision;
  decisionReadiness: DecisionReadiness;
  evidence: EvidenceAssessment;
  issueTree: IssueTreeBranch[];
  assumptions: KeyAssumption[];
  scenarios: ConsultingScenario[];
  kpis: OutcomeKpi[];
  priorities: WorkstreamPriority[];
  courseSources: CourseSource[];
  audit: {
    deterministic: true;
    aiMayAlterAssessment: false;
    methodologyVersion: typeof CONSULTING_METHODOLOGY_VERSION;
    inputScoringVersion: BusinessScore["version"];
    formulas: BilingualLabel[];
    limitations: BilingualLabel[];
  };
}

const DIMENSION_LABELS: Record<DimensionId, BilingualLabel> = {
  market_customer: { zh: "市场与顾客", en: "Market & customer" },
  strategy_differentiation: {
    zh: "战略与差异化",
    en: "Strategy & differentiation"
  },
  country_compliance: { zh: "国家与合规", en: "Country & compliance" },
  channels_digital: { zh: "渠道与数字化", en: "Channels & digital" },
  location_trade_area: { zh: "地点与商圈", en: "Location & trade area" },
  merchandise_supply_chain: {
    zh: "商品与供应链",
    en: "Merchandise & supply chain"
  },
  financial_unit_economics: {
    zh: "财务与单位经济",
    en: "Financial & unit economics"
  },
  marketing_crm_service: {
    zh: "营销、CRM 与服务",
    en: "Marketing, CRM & service"
  },
  organization_execution: {
    zh: "组织与执行",
    en: "Organization & execution"
  },
  risk_sustainability: {
    zh: "风险与可持续性",
    en: "Risk & sustainability"
  }
};

const HYPOTHESIS_CONFIG: Record<
  DimensionId,
  { statement: BilingualLabel; test: BilingualLabel }
> = {
  market_customer: {
    statement: {
      zh: "目标顾客存在足够明确、可验证的需求。",
      en: "The target customer has a sufficiently clear and testable need."
    },
    test: {
      zh: "用有日期的需求证据、付费行为与替代方案比较验证。",
      en: "Validate with dated demand evidence, paying behaviour, and alternatives."
    }
  },
  strategy_differentiation: {
    statement: {
      zh: "价值主张与差异化足以支持所选增长路径。",
      en: "The proposition and differentiation support the chosen growth path."
    },
    test: {
      zh: "验证顾客选择理由、可复制性与竞争回应。",
      en: "Test customer choice reasons, replicability, and competitive response."
    }
  },
  country_compliance: {
    statement: {
      zh: "目标国家进入条件与经营硬门槛可以关闭。",
      en: "Target-country entry and operating hard gates can be closed."
    },
    test: {
      zh: "逐项取得当前权威来源、日期、负责人和批准记录。",
      en: "Obtain a current authoritative source, date, owner, and approval record for each gate."
    }
  },
  channels_digital: {
    statement: {
      zh: "渠道角色、获客与履约路径能够形成闭环。",
      en: "Channel roles, acquisition, and fulfilment form a coherent system."
    },
    test: {
      zh: "按渠道验证流量、转化、履约成本与服务结果。",
      en: "Validate traffic, conversion, fulfilment cost, and service outcome by channel."
    }
  },
  location_trade_area: {
    statement: {
      zh: "地点与商圈能够支持门店销量和占用成本。",
      en: "The site and trade area can support store sales and occupancy cost."
    },
    test: {
      zh: "用分时客流、转化、客单价和租售敏感性验证。",
      en: "Test with daypart footfall, conversion, basket value, and rent-to-sales sensitivity."
    }
  },
  merchandise_supply_chain: {
    statement: {
      zh: "商品组合与供应网络能够稳定满足需求。",
      en: "The assortment and supply network can meet demand reliably."
    },
    test: {
      zh: "验证服务水平、缺货、交期、质量与集中度。",
      en: "Validate service level, stockouts, lead time, quality, and concentration."
    }
  },
  financial_unit_economics: {
    statement: {
      zh: "单位经济、固定成本与资金能够支持可持续经营。",
      en: "Unit economics, fixed costs, and funding support sustainable operation."
    },
    test: {
      zh: "复核收入、贡献毛利、盈亏平衡、现金跑道与压力情景。",
      en: "Reconcile revenue, contribution margin, break-even, runway, and stress cases."
    }
  },
  marketing_crm_service: {
    statement: {
      zh: "定位、获客、留存与服务承诺能够形成可衡量的顾客循环。",
      en: "Positioning, acquisition, retention, and service create a measurable customer loop."
    },
    test: {
      zh: "建立漏斗、分群、复购、投诉与服务恢复的同口径数据。",
      en: "Instrument a consistent funnel, cohorts, repeat behaviour, complaints, and recovery."
    }
  },
  organization_execution: {
    statement: {
      zh: "团队能力、决策权与里程碑足以交付方案。",
      en: "Capabilities, decision rights, and milestones are sufficient to deliver the plan."
    },
    test: {
      zh: "明确缺口、RACI、阶段关口、负责人和升级机制。",
      en: "Confirm gaps, RACI, stage gates, owners, and escalation paths."
    }
  },
  risk_sustainability: {
    statement: {
      zh: "关键风险已有可执行缓释和停止条件。",
      en: "Material risks have executable mitigations and stop conditions."
    },
    test: {
      zh: "量化触发器、风险责任人、缓释时限与剩余风险。",
      en: "Quantify triggers, risk owners, mitigation deadlines, and residual risk."
    }
  }
};

const ISSUE_BRANCHES: Array<{
  id: IssueTreeBranch["id"];
  question: BilingualLabel;
  dimensions: DimensionId[];
}> = [
  {
    id: "commercial_thesis",
    question: {
      zh: "商业命题：顾客需求与差异化是否足以创造可持续需求？",
      en: "Commercial thesis: Are customer need and differentiation sufficient to create durable demand?"
    },
    dimensions: ["market_customer", "strategy_differentiation"]
  },
  {
    id: "route_to_customer",
    question: {
      zh: "触达顾客：渠道、地点与顾客生命周期是否形成有效闭环？",
      en: "Route to customer: Do channels, location, and the customer lifecycle form an effective loop?"
    },
    dimensions: [
      "channels_digital",
      "location_trade_area",
      "marketing_crm_service"
    ]
  },
  {
    id: "operating_model",
    question: {
      zh: "运营模式：商品与供应链能否可靠交付承诺？",
      en: "Operating model: Can merchandise and supply reliably deliver the promise?"
    },
    dimensions: ["merchandise_supply_chain"]
  },
  {
    id: "economics",
    question: {
      zh: "经济性：单位经济、成本结构与资金是否成立？",
      en: "Economics: Do unit economics, cost structure, and funding hold?"
    },
    dimensions: ["financial_unit_economics"]
  },
  {
    id: "feasibility_execution",
    question: {
      zh: "可行性与执行：合规、组织和风险控制能否支持落地？",
      en: "Feasibility & execution: Can compliance, organization, and risk control support delivery?"
    },
    dimensions: [
      "country_compliance",
      "organization_execution",
      "risk_sustainability"
    ]
  }
];

const round = (value: number, precision = 1) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const clamp = (value: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, value));

const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

const hasContent = (value: string) => value.trim().length > 0;

const formatNumber = (value: number, precision = 1) =>
  round(value, precision).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision
  });

const formatCurrency = (
  value: number | null,
  currency: string,
  precision = 0
) =>
  value === null
    ? "—"
    : `${currency.trim() || "Currency"} ${formatNumber(value, precision)}`;

const formatPercent = (value: number | null) =>
  value === null ? "—" : `${formatNumber(value * 100, 1)}%`;

const formatMultiple = (value: number | null) =>
  value === null ? "—" : `${formatNumber(value, 2)}×`;

function dimensionById(
  score: BusinessScore,
  id: DimensionId
): DimensionResult {
  return (
    score.dimensions.find((dimension) => dimension.id === id) ?? {
      id,
      label: DIMENSION_LABELS[id],
      weight: 0,
      score: 0,
      weightedPoints: 0,
      applicable: false,
      evidenceHandles: [],
      rationale: {
        zh: "评分结果缺少该维度。",
        en: "The scoring result does not contain this dimension."
      }
    }
  );
}

const metricById = (score: BusinessScore, id: string) =>
  score.metrics.find((metric) => metric.id === id);

function gateReadiness(score: BusinessScore): number {
  const points = { pass: 100, review: 55, unknown: 25, fail: 0 } as const;
  return round(
    average(score.gates.map(({ status }) => points[status])),
    1
  );
}

function readinessLabel(level: ReadinessLevel): BilingualLabel {
  return {
    ready: { zh: "可进入决策", en: "Decision-ready" },
    conditional: { zh: "有条件进入决策", en: "Conditionally ready" },
    not_ready: { zh: "尚不可决策", en: "Not decision-ready" }
  }[level];
}

function buildDecisionReadiness(score: BusinessScore): DecisionReadiness {
  const rawComponents: Array<
    Omit<ReadinessComponent, "weightedContribution">
  > = [
    {
      id: "commercial_case",
      label: { zh: "商业案例强度", en: "Commercial case strength" },
      score: score.overallScore,
      weight: 35,
      evidence: {
        zh: "采用既有 100 分确定性商业评分。",
        en: "Uses the existing deterministic 100-point business score."
      }
    },
    {
      id: "evidence_confidence",
      label: { zh: "证据置信度", en: "Evidence confidence" },
      score: score.confidence,
      weight: 25,
      evidence: {
        zh: "采用评分引擎对完整性、证据质量与一致性的置信度。",
        en: "Uses scoring-engine confidence from completeness, evidence quality, and consistency."
      }
    },
    {
      id: "input_completeness",
      label: { zh: "输入完整性", en: "Input completeness" },
      score: score.completeness,
      weight: 20,
      evidence: {
        zh: "采用适用必填字段的程序化覆盖率。",
        en: "Uses programmatic coverage of applicable required fields."
      }
    },
    {
      id: "hard_gates",
      label: { zh: "硬门槛准备度", en: "Hard-gate readiness" },
      score: gateReadiness(score),
      weight: 20,
      evidence: {
        zh: "通过=100、复核=55、未知=25、失败=0，再取平均。",
        en: "Pass=100, Review=55, Unknown=25, Fail=0, then averaged."
      }
    }
  ];

  const components = rawComponents.map<ReadinessComponent>((component) => ({
    ...component,
    score: round(clamp(component.score)),
    weightedContribution: round(
      (clamp(component.score) * component.weight) / 100,
      2
    )
  }));
  const readinessScore = round(
    components.reduce(
      (sum, component) => sum + component.weightedContribution,
      0
    )
  );
  const level: ReadinessLevel =
    score.gateOutcome !== "blocked" && readinessScore >= 75
      ? "ready"
      : score.gateOutcome !== "blocked" && readinessScore >= 55
        ? "conditional"
        : "not_ready";

  return {
    score: readinessScore,
    level,
    label: readinessLabel(level),
    components,
    calculation:
      "35% commercial case + 25% evidence confidence + 20% completeness + 20% hard-gate readiness"
  };
}

function evidenceLevelLabel(level: EvidenceLevel): BilingualLabel {
  return {
    high: { zh: "高证据质量", en: "High evidence quality" },
    medium: { zh: "中等证据质量", en: "Medium evidence quality" },
    low: { zh: "低证据质量", en: "Low evidence quality" }
  }[level];
}

function buildEvidenceAssessment(
  input: BusinessInput,
  score: BusinessScore
): EvidenceAssessment {
  const declaredConfidence = {
    low: 35,
    medium: 65,
    high: 90
  }[input.riskEvidence.evidenceConfidence];
  const evidenceDateValid =
    input.riskEvidence.evidenceDate.trim().length > 0 &&
    Number.isFinite(Date.parse(input.riskEvidence.evidenceDate));
  const sourceTraceability = hasContent(
    input.riskEvidence.evidenceSource
  )
    ? 100
    : 0;
  const complianceTraceability = hasContent(
    input.compliance.currentEvidence
  )
    ? 100
    : 0;

  const rawComponents: Array<Omit<EvidenceComponent, "weightedContribution">> =
    [
      {
        id: "declared_confidence",
        label: { zh: "申报证据置信度", en: "Declared evidence confidence" },
        score: declaredConfidence,
        weight: 35,
        rule: {
          zh: "低=35、中=65、高=90；这是内部质量映射，不是外部评级。",
          en: "Low=35, Medium=65, High=90; this is an internal quality mapping, not an external rating."
        }
      },
      {
        id: "source_traceability",
        label: { zh: "来源可追溯性", en: "Source traceability" },
        score: sourceTraceability,
        weight: 30,
        rule: {
          zh: "已提交来源引用=100，缺失=0；文字长度不加分，引用是否真实有效仍须人工核验。",
          en: "Submitted source reference=100 and absent=0; narrative length adds no points, and validity still requires human verification."
        }
      },
      {
        id: "evidence_date",
        label: { zh: "证据日期", en: "Evidence date" },
        score: evidenceDateValid ? 100 : 0,
        weight: 15,
        rule: {
          zh: "存在可解析日期=100，否则=0；不自动断言内容仍然有效。",
          en: "Parseable date=100, otherwise=0; the system does not infer that the content remains current."
        }
      },
      {
        id: "compliance_traceability",
        label: {
          zh: "合规证据可追溯性",
          en: "Compliance evidence traceability"
        },
        score: complianceTraceability,
        weight: 20,
        rule: {
          zh: "已提交合规证据引用=100，缺失=0；文字长度不加分，法律有效性仍须专业复核。",
          en: "Submitted compliance-evidence reference=100 and absent=0; narrative length adds no points, and legal validity still requires professional review."
        }
      }
    ];

  const components = rawComponents.map<EvidenceComponent>((component) => ({
    ...component,
    weightedContribution: round(
      (component.score * component.weight) / 100,
      2
    )
  }));
  const qualityScore = round(
    components.reduce(
      (sum, component) => sum + component.weightedContribution,
      0
    )
  );
  const level: EvidenceLevel =
    qualityScore >= 75 && score.confidence >= 70
      ? "high"
      : qualityScore >= 50 && score.confidence >= 45
        ? "medium"
        : "low";
  const limitations: BilingualLabel[] = [];

  if (input.riskEvidence.evidenceConfidence !== "high") {
    limitations.push({
      zh: "申报证据置信度尚未达到“高”。",
      en: "Declared evidence confidence is below High."
    });
  }
  if (!hasContent(input.riskEvidence.evidenceSource)) {
    limitations.push({
      zh: "证据来源说明不足，无法形成完整追溯链。",
      en: "The evidence-source description is insufficient for a full audit trail."
    });
  }
  if (!evidenceDateValid) {
    limitations.push({
      zh: "缺少可解析的证据日期。",
      en: "A parseable evidence date is missing."
    });
  }
  if (!hasContent(input.compliance.currentEvidence)) {
    limitations.push({
      zh: "当前合规证据说明不足。",
      en: "Current compliance evidence is insufficiently documented."
    });
  }
  if (score.confidence < 70) {
    limitations.push({
      zh: "评分置信度低于内部决策阈值 70。",
      en: "Scoring confidence is below the internal decision threshold of 70."
    });
  }
  limitations.push({
    zh: "系统未引入或推断任何外部市场基准、法律意见或监管确认。",
    en: "No external market benchmark, legal opinion, or regulatory confirmation is introduced or inferred."
  });

  return {
    qualityScore,
    confidenceScore: score.confidence,
    level,
    label: evidenceLevelLabel(level),
    evidenceCount: score.evidenceCount,
    components,
    limitations,
    rule: {
      zh: "证据质量分与原评分置信度分开报告；二者都不能替代原始证据核验。",
      en: "Evidence quality is reported separately from scoring confidence; neither replaces verification of source evidence."
    }
  };
}

function hypothesisStatusLabel(status: HypothesisStatus): BilingualLabel {
  return {
    supported: { zh: "已支持", en: "Supported" },
    partially_supported: { zh: "部分支持", en: "Partially supported" },
    not_supported: { zh: "未支持", en: "Not supported" },
    insufficient_evidence: { zh: "证据不足", en: "Insufficient evidence" },
    not_applicable: { zh: "不适用", en: "Not applicable" }
  }[status];
}

function hypothesisStatus(
  dimension: DimensionResult,
  confidence: number
): HypothesisStatus {
  if (!dimension.applicable) return "not_applicable";
  if (confidence < 45) return "insufficient_evidence";
  if (dimension.score >= 75) return "supported";
  if (dimension.score >= 55) return "partially_supported";
  return "not_supported";
}

function branchStatus(
  hypotheses: ConsultingHypothesis[],
  branchScore: number
): HypothesisStatus {
  const applicable = hypotheses.filter(
    ({ status }) => status !== "not_applicable"
  );
  if (applicable.length === 0) return "not_applicable";
  if (
    applicable.some(({ status }) => status === "insufficient_evidence")
  ) {
    return "insufficient_evidence";
  }
  if (applicable.every(({ status }) => status === "supported")) {
    return "supported";
  }
  if (
    branchScore < 55 &&
    applicable.some(({ status }) => status === "not_supported")
  ) {
    return "not_supported";
  }
  return "partially_supported";
}

function buildIssueTree(score: BusinessScore): IssueTreeBranch[] {
  return ISSUE_BRANCHES.map<IssueTreeBranch>((branch) => {
    const dimensions = branch.dimensions.map((id) => dimensionById(score, id));
    const hypotheses = dimensions.map<ConsultingHypothesis>((dimension) => {
      const status = hypothesisStatus(dimension, score.confidence);
      return {
        id: `hypothesis-${dimension.id}`,
        dimensionId: dimension.id,
        statement: HYPOTHESIS_CONFIG[dimension.id].statement,
        status,
        statusLabel: hypothesisStatusLabel(status),
        score: dimension.score,
        test: HYPOTHESIS_CONFIG[dimension.id].test,
        evidenceHandles: [...dimension.evidenceHandles]
      };
    });
    const applicable = dimensions.filter(({ applicable }) => applicable);
    const totalWeight = applicable.reduce(
      (sum, dimension) => sum + dimension.weight,
      0
    );
    const scoreValue =
      totalWeight > 0
        ? round(
            applicable.reduce(
              (sum, dimension) => sum + dimension.score * dimension.weight,
              0
            ) / totalWeight
          )
        : 0;
    const status = branchStatus(hypotheses, scoreValue);

    return {
      id: branch.id,
      question: branch.question,
      score: scoreValue,
      status,
      statusLabel: hypothesisStatusLabel(status),
      hypotheses
    };
  });
}

function assumptionStatusLabel(status: AssumptionStatus): BilingualLabel {
  return {
    supported: { zh: "当前证据支持", en: "Supported by current evidence" },
    partially_supported: {
      zh: "部分支持，仍需验证",
      en: "Partially supported; validation required"
    },
    unverified: { zh: "尚未验证", en: "Unverified" },
    contradicted: { zh: "当前数据不支持", en: "Contradicted by current data" }
  }[status];
}

const assumptionCriticality = (status: AssumptionStatus): Priority =>
  status === "contradicted"
    ? "P0"
    : status === "unverified" || status === "partially_supported"
      ? "P1"
      : "P2";

function dimensionSources(score: BusinessScore, id: DimensionId): string[] {
  return [...dimensionById(score, id).evidenceHandles];
}

function buildAssumptions(
  input: BusinessInput,
  score: BusinessScore
): KeyAssumption[] {
  const currency = input.geography.currency;
  const contributionMargin = metricById(score, "contribution_margin");
  const breakEvenCoverage = metricById(score, "break_even_coverage");
  const serviceLevel = metricById(score, "service_level");
  const supplierShare = metricById(score, "top_supplier_share");
  const allGatesPass = score.gates.every(({ status }) => status === "pass");
  const hasFailedGate = score.gates.some(({ status }) => status === "fail");
  const hasUnknownGate = score.gates.some(({ status }) => status === "unknown");
  const hasDemandEvidence = hasContent(input.customer.marketDemandEvidence);
  const demandStatus: AssumptionStatus = !hasDemandEvidence
    ? "unverified"
    : input.riskEvidence.evidenceConfidence === "high" &&
        ["operating", "scaling"].includes(input.identity.stage)
      ? "supported"
      : "partially_supported";
  const contributionStatus: AssumptionStatus =
    contributionMargin?.value === null ||
    contributionMargin?.value === undefined
      ? "unverified"
      : contributionMargin.value > 0
        ? "supported"
        : "contradicted";
  const downsideStatus: AssumptionStatus =
    breakEvenCoverage?.value === null ||
    breakEvenCoverage?.value === undefined
      ? "unverified"
      : breakEvenCoverage.value >= 1
        ? "supported"
        : "contradicted";
  const complianceStatus: AssumptionStatus = hasFailedGate
    ? "contradicted"
    : allGatesPass
      ? "supported"
      : hasUnknownGate
        ? "unverified"
        : "partially_supported";
  const supplyStatus: AssumptionStatus =
    !serviceLevel ||
    serviceLevel.value === null ||
    !supplierShare ||
    supplierShare.value === null
      ? "unverified"
      : serviceLevel.status === "risk" || supplierShare.status === "risk"
        ? "contradicted"
        : serviceLevel.status === "strong" &&
            supplierShare.status === "strong"
          ? "supported"
          : "partially_supported";
  const organizationScore = dimensionById(
    score,
    "organization_execution"
  ).score;
  const organizationStatus: AssumptionStatus =
    organizationScore >= 75
      ? "supported"
      : organizationScore >= 55
        ? "partially_supported"
        : "unverified";
  const entryModeStatus: AssumptionStatus =
    input.model.candidateEntryMode.trim().length > 0
      ? "partially_supported"
      : "unverified";

  const raw: Array<Omit<KeyAssumption, "criticality" | "statusLabel">> = [
    {
      id: "demand-realization",
      statement: {
        zh: `每月 ${formatCurrency(input.financial.monthlyRevenue, currency)} 的基础收入假设可以实现。`,
        en: `The base monthly revenue assumption of ${formatCurrency(input.financial.monthlyRevenue, currency)} is achievable.`
      },
      submittedBasis: {
        zh: input.customer.marketDemandEvidence || "未提交需求证据。",
        en: input.customer.marketDemandEvidence || "No demand evidence submitted."
      },
      status: demandStatus,
      validationTest: {
        zh: "用真实交易、分渠道转化和复购数据对基础收入进行拆解验证。",
        en: "Validate base revenue using actual transactions, channel conversion, and repeat behaviour."
      },
      owner: { zh: "商业负责人", en: "Commercial lead" },
      trigger: {
        zh: `实际月收入低于下行情景 ${formatCurrency(input.financial.downsideMonthlyRevenue, currency)} 时升级。`,
        en: `Escalate when actual monthly revenue falls below the downside case of ${formatCurrency(input.financial.downsideMonthlyRevenue, currency)}.`
      },
      sourceHandles: dimensionSources(score, "market_customer")
    },
    {
      id: "positive-contribution",
      statement: {
        zh: "销售在扣除 COGS 与变动成本后仍保持正贡献毛利。",
        en: "Sales retain a positive contribution margin after COGS and variable costs."
      },
      submittedBasis: {
        zh: `程序化贡献毛利率：${formatPercent(contributionMargin?.value ?? null)}。`,
        en: `Programmatic contribution margin: ${formatPercent(contributionMargin?.value ?? null)}.`
      },
      status: contributionStatus,
      validationTest: {
        zh: "按 SKU、渠道和顾客群复核净销售、COGS、折扣、退款与变动履约成本。",
        en: "Reconcile net sales, COGS, discounts, returns, and variable fulfilment cost by SKU, channel, and cohort."
      },
      owner: { zh: "财务负责人", en: "Finance lead" },
      trigger: {
        zh: "贡献毛利率≤0 时停止扩大投入并重做经济模型。",
        en: "Stop scale investment and rebuild the economics when contribution margin is ≤0."
      },
      sourceHandles: dimensionSources(score, "financial_unit_economics")
    },
    {
      id: "downside-viability",
      statement: {
        zh: "下行收入仍足以覆盖数学盈亏平衡收入。",
        en: "Downside revenue remains sufficient to cover mathematical break-even revenue."
      },
      submittedBasis: {
        zh: `下行盈亏平衡覆盖：${formatMultiple(breakEvenCoverage?.value ?? null)}。`,
        en: `Downside break-even coverage: ${formatMultiple(breakEvenCoverage?.value ?? null)}.`
      },
      status: downsideStatus,
      validationTest: {
        zh: "压力测试收入、贡献毛利与固定成本，并记录恢复或退出动作。",
        en: "Stress-test revenue, contribution margin, and fixed cost, with recovery or exit actions."
      },
      owner: { zh: "财务负责人", en: "Finance lead" },
      trigger: {
        zh: "覆盖倍数<1.0× 即进入停止损失评审。",
        en: "Coverage below 1.0× triggers a stop-loss review."
      },
      sourceHandles: dimensionSources(score, "financial_unit_economics")
    },
    {
      id: "compliance-closure",
      statement: {
        zh: "所有进入与经营硬门槛可在不可逆投入前关闭。",
        en: "All entry and operating hard gates can be closed before irreversible investment."
      },
      submittedBasis: {
        zh: `当前门槛结论：${score.gateOutcome}；${score.gates.filter(({ status }) => status !== "pass").length} 项未通过。`,
        en: `Current gate outcome: ${score.gateOutcome}; ${score.gates.filter(({ status }) => status !== "pass").length} gates are not Pass.`
      },
      status: complianceStatus,
      validationTest: {
        zh: "逐项取得目标国家当前权威证明，并由指定负责人批准。",
        en: "Obtain current authoritative evidence for the target country and named-owner approval for every gate."
      },
      owner: { zh: "合规负责人", en: "Compliance lead" },
      trigger: {
        zh: "任一硬门槛失败即停止相关不可逆承诺。",
        en: "Any failed hard gate stops the related irreversible commitment."
      },
      sourceHandles: dimensionSources(score, "country_compliance")
    },
    {
      id: "supply-continuity",
      statement: {
        zh: "供应网络可在可接受的服务、缺货和集中风险下支持销售计划。",
        en: "The supply network can support the sales plan with manageable service, stockout, and concentration risk."
      },
      submittedBasis: {
        zh: `服务水平 ${formatPercent(serviceLevel?.value ?? null)}；最大供应商占比 ${formatPercent(supplierShare?.value ?? null)}。`,
        en: `Service level ${formatPercent(serviceLevel?.value ?? null)}; top-supplier share ${formatPercent(supplierShare?.value ?? null)}.`
      },
      status: supplyStatus,
      validationTest: {
        zh: "按关键 SKU 追踪 OTIF、缺货、交期、质量事件和替代供应。",
        en: "Track OTIF, stockouts, lead time, quality events, and alternate supply by critical SKU."
      },
      owner: { zh: "供应链负责人", en: "Supply-chain lead" },
      trigger: {
        zh: "服务水平或供应商集中指标进入现有规则的风险状态时升级。",
        en: "Escalate when service level or supplier concentration enters Risk under the existing rules."
      },
      sourceHandles: dimensionSources(score, "merchandise_supply_chain")
    },
    {
      id: "execution-governance",
      statement: {
        zh: "团队、决策权、里程碑与 KPI 责任能够支持执行。",
        en: "Team, decision rights, milestones, and KPI ownership can support execution."
      },
      submittedBasis: {
        zh: `组织与执行规则分：${formatNumber(organizationScore)} / 100。`,
        en: `Organization & execution rule score: ${formatNumber(organizationScore)} / 100.`
      },
      status: organizationStatus,
      validationTest: {
        zh: "建立 RACI、周度决策节奏、阶段关口与逾期升级机制。",
        en: "Establish RACI, weekly decision cadence, stage gates, and overdue escalation."
      },
      owner: { zh: "项目负责人", en: "Program lead" },
      trigger: {
        zh: "P0 工作流无负责人或里程碑逾期时升级至管理层。",
        en: "Escalate when a P0 workstream lacks an owner or misses a milestone."
      },
      sourceHandles: dimensionSources(score, "organization_execution")
    },
    {
      id: "entry-mode-fit",
      statement: {
        zh: `候选进入模式“${input.model.candidateEntryMode || "未填写"}”优于可行替代方案。`,
        en: `The candidate entry mode "${input.model.candidateEntryMode || "not provided"}" is preferable to feasible alternatives.`
      },
      submittedBasis: {
        zh: "当前仅为待验证假设，不能由综合评分自动确认。",
        en: "This remains a hypothesis; the overall score cannot automatically confirm it."
      },
      status: entryModeStatus,
      validationTest: {
        zh: "比较控制权、资本、伙伴能力、退出难度与经核实的目标国要求；可用有效 QSPM 作相对排序。",
        en: "Compare control, capital, partner capability, reversibility, and verified country requirements; use a valid QSPM for relative ranking."
      },
      owner: { zh: "战略负责人", en: "Strategy lead" },
      trigger: {
        zh: "若候选模式依赖的伙伴、资本或合规条件未验证，则不得锁定模式。",
        en: "Do not lock the mode while required partner, capital, or compliance conditions remain unverified."
      },
      sourceHandles: [
        ...dimensionSources(score, "strategy_differentiation"),
        ...dimensionSources(score, "country_compliance")
      ]
    }
  ];

  const priorityOrder: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };
  return raw
    .map<KeyAssumption>((assumption) => ({
      ...assumption,
      criticality: assumptionCriticality(assumption.status),
      statusLabel: assumptionStatusLabel(assumption.status),
      sourceHandles: [...new Set(assumption.sourceHandles)]
    }))
    .sort(
      (left, right) =>
        priorityOrder[left.criticality] - priorityOrder[right.criticality]
    );
}

interface ScenarioEconomics {
  monthlyOperatingContribution: number | null;
  breakEvenCoverage: number | null;
}

function scenarioEconomics(
  revenue: number | null,
  input: BusinessInput
): ScenarioEconomics {
  if (revenue === null || revenue < 0 || input.financial.monthlyRevenue <= 0) {
    return {
      monthlyOperatingContribution: null,
      breakEvenCoverage: null
    };
  }
  const variableCostRate =
    (input.financial.monthlyCogs +
      input.financial.monthlyVariableCosts) /
    input.financial.monthlyRevenue;
  const contributionRate = 1 - variableCostRate;
  if (!Number.isFinite(contributionRate) || contributionRate <= 0) {
    return {
      monthlyOperatingContribution: round(
        revenue * contributionRate - input.financial.monthlyFixedCosts,
        2
      ),
      breakEvenCoverage: null
    };
  }
  const breakEvenRevenue =
    input.financial.monthlyFixedCosts / contributionRate;
  return {
    monthlyOperatingContribution: round(
      revenue * contributionRate - input.financial.monthlyFixedCosts,
      2
    ),
    breakEvenCoverage:
      breakEvenRevenue > 0 ? round(revenue / breakEvenRevenue, 3) : null
  };
}

function buildScenarios(
  input: BusinessInput,
  score: BusinessScore
): ConsultingScenario[] {
  const baseRevenue =
    input.financial.monthlyRevenue > 0
      ? input.financial.monthlyRevenue
      : null;
  const downsideRevenue =
    input.financial.downsideMonthlyRevenue > 0
      ? input.financial.downsideMonthlyRevenue
      : null;
  const upsideRevenue =
    baseRevenue !== null &&
    downsideRevenue !== null &&
    downsideRevenue < baseRevenue
      ? baseRevenue + (baseRevenue - downsideRevenue)
      : null;
  const sources = dimensionSources(score, "financial_unit_economics");
  const currency = input.geography.currency;

  const values = (
    revenue: number | null
  ): Pick<
    ConsultingScenario,
    | "available"
    | "monthlyRevenue"
    | "monthlyOperatingContribution"
    | "breakEvenCoverage"
  > => ({
    available: revenue !== null,
    monthlyRevenue: revenue,
    ...scenarioEconomics(revenue, input)
  });

  return [
    {
      id: "downside",
      label: { zh: "下行情景", en: "Downside" },
      ...values(downsideRevenue),
      basis: {
        zh:
          downsideRevenue === null
            ? "未提交下行收入；系统不虚构情景值。"
            : "采用使用者提交的下行月收入，并保持基础案例的 COGS/变动成本率与固定成本不变。",
        en:
          downsideRevenue === null
            ? "No downside revenue was submitted; the system does not invent a scenario value."
            : "Uses submitted downside monthly revenue while holding base-case COGS/variable-cost rates and fixed costs constant."
      },
      trigger: {
        zh:
          downsideRevenue === null
            ? "管理层需先批准下行情景阈值。"
            : `实际或滚动预测月收入≤${formatCurrency(downsideRevenue, currency)}。`,
        en:
          downsideRevenue === null
            ? "Management must approve a downside threshold first."
            : `Actual or rolling-forecast monthly revenue ≤ ${formatCurrency(downsideRevenue, currency)}.`
      },
      managementAction: {
        zh: "进入停止损失评审：冻结扩大投入，关闭硬门槛，重做现金与盈利路径。",
        en: "Enter stop-loss review: freeze scale investment, close hard gates, and rebuild the cash and profit path."
      },
      sourceHandles: sources
    },
    {
      id: "base",
      label: { zh: "基础情景", en: "Base" },
      ...values(baseRevenue),
      basis: {
        zh:
          baseRevenue === null
            ? "未提交有效基础月收入。"
            : "采用使用者提交的月收入、成本与固定成本；系统不推断其为实际值或预测值。",
        en:
          baseRevenue === null
            ? "No valid base monthly revenue was submitted."
            : "Uses submitted monthly revenue, cost, and fixed-cost inputs; the system does not infer whether they are actuals or forecasts."
      },
      trigger: {
        zh: "滚动结果围绕基础计划，且决策条件按期关闭。",
        en: "Rolling results remain around the base plan and decision conditions close on schedule."
      },
      managementAction: {
        zh: "按阶段关口执行，优先关闭 P0/P1 工作流并每周复核 KPI。",
        en: "Execute through stage gates, close P0/P1 workstreams first, and review KPIs weekly."
      },
      sourceHandles: sources
    },
    {
      id: "upside",
      label: { zh: "上行情景", en: "Upside" },
      ...values(upsideRevenue),
      basis: {
        zh:
          upsideRevenue === null
            ? "缺少可用的基础—下行差值；系统不虚构上行情景。"
            : `使用“基础收入 + 基础与下行的差值”得到 ${formatCurrency(upsideRevenue, currency)}；这是对称内部敏感性，不是外部预测。`,
        en:
          upsideRevenue === null
            ? "No usable base-to-downside delta exists; the system does not invent an upside case."
            : `Uses base revenue plus the base-to-downside delta, producing ${formatCurrency(upsideRevenue, currency)}; this is a symmetric internal sensitivity, not an external forecast.`
      },
      trigger: {
        zh:
          upsideRevenue === null
            ? "管理层需先批准上行情景与扩张阈值。"
            : `实际或滚动预测月收入≥${formatCurrency(upsideRevenue, currency)}，且硬门槛和护栏均未恶化。`,
        en:
          upsideRevenue === null
            ? "Management must first approve an upside and scale threshold."
            : `Actual or rolling-forecast monthly revenue ≥ ${formatCurrency(upsideRevenue, currency)}, with no deterioration in hard gates or guardrails.`
      },
      managementAction: {
        zh: "仅在贡献、现金、服务与合规护栏同时成立时进行受控扩张。",
        en: "Scale in a controlled manner only while contribution, cash, service, and compliance guardrails all hold."
      },
      sourceHandles: sources
    }
  ];
}

function linkedMetric(
  id: string,
  label: BilingualLabel,
  value: number | null,
  formattedValue: string,
  unit: string,
  formula: string,
  status: MetricResult["status"]
): KpiLinkedMetric {
  return {
    id,
    label,
    currentValue: value,
    formattedValue,
    unit,
    formula,
    status
  };
}

function buildKpis(input: BusinessInput, score: BusinessScore): OutcomeKpi[] {
  const contributionMargin = metricById(score, "contribution_margin");
  const breakEvenCoverage = metricById(score, "break_even_coverage");
  const runway = metricById(score, "cash_runway");
  const rentToSales = metricById(score, "rent_to_sales");
  const supplierShare = metricById(score, "top_supplier_share");
  const baseEconomics = scenarioEconomics(
    input.financial.monthlyRevenue > 0
      ? input.financial.monthlyRevenue
      : null,
    input
  );
  const operatingContributionStatus: MetricResult["status"] =
    baseEconomics.monthlyOperatingContribution === null
      ? "unknown"
      : baseEconomics.monthlyOperatingContribution >= 0
        ? "strong"
        : "risk";
  const currency = input.geography.currency.trim() || "currency";
  const financialSources = dimensionSources(
    score,
    "financial_unit_economics"
  );
  const supplySources = dimensionSources(
    score,
    "merchandise_supply_chain"
  );

  const financialGuardrails: KpiLinkedMetric[] = [
    linkedMetric(
      "cash_runway",
      { zh: "现金跑道", en: "Cash runway" },
      runway?.value ?? null,
      runway?.formattedValue ?? "—",
      "months",
      runway?.formula ?? "Submitted cash runway",
      runway?.status ?? "unknown"
    )
  ];
  if (input.model.type !== "digital") {
    financialGuardrails.push(
      linkedMetric(
        "rent_to_sales",
        { zh: "租售比", en: "Rent-to-sales" },
        rentToSales?.value ?? null,
        rentToSales?.formattedValue ?? "—",
        "%",
        rentToSales?.formula ?? "Occupancy cost ÷ sales",
        rentToSales?.status ?? "unknown"
      )
    );
  }

  return [
    {
      id: "monthly_operating_contribution",
      label: {
        zh: "月度经营贡献（固定成本后）",
        en: "Monthly operating contribution after fixed costs"
      },
      definition: {
        zh: "判断基础月收入在扣除 COGS、变动成本与固定成本后是否创造正经营贡献。",
        en: "Tests whether base monthly revenue creates positive operating contribution after COGS, variable cost, and fixed cost."
      },
      formula: "Revenue − COGS − variable costs − fixed costs",
      currentValue: baseEconomics.monthlyOperatingContribution,
      formattedValue: formatCurrency(
        baseEconomics.monthlyOperatingContribution,
        input.geography.currency
      ),
      unit: currency,
      target: {
        zh: "≥0；这是数学盈亏平衡条件，不是外部行业基准。",
        en: "≥0; this is a mathematical break-even condition, not an external industry benchmark."
      },
      targetBasis: "mathematical_break_even",
      cadence: { zh: "每周滚动、每月关账", en: "Weekly rolling; monthly close" },
      owner: { zh: "财务负责人", en: "Finance lead" },
      drivers: [
        linkedMetric(
          "monthly_revenue",
          { zh: "月收入", en: "Monthly revenue" },
          input.financial.monthlyRevenue,
          formatCurrency(
            input.financial.monthlyRevenue,
            input.geography.currency
          ),
          currency,
          "Submitted monthly revenue",
          input.financial.monthlyRevenue > 0 ? "strong" : "unknown"
        ),
        linkedMetric(
          "contribution_margin",
          { zh: "贡献毛利率", en: "Contribution margin" },
          contributionMargin?.value ?? null,
          contributionMargin?.formattedValue ?? "—",
          "%",
          contributionMargin?.formula ??
            "(Sales − COGS − variable costs) ÷ Sales",
          contributionMargin?.status ?? "unknown"
        )
      ],
      guardrails: financialGuardrails,
      sourceHandles: financialSources
    },
    {
      id: "downside_break_even_coverage",
      label: {
        zh: "下行情景盈亏平衡覆盖",
        en: "Downside break-even coverage"
      },
      definition: {
        zh: "衡量使用者提交的下行收入能否覆盖由当前贡献毛利和固定成本计算的盈亏平衡收入。",
        en: "Measures whether submitted downside revenue covers break-even revenue calculated from current contribution margin and fixed cost."
      },
      formula: "Submitted downside revenue ÷ mathematical break-even revenue",
      currentValue: breakEvenCoverage?.value ?? null,
      formattedValue: breakEvenCoverage?.formattedValue ?? "—",
      unit: "x",
      target: {
        zh: "≥1.0×；这是覆盖盈亏平衡的数学条件。",
        en: "≥1.0×; this is the mathematical condition for covering break-even."
      },
      targetBasis: "mathematical_break_even",
      cadence: { zh: "每周压力测试", en: "Weekly stress test" },
      owner: { zh: "财务负责人", en: "Finance lead" },
      drivers: [
        linkedMetric(
          "downside_monthly_revenue",
          { zh: "下行月收入", en: "Downside monthly revenue" },
          input.financial.downsideMonthlyRevenue > 0
            ? input.financial.downsideMonthlyRevenue
            : null,
          input.financial.downsideMonthlyRevenue > 0
            ? formatCurrency(
                input.financial.downsideMonthlyRevenue,
                input.geography.currency
              )
            : "—",
          currency,
          "Submitted downside monthly revenue",
          input.financial.downsideMonthlyRevenue > 0 ? "caution" : "unknown"
        ),
        linkedMetric(
          "contribution_margin",
          { zh: "贡献毛利率", en: "Contribution margin" },
          contributionMargin?.value ?? null,
          contributionMargin?.formattedValue ?? "—",
          "%",
          contributionMargin?.formula ??
            "(Sales − COGS − variable costs) ÷ Sales",
          contributionMargin?.status ?? "unknown"
        )
      ],
      guardrails: financialGuardrails,
      sourceHandles: financialSources
    },
    {
      id: "supplier_service_level",
      label: { zh: "供应商服务水平", en: "Supplier service level" },
      definition: {
        zh: "衡量供应网络按计划满足补货或交付要求的比例；当前值来自使用者提交，需与原始运营数据核对。",
        en: "Measures the share of replenishment or delivery requirements met as planned; the current value is submitted and requires reconciliation to operating data."
      },
      formula: "Requirements met as planned ÷ total requirements",
      currentValue: input.supply.serviceLevel / 100,
      formattedValue: formatPercent(input.supply.serviceLevel / 100),
      unit: "%",
      target: {
        zh: "由管理层依据顾客承诺、品类和当前基线批准；系统不虚构外部目标。",
        en: "Management must approve the target from the customer promise, category, and current baseline; the system does not invent an external target."
      },
      targetBasis: "management_target_required",
      cadence: { zh: "每日监控、每周复盘", en: "Daily monitoring; weekly review" },
      owner: { zh: "供应链负责人", en: "Supply-chain lead" },
      drivers: [
        linkedMetric(
          "stockout_rate",
          { zh: "缺货率", en: "Stockout rate" },
          input.supply.stockoutRate / 100,
          formatPercent(input.supply.stockoutRate / 100),
          "%",
          "Submitted stockout rate",
          input.supply.stockoutRate >= 0 ? "caution" : "unknown"
        ),
        linkedMetric(
          "lead_time_days",
          { zh: "交期", en: "Lead time" },
          input.supply.leadTimeDays,
          `${formatNumber(input.supply.leadTimeDays)} days`,
          "days",
          "Submitted lead time",
          input.supply.leadTimeDays > 0 ? "caution" : "unknown"
        )
      ],
      guardrails: [
        linkedMetric(
          "top_supplier_share",
          { zh: "最大供应商占比", en: "Top-supplier share" },
          supplierShare?.value ?? null,
          supplierShare?.formattedValue ?? "—",
          "%",
          supplierShare?.formula ?? "Top supplier purchases ÷ total purchases",
          supplierShare?.status ?? "unknown"
        )
      ],
      sourceHandles: supplySources
    }
  ];
}

function actionRiskLevel(action: ActionResult): RiskLevel {
  return action.priority === "P0"
    ? "critical"
    : action.priority === "P1"
      ? "high"
      : "medium";
}

function buildPriorities(score: BusinessScore): WorkstreamPriority[] {
  const priorityOrder: Record<Priority, number> = { P0: 0, P1: 1, P2: 2 };
  return score.actions
    .map((action, originalIndex) => ({
      action,
      originalIndex,
      dimension: dimensionById(score, action.dimension)
    }))
    .sort(
      (left, right) =>
        priorityOrder[left.action.priority] -
          priorityOrder[right.action.priority] ||
        left.dimension.score - right.dimension.score ||
        left.originalIndex - right.originalIndex
    )
    .map<WorkstreamPriority>(({ action, dimension }, index) => ({
      rank: index + 1,
      priority: action.priority,
      riskLevel: actionRiskLevel(action),
      workstream: dimension.label,
      risk: {
        zh: `${dimension.label.zh}规则分为 ${formatNumber(dimension.score)} / 100；未关闭的缺口可能削弱管理层结论。`,
        en: `${dimension.label.en} has a rule score of ${formatNumber(dimension.score)} / 100; unresolved gaps may weaken the management conclusion.`
      },
      whyNow: action.rationale,
      nextStep: action.action,
      owner: action.owner,
      horizon: action.horizon,
      exitCriteria: action.kpi,
      linkedDimension: action.dimension,
      sourceHandles: [...new Set(action.evidence)]
    }));
}

function buildCourseSources(score: BusinessScore): CourseSource[] {
  const sourceDimensions = new Map<string, Set<DimensionId>>();
  for (const dimension of score.dimensions) {
    if (!dimension.applicable) continue;
    for (const handle of dimension.evidenceHandles) {
      if (!handle.trim()) continue;
      const dimensions =
        sourceDimensions.get(handle) ?? new Set<DimensionId>();
      dimensions.add(dimension.id);
      sourceDimensions.set(handle, dimensions);
    }
  }

  return [...sourceDimensions.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map<CourseSource>(([handle, dimensions]) => ({
      handle,
      appliedTo: [...dimensions],
      note: {
        zh: `课程方法来源标识 ${handle}；仅说明方法映射，不构成外部事实、基准或当前法规证明。`,
        en: `Course-method source handle ${handle}; this records methodology mapping only and is not external fact, benchmark, or proof of current regulation.`
      }
    }));
}

function decisionLabel(
  recommendation: ExecutiveRecommendation
): BilingualLabel {
  return {
    proceed: { zh: "推进", en: "Proceed" },
    conditional: { zh: "有条件推进", en: "Conditional proceed" },
    pause: { zh: "暂停并补证", en: "Pause and validate" },
    stop: { zh: "停止当前方案", en: "Stop current case" }
  }[recommendation];
}

function buildDecisionConditions(score: BusinessScore): DecisionCondition[] {
  const financialSources = dimensionSources(
    score,
    "financial_unit_economics"
  );
  const metricConditions: DecisionCondition[] = [];
  const contributionMargin = metricById(score, "contribution_margin");
  const breakEvenCoverage = metricById(score, "break_even_coverage");
  const runway = metricById(score, "cash_runway");

  if (
    contributionMargin?.value === null ||
    contributionMargin?.value === undefined ||
    contributionMargin.value <= 0
  ) {
    metricConditions.push({
      id: "condition-positive-contribution",
      priority: "P0",
      label: {
        zh: "恢复并验证正贡献毛利。",
        en: "Restore and validate positive contribution margin."
      },
      test: {
        zh: "经财务复核的贡献毛利率>0。",
        en: "Finance-reconciled contribution margin is >0."
      },
      sourceHandles: financialSources
    });
  }
  if (
    breakEvenCoverage?.value === null ||
    breakEvenCoverage?.value === undefined ||
    breakEvenCoverage.value < 1
  ) {
    metricConditions.push({
      id: "condition-downside-break-even",
      priority: "P0",
      label: {
        zh: "关闭下行情景的盈亏平衡缺口。",
        en: "Close the downside break-even gap."
      },
      test: {
        zh: "经复核的下行盈亏平衡覆盖≥1.0×。",
        en: "Reconciled downside break-even coverage is ≥1.0×."
      },
      sourceHandles: financialSources
    });
  }
  if (runway?.status === "risk") {
    metricConditions.push({
      id: "condition-cash-runway",
      priority: "P0",
      label: {
        zh: "在投入前关闭现金跑道风险。",
        en: "Close the cash-runway risk before investment."
      },
      test: {
        zh: "现金跑道退出当前规则的风险状态，并获得财务负责人批准。",
        en: "Cash runway exits Risk under the current rule and receives Finance approval."
      },
      sourceHandles: financialSources
    });
  }

  const material = score.actions.filter(
    ({ priority }) => priority === "P0" || priority === "P1"
  );
  const source = material.length > 0 ? material : score.actions.slice(0, 3);
  const actionConditions = source.map<DecisionCondition>((action) => ({
    id: `condition-${action.id}`,
    priority: action.priority,
    label: action.action,
    test: action.kpi,
    sourceHandles: [...new Set(action.evidence)]
  }));
  return [...metricConditions, ...actionConditions]
    .filter(
      (condition, index, conditions) =>
        conditions.findIndex(({ id }) => id === condition.id) === index
    )
    .slice(0, 5);
}

function buildExecutiveDecision(
  score: BusinessScore,
  readiness: DecisionReadiness
): ExecutiveDecision {
  const contributionMargin = metricById(score, "contribution_margin");
  const breakEvenCoverage = metricById(score, "break_even_coverage");
  const runway = metricById(score, "cash_runway");
  const nonPositiveContribution =
    contributionMargin?.value !== null &&
    contributionMargin?.value !== undefined &&
    contributionMargin.value <= 0;
  const downsideNotCovered =
    breakEvenCoverage?.value === null ||
    breakEvenCoverage?.value === undefined ||
    breakEvenCoverage.value < 1;
  const runwayAtRisk = runway?.status === "risk";
  const recommendation: ExecutiveRecommendation =
    score.gateOutcome === "blocked" ||
    score.overallScore < 40 ||
    nonPositiveContribution
      ? "stop"
      : score.gateOutcome === "incomplete" ||
          readiness.score < 55 ||
          score.overallScore < 55 ||
          runwayAtRisk
        ? "pause"
        : score.gateOutcome === "conditional" ||
            readiness.score < 75 ||
            score.overallScore < 75 ||
            score.confidence < 70 ||
            downsideNotCovered
          ? "conditional"
          : "proceed";
  const headlines: Record<ExecutiveRecommendation, BilingualLabel> = {
    proceed: {
      zh: "商业案例可进入受控执行，继续用阶段关口保护投入。",
      en: "The business case can enter controlled execution, protected by stage gates."
    },
    conditional: {
      zh: "商业案例具备基础，但必须先关闭关键条件再扩大不可逆投入。",
      en: "The case has a foundation, but material conditions must close before irreversible scale investment."
    },
    pause: {
      zh: "现有证据不足以支持管理层承诺，应先完成验证冲刺。",
      en: "Current evidence is insufficient for management commitment; complete a validation sprint first."
    },
    stop: {
      zh: "当前方案触发硬停止规则；在重构方案或关闭失败门槛前不得推进。",
      en: "The current case triggers a hard-stop rule; do not proceed until the case is redesigned or failed gates are closed."
    }
  };

  return {
    recommendation,
    label: decisionLabel(recommendation),
    headline: headlines[recommendation],
    rationale: {
      zh: `综合规则分 ${formatNumber(score.overallScore)} / 100，决策准备度 ${formatNumber(readiness.score)} / 100，证据置信度 ${formatNumber(score.confidence)} / 100，硬门槛结果为 ${score.gateOutcome}。`,
      en: `Overall rule score ${formatNumber(score.overallScore)} / 100, decision readiness ${formatNumber(readiness.score)} / 100, evidence confidence ${formatNumber(score.confidence)} / 100, with gate outcome ${score.gateOutcome}.`
    },
    rule: {
      zh: "停止：门槛阻断、总分<40或贡献毛利≤0；暂停：门槛不完整、准备度<55、总分<55或现金跑道为风险；有条件：门槛有条件、准备度<75、总分<75、置信度<70或下行未覆盖盈亏平衡；否则推进。",
      en: "Stop: blocked gate, score <40, or contribution margin ≤0; Pause: incomplete gate, readiness <55, score <55, or cash runway at Risk; Conditional: conditional gate, readiness <75, score <75, confidence <70, or downside below break-even; otherwise Proceed."
    },
    conditions:
      recommendation === "proceed"
        ? []
        : buildDecisionConditions(score)
  };
}

export function buildConsultingAssessment(
  input: BusinessInput,
  score: BusinessScore
): ConsultingAssessment {
  const decisionReadiness = buildDecisionReadiness(score);
  const evidence = buildEvidenceAssessment(input, score);

  return {
    version: "1.0",
    generatedAt: score.generatedAt,
    businessName: score.businessName,
    executiveDecision: buildExecutiveDecision(score, decisionReadiness),
    decisionReadiness,
    evidence,
    issueTree: buildIssueTree(score),
    assumptions: buildAssumptions(input, score),
    scenarios: buildScenarios(input, score),
    kpis: buildKpis(input, score),
    priorities: buildPriorities(score),
    courseSources: buildCourseSources(score),
    audit: {
      deterministic: true,
      aiMayAlterAssessment: false,
      methodologyVersion: CONSULTING_METHODOLOGY_VERSION,
      inputScoringVersion: score.version,
      formulas: [
        {
          zh: "决策准备度 = 商业案例 35% + 证据置信度 25% + 输入完整性 20% + 硬门槛准备度 20%。",
          en: "Decision readiness = 35% commercial case + 25% evidence confidence + 20% input completeness + 20% hard-gate readiness."
        },
        {
          zh: "情景经营贡献 = 情景收入 × 基础贡献毛利率 − 基础固定成本。",
          en: "Scenario operating contribution = scenario revenue × base contribution margin − base fixed cost."
        },
        {
          zh: "上行情景仅在存在有效下行值时，按基础值上下对称敏感性计算。",
          en: "The upside case is calculated as a symmetric sensitivity around base only when a valid downside value exists."
        }
      ],
      limitations: [
        {
          zh: "结论仅使用提交输入与既有确定性评分；AI 无权修改分数、状态、优先级或管理层建议。",
          en: "The conclusion uses submitted inputs and the existing deterministic score only; AI cannot alter scores, statuses, priorities, or the management recommendation."
        },
        {
          zh: "系统不虚构外部行业基准、市场规模、法律意见或当前法规确认。",
          en: "The system does not invent external industry benchmarks, market size, legal opinions, or current regulatory confirmation."
        },
        {
          zh: "所有课程来源仅是方法标识，必须与当前目标国家和企业原始证据分开核验。",
          en: "All course sources are methodology handles and must be verified separately from current country and company evidence."
        }
      ]
    }
  };
}

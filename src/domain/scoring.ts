import {
  applicableRequiredFields,
  readPath
} from "./fields";
import { scoreFrameworks } from "./frameworks";
import type {
  ActionResult,
  BilingualLabel,
  BusinessInput,
  BusinessScore,
  DimensionId,
  DimensionResult,
  FindingResult,
  GateResult,
  GateStatus,
  MetricResult
} from "./types";

export const DEFAULT_WEIGHTS: Record<DimensionId, number> = {
  market_customer: 14,
  strategy_differentiation: 12,
  country_compliance: 8,
  channels_digital: 9,
  location_trade_area: 9,
  merchandise_supply_chain: 12,
  financial_unit_economics: 16,
  marketing_crm_service: 9,
  organization_execution: 6,
  risk_sustainability: 5
};

export const DIGITAL_WEIGHTS: Record<DimensionId, number> = {
  market_customer: 15,
  strategy_differentiation: 12,
  country_compliance: 8,
  channels_digital: 12,
  location_trade_area: 0,
  merchandise_supply_chain: 13,
  financial_unit_economics: 18,
  marketing_crm_service: 10,
  organization_execution: 6,
  risk_sustainability: 6
};

const DIMENSION_LABELS: Record<DimensionId, BilingualLabel> = {
  market_customer: { zh: "市场与顾客", en: "Market & customer" },
  strategy_differentiation: {
    zh: "战略与差异化",
    en: "Strategy & differentiation"
  },
  country_compliance: { zh: "国家与合规", en: "Country & compliance" },
  channels_digital: { zh: "渠道与数字化", en: "Channels & digital" },
  location_trade_area: {
    zh: "地点与商圈",
    en: "Location & trade area"
  },
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

const DIMENSION_SOURCES: Record<DimensionId, string[]> = {
  market_customer: ["RM11-C05", "RM11-C06", "GM10-C07", "SM-EXT"],
  strategy_differentiation: [
    "RM11-C02",
    "RM11-C06",
    "SM-TYPES",
    "GM10-C07"
  ],
  country_compliance: [
    "IM12Q-C02",
    "IM12Q-C03",
    "IM12Q-C10",
    "SM-ETH"
  ],
  channels_digital: ["RM11-C03", "RM11-C04", "GM10-C12", "GM10-C15"],
  location_trade_area: ["RM11-C08", "RM11-C09", "RM11-C17"],
  merchandise_supply_chain: [
    "RM11-C10",
    "RM11-C12",
    "RM11-C13",
    "GM10-C08"
  ],
  financial_unit_economics: [
    "RM11-C07",
    "RM11-C14",
    "SM-INT-P46-P50"
  ],
  marketing_crm_service: ["RM11-C11", "RM11-C15", "RM11-C18"],
  organization_execution: [
    "RM11-C16",
    "SM-EXEC-ORG",
    "SM-MON",
    "IM11-C11-C14"
  ],
  risk_sustainability: [
    "SM-ETH",
    "SM-MON",
    "IM12Q-C03",
    "GM10-C17"
  ]
};

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

function narrativePresence(value: string): number {
  const normalized = value.trim().toLowerCase();
  if (
    normalized.length === 0 ||
    ["unknown", "未知", "tbd", "n/a"].includes(normalized)
  ) {
    return 0;
  }
  // Narrative fields establish coverage only. Their length must never imply
  // stronger business performance; structured theory inputs carry the score.
  return 50;
}

function present(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return narrativePresence(value) > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return value !== undefined && value !== null;
}

function gatePoints(status: GateStatus): number {
  return {
    pass: 100,
    review: 55,
    unknown: 25,
    fail: 0
  }[status];
}

function ratioScore(
  value: number | null,
  thresholds: { strong: number; caution: number },
  direction: "higher" | "lower" = "higher"
): number {
  if (value === null || !Number.isFinite(value)) return 20;
  if (direction === "higher") {
    if (value >= thresholds.strong) return 100;
    if (value >= thresholds.caution) return 65;
    return 25;
  }
  if (value <= thresholds.strong) return 100;
  if (value <= thresholds.caution) return 65;
  return 25;
}

function metricStatus(
  value: number | null,
  strong: number,
  caution: number,
  direction: "higher" | "lower"
): MetricResult["status"] {
  if (value === null || !Number.isFinite(value)) return "unknown";
  if (direction === "higher") {
    if (value >= strong) return "strong";
    if (value >= caution) return "caution";
    return "risk";
  }
  if (value <= strong) return "strong";
  if (value <= caution) return "caution";
  return "risk";
}

function percent(value: number | null) {
  return value === null ? "—" : `${round(value * 100, 1)}%`;
}

function multiple(value: number | null) {
  return value === null ? "—" : `${round(value, 2)}×`;
}

function calculateMetrics(input: BusinessInput): MetricResult[] {
  const { financial, supply } = input;
  const revenue = financial.monthlyRevenue;
  const grossMargin =
    revenue > 0 ? (revenue - financial.monthlyCogs) / revenue : null;
  const contributionMargin =
    revenue > 0
      ? (revenue -
          financial.monthlyCogs -
          financial.monthlyVariableCosts) /
        revenue
      : null;
  const breakEvenRevenue =
    contributionMargin !== null && contributionMargin > 0
      ? financial.monthlyFixedCosts / contributionMargin
      : null;
  const breakEvenCoverage =
    breakEvenRevenue !== null && breakEvenRevenue > 0
      ? financial.downsideMonthlyRevenue / breakEvenRevenue
      : null;
  const rentToSales =
    revenue > 0 ? financial.monthlyOccupancyCost / revenue : null;
  const clvCac = financial.cac > 0 ? financial.clv / financial.cac : null;
  const topSupplier = supply.topSupplierShare / 100;
  const serviceLevel = supply.serviceLevel / 100;

  return [
    {
      id: "gross_margin",
      label: { zh: "毛利率", en: "Gross margin" },
      value: grossMargin,
      formattedValue: percent(grossMargin),
      unit: "%",
      status:
        grossMargin === null
          ? "unknown"
          : grossMargin > 0
            ? "strong"
            : "risk",
      interpretation: {
        zh: "用于判断销售扣除 COGS 后的剩余空间；需与同品类、同市场的最新基准比较。",
        en: "Sales remaining after COGS; compare with a current, category- and market-specific benchmark."
      },
      formula: "(Sales − COGS) ÷ Sales",
      provenance: "calculated"
    },
    {
      id: "contribution_margin",
      label: { zh: "贡献毛利率", en: "Contribution margin" },
      value: contributionMargin,
      formattedValue: percent(contributionMargin),
      unit: "%",
      status:
        contributionMargin === null
          ? "unknown"
          : contributionMargin > 0
            ? "strong"
            : "risk",
      interpretation: {
        zh: "贡献毛利必须为正，才能通过销量覆盖固定成本。",
        en: "Contribution margin must be positive for volume to cover fixed costs."
      },
      formula: "(Sales − COGS − variable costs) ÷ Sales",
      provenance: "calculated"
    },
    {
      id: "break_even_coverage",
      label: { zh: "下行情景盈亏平衡覆盖", en: "Downside break-even coverage" },
      value: breakEvenCoverage,
      formattedValue: multiple(breakEvenCoverage),
      unit: "x",
      status: metricStatus(breakEvenCoverage, 1.2, 1, "higher"),
      interpretation: {
        zh: "内部护栏：≥1.2× 较稳健，1.0–1.19× 可行但脆弱，<1.0× 未覆盖。",
        en: "Internal guardrail: ≥1.2× resilient, 1.0–1.19× viable but fragile, <1.0× uncovered."
      },
      formula: "Downside sales ÷ Break-even sales",
      provenance: "calculated"
    },
    {
      id: "rent_to_sales",
      label: { zh: "租售比", en: "Rent-to-sales" },
      value: rentToSales,
      formattedValue: percent(rentToSales),
      unit: "%",
      status: metricStatus(rentToSales, 0.1, 0.15, "lower"),
      interpretation: {
        zh: "内部护栏：≤10% 健康，10–15% 需关注，>15% 风险；须按业态校准。",
        en: "Internal guardrail: ≤10% healthy, 10–15% caution, >15% risk; calibrate by format."
      },
      formula: "Monthly occupancy cost ÷ Monthly sales",
      provenance: "calculated"
    },
    {
      id: "cash_runway",
      label: { zh: "现金跑道", en: "Cash runway" },
      value: financial.cashRunwayMonths,
      formattedValue: `${round(financial.cashRunwayMonths, 1)} ${
        financial.cashRunwayMonths === 1 ? "month" : "months"
      }`,
      unit: "months",
      status: metricStatus(financial.cashRunwayMonths, 6, 3, "higher"),
      interpretation: {
        zh: "内部护栏：≥6 个月较稳健，3–5 个月需关注，<3 个月为关键风险。",
        en: "Internal guardrail: ≥6 months resilient, 3–5 caution, <3 critical risk."
      },
      formula: "Submitted runway; cross-checked against funding and burn",
      provenance: "submitted"
    },
    {
      id: "clv_cac",
      label: { zh: "CLV:CAC", en: "CLV:CAC" },
      value: clvCac,
      formattedValue: multiple(clvCac),
      unit: "x",
      status: metricStatus(clvCac, 3, 1, "higher"),
      interpretation: {
        zh: "内部护栏：≥3× 较强，1–2.99× 需验证，<1× 不可持续。",
        en: "Internal guardrail: ≥3× strong, 1–2.99× validate, <1× unsustainable."
      },
      formula: "Customer lifetime value ÷ Customer acquisition cost",
      provenance: "calculated"
    },
    {
      id: "top_supplier_share",
      label: { zh: "最大供应商占比", en: "Top-supplier share" },
      value: topSupplier,
      formattedValue: percent(topSupplier),
      unit: "%",
      status: metricStatus(topSupplier, 0.35, 0.6, "lower"),
      interpretation: {
        zh: "内部护栏：≤35% 较有韧性，35–60% 需关注，>60% 集中风险。",
        en: "Internal guardrail: ≤35% resilient, 35–60% caution, >60% concentration risk."
      },
      formula: "Largest supplier purchases ÷ Total purchases",
      provenance: "submitted"
    },
    {
      id: "service_level",
      label: { zh: "库存服务水平", en: "Inventory service level" },
      value: serviceLevel,
      formattedValue: percent(serviceLevel),
      unit: "%",
      status: metricStatus(serviceLevel, 0.95, 0.9, "higher"),
      interpretation: {
        zh: "内部护栏：≥95% 较强，90–94% 需关注，<90% 有缺货风险。",
        en: "Internal guardrail: ≥95% strong, 90–94% caution, <90% stockout risk."
      },
      formula: "Items sold ÷ Items demanded",
      provenance: "submitted"
    }
  ];
}

const GATE_CONFIG: Array<{
  id: Exclude<keyof BusinessInput["compliance"], "currentEvidence">;
  label: BilingualLabel;
}> = [
  { id: "ownership", label: { zh: "合法经营与外资持股", en: "Legal operation & ownership" } },
  { id: "licences", label: { zh: "许可与场地批准", en: "Licensing & site approval" } },
  { id: "productSafety", label: { zh: "产品与顾客安全", en: "Product & customer safety" } },
  { id: "privacyPayment", label: { zh: "隐私、数据与支付", en: "Privacy, data & payments" } },
  { id: "labourSupplier", label: { zh: "劳动与供应商合规", en: "Labour & supplier compliance" } },
  { id: "fxTreasury", label: { zh: "外汇与资金汇回", en: "FX & treasury access" } },
  { id: "infrastructure", label: { zh: "关键基础设施", en: "Critical infrastructure" } },
  { id: "ethicsSanctions", label: { zh: "伦理、反贿赂与制裁", en: "Ethics, anti-bribery & sanctions" } }
];

function calculateGates(input: BusinessInput): GateResult[] {
  return GATE_CONFIG.map(({ id, label }) => {
    const status = input.compliance[id];
    const reason = {
      pass: {
        zh: "用户标记为已核实通过；正式决策前仍应保留有日期的权威证据。",
        en: "Marked verified by the user; retain dated authoritative evidence before a final decision."
      },
      review: {
        zh: "存在可缓解但尚未关闭的问题，进入或投资决定应设为有条件。",
        en: "A potentially remediable issue remains open; entry or investment should stay conditional."
      },
      fail: {
        zh: "已确认失败，不能由其他高分抵消；必须先重构方案或停止。",
        en: "Confirmed failure cannot be offset by other scores; redesign or stop before proceeding."
      },
      unknown: {
        zh: "关键事实未知，系统不会把未知自动当作通过。",
        en: "A critical fact is unknown; the system never converts unknown into pass."
      }
    }[status];

    return { id, label, status, reason };
  });
}

function numericalCompleteness(input: BusinessInput): number {
  const values = [
    input.financial.monthlyRevenue,
    input.financial.monthlyCogs,
    input.financial.monthlyFixedCosts,
    input.financial.monthlyUnits,
    input.financial.averagePrice,
    input.financial.launchCapex,
    input.financial.workingCapitalNeed,
    input.financial.fundingAvailable,
    input.financial.cashRunwayMonths,
    input.financial.downsideMonthlyRevenue,
    input.supply.supplierCount,
    input.supply.leadTimeDays,
    input.supply.serviceLevel
  ];
  if (input.model.type !== "digital") {
    values.push(
      input.channelLocation.footfallPerMonth,
      input.channelLocation.usableArea,
      input.channelLocation.annualOccupancyCost,
      input.channelLocation.annualSiteSalesForecast
    );
  }
  return average(values.map((value) => (value > 0 ? 100 : 0)));
}

function calculateCompleteness(input: BusinessInput): number {
  const fields = applicableRequiredFields(input);
  const textCompleteness = average(
    fields.map((field) => (present(readPath(input, field.path)) ? 100 : 0))
  );
  const gateCompleteness = average(
    GATE_CONFIG.map(({ id }) =>
      input.compliance[id] === "unknown" ? 0 : 100
    )
  );
  return round(
    textCompleteness * 0.58 +
      numericalCompleteness(input) * 0.27 +
      gateCompleteness * 0.15
  );
}

function calculateConsistency(input: BusinessInput): number {
  const checks: boolean[] = [];
  const { financial, channelLocation } = input;

  checks.push(financial.monthlyCogs <= financial.monthlyRevenue);
  checks.push(
    financial.monthlyCogs + financial.monthlyVariableCosts <=
      financial.monthlyRevenue
  );
  checks.push(
    financial.monthlyUnits === 0 ||
      financial.averagePrice === 0 ||
      Math.abs(
        financial.monthlyUnits * financial.averagePrice -
          financial.monthlyRevenue
      ) /
        Math.max(financial.monthlyRevenue, 1) <=
        0.35
  );
  checks.push(
    financial.monthlyBurn === 0 ||
      financial.fundingAvailable === 0 ||
      Math.abs(
        financial.fundingAvailable / financial.monthlyBurn -
          financial.cashRunwayMonths
      ) <= 2
  );
  checks.push(
    financial.monthlyRevenue === 0 ||
      financial.monthlyOccupancyCost <= financial.monthlyRevenue
  );
  if (input.model.type !== "digital") {
    checks.push(
      channelLocation.annualSiteSalesForecast === 0 ||
        channelLocation.annualOccupancyCost <=
          channelLocation.annualSiteSalesForecast
    );
  }

  return average(checks.map((check) => (check ? 100 : 0)));
}

function evidenceQuality(input: BusinessInput): number {
  const confidence = {
    low: 40,
    medium: 70,
    high: 100
  }[input.riskEvidence.evidenceConfidence];
  const source = narrativePresence(input.riskEvidence.evidenceSource);
  const date = /^\d{4}[-/]\d{1,2}([-/]\d{1,2})?$/.test(
    input.riskEvidence.evidenceDate.trim()
  )
    ? 100
    : 45;
  const compliance = narrativePresence(input.compliance.currentEvidence);
  return average([confidence, source, date, compliance]);
}

function normalizedScale(
  value: number,
  minimum: number,
  maximum: number
): number {
  if (!Number.isFinite(value) || maximum <= minimum) return 0;
  return clamp(((value - minimum) / (maximum - minimum)) * 100);
}

function structuredTheorySignals(input: BusinessInput) {
  const enterprise = input.enterprise;
  const fiveForces = Object.values(enterprise.fiveForces);
  const industryAttractiveness =
    100 - normalizedScale(average(fiveForces), 1, 5);
  const segmentAttractiveness = normalizedScale(
    average(Object.values(enterprise.stp.segmentAttractiveness)),
    1,
    5
  );
  const rightToWin = normalizedScale(
    average(Object.values(enterprise.stp.rightToWin)),
    1,
    5
  );
  const positioning = normalizedScale(
    average(Object.values(enterprise.stp.position)),
    1,
    5
  );

  const cpmWeightTotal = enterprise.cpm.factors.reduce(
    (sum, factor) => sum + factor.weight,
    0
  );
  const cpmValid =
    enterprise.cpm.factors.length >= 3 &&
    Math.abs(cpmWeightTotal - 1) <= 0.001;
  const cpmCompanyRating = cpmValid
    ? enterprise.cpm.factors.reduce(
        (sum, factor) => sum + factor.weight * factor.companyRating,
        0
      )
    : null;
  const cpmRelativeStrength =
    cpmCompanyRating === null
      ? 0
      : normalizedScale(cpmCompanyRating, 1, 4);

  const entryModeFit = Math.max(
    ...enterprise.entryModes.map((mode) =>
      normalizedScale(average(Object.values(mode.fit)), 1, 5)
    )
  );

  const perceptionAverage = average(
    Object.values(enterprise.serviceGaps.perceptions)
  );
  const serviceGapAverage = average(
    Object.keys(enterprise.serviceGaps.expectations).map((key) => {
      const dimension =
        key as keyof typeof enterprise.serviceGaps.expectations;
      return (
        enterprise.serviceGaps.perceptions[dimension] -
        enterprise.serviceGaps.expectations[dimension]
      );
    })
  );
  const customerServiceDelivery = average([
    normalizedScale(perceptionAverage, 1, 7),
    clamp(100 - (Math.max(0, -serviceGapAverage) / 6) * 100)
  ]);
  const organizationalServiceReadiness =
    100 -
    normalizedScale(
      average(
        Object.values(enterprise.serviceGaps.organizationGaps)
      ),
      1,
      5
    );

  const controlCoverage = average([
    enterprise.organizationControl.policyCoveragePct,
    enterprise.organizationControl.processCoveragePct,
    enterprise.organizationControl.kpiCoveragePct
  ]);
  const riskControlReadiness = average([
    enterprise.topRisk.controlEffectivenessPct,
    enterprise.topRisk.kriDefined ? 100 : 0,
    enterprise.topRisk.triggerDefined ? 100 : 0,
    enterprise.topRisk.contingencyFunded ? 100 : 0
  ]);
  const financeDataReadiness = average([
    Number.isFinite(enterprise.financeProductivity.monthlyNetProfit)
      ? 100
      : 0,
    enterprise.financeProductivity.totalAssets > 0 ? 100 : 0,
    enterprise.financeProductivity.averageInventory > 0 ? 100 : 0
  ]);

  return {
    industryAttractiveness,
    segmentAttractiveness,
    rightToWin,
    positioning,
    cpmRelativeStrength,
    entryModeFit,
    customerServiceDelivery,
    organizationalServiceReadiness,
    controlCoverage,
    riskControlReadiness,
    financeDataReadiness
  };
}

function calculateDimensionScores(
  input: BusinessInput,
  metrics: MetricResult[],
  weights: Record<DimensionId, number>
): DimensionResult[] {
  const metric = (id: string) => metrics.find((item) => item.id === id);
  const metricPoints = (id: string) => {
    const status = metric(id)?.status;
    return { strong: 100, caution: 65, risk: 25, unknown: 20 }[
      status ?? "unknown"
    ];
  };
  const texts = (...values: string[]) =>
    average(values.map(narrativePresence));
  const gates = GATE_CONFIG.map(({ id }) =>
    gatePoints(input.compliance[id])
  );
  const evidence = evidenceQuality(input);
  const physical = input.model.type !== "digital";
  const theory = structuredTheorySignals(input);

  const raw: Record<DimensionId, number> = {
    market_customer: average([
      theory.industryAttractiveness,
      theory.segmentAttractiveness,
      evidence
    ]),
    strategy_differentiation: average([
      theory.rightToWin,
      theory.positioning,
      theory.cpmRelativeStrength,
      texts(
        input.offer.valueProposition,
        input.offer.differentiation,
        input.offer.reasonToBelieve
      )
    ]),
    country_compliance: average([
      average(gates),
      evidence,
      theory.entryModeFit
    ]),
    channels_digital: average([
      texts(
        input.channelLocation.channelRoles,
        input.channelLocation.acquisitionRoute,
        input.channelLocation.fulfilmentRoute
      ),
      input.model.channels.length >= 2
        ? 100
        : input.model.channels.length === 1
          ? 70
          : 0,
      input.channelLocation.digitalConversionRate > 0 ? 100 : 35,
      input.channelLocation.platformFeeRate >= 0 ? 100 : 0
    ]),
    location_trade_area: physical
      ? average([
          texts(
            input.geography.catchment,
            input.channelLocation.siteType
          ),
          input.channelLocation.footfallPerMonth > 0 ? 100 : 20,
          input.channelLocation.storeConversionRate > 0 ? 100 : 20,
          input.channelLocation.usableArea > 0 ? 100 : 20,
          input.channelLocation.annualSiteSalesForecast > 0 ? 100 : 20,
          metricPoints("rent_to_sales")
        ])
      : 0,
    merchandise_supply_chain: average([
      texts(
        input.offer.assortment,
        input.supply.inventoryPlan,
        input.supply.qualityLogisticsRisk,
        input.supply.mitigation
      ),
      input.supply.supplierCount >= 2 ? 100 : input.supply.supplierCount === 1 ? 45 : 15,
      metricPoints("top_supplier_share"),
      metricPoints("service_level"),
      input.supply.leadTimeDays > 0 ? 80 : 20,
      ratioScore(input.supply.stockoutRate, { strong: 5, caution: 10 }, "lower")
    ]),
    financial_unit_economics: average([
      metricPoints("gross_margin"),
      metricPoints("contribution_margin"),
      metricPoints("break_even_coverage"),
      metricPoints("rent_to_sales"),
      metricPoints("cash_runway"),
      metricPoints("clv_cac"),
      numericalCompleteness(input),
      input.financial.downsideMonthlyRevenue > 0 ? 100 : 20,
      theory.financeDataReadiness
    ]),
    marketing_crm_service: average([
      theory.customerServiceDelivery,
      theory.organizationalServiceReadiness,
      metricPoints("clv_cac"),
      texts(
        input.marketing.servicePromise,
        input.marketing.complaintReturnsProcess
      )
    ]),
    organization_execution: average([
      theory.controlCoverage,
      texts(
        input.organization.teamAndKeyRoles,
        input.organization.retailCountryExperience,
        input.organization.capabilityGaps,
        input.organization.localPartner,
        input.organization.decisionRights,
        input.organization.milestones,
        input.organization.kpiOwners
      ),
      narrativePresence(input.identity.decisionHorizon),
      narrativePresence(input.identity.objective)
    ]),
    risk_sustainability: average([
      theory.riskControlReadiness,
      evidence,
      metricPoints("top_supplier_share"),
      input.financial.downsideMonthlyRevenue > 0 ? 100 : 20,
      average(gates)
    ])
  };

  return (Object.keys(raw) as DimensionId[]).map((id) => {
    const applicable = id !== "location_trade_area" || physical;
    const score = applicable ? round(clamp(raw[id])) : 0;
    return {
      id,
      label: DIMENSION_LABELS[id],
      weight: weights[id],
      score,
      weightedPoints: round((score * weights[id]) / 100, 2),
      applicable,
      evidenceHandles: DIMENSION_SOURCES[id],
      rationale: {
        zh: applicable
          ? "由结构化理论输入、已提交事实、证据质量与已披露的内部指标护栏程序化计算；自由文本长度不影响分数。"
          : "纯线上模式不适用，权重已按固定规则重新分配。",
        en: applicable
          ? "Calculated programmatically from structured theory inputs, submitted facts, evidence quality, and disclosed internal guardrails; narrative length has no effect."
          : "Not applicable to a digital-only model; weight is redistributed by a fixed rule."
      }
    };
  });
}

function getBand(score: number): BusinessScore["band"] {
  if (score >= 85)
    return {
      id: "robust",
      label: { zh: "稳健", en: "Robust" }
    };
  if (score >= 70)
    return {
      id: "promising",
      label: { zh: "有潜力，但有实质缺口", en: "Promising, material gaps" }
    };
  if (score >= 55)
    return {
      id: "conditional",
      label: { zh: "有条件可行", en: "Conditional" }
    };
  if (score >= 40)
    return {
      id: "fragile",
      label: { zh: "脆弱", en: "Fragile" }
    };
  return {
    id: "high_risk",
    label: { zh: "高风险", en: "High risk" }
  };
}

function findingFor(
  dimension: DimensionResult,
  strength: boolean
): FindingResult {
  const levelZh = strength
    ? "已形成可用基础"
    : dimension.score < 55
      ? "存在关键缺口"
      : dimension.score < 70
        ? "存在实质缺口"
        : "仍有改进空间";
  const levelEn = strength
    ? "has a usable foundation"
    : dimension.score < 55
      ? "has a critical gap"
      : dimension.score < 70
        ? "has a material gap"
        : "still has room to improve";
  return {
    id: `${strength ? "strength" : "gap"}-${dimension.id}`,
    dimension: dimension.id,
    title: dimension.label,
    detail: {
      zh: `${dimension.label.zh}${levelZh}（${round(dimension.score)} / 100），结论仍需与列出的证据来源一起阅读。`,
      en: `${dimension.label.en} ${levelEn} (${round(dimension.score)} / 100); read the result together with the listed evidence.`
    },
    evidence: dimension.evidenceHandles
  };
}

function buildFindings(dimensions: DimensionResult[]) {
  const applicable = dimensions.filter(({ applicable }) => applicable);
  const sorted = [...applicable].sort((a, b) => b.score - a.score);
  const strengthPool = sorted.filter(({ score }) => score >= 72);
  const gapPool = [...sorted].reverse().filter(({ score }) => score < 85);
  const strengths = (strengthPool.length > 0 ? strengthPool : sorted.slice(0, 3))
    .slice(0, 5)
    .map((dimension) => findingFor(dimension, true));
  const gaps = (gapPool.length > 0 ? gapPool : [...sorted].reverse().slice(0, 3))
    .slice(0, 5)
    .map((dimension) => findingFor(dimension, false));
  return { strengths, gaps };
}

function actionForDimension(
  dimension: DimensionResult,
  index: number
): ActionResult {
  const priority: ActionResult["priority"] =
    dimension.score < 45 ? "P0" : dimension.score < 65 ? "P1" : "P2";
  return {
    id: `action-${dimension.id}`,
    priority,
    dimension: dimension.id,
    action: {
      zh: `补强“${dimension.label.zh}”：先验证最低分指标，再进行下一笔扩大投入。`,
      en: `Strengthen ${dimension.label.en}: validate the lowest-scoring indicator before the next scale investment.`
    },
    rationale: {
      zh: `该维度当前为 ${round(dimension.score)} / 100，按影响与证据缺口排序第 ${index + 1}。`,
      en: `This dimension is ${round(dimension.score)} / 100 and ranks ${index + 1} by impact and evidence gap.`
    },
    owner: {
      zh:
        dimension.id === "financial_unit_economics"
          ? "财务负责人"
          : dimension.id === "country_compliance"
            ? "合规负责人"
            : "业务负责人",
      en:
        dimension.id === "financial_unit_economics"
          ? "Finance lead"
          : dimension.id === "country_compliance"
            ? "Compliance lead"
            : "Business lead"
    },
    horizon: {
      zh: priority === "P0" ? "0–14 天" : priority === "P1" ? "15–45 天" : "46–90 天",
      en: priority === "P0" ? "0–14 days" : priority === "P1" ? "15–45 days" : "46–90 days"
    },
    kpi: {
      zh: `完成该维度全部关键证据，并将规则分提升到至少 ${Math.min(75, Math.ceil(dimension.score / 5) * 5 + 10)}。`,
      en: `Complete all critical evidence and lift the deterministic dimension score to at least ${Math.min(75, Math.ceil(dimension.score / 5) * 5 + 10)}.`
    },
    evidence: dimension.evidenceHandles
  };
}

function buildActions(
  dimensions: DimensionResult[],
  gates: GateResult[]
): ActionResult[] {
  const gateActions = gates
    .filter(({ status }) => status !== "pass")
    .slice(0, 3)
    .map<ActionResult>((gate, index) => ({
      id: `gate-${gate.id}`,
      priority: gate.status === "fail" ? "P0" : "P1",
      dimension: "country_compliance",
      action: {
        zh: `核实并关闭硬门槛“${gate.label.zh}”，保存有日期的权威证据。`,
        en: `Verify and close the ${gate.label.en} hard gate, retaining dated authoritative evidence.`
      },
      rationale: gate.reason,
      owner: { zh: "合规负责人", en: "Compliance lead" },
      horizon: {
        zh: gate.status === "fail" ? "立即" : "0–14 天",
        en: gate.status === "fail" ? "Immediate" : "0–14 days"
      },
      kpi: {
        zh: "门槛状态转为通过，并记录来源、日期与批准人。",
        en: "Gate becomes Pass with source, date, and approver recorded."
      },
      evidence: ["IM12Q-C02", "IM12Q-C10", `GATE-${index + 1}`]
    }));
  const dimensionActions = dimensions
    .filter(({ applicable }) => applicable)
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.max(3, 7 - gateActions.length))
    .map(actionForDimension);
  return [...gateActions, ...dimensionActions].slice(0, 7);
}

export function scoreBusiness(input: BusinessInput): BusinessScore {
  const weights =
    input.model.type === "digital" ? DIGITAL_WEIGHTS : DEFAULT_WEIGHTS;
  const gates = calculateGates(input);
  const metrics = calculateMetrics(input);
  const dimensions = calculateDimensionScores(input, metrics, weights);
  const overallScore = round(
    dimensions.reduce(
      (sum, dimension) => sum + dimension.weightedPoints,
      0
    )
  );
  const completeness = calculateCompleteness(input);
  const confidence = round(
    completeness * 0.45 +
      evidenceQuality(input) * 0.35 +
      calculateConsistency(input) * 0.2
  );
  const gateOutcome: BusinessScore["gateOutcome"] = gates.some(
    ({ status }) => status === "fail"
  )
    ? "blocked"
    : gates.some(({ status }) => status === "unknown")
      ? "incomplete"
      : gates.some(({ status }) => status === "review")
        ? "conditional"
        : "eligible";
  const { strengths, gaps } = buildFindings(dimensions);
  const frameworks = scoreFrameworks(input);
  const dimension = (id: DimensionId) =>
    dimensions.find((item) => item.id === id)?.score ?? 0;

  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    businessName: input.identity.name,
    overallScore,
    band: getBand(overallScore),
    confidence,
    completeness,
    gateOutcome,
    gates,
    weights,
    dimensions,
    metrics,
    strengths,
    gaps,
    actions: buildActions(dimensions, gates),
    frameworks,
    countryAttractiveness: {
      score: round(
        dimension("market_customer") * 0.6 +
          dimension("country_compliance") * 0.4
      ),
      note: {
        zh: "只反映外部市场与国家条件，不包含企业自身执行能力。",
        en: "Reflects external market and country conditions only, excluding firm execution capability."
      }
    },
    firmReadiness: {
      score: round(
        average([
          dimension("strategy_differentiation"),
          dimension("merchandise_supply_chain"),
          dimension("financial_unit_economics"),
          dimension("organization_execution")
        ])
      ),
      note: {
        zh: "只反映企业资源与执行准备度，不代表目标国家吸引力。",
        en: "Reflects internal resources and execution readiness only, not target-country attractiveness."
      }
    },
    entryModeFit: {
      status:
        input.model.candidateEntryMode.trim().length > 0
          ? "hypothesis"
          : "insufficient",
      candidate: input.model.candidateEntryMode,
      note: {
        zh: "进入模式仅作为待验证假设；控制、资本、伙伴、文化距离与监管证据必须单独比较。",
        en: "Entry mode is a hypothesis to validate; control, capital, partner, cultural-distance, and regulatory evidence require separate comparison."
      }
    },
    evidenceCount: new Set([
      ...dimensions.flatMap(({ evidenceHandles }) => evidenceHandles),
      input.riskEvidence.evidenceSource,
      input.compliance.currentEvidence
    ]).size,
    audit: {
      deterministic: true,
      aiMayAlterScore: false,
      methodologyVersion: "1.0",
      warnings: [
        {
          zh: "课程中的美国法律、美元、平方英尺与历史零售案例仅作方法示例，不是当前本地基准。",
          en: "US laws, dollars, square feet, and historical retailer cases in the course are methodological examples, not current local benchmarks."
        },
        {
          zh: "系统已纠正课件中已确认的 IE 轴向/单元格、SPACE 算术、CPM 算术与财务术语错误。",
          en: "The implementation corrects confirmed course errors in IE axes/cells, SPACE arithmetic, CPM arithmetic, and financial terminology."
        }
      ]
    }
  };
}

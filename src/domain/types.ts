export type RetailModel = "physical" | "digital" | "hybrid";
export type BusinessStage =
  | "idea"
  | "pre_launch"
  | "operating"
  | "scaling";
export type GateStatus = "pass" | "review" | "fail" | "unknown";
export type EvidenceConfidence = "low" | "medium" | "high";

export type DimensionId =
  | "market_customer"
  | "strategy_differentiation"
  | "country_compliance"
  | "channels_digital"
  | "location_trade_area"
  | "merchandise_supply_chain"
  | "financial_unit_economics"
  | "marketing_crm_service"
  | "organization_execution"
  | "risk_sustainability";

export interface BilingualLabel {
  zh: string;
  en: string;
}

export interface WeightedFactorInput {
  id: string;
  label: BilingualLabel;
  weight: number;
  rating: number;
  note?: BilingualLabel;
}

export interface QspmFactorInput {
  id: string;
  label: BilingualLabel;
  source: "EFE" | "IFE";
  weight: number;
  attractivenessScores: Array<1 | 2 | 3 | 4 | null>;
}

export interface FiveForcesInput {
  rivalry: number;
  newEntrants: number;
  substitutes: number;
  buyerPower: number;
  supplierPower: number;
}

export interface CpmFactorInput {
  id: string;
  labelZh: string;
  labelEn: string;
  weight: number;
  companyRating: number;
  competitorARating: number;
  competitorBRating: number;
}

export interface StpInput {
  segmentAttractiveness: {
    sizeGrowth: number;
    profitability: number;
    accessibility: number;
    measurability: number;
    strategicFit: number;
  };
  rightToWin: {
    differentiation: number;
    capability: number;
    channelAccess: number;
    credibility: number;
  };
  targetingStrategy:
    | "undifferentiated"
    | "differentiated"
    | "concentrated";
  position: {
    customerClarity: number;
    competitorDistinctiveness: number;
    evidenceStrength: number;
    deliveryConsistency: number;
  };
}

export interface EntryModeFitInput {
  id: string;
  label: BilingualLabel;
  fit: {
    control: number;
    capitalEfficiency: number;
    speed: number;
    adaptation: number;
    ipProtection: number;
    localKnowledge: number;
    partnerFeasibility: number;
    supplyAccess: number;
    exitFlexibility: number;
  };
}

export interface RaterInput {
  reliability: number;
  responsiveness: number;
  assurance: number;
  empathy: number;
  tangibles: number;
}

export interface EnterpriseInput {
  fiveForces: FiveForcesInput;
  cpm: {
    competitorAName: string;
    competitorBName: string;
    factors: CpmFactorInput[];
  };
  stp: StpInput;
  entryModes: EntryModeFitInput[];
  financeProductivity: {
    monthlyNetProfit: number;
    totalAssets: number;
    averageInventory: number;
  };
  serviceGaps: {
    expectations: RaterInput;
    perceptions: RaterInput;
    organizationGaps: {
      knowledge: number;
      standards: number;
      delivery: number;
      communication: number;
    };
  };
  organizationControl: {
    policyCoveragePct: number;
    processCoveragePct: number;
    kpiCoveragePct: number;
    reviewCadenceDays: number;
    varianceTolerancePct: number;
  };
  topRisk: {
    name: BilingualLabel;
    likelihood: number;
    impact: number;
    controlEffectivenessPct: number;
    kriDefined: boolean;
    triggerDefined: boolean;
    contingencyFunded: boolean;
  };
}

export interface BusinessInput {
  identity: {
    name: string;
    category: string;
    stage: BusinessStage;
    objective: string;
    decisionHorizon: string;
  };
  geography: {
    homeCountry: string;
    targetCountry: string;
    stateCity: string;
    catchment: string;
    currency: string;
  };
  model: {
    type: RetailModel;
    retailFormat: string;
    channels: string[];
    candidateEntryMode: string;
  };
  customer: {
    targetSegment: string;
    payerAndUser: string;
    jobOrPain: string;
    buyingOccasion: string;
    currentAlternative: string;
    willingnessToPayEvidence: string;
    marketDemandEvidence: string;
    competitors: string;
  };
  offer: {
    valueProposition: string;
    assortment: string;
    pricePosition: string;
    differentiation: string;
    reasonToBelieve: string;
    growthStrategy: string;
  };
  compliance: {
    ownership: GateStatus;
    licences: GateStatus;
    productSafety: GateStatus;
    privacyPayment: GateStatus;
    labourSupplier: GateStatus;
    fxTreasury: GateStatus;
    infrastructure: GateStatus;
    ethicsSanctions: GateStatus;
    currentEvidence: string;
  };
  channelLocation: {
    channelRoles: string;
    acquisitionRoute: string;
    fulfilmentRoute: string;
    digitalConversionRate: number;
    platformFeeRate: number;
    siteType: string;
    footfallPerMonth: number;
    storeConversionRate: number;
    usableArea: number;
    annualOccupancyCost: number;
    annualSiteSalesForecast: number;
  };
  supply: {
    supplierCount: number;
    topSupplierShare: number;
    leadTimeDays: number;
    serviceLevel: number;
    stockoutRate: number;
    inventoryPlan: string;
    qualityLogisticsRisk: string;
    mitigation: string;
  };
  financial: {
    monthlyRevenue: number;
    monthlyCogs: number;
    monthlyVariableCosts: number;
    monthlyFixedCosts: number;
    monthlyUnits: number;
    averagePrice: number;
    monthlyOccupancyCost: number;
    monthlyMarketingSpend: number;
    launchCapex: number;
    workingCapitalNeed: number;
    fundingAvailable: number;
    monthlyBurn: number;
    cashRunwayMonths: number;
    cac: number;
    clv: number;
    downsideMonthlyRevenue: number;
  };
  marketing: {
    positioning: string;
    acquisitionChannels: string;
    crmRetention: string;
    servicePromise: string;
    complaintReturnsProcess: string;
  };
  organization: {
    teamAndKeyRoles: string;
    retailCountryExperience: string;
    capabilityGaps: string;
    localPartner: string;
    decisionRights: string;
    milestones: string;
    kpiOwners: string;
  };
  riskEvidence: {
    topRisks: string;
    mitigations: string;
    evidenceSource: string;
    evidenceDate: string;
    evidenceConfidence: EvidenceConfidence;
    assumptions: string;
  };
  frameworks: {
    efe: WeightedFactorInput[];
    ife: WeightedFactorInput[];
    qspm: {
      strategies: BilingualLabel[];
      factors: QspmFactorInput[];
    };
  };
  enterprise: EnterpriseInput;
}

export interface GateResult {
  id: keyof BusinessInput["compliance"];
  label: BilingualLabel;
  status: GateStatus;
  reason: BilingualLabel;
}

export interface MetricResult {
  id: string;
  label: BilingualLabel;
  value: number | null;
  formattedValue: string;
  unit: string;
  status: "strong" | "caution" | "risk" | "unknown";
  interpretation: BilingualLabel;
  formula: string;
  provenance: "calculated" | "submitted";
}

export interface FindingResult {
  id: string;
  dimension: DimensionId;
  title: BilingualLabel;
  detail: BilingualLabel;
  evidence: string[];
}

export interface ActionResult {
  id: string;
  priority: "P0" | "P1" | "P2";
  dimension: DimensionId;
  action: BilingualLabel;
  rationale: BilingualLabel;
  owner: BilingualLabel;
  horizon: BilingualLabel;
  kpi: BilingualLabel;
  evidence: string[];
}

export interface DimensionResult {
  id: DimensionId;
  label: BilingualLabel;
  weight: number;
  score: number;
  weightedPoints: number;
  applicable: boolean;
  evidenceHandles: string[];
  rationale: BilingualLabel;
}

export interface FrameworkScore {
  valid: boolean;
  score: number | null;
  weightTotal: number;
  issues: string[];
}

export interface FrameworkResult {
  efe: FrameworkScore;
  ife: FrameworkScore;
  ie: {
    cell: "I" | "II" | "III" | "IV" | "V" | "VI" | "VII" | "VIII" | "IX" | null;
    posture: "grow" | "hold" | "harvest" | null;
  };
  qspm: {
    valid: boolean;
    totals: number[];
    leadingStrategyIndex: number | null;
    issues: string[];
  };
}

export interface BusinessScore {
  version: "1.0";
  generatedAt: string;
  businessName: string;
  overallScore: number;
  band: {
    id: "robust" | "promising" | "conditional" | "fragile" | "high_risk";
    label: BilingualLabel;
  };
  confidence: number;
  completeness: number;
  gateOutcome: "blocked" | "incomplete" | "conditional" | "eligible";
  gates: GateResult[];
  weights: Record<DimensionId, number>;
  dimensions: DimensionResult[];
  metrics: MetricResult[];
  strengths: FindingResult[];
  gaps: FindingResult[];
  actions: ActionResult[];
  frameworks: FrameworkResult;
  countryAttractiveness: {
    score: number;
    note: BilingualLabel;
  };
  firmReadiness: {
    score: number;
    note: BilingualLabel;
  };
  entryModeFit: {
    status: "hypothesis" | "insufficient";
    candidate: string;
    note: BilingualLabel;
  };
  evidenceCount: number;
  audit: {
    deterministic: true;
    aiMayAlterScore: false;
    methodologyVersion: "1.0";
    warnings: BilingualLabel[];
  };
}

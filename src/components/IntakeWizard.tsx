import { useMemo, useState } from "react";
import type { BilingualText, Locale } from "../i18n";
import { text, uiCopy } from "../i18n";

type NumericDraftValue = number | "";

export interface RetailIntakeDraft {
  businessName: string;
  businessCategory: string;
  businessStage: string;
  assessmentObjective: string;
  decisionHorizonMonths: NumericDraftValue;
  businessSummary: string;

  homeCountry: string;
  targetCountry: string;
  targetStateRegion: string;
  targetCity: string;
  catchmentDefinition: string;
  currency: string;
  operatingModel: string;
  retailFormat: string;
  entryMode: string;
  plannedLaunchDate: string;

  targetSegment: string;
  payerUserRelationship: string;
  customerJobPain: string;
  purchaseOccasion: string;
  currentAlternative: string;
  willingnessToPayEvidence: string;
  estimatedCustomerCount: NumericDraftValue;
  demandEvidence: string;

  valueProposition: string;
  assortmentStrategy: string;
  pricingPosition: string;
  differentiationEvidence: string;
  reasonToBelieve: string;
  growthStrategy: string;
  mainCompetitors: string;
  marketEvidence: string;
  marketEvidenceSource: string;
  marketEvidenceDate: string;
  marketEvidenceConfidence: string;

  ownershipGate: string;
  licenseGate: string;
  productSafetyGate: string;
  privacyPaymentGate: string;
  labourSupplierGate: string;
  fxGate: string;
  infrastructureGate: string;
  ethicsGate: string;
  complianceNotes: string;
  salesChannels: string[];
  fulfilmentModel: string;
  channelRoles: string;
  trafficSource: string;
  monthlyTraffic: NumericDraftValue;
  conversionRatePct: NumericDraftValue;
  platformFeeRatePct: NumericDraftValue;

  siteType: string;
  siteAreaSqm: NumericDraftValue;
  monthlyFootfall: NumericDraftValue;
  storeConversionRatePct: NumericDraftValue;
  annualSiteSalesForecast: NumericDraftValue;
  parkingAccess: string;
  visibilityAssessment: string;
  monthlyRent: NumericDraftValue;
  monthlyCommonAreaCharges: NumericDraftValue;
  leaseTermMonths: NumericDraftValue;
  cannibalizationRisk: string;
  supplierCount: NumericDraftValue;
  topSupplierSharePct: NumericDraftValue;
  leadTimeDays: NumericDraftValue;
  inventoryServiceLevelPct: NumericDraftValue;
  inventoryTurnover: NumericDraftValue;
  stockoutRatePct: NumericDraftValue;
  replenishmentModel: string;
  inventoryRisks: string;
  supplyMitigation: string;

  monthlyRevenue: NumericDraftValue;
  monthlyCogs: NumericDraftValue;
  monthlyVariableCost: NumericDraftValue;
  monthlyFixedCost: NumericDraftValue;
  monthlyOccupancyCost: NumericDraftValue;
  monthlyMarketingSpend: NumericDraftValue;
  averageSellingPrice: NumericDraftValue;
  monthlyUnits: NumericDraftValue;
  capex: NumericDraftValue;
  workingCapital: NumericDraftValue;
  fundingAvailable: NumericDraftValue;
  monthlyBurn: NumericDraftValue;
  runwayMonths: NumericDraftValue;
  cac: NumericDraftValue;
  clv: NumericDraftValue;
  downsideRevenuePct: NumericDraftValue;
  downsideCostIncreasePct: NumericDraftValue;
  financialEvidence: string;

  positioningStatement: string;
  acquisitionPlan: string;
  crmRetentionPlan: string;
  servicePromise: string;
  complaintReturnsProcess: string;
  teamSize: NumericDraftValue;
  teamAndKeyRoles: string;
  leadershipRetailExperience: string;
  capabilityGaps: string;
  localPartner: string;
  decisionRights: string;
  keyMilestones: string;
  kpiOwners: string;
  topRisks: string;
  riskMitigation: string;
  evidenceSource: string;
  evidenceAsOfDate: string;
  evidenceConfidence: string;
  assumptionsLimitations: string;

  fiveForcesRivalry: NumericDraftValue;
  fiveForcesNewEntrants: NumericDraftValue;
  fiveForcesSubstitutes: NumericDraftValue;
  fiveForcesBuyerPower: NumericDraftValue;
  fiveForcesSupplierPower: NumericDraftValue;

  cpmCompetitorAName: string;
  cpmCompetitorBName: string;
  cpmFactor1Id: string;
  cpmFactor1LabelZh: string;
  cpmFactor1LabelEn: string;
  cpmFactor1Weight: NumericDraftValue;
  cpmFactor1CompanyRating: NumericDraftValue;
  cpmFactor1CompetitorARating: NumericDraftValue;
  cpmFactor1CompetitorBRating: NumericDraftValue;
  cpmFactor2Id: string;
  cpmFactor2LabelZh: string;
  cpmFactor2LabelEn: string;
  cpmFactor2Weight: NumericDraftValue;
  cpmFactor2CompanyRating: NumericDraftValue;
  cpmFactor2CompetitorARating: NumericDraftValue;
  cpmFactor2CompetitorBRating: NumericDraftValue;
  cpmFactor3Id: string;
  cpmFactor3LabelZh: string;
  cpmFactor3LabelEn: string;
  cpmFactor3Weight: NumericDraftValue;
  cpmFactor3CompanyRating: NumericDraftValue;
  cpmFactor3CompetitorARating: NumericDraftValue;
  cpmFactor3CompetitorBRating: NumericDraftValue;
  cpmExtraFactorsJson: string;

  stpSegmentSizeGrowth: NumericDraftValue;
  stpSegmentProfitability: NumericDraftValue;
  stpSegmentAccessibility: NumericDraftValue;
  stpSegmentMeasurability: NumericDraftValue;
  stpSegmentStrategicFit: NumericDraftValue;
  stpRightToWinDifferentiation: NumericDraftValue;
  stpRightToWinCapability: NumericDraftValue;
  stpRightToWinChannelAccess: NumericDraftValue;
  stpRightToWinCredibility: NumericDraftValue;
  stpTargetingStrategy: string;
  stpPositionCustomerClarity: NumericDraftValue;
  stpPositionCompetitorDistinctiveness: NumericDraftValue;
  stpPositionEvidenceStrength: NumericDraftValue;
  stpPositionDeliveryConsistency: NumericDraftValue;

  entryMode1Id: string;
  entryMode1LabelZh: string;
  entryMode1LabelEn: string;
  entryMode1Control: NumericDraftValue;
  entryMode1CapitalEfficiency: NumericDraftValue;
  entryMode1Speed: NumericDraftValue;
  entryMode1Adaptation: NumericDraftValue;
  entryMode1IpProtection: NumericDraftValue;
  entryMode1LocalKnowledge: NumericDraftValue;
  entryMode1PartnerFeasibility: NumericDraftValue;
  entryMode1SupplyAccess: NumericDraftValue;
  entryMode1ExitFlexibility: NumericDraftValue;
  entryMode2Id: string;
  entryMode2LabelZh: string;
  entryMode2LabelEn: string;
  entryMode2Control: NumericDraftValue;
  entryMode2CapitalEfficiency: NumericDraftValue;
  entryMode2Speed: NumericDraftValue;
  entryMode2Adaptation: NumericDraftValue;
  entryMode2IpProtection: NumericDraftValue;
  entryMode2LocalKnowledge: NumericDraftValue;
  entryMode2PartnerFeasibility: NumericDraftValue;
  entryMode2SupplyAccess: NumericDraftValue;
  entryMode2ExitFlexibility: NumericDraftValue;

  enterpriseMonthlyNetProfit: NumericDraftValue;
  enterpriseTotalAssets: NumericDraftValue;
  enterpriseAverageInventory: NumericDraftValue;

  serviceExpectationReliability: NumericDraftValue;
  serviceExpectationResponsiveness: NumericDraftValue;
  serviceExpectationAssurance: NumericDraftValue;
  serviceExpectationEmpathy: NumericDraftValue;
  serviceExpectationTangibles: NumericDraftValue;
  servicePerceptionReliability: NumericDraftValue;
  servicePerceptionResponsiveness: NumericDraftValue;
  servicePerceptionAssurance: NumericDraftValue;
  servicePerceptionEmpathy: NumericDraftValue;
  servicePerceptionTangibles: NumericDraftValue;
  organizationGapKnowledge: NumericDraftValue;
  organizationGapStandards: NumericDraftValue;
  organizationGapDelivery: NumericDraftValue;
  organizationGapCommunication: NumericDraftValue;

  controlPolicyCoveragePct: NumericDraftValue;
  controlProcessCoveragePct: NumericDraftValue;
  controlKpiCoveragePct: NumericDraftValue;
  controlReviewCadenceDays: NumericDraftValue;
  controlVarianceTolerancePct: NumericDraftValue;

  topRiskNameZh: string;
  topRiskNameEn: string;
  topRiskLikelihood: NumericDraftValue;
  topRiskImpact: NumericDraftValue;
  topRiskControlEffectivenessPct: NumericDraftValue;
  topRiskKriDefined: string;
  topRiskTriggerDefined: string;
  topRiskContingencyFunded: string;
}

export type RetailIntakeFieldKey = keyof RetailIntakeDraft;

type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkboxes";

export interface IntakeOption {
  value: string;
  label: BilingualText;
}

export interface IntakeFieldDefinition {
  key: RetailIntakeFieldKey;
  label: BilingualText;
  type: FieldType;
  required?: boolean;
  full?: boolean;
  placeholder?: BilingualText;
  help?: BilingualText;
  options?: IntakeOption[];
  min?: number;
  max?: number;
  step?: number;
  showWhen?: (draft: RetailIntakeDraft) => boolean;
}

export interface IntakeSectionDefinition {
  title: BilingualText;
  description?: BilingualText;
  fields: IntakeFieldDefinition[];
}

export interface IntakeStepDefinition {
  id: string;
  title: BilingualText;
  shortTitle: BilingualText;
  description: BilingualText;
  sections: IntakeSectionDefinition[];
}

export interface StepCoverage {
  stepId: string;
  completed: number;
  total: number;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
}

export interface DraftCoverage {
  completed: number;
  total: number;
  percent: number;
  requiredCompleted: number;
  requiredTotal: number;
  missingRequired: RetailIntakeFieldKey[];
  byStep: StepCoverage[];
}

export interface IntakeWizardProps {
  locale: Locale;
  value: RetailIntakeDraft;
  onChange: (next: RetailIntakeDraft) => void;
  onSave: (draft: RetailIntakeDraft) => void | Promise<void>;
  onSubmit: (draft: RetailIntakeDraft) => void | Promise<void>;
  onLoadDemo: () => void;
  submitting?: boolean;
  savedAt?: string | null;
}

const option = (
  value: string,
  zh: string,
  en: string
): IntakeOption => ({
  value,
  label: { zh, en }
});

const stageOptions = [
  option("idea", "构想", "Idea"),
  option("pre_launch", "筹备期", "Pre-launch"),
  option("operating", "运营中", "Operating"),
  option("scaling", "扩张期", "Scaling")
];

const objectiveOptions = [
  option("go_no_go", "投资 / 上线决策", "Go / no-go decision"),
  option("market_entry", "进入新市场", "Market entry"),
  option("site_selection", "选址评估", "Site selection"),
  option("performance", "经营改善", "Performance improvement"),
  option("fundraising", "融资准备", "Fundraising readiness")
];

const operatingModelOptions = [
  option("physical", "实体零售", "Physical retail"),
  option("digital", "纯线上零售", "Digital-only retail"),
  option("hybrid", "线上线下一体", "Hybrid / omnichannel")
];

const entryModeOptions = [
  option("organic", "自建 / 有机进入", "Organic entry"),
  option("acquisition", "收购", "Acquisition"),
  option("franchise", "特许经营", "Franchise"),
  option("licensing", "许可经营", "Licensing"),
  option("joint_venture", "合资", "Joint venture"),
  option("existing_operation", "现有本地业务", "Existing local operation"),
  option("other", "其他（请在摘要说明）", "Other (explain in summary)")
];

const confidenceOptions = [
  option("high", "高：可追溯的一手或审计数据", "High: traceable primary or audited data"),
  option("medium", "中：可靠二手或内部估算", "Medium: credible secondary data or internal estimate"),
  option("low", "低：早期假设，尚未验证", "Low: early assumption, not yet validated")
];

const gateOptions = [
  option("pass", "已确认可行", "Pass / cleared"),
  option("review", "有条件或需要复核", "Conditional / review"),
  option("unknown", "尚未核实", "Unknown / unverified"),
  option("fail", "当前受阻", "Fail / blocked")
];

const channelOptions = [
  option("store", "门店", "Store"),
  option("ecommerce", "自营电商", "Owned e-commerce"),
  option("marketplace", "第三方平台", "Marketplace"),
  option("social", "社交商务", "Social commerce"),
  option("popup", "快闪 / 活动", "Pop-up / event"),
  option("wholesale", "批发 / B2B", "Wholesale / B2B")
];

const forceIntensityOptions = [
  option("1", "1 — 压力很低", "1 — Very low pressure"),
  option("2", "2 — 压力较低", "2 — Low pressure"),
  option("3", "3 — 压力中等", "3 — Moderate pressure"),
  option("4", "4 — 压力较高", "4 — High pressure"),
  option("5", "5 — 压力很高", "5 — Very high pressure")
];

const strengthFiveOptions = [
  option("1", "1 — 很弱", "1 — Very weak"),
  option("2", "2 — 较弱", "2 — Weak"),
  option("3", "3 — 中等", "3 — Moderate"),
  option("4", "4 — 较强", "4 — Strong"),
  option("5", "5 — 很强", "5 — Very strong")
];

const severityFiveOptions = [
  option("1", "1 — 轻微", "1 — Minor"),
  option("2", "2 — 较低", "2 — Low"),
  option("3", "3 — 中等", "3 — Moderate"),
  option("4", "4 — 严重", "4 — Severe"),
  option("5", "5 — 关键缺口", "5 — Critical gap")
];

const cpmRatingOptions = [
  option("1", "1 — 主要弱点", "1 — Major weakness"),
  option("2", "2 — 次要弱点", "2 — Minor weakness"),
  option("3", "3 — 次要优势", "3 — Minor strength"),
  option("4", "4 — 主要优势", "4 — Major strength")
];

const raterOptions = [
  option("1", "1 — 很低", "1 — Very low"),
  option("2", "2 — 低", "2 — Low"),
  option("3", "3 — 较低", "3 — Moderately low"),
  option("4", "4 — 中等", "4 — Neutral"),
  option("5", "5 — 较高", "5 — Moderately high"),
  option("6", "6 — 高", "6 — High"),
  option("7", "7 — 很高", "7 — Very high")
];

const targetingStrategyOptions = [
  option("undifferentiated", "无差异目标市场", "Undifferentiated targeting"),
  option("differentiated", "差异化多细分市场", "Differentiated targeting"),
  option("concentrated", "集中单一细分市场", "Concentrated targeting")
];

const yesNoOptions = [
  option("yes", "是", "Yes"),
  option("no", "否", "No")
];

const isPhysicalModel = (draft: RetailIntakeDraft) =>
  draft.operatingModel === "physical" ||
  draft.operatingModel === "hybrid";

const field = (
  definition: IntakeFieldDefinition
): IntakeFieldDefinition => definition;

const scoredSelect = (
  key: RetailIntakeFieldKey,
  zh: string,
  en: string,
  options: IntakeOption[],
  help?: BilingualText
) =>
  field({
    key,
    label: { zh, en },
    type: "select",
    required: true,
    options,
    help
  });

const requiredNumber = (
  key: RetailIntakeFieldKey,
  zh: string,
  en: string,
  min = 0,
  max?: number,
  step = 0.01
) =>
  field({
    key,
    label: { zh, en },
    type: "number",
    required: true,
    min,
    max,
    step
  });

export const intakeSteps: IntakeStepDefinition[] = [
  {
    id: "business",
    title: { zh: "业务与评估任务", en: "Business & decision brief" },
    shortTitle: { zh: "业务", en: "Business" },
    description: {
      zh: "先说明要评估什么、处于哪个阶段，以及本次决策的时间边界。",
      en: "Define what is being assessed, its stage, and the time boundary of the decision."
    },
    sections: [
      {
        title: { zh: "基本身份", en: "Business identity" },
        description: {
          zh: "必填项决定报告的分析对象和适用范围。",
          en: "Required items define the subject and scope of the report."
        },
        fields: [
          field({
            key: "businessName",
            label: { zh: "业务 / 品牌名称", en: "Business / brand name" },
            type: "text",
            required: true,
            placeholder: { zh: "例如：社区生鲜店", en: "e.g. Neighbourhood grocer" }
          }),
          field({
            key: "businessCategory",
            label: { zh: "零售品类", en: "Retail category" },
            type: "text",
            required: true,
            placeholder: { zh: "例如：食品杂货、美妆、服装", en: "e.g. Grocery, beauty, apparel" }
          }),
          field({
            key: "businessStage",
            label: { zh: "当前阶段", en: "Current stage" },
            type: "select",
            required: true,
            options: stageOptions
          }),
          field({
            key: "assessmentObjective",
            label: { zh: "本次评估目的", en: "Assessment objective" },
            type: "select",
            required: true,
            options: objectiveOptions
          }),
          field({
            key: "decisionHorizonMonths",
            label: { zh: "决策周期（月）", en: "Decision horizon (months)" },
            type: "number",
            required: true,
            min: 1,
            max: 120,
            step: 1,
            help: {
              zh: "报告会按此周期判断里程碑和风险紧迫度。",
              en: "This anchors milestone timing and risk urgency."
            }
          }),
          field({
            key: "businessSummary",
            label: { zh: "业务模型摘要", en: "Business model summary" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "说明卖什么、卖给谁、如何交付、如何赚钱，以及当前最关键的决策。",
              en: "Explain what you sell, to whom, how it is delivered, how it earns money, and the key decision."
            }
          })
        ]
      }
    ]
  },
  {
    id: "market",
    title: { zh: "国家、城市与经营形态", en: "Market, city & operating model" },
    shortTitle: { zh: "市场", en: "Market" },
    description: {
      zh: "国家和城市必须明确；法规、成本和需求不可跨市场直接套用。",
      en: "Country and city are mandatory because regulations, costs, and demand do not transfer automatically."
    },
    sections: [
      {
        title: { zh: "地理边界", en: "Geographic boundary" },
        fields: [
          field({
            key: "homeCountry",
            label: { zh: "总部 / 原始市场国家", en: "Home country / origin market" },
            type: "text",
            required: true,
            placeholder: { zh: "写国家全名", en: "Enter the full country name" }
          }),
          field({
            key: "targetCountry",
            label: { zh: "目标国家", en: "Target country" },
            type: "text",
            required: true,
            placeholder: { zh: "写国家全名", en: "Enter the full country name" }
          }),
          field({
            key: "targetStateRegion",
            label: { zh: "州 / 省 / 区域", en: "State / province / region" },
            type: "text",
            required: true
          }),
          field({
            key: "targetCity",
            label: { zh: "目标城市", en: "Target city" },
            type: "text",
            required: true
          }),
          field({
            key: "catchmentDefinition",
            label: { zh: "商圈 / 服务范围", en: "Catchment / service area" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "例如：门店 3 公里范围；或可在 24 小时内配送的邮编区域。",
              en: "e.g. Three-kilometre store radius, or postcodes reachable within 24 hours."
            }
          }),
          field({
            key: "currency",
            label: { zh: "统一财务币种", en: "Reporting currency" },
            type: "text",
            required: true,
            placeholder: { zh: "例如：MYR、CNY、USD", en: "e.g. MYR, CNY, USD" },
            help: {
              zh: "后续所有金额必须使用同一币种。",
              en: "Use this same currency for every financial amount below."
            }
          })
        ]
      },
      {
        title: { zh: "经营形态与进入方式", en: "Format and entry route" },
        fields: [
          field({
            key: "operatingModel",
            label: { zh: "经营模式", en: "Operating model" },
            type: "radio",
            required: true,
            full: true,
            options: operatingModelOptions
          }),
          field({
            key: "retailFormat",
            label: { zh: "零售业态", en: "Retail format" },
            type: "text",
            required: true,
            placeholder: {
              zh: "例如：便利店、专卖店、订阅电商",
              en: "e.g. Convenience store, specialty store, subscription commerce"
            }
          }),
          field({
            key: "entryMode",
            label: { zh: "市场进入方式", en: "Market entry mode" },
            type: "select",
            required: true,
            options: entryModeOptions
          }),
          field({
            key: "plannedLaunchDate",
            label: { zh: "计划上线 / 评估基准日", en: "Planned launch / decision date" },
            type: "date",
            required: true
          })
        ]
      }
    ]
  },
  {
    id: "customer",
    title: { zh: "目标客户与需求证据", en: "Target customer & demand evidence" },
    shortTitle: { zh: "客户", en: "Customer" },
    description: {
      zh: "区分使用者与付款者，并用真实行为证据说明需求和支付意愿。",
      en: "Separate users from payers and support demand and willingness to pay with behavioural evidence."
    },
    sections: [
      {
        title: { zh: "客户定义", en: "Customer definition" },
        fields: [
          field({
            key: "targetSegment",
            label: { zh: "核心目标客群", en: "Primary target segment" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "写人口特征、行为、需求、地理位置和可识别边界。",
              en: "Describe demographics, behaviour, need, location, and a measurable boundary."
            }
          }),
          field({
            key: "payerUserRelationship",
            label: { zh: "付款者与使用者", en: "Payer and user relationship" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "两者是否同一人？谁决定、谁付款、谁使用？",
              en: "Are they the same person? Who decides, pays, and uses?"
            }
          }),
          field({
            key: "customerJobPain",
            label: { zh: "核心任务 / 痛点", en: "Core job / pain point" },
            type: "textarea",
            required: true
          }),
          field({
            key: "purchaseOccasion",
            label: { zh: "购买场景与频率", en: "Purchase occasion & frequency" },
            type: "textarea",
            required: true
          }),
          field({
            key: "currentAlternative",
            label: { zh: "当前替代方案", en: "Current alternative" },
            type: "textarea",
            required: true,
            help: {
              zh: "包括“不购买”、自行解决或跨品类替代。",
              en: "Include doing nothing, self-service, and cross-category substitutes."
            }
          })
        ]
      },
      {
        title: { zh: "需求验证", en: "Demand validation" },
        fields: [
          field({
            key: "willingnessToPayEvidence",
            label: { zh: "支付意愿证据", en: "Willingness-to-pay evidence" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "例如：已付定金、真实订单、价格测试、带样本量的调查。",
              en: "e.g. Deposits, real orders, price tests, or a survey with sample size."
            }
          }),
          field({
            key: "estimatedCustomerCount",
            label: { zh: "可服务客户估计数", en: "Estimated serviceable customers" },
            type: "number",
            required: true,
            min: 0,
            step: 1
          }),
          field({
            key: "demandEvidence",
            label: { zh: "需求规模证据与计算", en: "Demand evidence & calculation" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "给出样本、期间、来源和计算过程，不要只写结论。",
              en: "Give the sample, period, source, and calculation—not only a conclusion."
            }
          })
        ]
      }
    ]
  },
  {
    id: "offer",
    title: { zh: "价值、商品与竞争", en: "Value, merchandise & competition" },
    shortTitle: { zh: "价值", en: "Offer" },
    description: {
      zh: "将价值主张、商品组合、定价和可持续差异化连接到市场证据。",
      en: "Connect the proposition, assortment, pricing, and defensible differentiation to market evidence."
    },
    sections: [
      {
        title: { zh: "零售策略", en: "Retail strategy" },
        fields: [
          field({
            key: "valueProposition",
            label: { zh: "价值主张", en: "Value proposition" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "针对哪类客户，以什么零售组合解决什么问题，并带来何种可验证结果？",
              en: "For which customer, what retail mix solves which problem, with what verifiable outcome?"
            }
          }),
          field({
            key: "assortmentStrategy",
            label: { zh: "商品组合策略", en: "Assortment strategy" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "品类宽度/深度、自有品牌、独家商品、更新节奏。",
              en: "Breadth/depth, private label, exclusives, and refresh cadence."
            }
          }),
          field({
            key: "pricingPosition",
            label: { zh: "价格定位与逻辑", en: "Price position & logic" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "相对竞品的价格带、加价逻辑和促销依赖。",
              en: "Price band versus alternatives, markup logic, and promotion dependence."
            }
          }),
          field({
            key: "differentiationEvidence",
            label: { zh: "差异化与可持续优势证据", en: "Differentiation & sustainable advantage evidence" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "说明顾客忠诚、位置、供应商、运营、人才、系统、独家商品或服务中的优势。",
              en: "Evidence advantage in loyalty, location, vendors, operations, people, systems, exclusives, or service."
            }
          }),
          field({
            key: "reasonToBelieve",
            label: { zh: "顾客相信你的理由", en: "Customer reason to believe" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "写已经存在、可核验的能力、资质、资产或业绩，而不是宣传口号。",
              en: "State existing, verifiable capabilities, credentials, assets, or results—not a slogan."
            }
          }),
          field({
            key: "growthStrategy",
            label: { zh: "首要增长路径", en: "Primary growth path" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "说明市场渗透、市场扩张、业态开发或多元化中的主路径及边界。",
              en: "Define the primary route and limits across penetration, market expansion, format development, or diversification."
            }
          }),
          field({
            key: "mainCompetitors",
            label: { zh: "主要竞品与替代品", en: "Main competitors & substitutes" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "列出名称、业态、价格、强项、弱项和比较日期。",
              en: "List names, format, price, strengths, weaknesses, and comparison date."
            }
          })
        ]
      },
      {
        title: { zh: "市场证据", en: "Market evidence" },
        fields: [
          field({
            key: "marketEvidence",
            label: { zh: "市场规模 / 增长 / 竞争强度证据", en: "Market size / growth / rivalry evidence" },
            type: "textarea",
            required: true,
            full: true
          }),
          field({
            key: "marketEvidenceSource",
            label: { zh: "市场证据来源", en: "Market evidence source" },
            type: "text",
            required: true,
            placeholder: {
              zh: "报告、数据表、访谈或内部交易记录名称",
              en: "Name the report, dataset, interview, or transaction record"
            }
          }),
          field({
            key: "marketEvidenceDate",
            label: { zh: "证据日期", en: "Evidence date" },
            type: "date",
            required: true
          }),
          field({
            key: "marketEvidenceConfidence",
            label: { zh: "证据可信度", en: "Evidence confidence" },
            type: "select",
            required: true,
            options: confidenceOptions
          })
        ]
      }
    ]
  },
  {
    id: "gates",
    title: { zh: "合规门槛与渠道", en: "Compliance gates & channels" },
    shortTitle: { zh: "门槛", en: "Gates" },
    description: {
      zh: "硬性门槛不可用其他高分抵消。请按目标国家与城市的最新证据填写，系统不会推测法规。",
      en: "Hard gates cannot be offset by other strengths. Use current target-country and city evidence; the system does not infer regulations."
    },
    sections: [
      {
        title: { zh: "硬性可行性门槛", en: "Hard feasibility gates" },
        description: {
          zh: "每一项都必须选择状态；“不适用”或“有条件”请在说明中给出依据。",
          en: "Every gate needs a status; explain the basis for “not applicable” or “conditional”."
        },
        fields: [
          field({
            key: "ownershipGate",
            label: { zh: "外资 / 所有权限制", en: "Foreign ownership / entity rules" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "licenseGate",
            label: { zh: "经营许可与分区", en: "Licensing & zoning" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "productSafetyGate",
            label: { zh: "产品安全 / 标签 / 进口", en: "Product safety / labelling / import" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "privacyPaymentGate",
            label: { zh: "隐私、支付与消费者保护", en: "Privacy, payments & consumer protection" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "labourSupplierGate",
            label: { zh: "劳动与供应商合规", en: "Labour & supplier compliance" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "fxGate",
            label: { zh: "外汇、税务与资金汇回", en: "FX, tax & repatriation" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "infrastructureGate",
            label: { zh: "物流、能源与数字基础设施", en: "Logistics, energy & digital infrastructure" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "ethicsGate",
            label: { zh: "伦理与可持续底线", en: "Ethics & sustainability floor" },
            type: "select",
            required: true,
            options: gateOptions
          }),
          field({
            key: "complianceNotes",
            label: { zh: "门槛证据、责任人和待办", en: "Gate evidence, owner & open actions" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "逐项写来源、发布日期、有效期、负责核实的人和截止日。",
              en: "For each gate, record source, publication date, expiry, verification owner, and due date."
            }
          })
        ]
      },
      {
        title: { zh: "渠道与履约", en: "Channels & fulfilment" },
        fields: [
          field({
            key: "salesChannels",
            label: { zh: "销售渠道（可多选）", en: "Sales channels (select all that apply)" },
            type: "checkboxes",
            required: true,
            full: true,
            options: channelOptions
          }),
          field({
            key: "fulfilmentModel",
            label: { zh: "履约与退货模式", en: "Fulfilment & returns model" },
            type: "textarea",
            required: true
          }),
          field({
            key: "channelRoles",
            label: { zh: "各渠道角色与协同规则", en: "Channel roles & coordination rules" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "说明每个渠道负责获客、体验、交易、履约或售后中的哪一环，以及价格/库存如何一致。",
              en: "Explain which channel owns discovery, experience, transaction, fulfilment, or service, and how price/inventory stay aligned."
            }
          }),
          field({
            key: "trafficSource",
            label: { zh: "主要流量来源", en: "Primary traffic sources" },
            type: "textarea",
            required: true
          }),
          field({
            key: "monthlyTraffic",
            label: { zh: "月均访问 / 到店人数", en: "Monthly visits / sessions" },
            type: "number",
            required: true,
            min: 0,
            step: 1
          }),
          field({
            key: "conversionRatePct",
            label: { zh: "转化率（%）", en: "Conversion rate (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1
          }),
          field({
            key: "platformFeeRatePct",
            label: { zh: "平台 / 支付综合费率（%）", en: "Platform / payment fee rate (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1
          })
        ]
      }
    ]
  },
  {
    id: "operations",
    title: { zh: "门店与供应链", en: "Site & supply chain" },
    shortTitle: { zh: "运营", en: "Operations" },
    description: {
      zh: "实体或混合模式需要门店数据；所有模式都需要供应、库存和服务水平数据。",
      en: "Physical and hybrid models require site data; every model requires supply, inventory, and service-level data."
    },
    sections: [
      {
        title: { zh: "门店与商圈（条件必填）", en: "Site & trade area (conditionally required)" },
        description: {
          zh: "纯线上模式会自动跳过本组，不影响覆盖率。",
          en: "This group is automatically excluded for digital-only models."
        },
        fields: [
          field({
            key: "siteType",
            label: { zh: "地点类型", en: "Location type" },
            type: "text",
            required: true,
            showWhen: isPhysicalModel,
            placeholder: {
              zh: "例如：购物中心、临街、社区中心",
              en: "e.g. Shopping centre, high street, neighbourhood centre"
            }
          }),
          field({
            key: "siteAreaSqm",
            label: { zh: "营业面积（平方米）", en: "Selling area (square metres)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.1,
            showWhen: isPhysicalModel
          }),
          field({
            key: "monthlyFootfall",
            label: { zh: "月均门前 / 商场客流", en: "Monthly passing / centre footfall" },
            type: "number",
            required: true,
            min: 0,
            step: 1,
            showWhen: isPhysicalModel
          }),
          field({
            key: "storeConversionRatePct",
            label: { zh: "门店客流转化率（%）", en: "Store footfall conversion rate (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1,
            showWhen: isPhysicalModel
          }),
          field({
            key: "annualSiteSalesForecast",
            label: { zh: "该门店年销售预测", en: "Annual site sales forecast" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01,
            showWhen: isPhysicalModel
          }),
          field({
            key: "parkingAccess",
            label: { zh: "交通、停车与装卸", en: "Access, parking & loading" },
            type: "textarea",
            required: true,
            showWhen: isPhysicalModel
          }),
          field({
            key: "visibilityAssessment",
            label: { zh: "可见性与动线证据", en: "Visibility & circulation evidence" },
            type: "textarea",
            required: true,
            showWhen: isPhysicalModel
          }),
          field({
            key: "monthlyRent",
            label: { zh: "月租金", en: "Monthly base rent" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01,
            showWhen: isPhysicalModel
          }),
          field({
            key: "monthlyCommonAreaCharges",
            label: { zh: "月物业 / 公共区域费", en: "Monthly service / common-area charges" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01,
            showWhen: isPhysicalModel
          }),
          field({
            key: "leaseTermMonths",
            label: { zh: "租期（月）", en: "Lease term (months)" },
            type: "number",
            required: true,
            min: 0,
            step: 1,
            showWhen: isPhysicalModel
          }),
          field({
            key: "cannibalizationRisk",
            label: { zh: "渠道 / 门店蚕食风险", en: "Channel / store cannibalization risk" },
            type: "textarea",
            required: true,
            full: true,
            showWhen: isPhysicalModel
          })
        ]
      },
      {
        title: { zh: "采购、库存与服务水平", en: "Sourcing, inventory & service level" },
        fields: [
          field({
            key: "supplierCount",
            label: { zh: "活跃供应商数量", en: "Active supplier count" },
            type: "number",
            required: true,
            min: 0,
            step: 1
          }),
          field({
            key: "topSupplierSharePct",
            label: { zh: "最大供应商采购占比（%）", en: "Top supplier purchase share (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1
          }),
          field({
            key: "leadTimeDays",
            label: { zh: "平均补货提前期（天）", en: "Average replenishment lead time (days)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.1
          }),
          field({
            key: "inventoryServiceLevelPct",
            label: { zh: "库存服务水平（%）", en: "Inventory service level (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1,
            help: {
              zh: "满足需求的商品数量 ÷ 顾客需求商品数量。",
              en: "Items sold divided by items demanded."
            }
          }),
          field({
            key: "inventoryTurnover",
            label: { zh: "库存周转（次 / 年）", en: "Inventory turnover (times / year)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.1
          }),
          field({
            key: "stockoutRatePct",
            label: { zh: "缺货率（%）", en: "Stockout rate (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1
          }),
          field({
            key: "replenishmentModel",
            label: { zh: "补货与信息共享方式", en: "Replenishment & information-sharing model" },
            type: "textarea",
            required: true,
            placeholder: {
              zh: "说明 push/pull、JIT、VMI、CPFR、配送中心或门店直送。",
              en: "Explain push/pull, JIT, VMI, CPFR, distribution centre, or direct-store delivery."
            }
          }),
          field({
            key: "inventoryRisks",
            label: { zh: "库存与供应中断风险", en: "Inventory & disruption risks" },
            type: "textarea",
            required: true,
            full: true
          }),
          field({
            key: "supplyMitigation",
            label: { zh: "供应风险缓释与触发动作", en: "Supply-risk mitigation & trigger actions" },
            type: "textarea",
            required: true,
            full: true
          })
        ]
      }
    ]
  },
  {
    id: "economics",
    title: { zh: "财务与单位经济", en: "Financials & unit economics" },
    shortTitle: { zh: "财务", en: "Economics" },
    description: {
      zh: "金额全部使用第二步选择的币种，并使用同一月度口径。估算值可以填写，但必须说明依据。",
      en: "Use the selected currency and one consistent monthly basis. Estimates are allowed, but their basis must be disclosed."
    },
    sections: [
      {
        title: { zh: "月度经营数据", en: "Monthly operating data" },
        description: {
          zh: "确实为零时才填 0；未知数据请先做可追溯估算。",
          en: "Enter 0 only when genuinely zero; create a traceable estimate for unknown values."
        },
        fields: [
          field({
            key: "monthlyRevenue",
            label: { zh: "月销售收入", en: "Monthly sales revenue" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyCogs",
            label: { zh: "月销售成本（COGS）", en: "Monthly cost of goods sold (COGS)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyVariableCost",
            label: { zh: "其他月变动成本", en: "Other monthly variable cost" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyFixedCost",
            label: { zh: "月固定成本（不含占用成本）", en: "Monthly fixed cost (excl. occupancy)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyOccupancyCost",
            label: { zh: "月占用 / 场地成本总额", en: "Total monthly occupancy cost" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyMarketingSpend",
            label: { zh: "月营销费用", en: "Monthly marketing spend" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "averageSellingPrice",
            label: { zh: "平均成交价 / 客单价", en: "Average selling price / order value" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyUnits",
            label: { zh: "月销量 / 订单数", en: "Monthly units / orders" },
            type: "number",
            required: true,
            min: 0,
            step: 1
          })
        ]
      },
      {
        title: { zh: "资本、获客与压力测试", en: "Capital, acquisition & stress test" },
        fields: [
          field({
            key: "capex",
            label: { zh: "一次性资本开支（CAPEX）", en: "One-time capital expenditure (CAPEX)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "workingCapital",
            label: { zh: "所需营运资金", en: "Required working capital" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "fundingAvailable",
            label: { zh: "可用资金", en: "Funding available" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "monthlyBurn",
            label: { zh: "月净现金消耗", en: "Monthly net cash burn" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "runwayMonths",
            label: { zh: "现金跑道（月）", en: "Cash runway (months)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.1
          }),
          field({
            key: "cac",
            label: { zh: "获客成本（CAC）", en: "Customer acquisition cost (CAC)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "clv",
            label: { zh: "客户终身价值（CLV）", en: "Customer lifetime value (CLV)" },
            type: "number",
            required: true,
            min: 0,
            step: 0.01
          }),
          field({
            key: "downsideRevenuePct",
            label: { zh: "下行情景收入下降（%）", en: "Downside revenue decline (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 100,
            step: 0.1
          }),
          field({
            key: "downsideCostIncreasePct",
            label: { zh: "下行情景成本上升（%）", en: "Downside cost increase (%)" },
            type: "number",
            required: true,
            min: 0,
            max: 1000,
            step: 0.1
          }),
          field({
            key: "financialEvidence",
            label: { zh: "财务数据来源、期间与假设", en: "Financial source, period & assumptions" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "区分真实结果、已签报价、行业数据和管理层假设。",
              en: "Separate actuals, signed quotes, industry data, and management assumptions."
            }
          })
        ]
      }
    ]
  },
  {
    id: "execution",
    title: { zh: "增长、团队、风险与证据", en: "Growth, team, risks & evidence" },
    shortTitle: { zh: "执行", en: "Execution" },
    description: {
      zh: "最后说明获客、留存、服务、执行责任和最关键的可证伪假设。",
      en: "Finish with acquisition, retention, service, ownership, and the most important falsifiable assumptions."
    },
    sections: [
      {
        title: { zh: "营销、CRM 与服务", en: "Marketing, CRM & service" },
        fields: [
          field({
            key: "positioningStatement",
            label: { zh: "定位陈述", en: "Positioning statement" },
            type: "textarea",
            required: true,
            full: true
          }),
          field({
            key: "acquisitionPlan",
            label: { zh: "获客计划与漏斗指标", en: "Acquisition plan & funnel metrics" },
            type: "textarea",
            required: true
          }),
          field({
            key: "crmRetentionPlan",
            label: { zh: "CRM、留存与顾客份额计划", en: "CRM, retention & share-of-wallet plan" },
            type: "textarea",
            required: true
          }),
          field({
            key: "servicePromise",
            label: { zh: "服务承诺与补救机制", en: "Service promise & recovery process" },
            type: "textarea",
            required: true,
            full: true,
            help: {
              zh: "包括可靠性、响应速度、保障、同理心和实际体验。",
              en: "Cover reliability, responsiveness, assurance, empathy, and tangible experience."
            }
          }),
          field({
            key: "complaintReturnsProcess",
            label: { zh: "投诉、退货与服务补救流程", en: "Complaint, returns & service-recovery process" },
            type: "textarea",
            required: true,
            full: true
          })
        ]
      },
      {
        title: { zh: "组织与控制", en: "Organization & control" },
        fields: [
          field({
            key: "teamSize",
            label: { zh: "当前 / 首年团队人数", en: "Current / year-one team size" },
            type: "number",
            required: true,
            min: 0,
            step: 1
          }),
          field({
            key: "teamAndKeyRoles",
            label: { zh: "团队构成与关键岗位", en: "Team composition & key roles" },
            type: "textarea",
            required: true
          }),
          field({
            key: "leadershipRetailExperience",
            label: { zh: "核心团队零售与当地经验", en: "Leadership retail & local-market experience" },
            type: "textarea",
            required: true
          }),
          field({
            key: "capabilityGaps",
            label: { zh: "能力缺口与招聘 / 合作计划", en: "Capability gaps & hire / partner plan" },
            type: "textarea",
            required: true
          }),
          field({
            key: "localPartner",
            label: { zh: "当地伙伴及其职责", en: "Local partner & responsibilities" },
            type: "textarea",
            required: true,
            help: {
              zh: "若无合作伙伴，请说明哪些当地能力由内部团队承担。",
              en: "If there is no partner, explain which local capabilities are owned internally."
            }
          }),
          field({
            key: "decisionRights",
            label: { zh: "关键决策权与升级机制", en: "Decision rights & escalation" },
            type: "textarea",
            required: true
          }),
          field({
            key: "keyMilestones",
            label: { zh: "关键里程碑与日期", en: "Key milestones & dates" },
            type: "textarea",
            required: true
          }),
          field({
            key: "kpiOwners",
            label: { zh: "核心 KPI、目标与负责人", en: "Core KPIs, targets & owners" },
            type: "textarea",
            required: true,
            full: true
          })
        ]
      },
      {
        title: { zh: "风险与证据总表", en: "Risk & evidence register" },
        fields: [
          field({
            key: "topRisks",
            label: { zh: "前三至五项关键风险", en: "Top three to five risks" },
            type: "textarea",
            required: true
          }),
          field({
            key: "riskMitigation",
            label: { zh: "缓释、触发指标与应急方案", en: "Mitigation, trigger metrics & contingency" },
            type: "textarea",
            required: true
          }),
          field({
            key: "evidenceSource",
            label: { zh: "主要证据包 / 来源清单", en: "Primary evidence pack / source list" },
            type: "textarea",
            required: true,
            full: true,
            placeholder: {
              zh: "列出文件名、链接、数据所有者或访谈对象；不要粘贴密钥或个人敏感数据。",
              en: "List filenames, links, data owners, or interview roles; never paste keys or sensitive personal data."
            }
          }),
          field({
            key: "evidenceAsOfDate",
            label: { zh: "证据截止日期", en: "Evidence as-of date" },
            type: "date",
            required: true
          }),
          field({
            key: "evidenceConfidence",
            label: { zh: "整体证据可信度", en: "Overall evidence confidence" },
            type: "select",
            required: true,
            options: confidenceOptions
          }),
          field({
            key: "assumptionsLimitations",
            label: { zh: "关键假设与局限", en: "Key assumptions & limitations" },
            type: "textarea",
            required: true,
            full: true
          })
        ]
      }
    ]
  },
  {
    id: "enterprise",
    title: { zh: "企业工作台", en: "Enterprise workbench" },
    shortTitle: { zh: "企业", en: "Enterprise" },
    description: {
      zh: "用固定量表补全五力、竞争、STP、进入模式、生产力、服务缺口、控制与风险资料。系统只计算结构化数值，不按自由文本长度评分。",
      en: "Complete fixed-scale Five Forces, competition, STP, entry-mode, productivity, service-gap, control, and risk inputs. The engine scores structured values, never narrative length."
    },
    sections: [
      {
        title: { zh: "1. 行业五力", en: "1. Industry Five Forces" },
        description: {
          zh: "1 表示竞争压力很低，5 表示压力很高；高分代表行业吸引力受到更大挤压。",
          en: "1 means very low competitive pressure and 5 means very high pressure; higher values constrain industry attractiveness."
        },
        fields: [
          scoredSelect("fiveForcesRivalry", "现有竞争者对抗强度", "Rivalry among existing competitors", forceIntensityOptions),
          scoredSelect("fiveForcesNewEntrants", "新进入者威胁", "Threat of new entrants", forceIntensityOptions),
          scoredSelect("fiveForcesSubstitutes", "替代品威胁", "Threat of substitutes", forceIntensityOptions),
          scoredSelect("fiveForcesBuyerPower", "买方议价能力", "Buyer bargaining power", forceIntensityOptions),
          scoredSelect("fiveForcesSupplierPower", "供应商议价能力", "Supplier bargaining power", forceIntensityOptions)
        ]
      },
      {
        title: { zh: "2. 竞争态势矩阵（CPM）", en: "2. Competitive Profile Matrix (CPM)" },
        description: {
          zh: "至少三个关键成功因素；权重总和必须等于 1.00。评分 1=主要弱点、4=主要优势。",
          en: "Provide at least three critical success factors; weights must total 1.00. Rating 1=major weakness and 4=major strength."
        },
        fields: [
          field({
            key: "cpmCompetitorAName",
            label: { zh: "竞品 A 名称", en: "Competitor A name" },
            type: "text",
            required: true
          }),
          field({
            key: "cpmCompetitorBName",
            label: { zh: "竞品 B 名称", en: "Competitor B name" },
            type: "text",
            required: true
          }),
          ...([1, 2, 3] as const).flatMap((factorIndex) => [
            field({
              key: `cpmFactor${factorIndex}LabelZh` as RetailIntakeFieldKey,
              label: {
                zh: `因素 ${factorIndex} 中文名称`,
                en: `Factor ${factorIndex} Chinese label`
              },
              type: "text",
              required: true
            }),
            field({
              key: `cpmFactor${factorIndex}LabelEn` as RetailIntakeFieldKey,
              label: {
                zh: `因素 ${factorIndex} 英文名称`,
                en: `Factor ${factorIndex} English label`
              },
              type: "text",
              required: true
            }),
            requiredNumber(
              `cpmFactor${factorIndex}Weight` as RetailIntakeFieldKey,
              `因素 ${factorIndex} 权重`,
              `Factor ${factorIndex} weight`,
              0,
              1,
              0.01
            ),
            scoredSelect(
              `cpmFactor${factorIndex}CompanyRating` as RetailIntakeFieldKey,
              `因素 ${factorIndex}：本企业评分`,
              `Factor ${factorIndex}: company rating`,
              cpmRatingOptions
            ),
            scoredSelect(
              `cpmFactor${factorIndex}CompetitorARating` as RetailIntakeFieldKey,
              `因素 ${factorIndex}：竞品 A 评分`,
              `Factor ${factorIndex}: competitor A rating`,
              cpmRatingOptions
            ),
            scoredSelect(
              `cpmFactor${factorIndex}CompetitorBRating` as RetailIntakeFieldKey,
              `因素 ${factorIndex}：竞品 B 评分`,
              `Factor ${factorIndex}: competitor B rating`,
              cpmRatingOptions
            )
          ])
        ]
      },
      {
        title: { zh: "3. STP 决策量表", en: "3. STP decision scales" },
        description: {
          zh: "细分吸引力、赢得市场的权利和定位质量均使用 1–5 固定量表。",
          en: "Segment attractiveness, right to win, and positioning quality use fixed 1–5 scales."
        },
        fields: [
          scoredSelect("stpSegmentSizeGrowth", "细分规模与增长", "Segment size & growth", strengthFiveOptions),
          scoredSelect("stpSegmentProfitability", "细分盈利潜力", "Segment profitability", strengthFiveOptions),
          scoredSelect("stpSegmentAccessibility", "细分可触达性", "Segment accessibility", strengthFiveOptions),
          scoredSelect("stpSegmentMeasurability", "细分可衡量性", "Segment measurability", strengthFiveOptions),
          scoredSelect("stpSegmentStrategicFit", "细分战略匹配度", "Segment strategic fit", strengthFiveOptions),
          scoredSelect("stpRightToWinDifferentiation", "赢得市场：差异化", "Right to win: differentiation", strengthFiveOptions),
          scoredSelect("stpRightToWinCapability", "赢得市场：能力基础", "Right to win: capability base", strengthFiveOptions),
          scoredSelect("stpRightToWinChannelAccess", "赢得市场：渠道触达", "Right to win: channel access", strengthFiveOptions),
          scoredSelect("stpRightToWinCredibility", "赢得市场：品牌可信度", "Right to win: credibility", strengthFiveOptions),
          field({
            key: "stpTargetingStrategy",
            label: { zh: "目标市场策略", en: "Targeting strategy" },
            type: "select",
            required: true,
            options: targetingStrategyOptions
          }),
          scoredSelect("stpPositionCustomerClarity", "定位：目标顾客清晰度", "Position: customer clarity", strengthFiveOptions),
          scoredSelect("stpPositionCompetitorDistinctiveness", "定位：相对竞品独特性", "Position: competitor distinctiveness", strengthFiveOptions),
          scoredSelect("stpPositionEvidenceStrength", "定位：证据强度", "Position: evidence strength", strengthFiveOptions),
          scoredSelect("stpPositionDeliveryConsistency", "定位：交付一致性", "Position: delivery consistency", strengthFiveOptions)
        ]
      },
      {
        title: { zh: "4. 两个进入模式方案", en: "4. Two entry-mode options" },
        description: {
          zh: "为两个可执行方案填写中英文名称，并按九项适配度分别评分；1=很弱，5=很强。",
          en: "Name two executable options in both languages and rate nine fit criteria; 1=very weak and 5=very strong."
        },
        fields: [
          ...([1, 2] as const).flatMap((modeIndex) => [
            field({
              key: `entryMode${modeIndex}LabelZh` as RetailIntakeFieldKey,
              label: {
                zh: `方案 ${modeIndex} 中文名称`,
                en: `Option ${modeIndex} Chinese label`
              },
              type: "text",
              required: true
            }),
            field({
              key: `entryMode${modeIndex}LabelEn` as RetailIntakeFieldKey,
              label: {
                zh: `方案 ${modeIndex} 英文名称`,
                en: `Option ${modeIndex} English label`
              },
              type: "text",
              required: true
            }),
            ...([
              ["Control", "控制力", "Control"],
              ["CapitalEfficiency", "资本效率", "Capital efficiency"],
              ["Speed", "进入速度", "Speed"],
              ["Adaptation", "本地适应能力", "Local adaptation"],
              ["IpProtection", "知识产权保护", "IP protection"],
              ["LocalKnowledge", "本地知识", "Local knowledge"],
              ["PartnerFeasibility", "合作伙伴可行性", "Partner feasibility"],
              ["SupplyAccess", "供应链可达性", "Supply access"],
              ["ExitFlexibility", "退出灵活性", "Exit flexibility"]
            ] as const).map(([suffix, zh, en]) =>
              scoredSelect(
                `entryMode${modeIndex}${suffix}` as RetailIntakeFieldKey,
                `方案 ${modeIndex}：${zh}`,
                `Option ${modeIndex}: ${en}`,
                strengthFiveOptions
              )
            )
          ])
        ]
      },
      {
        title: { zh: "5. 财务与资产生产力", en: "5. Financial & asset productivity" },
        description: {
          zh: "全部金额沿用前述统一财务币种；系统据此计算资产回报和 GMROI，不使用外部基准推测。",
          en: "Use the reporting currency defined earlier. The engine calculates asset return and GMROI without inventing external benchmarks."
        },
        fields: [
          field({
            key: "enterpriseMonthlyNetProfit",
            label: { zh: "月净利润（亏损填负数）", en: "Monthly net profit (negative if loss-making)" },
            type: "number",
            required: true,
            step: 0.01
          }),
          requiredNumber("enterpriseTotalAssets", "总资产", "Total assets"),
          requiredNumber("enterpriseAverageInventory", "平均库存成本", "Average inventory at cost")
        ]
      },
      {
        title: { zh: "6. 服务质量与组织缺口", en: "6. Service quality & organizational gaps" },
        description: {
          zh: "RATER 期望与感知使用 1–7；组织缺口使用 1–5 严重度。系统按维度计算缺口，而非评价文字长度。",
          en: "RATER expectations and perceptions use 1–7; organizational gaps use 1–5 severity. The engine computes dimensional gaps, not narrative length."
        },
        fields: [
          ...([
            ["Reliability", "可靠性", "Reliability"],
            ["Responsiveness", "响应性", "Responsiveness"],
            ["Assurance", "保证性", "Assurance"],
            ["Empathy", "同理心", "Empathy"],
            ["Tangibles", "有形要素", "Tangibles"]
          ] as const).flatMap(([suffix, zh, en]) => [
            scoredSelect(
              `serviceExpectation${suffix}` as RetailIntakeFieldKey,
              `${zh}：顾客期望`,
              `${en}: customer expectation`,
              raterOptions
            ),
            scoredSelect(
              `servicePerception${suffix}` as RetailIntakeFieldKey,
              `${zh}：实际感知`,
              `${en}: actual perception`,
              raterOptions
            )
          ]),
          scoredSelect("organizationGapKnowledge", "组织缺口：顾客知识", "Organization gap: customer knowledge", severityFiveOptions),
          scoredSelect("organizationGapStandards", "组织缺口：服务标准", "Organization gap: service standards", severityFiveOptions),
          scoredSelect("organizationGapDelivery", "组织缺口：服务交付", "Organization gap: service delivery", severityFiveOptions),
          scoredSelect("organizationGapCommunication", "组织缺口：外部沟通", "Organization gap: external communication", severityFiveOptions)
        ]
      },
      {
        title: { zh: "7. 组织控制与首要风险", en: "7. Organization control & top risk" },
        description: {
          zh: "覆盖率衡量已定义并有责任人的控制范围；首要风险必须同时包含概率、影响、控制有效性、KRI、触发器和已拨备应急资金。",
          en: "Coverage reflects controls that are defined and owned. The top risk records likelihood, impact, control effectiveness, KRI, trigger, and funded contingency."
        },
        fields: [
          requiredNumber("controlPolicyCoveragePct", "政策覆盖率（%）", "Policy coverage (%)", 0, 100, 0.1),
          requiredNumber("controlProcessCoveragePct", "流程覆盖率（%）", "Process coverage (%)", 0, 100, 0.1),
          requiredNumber("controlKpiCoveragePct", "KPI 责任覆盖率（%）", "KPI ownership coverage (%)", 0, 100, 0.1),
          requiredNumber("controlReviewCadenceDays", "管理复盘周期（天）", "Management review cadence (days)", 1, 3650, 1),
          requiredNumber("controlVarianceTolerancePct", "偏差容忍度（%）", "Variance tolerance (%)", 0, 100, 0.1),
          field({
            key: "topRiskNameZh",
            label: { zh: "首要风险中文名称", en: "Top risk Chinese name" },
            type: "text",
            required: true
          }),
          field({
            key: "topRiskNameEn",
            label: { zh: "首要风险英文名称", en: "Top risk English name" },
            type: "text",
            required: true
          }),
          scoredSelect("topRiskLikelihood", "首要风险发生概率", "Top risk likelihood", severityFiveOptions),
          scoredSelect("topRiskImpact", "首要风险影响", "Top risk impact", severityFiveOptions),
          requiredNumber("topRiskControlEffectivenessPct", "控制有效性（%）", "Control effectiveness (%)", 0, 100, 0.1),
          field({
            key: "topRiskKriDefined",
            label: { zh: "是否已定义 KRI", en: "KRI defined?" },
            type: "select",
            required: true,
            options: yesNoOptions
          }),
          field({
            key: "topRiskTriggerDefined",
            label: { zh: "是否已定义升级触发器", en: "Escalation trigger defined?" },
            type: "select",
            required: true,
            options: yesNoOptions
          }),
          field({
            key: "topRiskContingencyFunded",
            label: { zh: "应急方案是否已获资金", en: "Contingency funded?" },
            type: "select",
            required: true,
            options: yesNoOptions
          })
        ]
      }
    ]
  }
];

export const intakeFieldDefinitions: IntakeFieldDefinition[] =
  intakeSteps.flatMap((step) =>
    step.sections.flatMap((section) => section.fields)
  );

export function createEmptyDraft(): RetailIntakeDraft {
  return {
    businessName: "",
    businessCategory: "",
    businessStage: "",
    assessmentObjective: "",
    decisionHorizonMonths: "",
    businessSummary: "",
    homeCountry: "",
    targetCountry: "",
    targetStateRegion: "",
    targetCity: "",
    catchmentDefinition: "",
    currency: "",
    operatingModel: "",
    retailFormat: "",
    entryMode: "",
    plannedLaunchDate: "",
    targetSegment: "",
    payerUserRelationship: "",
    customerJobPain: "",
    purchaseOccasion: "",
    currentAlternative: "",
    willingnessToPayEvidence: "",
    estimatedCustomerCount: "",
    demandEvidence: "",
    valueProposition: "",
    assortmentStrategy: "",
    pricingPosition: "",
    differentiationEvidence: "",
    reasonToBelieve: "",
    growthStrategy: "",
    mainCompetitors: "",
    marketEvidence: "",
    marketEvidenceSource: "",
    marketEvidenceDate: "",
    marketEvidenceConfidence: "",
    ownershipGate: "",
    licenseGate: "",
    productSafetyGate: "",
    privacyPaymentGate: "",
    labourSupplierGate: "",
    fxGate: "",
    infrastructureGate: "",
    ethicsGate: "",
    complianceNotes: "",
    salesChannels: [],
    fulfilmentModel: "",
    channelRoles: "",
    trafficSource: "",
    monthlyTraffic: "",
    conversionRatePct: "",
    platformFeeRatePct: "",
    siteType: "",
    siteAreaSqm: "",
    monthlyFootfall: "",
    storeConversionRatePct: "",
    annualSiteSalesForecast: "",
    parkingAccess: "",
    visibilityAssessment: "",
    monthlyRent: "",
    monthlyCommonAreaCharges: "",
    leaseTermMonths: "",
    cannibalizationRisk: "",
    supplierCount: "",
    topSupplierSharePct: "",
    leadTimeDays: "",
    inventoryServiceLevelPct: "",
    inventoryTurnover: "",
    stockoutRatePct: "",
    replenishmentModel: "",
    inventoryRisks: "",
    supplyMitigation: "",
    monthlyRevenue: "",
    monthlyCogs: "",
    monthlyVariableCost: "",
    monthlyFixedCost: "",
    monthlyOccupancyCost: "",
    monthlyMarketingSpend: "",
    averageSellingPrice: "",
    monthlyUnits: "",
    capex: "",
    workingCapital: "",
    fundingAvailable: "",
    monthlyBurn: "",
    runwayMonths: "",
    cac: "",
    clv: "",
    downsideRevenuePct: "",
    downsideCostIncreasePct: "",
    financialEvidence: "",
    positioningStatement: "",
    acquisitionPlan: "",
    crmRetentionPlan: "",
    servicePromise: "",
    complaintReturnsProcess: "",
    teamSize: "",
    teamAndKeyRoles: "",
    leadershipRetailExperience: "",
    capabilityGaps: "",
    localPartner: "",
    decisionRights: "",
    keyMilestones: "",
    kpiOwners: "",
    topRisks: "",
    riskMitigation: "",
    evidenceSource: "",
    evidenceAsOfDate: "",
    evidenceConfidence: "",
    assumptionsLimitations: "",
    fiveForcesRivalry: "",
    fiveForcesNewEntrants: "",
    fiveForcesSubstitutes: "",
    fiveForcesBuyerPower: "",
    fiveForcesSupplierPower: "",
    cpmCompetitorAName: "",
    cpmCompetitorBName: "",
    cpmFactor1Id: "cpm-factor-1",
    cpmFactor1LabelZh: "",
    cpmFactor1LabelEn: "",
    cpmFactor1Weight: "",
    cpmFactor1CompanyRating: "",
    cpmFactor1CompetitorARating: "",
    cpmFactor1CompetitorBRating: "",
    cpmFactor2Id: "cpm-factor-2",
    cpmFactor2LabelZh: "",
    cpmFactor2LabelEn: "",
    cpmFactor2Weight: "",
    cpmFactor2CompanyRating: "",
    cpmFactor2CompetitorARating: "",
    cpmFactor2CompetitorBRating: "",
    cpmFactor3Id: "cpm-factor-3",
    cpmFactor3LabelZh: "",
    cpmFactor3LabelEn: "",
    cpmFactor3Weight: "",
    cpmFactor3CompanyRating: "",
    cpmFactor3CompetitorARating: "",
    cpmFactor3CompetitorBRating: "",
    cpmExtraFactorsJson: "[]",
    stpSegmentSizeGrowth: "",
    stpSegmentProfitability: "",
    stpSegmentAccessibility: "",
    stpSegmentMeasurability: "",
    stpSegmentStrategicFit: "",
    stpRightToWinDifferentiation: "",
    stpRightToWinCapability: "",
    stpRightToWinChannelAccess: "",
    stpRightToWinCredibility: "",
    stpTargetingStrategy: "",
    stpPositionCustomerClarity: "",
    stpPositionCompetitorDistinctiveness: "",
    stpPositionEvidenceStrength: "",
    stpPositionDeliveryConsistency: "",
    entryMode1Id: "entry-mode-1",
    entryMode1LabelZh: "",
    entryMode1LabelEn: "",
    entryMode1Control: "",
    entryMode1CapitalEfficiency: "",
    entryMode1Speed: "",
    entryMode1Adaptation: "",
    entryMode1IpProtection: "",
    entryMode1LocalKnowledge: "",
    entryMode1PartnerFeasibility: "",
    entryMode1SupplyAccess: "",
    entryMode1ExitFlexibility: "",
    entryMode2Id: "entry-mode-2",
    entryMode2LabelZh: "",
    entryMode2LabelEn: "",
    entryMode2Control: "",
    entryMode2CapitalEfficiency: "",
    entryMode2Speed: "",
    entryMode2Adaptation: "",
    entryMode2IpProtection: "",
    entryMode2LocalKnowledge: "",
    entryMode2PartnerFeasibility: "",
    entryMode2SupplyAccess: "",
    entryMode2ExitFlexibility: "",
    enterpriseMonthlyNetProfit: "",
    enterpriseTotalAssets: "",
    enterpriseAverageInventory: "",
    serviceExpectationReliability: "",
    serviceExpectationResponsiveness: "",
    serviceExpectationAssurance: "",
    serviceExpectationEmpathy: "",
    serviceExpectationTangibles: "",
    servicePerceptionReliability: "",
    servicePerceptionResponsiveness: "",
    servicePerceptionAssurance: "",
    servicePerceptionEmpathy: "",
    servicePerceptionTangibles: "",
    organizationGapKnowledge: "",
    organizationGapStandards: "",
    organizationGapDelivery: "",
    organizationGapCommunication: "",
    controlPolicyCoveragePct: "",
    controlProcessCoveragePct: "",
    controlKpiCoveragePct: "",
    controlReviewCadenceDays: "",
    controlVarianceTolerancePct: "",
    topRiskNameZh: "",
    topRiskNameEn: "",
    topRiskLikelihood: "",
    topRiskImpact: "",
    topRiskControlEffectivenessPct: "",
    topRiskKriDefined: "",
    topRiskTriggerDefined: "",
    topRiskContingencyFunded: ""
  };
}

function fieldIsVisible(
  definition: IntakeFieldDefinition,
  draft: RetailIntakeDraft
) {
  return definition.showWhen ? definition.showWhen(draft) : true;
}

function valueIsPresent(value: RetailIntakeDraft[RetailIntakeFieldKey]) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Number.isFinite(value);
}

function stepFields(
  step: IntakeStepDefinition,
  draft: RetailIntakeDraft
) {
  return step.sections
    .flatMap((section) => section.fields)
    .filter((definition) => fieldIsVisible(definition, draft));
}

export function calculateDraftCoverage(
  draft: RetailIntakeDraft
): DraftCoverage {
  const byStep = intakeSteps.map((step): StepCoverage => {
    const fields = stepFields(step, draft);
    const completed = fields.filter((definition) =>
      valueIsPresent(draft[definition.key])
    ).length;
    const requiredFields = fields.filter(
      (definition) => definition.required
    );
    const requiredCompleted = requiredFields.filter((definition) =>
      valueIsPresent(draft[definition.key])
    ).length;

    return {
      stepId: step.id,
      completed,
      total: fields.length,
      percent:
        fields.length === 0
          ? 100
          : Math.round((completed / fields.length) * 100),
      requiredCompleted,
      requiredTotal: requiredFields.length
    };
  });

  const fields = intakeSteps.flatMap((step) => stepFields(step, draft));
  const requiredFields = fields.filter(
    (definition) => definition.required
  );
  const completed = fields.filter((definition) =>
    valueIsPresent(draft[definition.key])
  ).length;
  const requiredCompleted = requiredFields.filter((definition) =>
    valueIsPresent(draft[definition.key])
  ).length;

  return {
    completed,
    total: fields.length,
    percent:
      fields.length === 0
        ? 100
        : Math.round((completed / fields.length) * 100),
    requiredCompleted,
    requiredTotal: requiredFields.length,
    missingRequired: requiredFields
      .filter(
        (definition) => !valueIsPresent(draft[definition.key])
      )
      .map((definition) => definition.key),
    byStep
  };
}

function secondaryLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

function selectPlaceholder(locale: Locale) {
  return locale === "zh" ? "请选择" : "Select an option";
}

function requiredMessage(locale: Locale) {
  return locale === "zh"
    ? "此项为生成可解释评分的必填信息。"
    : "Required for an explainable score.";
}

function getSavedAtLabel(savedAt: string | null | undefined, locale: Locale) {
  if (!savedAt) return null;
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return null;

  const formatted = new Intl.DateTimeFormat(
    locale === "zh" ? "zh-CN" : "en-GB",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }
  ).format(date);

  return locale === "zh"
    ? `草稿已保存：${formatted}`
    : `Draft saved: ${formatted}`;
}

function renderPrimaryLabel(
  definition: IntakeFieldDefinition,
  locale: Locale
) {
  const otherLocale = secondaryLocale(locale);

  return (
    <span className="field-label">
      <span>
        {text(definition.label, locale)}
        {definition.required ? (
          <>
            {" "}
            <span className="required" aria-hidden="true">
              *
            </span>
          </>
        ) : null}
      </span>
      <small>{text(definition.label, otherLocale)}</small>
    </span>
  );
}

export function IntakeWizard({
  locale,
  value,
  onChange,
  onSave,
  onSubmit,
  onLoadDemo,
  submitting = false,
  savedAt
}: IntakeWizardProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [invalidFields, setInvalidFields] = useState<
    Set<RetailIntakeFieldKey>
  >(() => new Set());
  const coverage = useMemo(
    () => calculateDraftCoverage(value),
    [value]
  );
  const activeStep = intakeSteps[activeStepIndex];
  const currentRequiredFields = useMemo(
    () =>
      stepFields(activeStep, value).filter(
        (definition) => definition.required
      ),
    [activeStep, value]
  );
  const currentMissing = currentRequiredFields.filter(
    (definition) => !valueIsPresent(value[definition.key])
  );
  const savedAtLabel = getSavedAtLabel(savedAt, locale);
  const otherLocale = secondaryLocale(locale);

  const updateField = (
    key: RetailIntakeFieldKey,
    nextValue: RetailIntakeDraft[RetailIntakeFieldKey]
  ) => {
    onChange({
      ...value,
      [key]: nextValue
    });

    if (valueIsPresent(nextValue)) {
      setInvalidFields((current) => {
        if (!current.has(key)) return current;
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

  const validateCurrentStep = () => {
    const missing = stepFields(activeStep, value)
      .filter((definition) => definition.required)
      .filter(
        (definition) => !valueIsPresent(value[definition.key])
      )
      .map((definition) => definition.key);

    setInvalidFields(new Set(missing));
    if (missing.length > 0) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(`intake-${String(missing[0])}`)
          ?.focus();
      });
      return false;
    }

    return true;
  };

  const goToStep = (nextIndex: number) => {
    if (nextIndex === activeStepIndex) return;
    if (nextIndex < activeStepIndex || validateCurrentStep()) {
      setInvalidFields(new Set());
      setActiveStepIndex(nextIndex);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleForward = async () => {
    if (!validateCurrentStep()) return;

    if (activeStepIndex < intakeSteps.length - 1) {
      setInvalidFields(new Set());
      setActiveStepIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    await onSubmit(value);
  };

  const toggleArrayOption = (
    key: RetailIntakeFieldKey,
    optionValue: string
  ) => {
    const current = value[key];
    if (!Array.isArray(current)) return;
    updateField(
      key,
      current.includes(optionValue)
        ? current.filter((item) => item !== optionValue)
        : [...current, optionValue]
    );
  };

  const renderField = (definition: IntakeFieldDefinition) => {
    if (!fieldIsVisible(definition, value)) return null;

    const inputId = `intake-${String(definition.key)}`;
    const fieldValue = value[definition.key];
    const invalid = invalidFields.has(definition.key);
    const errorId = `${inputId}-error`;
    const helpId = `${inputId}-help`;
    const describedBy = [
      invalid ? errorId : null,
      definition.help ? helpId : null
    ]
      .filter(Boolean)
      .join(" ");
    const className = `field${definition.full ? " full" : ""}`;

    let control;

    if (definition.type === "textarea") {
      control = (
        <textarea
          id={inputId}
          value={String(fieldValue)}
          onChange={(event) =>
            updateField(definition.key, event.target.value)
          }
          placeholder={
            definition.placeholder
              ? text(definition.placeholder, locale)
              : undefined
          }
          required={definition.required}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
          rows={4}
        />
      );
    } else if (definition.type === "select") {
      control = (
        <select
          id={inputId}
          value={String(fieldValue)}
          onChange={(event) =>
            updateField(definition.key, event.target.value)
          }
          required={definition.required}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        >
          <option value="">{selectPlaceholder(locale)}</option>
          {definition.options?.map((item) => (
            <option key={item.value} value={item.value}>
              {text(item.label, locale)}
            </option>
          ))}
        </select>
      );
    } else if (definition.type === "radio") {
      control = (
        <div
          id={inputId}
          className="choice-row"
          role="radiogroup"
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        >
          {definition.options?.map((item) => (
            <label className="choice" key={item.value}>
              <input
                type="radio"
                name={String(definition.key)}
                value={item.value}
                checked={fieldValue === item.value}
                onChange={(event) =>
                  updateField(definition.key, event.target.value)
                }
                required={definition.required}
              />
              <span>
                {text(item.label, locale)}
                {" / "}
                {text(item.label, otherLocale)}
              </span>
            </label>
          ))}
        </div>
      );
    } else if (definition.type === "checkboxes") {
      const selected = Array.isArray(fieldValue) ? fieldValue : [];
      control = (
        <div
          id={inputId}
          className="choice-row"
          role="group"
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        >
          {definition.options?.map((item) => (
            <label className="choice" key={item.value}>
              <input
                type="checkbox"
                value={item.value}
                checked={selected.includes(item.value)}
                onChange={() =>
                  toggleArrayOption(definition.key, item.value)
                }
              />
              <span>
                {text(item.label, locale)}
                {" / "}
                {text(item.label, otherLocale)}
              </span>
            </label>
          ))}
        </div>
      );
    } else {
      control = (
        <input
          id={inputId}
          type={definition.type}
          value={fieldValue as string | number}
          onChange={(event) => {
            const nextValue =
              definition.type === "number"
                ? event.target.value === ""
                  ? ""
                  : Number(event.target.value)
                : event.target.value;
            updateField(definition.key, nextValue);
          }}
          placeholder={
            definition.placeholder
              ? text(definition.placeholder, locale)
              : undefined
          }
          min={definition.min}
          max={definition.max}
          step={definition.step}
          inputMode={
            definition.type === "number" ? "decimal" : undefined
          }
          required={definition.required}
          aria-invalid={invalid}
          aria-describedby={describedBy || undefined}
        />
      );
    }

    return (
      <div className={className} key={definition.key}>
        <label htmlFor={inputId}>
          {renderPrimaryLabel(definition, locale)}
        </label>
        {control}
        {definition.help ? (
          <p className="field-help" id={helpId}>
            {text(definition.help, locale)}
            {" / "}
            {text(definition.help, otherLocale)}
          </p>
        ) : null}
        {invalid ? (
          <p className="field-error" id={errorId} role="alert">
            {requiredMessage(locale)}
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <form
        className="wizard-shell"
        onSubmit={(event) => {
          event.preventDefault();
          void handleForward();
        }}
        noValidate
      >
        <aside className="step-rail" aria-label={locale === "zh" ? "评估步骤" : "Assessment steps"}>
          <ol className="step-list">
            {intakeSteps.map((step, index) => {
              const stepCoverage = coverage.byStep[index];
              const complete =
                stepCoverage.requiredTotal > 0 &&
                stepCoverage.requiredCompleted ===
                  stepCoverage.requiredTotal;
              const stepClassName = [
                "step-button",
                index === activeStepIndex ? "is-active" : "",
                complete ? "is-complete" : ""
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li className="step-item" key={step.id}>
                  <button
                    className={stepClassName}
                    type="button"
                    onClick={() => goToStep(index)}
                    aria-current={
                      index === activeStepIndex ? "step" : undefined
                    }
                  >
                    <span className="step-number">
                      {complete ? "✓" : index + 1}
                    </span>
                    <span className="step-label">
                      <strong>{text(step.shortTitle, locale)}</strong>
                      <small>{text(step.shortTitle, otherLocale)}</small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>

        <main className="wizard-main">
          <div className="page-title-row">
            <div>
              <p className="section-copy">
                {locale === "zh"
                  ? `第 ${activeStepIndex + 1} 步，共 ${intakeSteps.length} 步`
                  : `Step ${activeStepIndex + 1} of ${intakeSteps.length}`}
              </p>
              <h1 className="page-title">
                {text(activeStep.title, locale)}
              </h1>
              <p className="page-subtitle">
                {text(activeStep.description, locale)}
                {" "}
                <strong>
                  {locale === "zh"
                    ? "仅支持中文与 English。"
                    : "Chinese & English only."}
                </strong>
              </p>
            </div>
            <button
              className="button"
              type="button"
              onClick={() => {
                setInvalidFields(new Set());
                onLoadDemo();
              }}
              disabled={submitting}
            >
              {locale === "zh" ? "载入示例" : "Load demo"}
            </button>
          </div>

          {activeStep.sections.map((section) => {
            const visibleFields = section.fields.filter((definition) =>
              fieldIsVisible(definition, value)
            );
            if (visibleFields.length === 0) return null;

            return (
              <section className="form-section" key={section.title.en}>
                <h2 className="section-title">
                  {text(section.title, locale)}
                </h2>
                <p className="section-copy">
                  {text(section.title, otherLocale)}
                  {section.description
                    ? ` · ${text(section.description, locale)}`
                    : ""}
                </p>
                <div className="form-grid">
                  {visibleFields.map(renderField)}
                </div>
              </section>
            );
          })}
        </main>

        <aside className="coverage-rail" aria-label={locale === "zh" ? "信息覆盖率" : "Information coverage"}>
          <div className="coverage-inner">
            <h2 className="coverage-title">
              {locale === "zh"
                ? "信息覆盖率"
                : "Information coverage"}
            </h2>
            <div className="coverage-value">{coverage.percent}%</div>
            <progress
              className="progress-track"
              value={coverage.percent}
              max={100}
              aria-label={
                locale === "zh" ? "总体信息覆盖率" : "Overall information coverage"
              }
            />
            <p className="section-copy">
              {locale === "zh"
                ? `${coverage.completed}/${coverage.total} 项已有资料；必填 ${coverage.requiredCompleted}/${coverage.requiredTotal}`
                : `${coverage.completed}/${coverage.total} items supplied; ${coverage.requiredCompleted}/${coverage.requiredTotal} required`}
            </p>

            <ol className="coverage-list">
              {intakeSteps.map((step, index) => {
                const item = coverage.byStep[index];
                return (
                  <li className="coverage-item" key={step.id}>
                    <span className="coverage-index">{index + 1}</span>
                    <span>
                      {text(step.shortTitle, locale)}
                      <progress
                        className="mini-progress"
                        value={item.percent}
                        max={100}
                        aria-label={`${text(step.shortTitle, locale)} ${item.percent}%`}
                      />
                    </span>
                    <span>{item.percent}%</span>
                  </li>
                );
              })}
            </ol>

            <p className="coverage-note">
              <span aria-hidden="true">ⓘ</span>
              <span>
                {locale === "zh"
                  ? "红色 * 为必填。覆盖率衡量资料完整度，不代表商业评分；证据质量与逻辑一致性会另外评估。"
                  : "A red * marks required data. Coverage measures completeness, not business quality; evidence and consistency are assessed separately."}
              </span>
            </p>
          </div>
        </aside>

        <div className="bottom-action-bar">
          <div
            className={`validation-status${currentMissing.length > 0 ? " has-errors" : ""}`}
            role="status"
          >
            <span aria-hidden="true">
              {currentMissing.length > 0 ? "○" : "✓"}
            </span>
            <span>
              {currentMissing.length > 0
                ? locale === "zh"
                  ? `本步还有 ${currentMissing.length} 个必填项`
                  : `${currentMissing.length} required item${currentMissing.length === 1 ? "" : "s"} remaining`
                : locale === "zh"
                  ? "本步必填信息完整"
                  : "Required data complete for this step"}
              {savedAtLabel ? ` · ${savedAtLabel}` : ""}
            </span>
          </div>

          <div className="button-group">
            <button
              className="button ghost"
              type="button"
              onClick={() => void onSave(value)}
              disabled={submitting}
            >
              {text(uiCopy.actions.saveDraft, locale)}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => goToStep(activeStepIndex - 1)}
              disabled={activeStepIndex === 0 || submitting}
            >
              ← {text(uiCopy.actions.back, locale)}
            </button>
            <button
              className="button primary"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? locale === "zh"
                  ? "正在评估…"
                  : "Assessing…"
                : activeStepIndex === intakeSteps.length - 1
                  ? text(uiCopy.actions.assess, locale)
                  : `${text(uiCopy.actions.continue, locale)} →`}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export default IntakeWizard;

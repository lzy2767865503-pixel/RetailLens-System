import { z } from "zod";
import type {
  BilingualLabel,
  BusinessInput,
  DimensionId
} from "./types";

const RequiredText = z.string().trim().min(1).max(2_000);
const OptionalNarrative = z.string().trim().max(4_000);
const NonNegative = z.number().finite().nonnegative();
const Percentage = z.number().finite().min(0).max(100);
const StrengthFive = z.number().finite().int().min(1).max(5);
const RatingFour = z.number().finite().int().min(1).max(4);
const RatingSeven = z.number().finite().int().min(1).max(7);

const GateStatusSchema = z.enum([
  "pass",
  "review",
  "fail",
  "unknown"
]);

const BilingualLabelSchema = z
  .object({
    zh: z.string().trim().min(1).max(400),
    en: z.string().trim().min(1).max(400)
  })
  .strict();

const WeightedFactorSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    label: BilingualLabelSchema,
    weight: z.number().finite().min(0).max(1),
    rating: z.number().finite().min(1).max(4),
    note: BilingualLabelSchema.optional()
  })
  .strict();

const QspmFactorSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    label: BilingualLabelSchema,
    source: z.enum(["EFE", "IFE"]),
    weight: z.number().finite().min(0).max(1),
    attractivenessScores: z.array(
      z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.null()])
    )
  })
  .strict();

const CpmFactorSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    labelZh: z.string().trim().min(1).max(400),
    labelEn: z.string().trim().min(1).max(400),
    weight: z.number().finite().min(0).max(1),
    companyRating: RatingFour,
    competitorARating: RatingFour,
    competitorBRating: RatingFour
  })
  .strict();

const RaterSchema = z
  .object({
    reliability: RatingSeven,
    responsiveness: RatingSeven,
    assurance: RatingSeven,
    empathy: RatingSeven,
    tangibles: RatingSeven
  })
  .strict();

const EntryModeFitSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    label: BilingualLabelSchema,
    fit: z
      .object({
        control: StrengthFive,
        capitalEfficiency: StrengthFive,
        speed: StrengthFive,
        adaptation: StrengthFive,
        ipProtection: StrengthFive,
        localKnowledge: StrengthFive,
        partnerFeasibility: StrengthFive,
        supplyAccess: StrengthFive,
        exitFlexibility: StrengthFive
      })
      .strict()
  })
  .strict();

export const BusinessInputSchema = z
  .object({
    identity: z
      .object({
        name: RequiredText,
        category: RequiredText,
        stage: z.enum(["idea", "pre_launch", "operating", "scaling"]),
        objective: RequiredText,
        decisionHorizon: RequiredText
      })
      .strict(),
    geography: z
      .object({
        homeCountry: RequiredText,
        targetCountry: RequiredText,
        stateCity: RequiredText,
        catchment: RequiredText,
        currency: z.string().trim().min(3).max(12)
      })
      .strict(),
    model: z
      .object({
        type: z.enum(["physical", "digital", "hybrid"]),
        retailFormat: RequiredText,
        channels: z.array(z.string().trim().min(1).max(160)).min(1).max(12),
        candidateEntryMode: RequiredText
      })
      .strict(),
    customer: z
      .object({
        targetSegment: RequiredText,
        payerAndUser: RequiredText,
        jobOrPain: RequiredText,
        buyingOccasion: RequiredText,
        currentAlternative: RequiredText,
        willingnessToPayEvidence: RequiredText,
        marketDemandEvidence: RequiredText,
        competitors: RequiredText
      })
      .strict(),
    offer: z
      .object({
        valueProposition: RequiredText,
        assortment: RequiredText,
        pricePosition: RequiredText,
        differentiation: RequiredText,
        reasonToBelieve: RequiredText,
        growthStrategy: RequiredText
      })
      .strict(),
    compliance: z
      .object({
        ownership: GateStatusSchema,
        licences: GateStatusSchema,
        productSafety: GateStatusSchema,
        privacyPayment: GateStatusSchema,
        labourSupplier: GateStatusSchema,
        fxTreasury: GateStatusSchema,
        infrastructure: GateStatusSchema,
        ethicsSanctions: GateStatusSchema,
        currentEvidence: OptionalNarrative
      })
      .strict(),
    channelLocation: z
      .object({
        channelRoles: RequiredText,
        acquisitionRoute: RequiredText,
        fulfilmentRoute: RequiredText,
        digitalConversionRate: Percentage,
        platformFeeRate: Percentage,
        siteType: OptionalNarrative,
        footfallPerMonth: NonNegative,
        storeConversionRate: Percentage,
        usableArea: NonNegative,
        annualOccupancyCost: NonNegative,
        annualSiteSalesForecast: NonNegative
      })
      .strict(),
    supply: z
      .object({
        supplierCount: z.number().int().finite().nonnegative(),
        topSupplierShare: Percentage,
        leadTimeDays: NonNegative,
        serviceLevel: Percentage,
        stockoutRate: Percentage,
        inventoryPlan: RequiredText,
        qualityLogisticsRisk: RequiredText,
        mitigation: RequiredText
      })
      .strict(),
    financial: z
      .object({
        monthlyRevenue: NonNegative,
        monthlyCogs: NonNegative,
        monthlyVariableCosts: NonNegative,
        monthlyFixedCosts: NonNegative,
        monthlyUnits: NonNegative,
        averagePrice: NonNegative,
        monthlyOccupancyCost: NonNegative,
        monthlyMarketingSpend: NonNegative,
        launchCapex: NonNegative,
        workingCapitalNeed: NonNegative,
        fundingAvailable: NonNegative,
        monthlyBurn: NonNegative,
        cashRunwayMonths: NonNegative,
        cac: NonNegative,
        clv: NonNegative,
        downsideMonthlyRevenue: NonNegative
      })
      .strict(),
    marketing: z
      .object({
        positioning: RequiredText,
        acquisitionChannels: RequiredText,
        crmRetention: RequiredText,
        servicePromise: RequiredText,
        complaintReturnsProcess: RequiredText
      })
      .strict(),
    organization: z
      .object({
        teamAndKeyRoles: RequiredText,
        retailCountryExperience: RequiredText,
        capabilityGaps: RequiredText,
        localPartner: RequiredText,
        decisionRights: RequiredText,
        milestones: RequiredText,
        kpiOwners: RequiredText
      })
      .strict(),
    riskEvidence: z
      .object({
        topRisks: RequiredText,
        mitigations: RequiredText,
        evidenceSource: RequiredText,
        evidenceDate: z.string().trim().min(4).max(40),
        evidenceConfidence: z.enum(["low", "medium", "high"]),
        assumptions: RequiredText
      })
      .strict(),
    enterprise: z
      .object({
        fiveForces: z
          .object({
            rivalry: StrengthFive,
            newEntrants: StrengthFive,
            substitutes: StrengthFive,
            buyerPower: StrengthFive,
            supplierPower: StrengthFive
          })
          .strict(),
        cpm: z
          .object({
            competitorAName: RequiredText,
            competitorBName: RequiredText,
            factors: z.array(CpmFactorSchema).min(3).max(12)
          })
          .strict(),
        stp: z
          .object({
            segmentAttractiveness: z
              .object({
                sizeGrowth: StrengthFive,
                profitability: StrengthFive,
                accessibility: StrengthFive,
                measurability: StrengthFive,
                strategicFit: StrengthFive
              })
              .strict(),
            rightToWin: z
              .object({
                differentiation: StrengthFive,
                capability: StrengthFive,
                channelAccess: StrengthFive,
                credibility: StrengthFive
              })
              .strict(),
            targetingStrategy: z.enum([
              "undifferentiated",
              "differentiated",
              "concentrated"
            ]),
            position: z
              .object({
                customerClarity: StrengthFive,
                competitorDistinctiveness: StrengthFive,
                evidenceStrength: StrengthFive,
                deliveryConsistency: StrengthFive
              })
              .strict()
          })
          .strict(),
        entryModes: z.array(EntryModeFitSchema).length(2),
        financeProductivity: z
          .object({
            monthlyNetProfit: z.number().finite(),
            totalAssets: NonNegative,
            averageInventory: NonNegative
          })
          .strict(),
        serviceGaps: z
          .object({
            expectations: RaterSchema,
            perceptions: RaterSchema,
            organizationGaps: z
              .object({
                knowledge: StrengthFive,
                standards: StrengthFive,
                delivery: StrengthFive,
                communication: StrengthFive
              })
              .strict()
          })
          .strict(),
        organizationControl: z
          .object({
            policyCoveragePct: Percentage,
            processCoveragePct: Percentage,
            kpiCoveragePct: Percentage,
            reviewCadenceDays: z.number().finite().int().min(1).max(3_650),
            varianceTolerancePct: Percentage
          })
          .strict(),
        topRisk: z
          .object({
            name: BilingualLabelSchema,
            likelihood: StrengthFive,
            impact: StrengthFive,
            controlEffectivenessPct: Percentage,
            kriDefined: z.boolean(),
            triggerDefined: z.boolean(),
            contingencyFunded: z.boolean()
          })
          .strict()
      })
      .strict(),
    frameworks: z
      .object({
        efe: z.array(WeightedFactorSchema).max(30),
        ife: z.array(WeightedFactorSchema).max(30),
        qspm: z
          .object({
            strategies: z.array(BilingualLabelSchema).max(6),
            factors: z.array(QspmFactorSchema).max(60)
          })
          .strict()
      })
      .strict()
  })
  .strict() satisfies z.ZodType<BusinessInput>;

export type RequiredFieldPath =
  | "identity.name"
  | "identity.category"
  | "identity.objective"
  | "identity.decisionHorizon"
  | "geography.homeCountry"
  | "geography.targetCountry"
  | "geography.stateCity"
  | "geography.catchment"
  | "geography.currency"
  | "model.retailFormat"
  | "model.channels"
  | "model.candidateEntryMode"
  | "customer.targetSegment"
  | "customer.payerAndUser"
  | "customer.jobOrPain"
  | "customer.buyingOccasion"
  | "customer.currentAlternative"
  | "customer.willingnessToPayEvidence"
  | "customer.marketDemandEvidence"
  | "customer.competitors"
  | "offer.valueProposition"
  | "offer.assortment"
  | "offer.pricePosition"
  | "offer.differentiation"
  | "offer.reasonToBelieve"
  | "offer.growthStrategy"
  | "compliance.currentEvidence"
  | "channelLocation.channelRoles"
  | "channelLocation.acquisitionRoute"
  | "channelLocation.fulfilmentRoute"
  | "supply.inventoryPlan"
  | "supply.qualityLogisticsRisk"
  | "supply.mitigation"
  | "marketing.positioning"
  | "marketing.acquisitionChannels"
  | "marketing.crmRetention"
  | "marketing.servicePromise"
  | "marketing.complaintReturnsProcess"
  | "organization.teamAndKeyRoles"
  | "organization.retailCountryExperience"
  | "organization.capabilityGaps"
  | "organization.localPartner"
  | "organization.decisionRights"
  | "organization.milestones"
  | "organization.kpiOwners"
  | "riskEvidence.topRisks"
  | "riskEvidence.mitigations"
  | "riskEvidence.evidenceSource"
  | "riskEvidence.evidenceDate"
  | "riskEvidence.assumptions"
  | "enterprise.fiveForces"
  | "enterprise.cpm.factors"
  | "enterprise.stp"
  | "enterprise.entryModes"
  | "enterprise.financeProductivity"
  | "enterprise.serviceGaps"
  | "enterprise.organizationControl"
  | "enterprise.topRisk";

export interface RequiredFieldDefinition {
  path: RequiredFieldPath;
  label: BilingualLabel;
  dimension: DimensionId;
  conditional?: "physical_or_hybrid";
}

export const REQUIRED_FIELDS: RequiredFieldDefinition[] = [
  { path: "identity.name", label: { zh: "企业名称", en: "Business name" }, dimension: "strategy_differentiation" },
  { path: "identity.category", label: { zh: "商品品类", en: "Category" }, dimension: "strategy_differentiation" },
  { path: "identity.objective", label: { zh: "评估目的", en: "Assessment objective" }, dimension: "organization_execution" },
  { path: "identity.decisionHorizon", label: { zh: "决策期限", en: "Decision horizon" }, dimension: "organization_execution" },
  { path: "geography.homeCountry", label: { zh: "母国", en: "Home country" }, dimension: "country_compliance" },
  { path: "geography.targetCountry", label: { zh: "目标国家", en: "Target country" }, dimension: "country_compliance" },
  { path: "geography.stateCity", label: { zh: "目标州省与城市", en: "Target state/city" }, dimension: "location_trade_area" },
  { path: "geography.catchment", label: { zh: "商圈范围", en: "Catchment" }, dimension: "location_trade_area", conditional: "physical_or_hybrid" },
  { path: "geography.currency", label: { zh: "经营币种", en: "Operating currency" }, dimension: "financial_unit_economics" },
  { path: "model.retailFormat", label: { zh: "零售业态", en: "Retail format" }, dimension: "strategy_differentiation" },
  { path: "model.channels", label: { zh: "经营渠道", en: "Channels" }, dimension: "channels_digital" },
  { path: "model.candidateEntryMode", label: { zh: "候选进入模式", en: "Candidate entry mode" }, dimension: "country_compliance" },
  { path: "customer.targetSegment", label: { zh: "目标顾客", en: "Target segment" }, dimension: "market_customer" },
  { path: "customer.payerAndUser", label: { zh: "付款者与使用者", en: "Payer and user" }, dimension: "market_customer" },
  { path: "customer.jobOrPain", label: { zh: "顾客任务或痛点", en: "Customer job or pain" }, dimension: "market_customer" },
  { path: "customer.buyingOccasion", label: { zh: "购买场景", en: "Buying occasion" }, dimension: "market_customer" },
  { path: "customer.currentAlternative", label: { zh: "当前替代方案", en: "Current alternative" }, dimension: "market_customer" },
  { path: "customer.willingnessToPayEvidence", label: { zh: "支付意愿证据", en: "Willingness-to-pay evidence" }, dimension: "market_customer" },
  { path: "customer.marketDemandEvidence", label: { zh: "市场需求证据", en: "Market-demand evidence" }, dimension: "market_customer" },
  { path: "customer.competitors", label: { zh: "直接与间接竞争者", en: "Direct and indirect competitors" }, dimension: "market_customer" },
  { path: "offer.valueProposition", label: { zh: "价值主张", en: "Value proposition" }, dimension: "strategy_differentiation" },
  { path: "offer.assortment", label: { zh: "商品组合", en: "Assortment" }, dimension: "merchandise_supply_chain" },
  { path: "offer.pricePosition", label: { zh: "价格定位", en: "Price position" }, dimension: "strategy_differentiation" },
  { path: "offer.differentiation", label: { zh: "可防守差异", en: "Defensible difference" }, dimension: "strategy_differentiation" },
  { path: "offer.reasonToBelieve", label: { zh: "可信理由", en: "Reason to believe" }, dimension: "strategy_differentiation" },
  { path: "offer.growthStrategy", label: { zh: "增长路径", en: "Growth strategy" }, dimension: "strategy_differentiation" },
  { path: "compliance.currentEvidence", label: { zh: "合规证据", en: "Compliance evidence" }, dimension: "country_compliance" },
  { path: "channelLocation.channelRoles", label: { zh: "渠道角色", en: "Channel roles" }, dimension: "channels_digital" },
  { path: "channelLocation.acquisitionRoute", label: { zh: "获客路径", en: "Acquisition route" }, dimension: "channels_digital" },
  { path: "channelLocation.fulfilmentRoute", label: { zh: "履约路径", en: "Fulfilment route" }, dimension: "channels_digital" },
  { path: "supply.inventoryPlan", label: { zh: "库存计划", en: "Inventory plan" }, dimension: "merchandise_supply_chain" },
  { path: "supply.qualityLogisticsRisk", label: { zh: "质量与物流风险", en: "Quality and logistics risks" }, dimension: "merchandise_supply_chain" },
  { path: "supply.mitigation", label: { zh: "供应缓解方案", en: "Supply mitigation" }, dimension: "merchandise_supply_chain" },
  { path: "marketing.positioning", label: { zh: "市场定位", en: "Positioning" }, dimension: "marketing_crm_service" },
  { path: "marketing.acquisitionChannels", label: { zh: "获客渠道", en: "Acquisition channels" }, dimension: "marketing_crm_service" },
  { path: "marketing.crmRetention", label: { zh: "CRM 与留存", en: "CRM and retention" }, dimension: "marketing_crm_service" },
  { path: "marketing.servicePromise", label: { zh: "服务承诺", en: "Service promise" }, dimension: "marketing_crm_service" },
  { path: "marketing.complaintReturnsProcess", label: { zh: "投诉退货流程", en: "Complaint and returns process" }, dimension: "marketing_crm_service" },
  { path: "organization.teamAndKeyRoles", label: { zh: "团队与关键岗位", en: "Team and key roles" }, dimension: "organization_execution" },
  { path: "organization.retailCountryExperience", label: { zh: "零售与目标国经验", en: "Retail and target-country experience" }, dimension: "organization_execution" },
  { path: "organization.capabilityGaps", label: { zh: "能力缺口", en: "Capability gaps" }, dimension: "organization_execution" },
  { path: "organization.localPartner", label: { zh: "本地伙伴", en: "Local partner" }, dimension: "organization_execution" },
  { path: "organization.decisionRights", label: { zh: "决策权", en: "Decision rights" }, dimension: "organization_execution" },
  { path: "organization.milestones", label: { zh: "里程碑", en: "Milestones" }, dimension: "organization_execution" },
  { path: "organization.kpiOwners", label: { zh: "KPI 负责人", en: "KPI owners" }, dimension: "organization_execution" },
  { path: "riskEvidence.topRisks", label: { zh: "主要风险", en: "Top risks" }, dimension: "risk_sustainability" },
  { path: "riskEvidence.mitigations", label: { zh: "风险缓解", en: "Risk mitigation" }, dimension: "risk_sustainability" },
  { path: "riskEvidence.evidenceSource", label: { zh: "证据来源", en: "Evidence source" }, dimension: "risk_sustainability" },
  { path: "riskEvidence.evidenceDate", label: { zh: "证据日期", en: "Evidence date" }, dimension: "risk_sustainability" },
  { path: "riskEvidence.assumptions", label: { zh: "关键假设", en: "Key assumptions" }, dimension: "risk_sustainability" },
  { path: "enterprise.fiveForces", label: { zh: "行业五力", en: "Industry Five Forces" }, dimension: "market_customer" },
  { path: "enterprise.cpm.factors", label: { zh: "竞争态势矩阵", en: "Competitive Profile Matrix" }, dimension: "strategy_differentiation" },
  { path: "enterprise.stp", label: { zh: "STP 决策量表", en: "STP decision scales" }, dimension: "market_customer" },
  { path: "enterprise.entryModes", label: { zh: "进入模式方案", en: "Entry-mode options" }, dimension: "country_compliance" },
  { path: "enterprise.financeProductivity", label: { zh: "财务与资产生产力", en: "Financial and asset productivity" }, dimension: "financial_unit_economics" },
  { path: "enterprise.serviceGaps", label: { zh: "服务与组织缺口", en: "Service and organization gaps" }, dimension: "marketing_crm_service" },
  { path: "enterprise.organizationControl", label: { zh: "组织控制", en: "Organization control" }, dimension: "organization_execution" },
  { path: "enterprise.topRisk", label: { zh: "首要风险控制", en: "Top-risk control" }, dimension: "risk_sustainability" }
];

export function readPath(input: BusinessInput, path: RequiredFieldPath): unknown {
  return path.split(".").reduce<unknown>((value, part) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[part];
  }, input);
}

export function applicableRequiredFields(
  input: BusinessInput
): RequiredFieldDefinition[] {
  return REQUIRED_FIELDS.filter(
    (field) =>
      field.conditional !== "physical_or_hybrid" ||
      input.model.type !== "digital"
  );
}

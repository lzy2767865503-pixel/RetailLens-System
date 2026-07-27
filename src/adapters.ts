import type {
  RetailIntakeDraft
} from "./components/IntakeWizard";
import type {
  RetailReportViewModel
} from "./components/ReportView";
import type {
  StrategyFrameworkData
} from "./components/StrategyMatrices";
import type {
  BusinessInput,
  BusinessScore,
  EvidenceConfidence,
  GateStatus
} from "./domain";

const numberValue = (value: number | string) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const yesNoValue = (value: string) => value === "yes";

const parseCpmExtraFactors = (
  value: string
): BusinessInput["enterprise"]["cpm"]["factors"] => {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? (parsed as BusinessInput["enterprise"]["cpm"]["factors"])
      : [];
  } catch {
    return [];
  }
};

const gateValue = (value: string): GateStatus =>
  value === "pass" ||
  value === "review" ||
  value === "fail" ||
  value === "unknown"
    ? value
    : "unknown";

const evidenceConfidence = (value: string): EvidenceConfidence =>
  value === "high" || value === "medium" || value === "low"
    ? value
    : "low";

export const EMPTY_FRAMEWORKS: BusinessInput["frameworks"] = {
  efe: [],
  ife: [],
  qspm: {
    strategies: [],
    factors: []
  }
};

export function draftToBusiness(
  draft: RetailIntakeDraft,
  frameworks: BusinessInput["frameworks"] = EMPTY_FRAMEWORKS
): BusinessInput {
  const monthlyRevenue = numberValue(draft.monthlyRevenue);
  const downsidePercent = numberValue(draft.downsideRevenuePct);
  const annualOccupancy =
    (numberValue(draft.monthlyRent) +
      numberValue(draft.monthlyCommonAreaCharges)) *
    12;

  return {
    identity: {
      name: draft.businessName.trim(),
      category: draft.businessCategory.trim(),
      stage:
        draft.businessStage === "idea" ||
        draft.businessStage === "pre_launch" ||
        draft.businessStage === "operating" ||
        draft.businessStage === "scaling"
          ? draft.businessStage
          : "idea",
      objective:
        [draft.assessmentObjective, draft.businessSummary]
          .filter(Boolean)
          .join(": ")
          .trim() || "unknown",
      decisionHorizon: `${numberValue(draft.decisionHorizonMonths)} months`
    },
    geography: {
      homeCountry: draft.homeCountry.trim(),
      targetCountry: draft.targetCountry.trim(),
      stateCity: [draft.targetStateRegion, draft.targetCity]
        .filter(Boolean)
        .join(", ")
        .trim(),
      catchment:
        draft.operatingModel === "digital"
          ? "Digital-only / N/A"
          : draft.catchmentDefinition.trim(),
      currency: draft.currency.trim().toUpperCase()
    },
    model: {
      type:
        draft.operatingModel === "digital" ||
        draft.operatingModel === "hybrid" ||
        draft.operatingModel === "physical"
          ? draft.operatingModel
          : "physical",
      retailFormat: draft.retailFormat.trim(),
      channels: draft.salesChannels,
      candidateEntryMode: draft.entryMode.trim()
    },
    customer: {
      targetSegment: draft.targetSegment.trim(),
      payerAndUser: draft.payerUserRelationship.trim(),
      jobOrPain: draft.customerJobPain.trim(),
      buyingOccasion: draft.purchaseOccasion.trim(),
      currentAlternative: draft.currentAlternative.trim(),
      willingnessToPayEvidence: draft.willingnessToPayEvidence.trim(),
      marketDemandEvidence: [
        draft.demandEvidence,
        draft.marketEvidence,
        draft.estimatedCustomerCount === ""
          ? ""
          : `Estimated addressable customers: ${draft.estimatedCustomerCount}`
      ]
        .filter(Boolean)
        .join("\n"),
      competitors: draft.mainCompetitors.trim()
    },
    offer: {
      valueProposition: draft.valueProposition.trim(),
      assortment: draft.assortmentStrategy.trim(),
      pricePosition: draft.pricingPosition.trim(),
      differentiation: draft.differentiationEvidence.trim(),
      reasonToBelieve: draft.reasonToBelieve.trim(),
      growthStrategy: draft.growthStrategy.trim()
    },
    compliance: {
      ownership: gateValue(draft.ownershipGate),
      licences: gateValue(draft.licenseGate),
      productSafety: gateValue(draft.productSafetyGate),
      privacyPayment: gateValue(draft.privacyPaymentGate),
      labourSupplier: gateValue(draft.labourSupplierGate),
      fxTreasury: gateValue(draft.fxGate),
      infrastructure: gateValue(draft.infrastructureGate),
      ethicsSanctions: gateValue(draft.ethicsGate),
      currentEvidence: draft.complianceNotes.trim()
    },
    channelLocation: {
      channelRoles: draft.channelRoles.trim(),
      acquisitionRoute: draft.trafficSource.trim(),
      fulfilmentRoute: draft.fulfilmentModel.trim(),
      digitalConversionRate: numberValue(draft.conversionRatePct),
      platformFeeRate: numberValue(draft.platformFeeRatePct),
      siteType: draft.siteType.trim(),
      footfallPerMonth: numberValue(draft.monthlyFootfall),
      storeConversionRate: numberValue(draft.storeConversionRatePct),
      usableArea: numberValue(draft.siteAreaSqm),
      annualOccupancyCost: annualOccupancy,
      annualSiteSalesForecast: numberValue(
        draft.annualSiteSalesForecast
      )
    },
    supply: {
      supplierCount: Math.round(numberValue(draft.supplierCount)),
      topSupplierShare: numberValue(draft.topSupplierSharePct),
      leadTimeDays: numberValue(draft.leadTimeDays),
      serviceLevel: numberValue(draft.inventoryServiceLevelPct),
      stockoutRate: numberValue(draft.stockoutRatePct),
      inventoryPlan: [
        draft.replenishmentModel,
        draft.inventoryTurnover === ""
          ? ""
          : `Inventory turnover: ${draft.inventoryTurnover}`
      ]
        .filter(Boolean)
        .join("; "),
      qualityLogisticsRisk: draft.inventoryRisks.trim(),
      mitigation: draft.supplyMitigation.trim()
    },
    financial: {
      monthlyRevenue,
      monthlyCogs: numberValue(draft.monthlyCogs),
      monthlyVariableCosts: numberValue(draft.monthlyVariableCost),
      monthlyFixedCosts: numberValue(draft.monthlyFixedCost),
      monthlyUnits: numberValue(draft.monthlyUnits),
      averagePrice: numberValue(draft.averageSellingPrice),
      monthlyOccupancyCost: numberValue(draft.monthlyOccupancyCost),
      monthlyMarketingSpend: numberValue(draft.monthlyMarketingSpend),
      launchCapex: numberValue(draft.capex),
      workingCapitalNeed: numberValue(draft.workingCapital),
      fundingAvailable: numberValue(draft.fundingAvailable),
      monthlyBurn: numberValue(draft.monthlyBurn),
      cashRunwayMonths: numberValue(draft.runwayMonths),
      cac: numberValue(draft.cac),
      clv: numberValue(draft.clv),
      downsideMonthlyRevenue:
        monthlyRevenue * Math.max(0, 1 - downsidePercent / 100)
    },
    marketing: {
      positioning: draft.positioningStatement.trim(),
      acquisitionChannels: draft.acquisitionPlan.trim(),
      crmRetention: draft.crmRetentionPlan.trim(),
      servicePromise: draft.servicePromise.trim(),
      complaintReturnsProcess: draft.complaintReturnsProcess.trim()
    },
    organization: {
      teamAndKeyRoles: [
        draft.teamAndKeyRoles,
        draft.teamSize === "" ? "" : `Team size: ${draft.teamSize}`
      ]
        .filter(Boolean)
        .join("; "),
      retailCountryExperience: draft.leadershipRetailExperience.trim(),
      capabilityGaps: draft.capabilityGaps.trim(),
      localPartner: draft.localPartner.trim(),
      decisionRights: draft.decisionRights.trim(),
      milestones: [
        draft.keyMilestones,
        draft.plannedLaunchDate
          ? `Planned launch: ${draft.plannedLaunchDate}`
          : ""
      ]
        .filter(Boolean)
        .join("; "),
      kpiOwners: draft.kpiOwners.trim()
    },
    riskEvidence: {
      topRisks: draft.topRisks.trim(),
      mitigations: draft.riskMitigation.trim(),
      evidenceSource: [
        draft.evidenceSource,
        draft.marketEvidenceSource,
        draft.financialEvidence
      ]
        .filter(Boolean)
        .join("; "),
      evidenceDate:
        draft.evidenceAsOfDate || draft.marketEvidenceDate || "unknown",
      evidenceConfidence: evidenceConfidence(
        draft.evidenceConfidence || draft.marketEvidenceConfidence
      ),
      assumptions: [
        draft.assumptionsLimitations,
        draft.downsideCostIncreasePct === ""
          ? ""
          : `Downside cost increase: ${draft.downsideCostIncreasePct}%`
      ]
        .filter(Boolean)
        .join("; ")
    },
    enterprise: {
      fiveForces: {
        rivalry: numberValue(draft.fiveForcesRivalry),
        newEntrants: numberValue(draft.fiveForcesNewEntrants),
        substitutes: numberValue(draft.fiveForcesSubstitutes),
        buyerPower: numberValue(draft.fiveForcesBuyerPower),
        supplierPower: numberValue(draft.fiveForcesSupplierPower)
      },
      cpm: {
        competitorAName: draft.cpmCompetitorAName.trim(),
        competitorBName: draft.cpmCompetitorBName.trim(),
        factors: [
          {
            id: draft.cpmFactor1Id.trim() || "cpm-factor-1",
            labelZh: draft.cpmFactor1LabelZh.trim(),
            labelEn: draft.cpmFactor1LabelEn.trim(),
            weight: numberValue(draft.cpmFactor1Weight),
            companyRating: numberValue(draft.cpmFactor1CompanyRating),
            competitorARating: numberValue(
              draft.cpmFactor1CompetitorARating
            ),
            competitorBRating: numberValue(
              draft.cpmFactor1CompetitorBRating
            )
          },
          {
            id: draft.cpmFactor2Id.trim() || "cpm-factor-2",
            labelZh: draft.cpmFactor2LabelZh.trim(),
            labelEn: draft.cpmFactor2LabelEn.trim(),
            weight: numberValue(draft.cpmFactor2Weight),
            companyRating: numberValue(draft.cpmFactor2CompanyRating),
            competitorARating: numberValue(
              draft.cpmFactor2CompetitorARating
            ),
            competitorBRating: numberValue(
              draft.cpmFactor2CompetitorBRating
            )
          },
          {
            id: draft.cpmFactor3Id.trim() || "cpm-factor-3",
            labelZh: draft.cpmFactor3LabelZh.trim(),
            labelEn: draft.cpmFactor3LabelEn.trim(),
            weight: numberValue(draft.cpmFactor3Weight),
            companyRating: numberValue(draft.cpmFactor3CompanyRating),
            competitorARating: numberValue(
              draft.cpmFactor3CompetitorARating
            ),
            competitorBRating: numberValue(
              draft.cpmFactor3CompetitorBRating
            )
          },
          ...parseCpmExtraFactors(draft.cpmExtraFactorsJson)
        ]
      },
      stp: {
        segmentAttractiveness: {
          sizeGrowth: numberValue(draft.stpSegmentSizeGrowth),
          profitability: numberValue(draft.stpSegmentProfitability),
          accessibility: numberValue(draft.stpSegmentAccessibility),
          measurability: numberValue(draft.stpSegmentMeasurability),
          strategicFit: numberValue(draft.stpSegmentStrategicFit)
        },
        rightToWin: {
          differentiation: numberValue(
            draft.stpRightToWinDifferentiation
          ),
          capability: numberValue(draft.stpRightToWinCapability),
          channelAccess: numberValue(
            draft.stpRightToWinChannelAccess
          ),
          credibility: numberValue(draft.stpRightToWinCredibility)
        },
        targetingStrategy:
          draft.stpTargetingStrategy === "undifferentiated" ||
          draft.stpTargetingStrategy === "differentiated" ||
          draft.stpTargetingStrategy === "concentrated"
            ? draft.stpTargetingStrategy
            : "concentrated",
        position: {
          customerClarity: numberValue(
            draft.stpPositionCustomerClarity
          ),
          competitorDistinctiveness: numberValue(
            draft.stpPositionCompetitorDistinctiveness
          ),
          evidenceStrength: numberValue(
            draft.stpPositionEvidenceStrength
          ),
          deliveryConsistency: numberValue(
            draft.stpPositionDeliveryConsistency
          )
        }
      },
      entryModes: [
        {
          id: draft.entryMode1Id.trim() || "entry-mode-1",
          label: {
            zh: draft.entryMode1LabelZh.trim(),
            en: draft.entryMode1LabelEn.trim()
          },
          fit: {
            control: numberValue(draft.entryMode1Control),
            capitalEfficiency: numberValue(
              draft.entryMode1CapitalEfficiency
            ),
            speed: numberValue(draft.entryMode1Speed),
            adaptation: numberValue(draft.entryMode1Adaptation),
            ipProtection: numberValue(draft.entryMode1IpProtection),
            localKnowledge: numberValue(
              draft.entryMode1LocalKnowledge
            ),
            partnerFeasibility: numberValue(
              draft.entryMode1PartnerFeasibility
            ),
            supplyAccess: numberValue(draft.entryMode1SupplyAccess),
            exitFlexibility: numberValue(
              draft.entryMode1ExitFlexibility
            )
          }
        },
        {
          id: draft.entryMode2Id.trim() || "entry-mode-2",
          label: {
            zh: draft.entryMode2LabelZh.trim(),
            en: draft.entryMode2LabelEn.trim()
          },
          fit: {
            control: numberValue(draft.entryMode2Control),
            capitalEfficiency: numberValue(
              draft.entryMode2CapitalEfficiency
            ),
            speed: numberValue(draft.entryMode2Speed),
            adaptation: numberValue(draft.entryMode2Adaptation),
            ipProtection: numberValue(draft.entryMode2IpProtection),
            localKnowledge: numberValue(
              draft.entryMode2LocalKnowledge
            ),
            partnerFeasibility: numberValue(
              draft.entryMode2PartnerFeasibility
            ),
            supplyAccess: numberValue(draft.entryMode2SupplyAccess),
            exitFlexibility: numberValue(
              draft.entryMode2ExitFlexibility
            )
          }
        }
      ],
      financeProductivity: {
        monthlyNetProfit: numberValue(
          draft.enterpriseMonthlyNetProfit
        ),
        totalAssets: numberValue(draft.enterpriseTotalAssets),
        averageInventory: numberValue(
          draft.enterpriseAverageInventory
        )
      },
      serviceGaps: {
        expectations: {
          reliability: numberValue(
            draft.serviceExpectationReliability
          ),
          responsiveness: numberValue(
            draft.serviceExpectationResponsiveness
          ),
          assurance: numberValue(draft.serviceExpectationAssurance),
          empathy: numberValue(draft.serviceExpectationEmpathy),
          tangibles: numberValue(draft.serviceExpectationTangibles)
        },
        perceptions: {
          reliability: numberValue(
            draft.servicePerceptionReliability
          ),
          responsiveness: numberValue(
            draft.servicePerceptionResponsiveness
          ),
          assurance: numberValue(draft.servicePerceptionAssurance),
          empathy: numberValue(draft.servicePerceptionEmpathy),
          tangibles: numberValue(draft.servicePerceptionTangibles)
        },
        organizationGaps: {
          knowledge: numberValue(draft.organizationGapKnowledge),
          standards: numberValue(draft.organizationGapStandards),
          delivery: numberValue(draft.organizationGapDelivery),
          communication: numberValue(
            draft.organizationGapCommunication
          )
        }
      },
      organizationControl: {
        policyCoveragePct: numberValue(
          draft.controlPolicyCoveragePct
        ),
        processCoveragePct: numberValue(
          draft.controlProcessCoveragePct
        ),
        kpiCoveragePct: numberValue(draft.controlKpiCoveragePct),
        reviewCadenceDays: numberValue(
          draft.controlReviewCadenceDays
        ),
        varianceTolerancePct: numberValue(
          draft.controlVarianceTolerancePct
        )
      },
      topRisk: {
        name: {
          zh: draft.topRiskNameZh.trim(),
          en: draft.topRiskNameEn.trim()
        },
        likelihood: numberValue(draft.topRiskLikelihood),
        impact: numberValue(draft.topRiskImpact),
        controlEffectivenessPct: numberValue(
          draft.topRiskControlEffectivenessPct
        ),
        kriDefined: yesNoValue(draft.topRiskKriDefined),
        triggerDefined: yesNoValue(draft.topRiskTriggerDefined),
        contingencyFunded: yesNoValue(
          draft.topRiskContingencyFunded
        )
      }
    },
    frameworks: structuredClone(frameworks)
  };
}

export function businessToDraft(
  business: BusinessInput
): RetailIntakeDraft {
  const locationParts = business.geography.stateCity
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const state = locationParts[0] ?? "";
  const city =
    locationParts.length > 1
      ? locationParts[locationParts.length - 1]
      : state;
  const downsideRevenuePct =
    business.financial.monthlyRevenue > 0
      ? Math.max(
          0,
          (1 -
            business.financial.downsideMonthlyRevenue /
              business.financial.monthlyRevenue) *
            100
        )
      : 0;
  const objective =
    business.identity.objective.toLowerCase().includes("site")
      ? "site_selection"
      : business.identity.objective.toLowerCase().includes("market")
        ? "market_entry"
        : "go_no_go";
  const cpmFactorAt = (index: number) =>
    business.enterprise.cpm.factors[index] ?? {
      id: `cpm-factor-${index + 1}`,
      labelZh: "",
      labelEn: "",
      weight: 0,
      companyRating: 1,
      competitorARating: 1,
      competitorBRating: 1
    };
  const cpmFactor1 = cpmFactorAt(0);
  const cpmFactor2 = cpmFactorAt(1);
  const cpmFactor3 = cpmFactorAt(2);
  const emptyEntryMode = (index: number) => ({
    id: `entry-mode-${index + 1}`,
    label: { zh: "", en: "" },
    fit: {
      control: 1,
      capitalEfficiency: 1,
      speed: 1,
      adaptation: 1,
      ipProtection: 1,
      localKnowledge: 1,
      partnerFeasibility: 1,
      supplyAccess: 1,
      exitFlexibility: 1
    }
  });
  const entryMode1 =
    business.enterprise.entryModes[0] ?? emptyEntryMode(0);
  const entryMode2 =
    business.enterprise.entryModes[1] ?? emptyEntryMode(1);

  return {
    businessName: business.identity.name,
    businessCategory: business.identity.category,
    businessStage: business.identity.stage,
    assessmentObjective: objective,
    decisionHorizonMonths:
      Number.parseFloat(business.identity.decisionHorizon) || 3,
    businessSummary: business.identity.objective,
    homeCountry: business.geography.homeCountry,
    targetCountry: business.geography.targetCountry,
    targetStateRegion: state,
    targetCity: city,
    catchmentDefinition: business.geography.catchment,
    currency: business.geography.currency,
    operatingModel: business.model.type,
    retailFormat: business.model.retailFormat,
    entryMode: business.model.candidateEntryMode.includes("Organic")
      ? "organic"
      : business.model.candidateEntryMode,
    plannedLaunchDate: "",
    targetSegment: business.customer.targetSegment,
    payerUserRelationship: business.customer.payerAndUser,
    customerJobPain: business.customer.jobOrPain,
    purchaseOccasion: business.customer.buyingOccasion,
    currentAlternative: business.customer.currentAlternative,
    willingnessToPayEvidence:
      business.customer.willingnessToPayEvidence,
    estimatedCustomerCount: "",
    demandEvidence: business.customer.marketDemandEvidence,
    valueProposition: business.offer.valueProposition,
    assortmentStrategy: business.offer.assortment,
    pricingPosition: business.offer.pricePosition,
    differentiationEvidence: business.offer.differentiation,
    reasonToBelieve: business.offer.reasonToBelieve,
    growthStrategy: business.offer.growthStrategy,
    mainCompetitors: business.customer.competitors,
    marketEvidence: business.customer.marketDemandEvidence,
    marketEvidenceSource: business.riskEvidence.evidenceSource,
    marketEvidenceDate: business.riskEvidence.evidenceDate,
    marketEvidenceConfidence:
      business.riskEvidence.evidenceConfidence,
    ownershipGate: business.compliance.ownership,
    licenseGate: business.compliance.licences,
    productSafetyGate: business.compliance.productSafety,
    privacyPaymentGate: business.compliance.privacyPayment,
    labourSupplierGate: business.compliance.labourSupplier,
    fxGate: business.compliance.fxTreasury,
    infrastructureGate: business.compliance.infrastructure,
    ethicsGate: business.compliance.ethicsSanctions,
    complianceNotes: business.compliance.currentEvidence,
    salesChannels: [...business.model.channels],
    fulfilmentModel: business.channelLocation.fulfilmentRoute,
    channelRoles: business.channelLocation.channelRoles,
    trafficSource: business.channelLocation.acquisitionRoute,
    monthlyTraffic: "",
    conversionRatePct: business.channelLocation.digitalConversionRate,
    platformFeeRatePct: business.channelLocation.platformFeeRate,
    siteType: business.channelLocation.siteType,
    siteAreaSqm: business.channelLocation.usableArea,
    monthlyFootfall: business.channelLocation.footfallPerMonth,
    storeConversionRatePct:
      business.channelLocation.storeConversionRate,
    annualSiteSalesForecast:
      business.channelLocation.annualSiteSalesForecast,
    parkingAccess: "To be verified / 待核实",
    visibilityAssessment: "To be verified / 待核实",
    monthlyRent: business.channelLocation.annualOccupancyCost / 12,
    monthlyCommonAreaCharges: 0,
    leaseTermMonths: 12,
    cannibalizationRisk: "To be verified / 待核实",
    supplierCount: business.supply.supplierCount,
    topSupplierSharePct: business.supply.topSupplierShare,
    leadTimeDays: business.supply.leadTimeDays,
    inventoryServiceLevelPct: business.supply.serviceLevel,
    inventoryTurnover: "",
    stockoutRatePct: business.supply.stockoutRate,
    replenishmentModel: business.supply.inventoryPlan,
    inventoryRisks: business.supply.qualityLogisticsRisk,
    supplyMitigation: business.supply.mitigation,
    monthlyRevenue: business.financial.monthlyRevenue,
    monthlyCogs: business.financial.monthlyCogs,
    monthlyVariableCost: business.financial.monthlyVariableCosts,
    monthlyFixedCost: business.financial.monthlyFixedCosts,
    monthlyOccupancyCost:
      business.financial.monthlyOccupancyCost,
    monthlyMarketingSpend:
      business.financial.monthlyMarketingSpend,
    averageSellingPrice: business.financial.averagePrice,
    monthlyUnits: business.financial.monthlyUnits,
    capex: business.financial.launchCapex,
    workingCapital: business.financial.workingCapitalNeed,
    fundingAvailable: business.financial.fundingAvailable,
    monthlyBurn: business.financial.monthlyBurn,
    runwayMonths: business.financial.cashRunwayMonths,
    cac: business.financial.cac,
    clv: business.financial.clv,
    downsideRevenuePct,
    downsideCostIncreasePct: 10,
    financialEvidence: business.riskEvidence.evidenceSource,
    positioningStatement: business.marketing.positioning,
    acquisitionPlan: business.marketing.acquisitionChannels,
    crmRetentionPlan: business.marketing.crmRetention,
    servicePromise: business.marketing.servicePromise,
    complaintReturnsProcess:
      business.marketing.complaintReturnsProcess,
    teamSize: "",
    teamAndKeyRoles: business.organization.teamAndKeyRoles,
    leadershipRetailExperience:
      business.organization.retailCountryExperience,
    capabilityGaps: business.organization.capabilityGaps,
    localPartner: business.organization.localPartner,
    decisionRights: business.organization.decisionRights,
    keyMilestones: business.organization.milestones,
    kpiOwners: business.organization.kpiOwners,
    topRisks: business.riskEvidence.topRisks,
    riskMitigation: business.riskEvidence.mitigations,
    evidenceSource: business.riskEvidence.evidenceSource,
    evidenceAsOfDate: business.riskEvidence.evidenceDate,
    evidenceConfidence: business.riskEvidence.evidenceConfidence,
    assumptionsLimitations: business.riskEvidence.assumptions,
    fiveForcesRivalry: business.enterprise.fiveForces.rivalry,
    fiveForcesNewEntrants:
      business.enterprise.fiveForces.newEntrants,
    fiveForcesSubstitutes:
      business.enterprise.fiveForces.substitutes,
    fiveForcesBuyerPower: business.enterprise.fiveForces.buyerPower,
    fiveForcesSupplierPower:
      business.enterprise.fiveForces.supplierPower,
    cpmCompetitorAName: business.enterprise.cpm.competitorAName,
    cpmCompetitorBName: business.enterprise.cpm.competitorBName,
    cpmFactor1Id: cpmFactor1.id,
    cpmFactor1LabelZh: cpmFactor1.labelZh,
    cpmFactor1LabelEn: cpmFactor1.labelEn,
    cpmFactor1Weight: cpmFactor1.weight,
    cpmFactor1CompanyRating: cpmFactor1.companyRating,
    cpmFactor1CompetitorARating: cpmFactor1.competitorARating,
    cpmFactor1CompetitorBRating: cpmFactor1.competitorBRating,
    cpmFactor2Id: cpmFactor2.id,
    cpmFactor2LabelZh: cpmFactor2.labelZh,
    cpmFactor2LabelEn: cpmFactor2.labelEn,
    cpmFactor2Weight: cpmFactor2.weight,
    cpmFactor2CompanyRating: cpmFactor2.companyRating,
    cpmFactor2CompetitorARating: cpmFactor2.competitorARating,
    cpmFactor2CompetitorBRating: cpmFactor2.competitorBRating,
    cpmFactor3Id: cpmFactor3.id,
    cpmFactor3LabelZh: cpmFactor3.labelZh,
    cpmFactor3LabelEn: cpmFactor3.labelEn,
    cpmFactor3Weight: cpmFactor3.weight,
    cpmFactor3CompanyRating: cpmFactor3.companyRating,
    cpmFactor3CompetitorARating: cpmFactor3.competitorARating,
    cpmFactor3CompetitorBRating: cpmFactor3.competitorBRating,
    cpmExtraFactorsJson: JSON.stringify(
      business.enterprise.cpm.factors.slice(3)
    ),
    stpSegmentSizeGrowth:
      business.enterprise.stp.segmentAttractiveness.sizeGrowth,
    stpSegmentProfitability:
      business.enterprise.stp.segmentAttractiveness.profitability,
    stpSegmentAccessibility:
      business.enterprise.stp.segmentAttractiveness.accessibility,
    stpSegmentMeasurability:
      business.enterprise.stp.segmentAttractiveness.measurability,
    stpSegmentStrategicFit:
      business.enterprise.stp.segmentAttractiveness.strategicFit,
    stpRightToWinDifferentiation:
      business.enterprise.stp.rightToWin.differentiation,
    stpRightToWinCapability:
      business.enterprise.stp.rightToWin.capability,
    stpRightToWinChannelAccess:
      business.enterprise.stp.rightToWin.channelAccess,
    stpRightToWinCredibility:
      business.enterprise.stp.rightToWin.credibility,
    stpTargetingStrategy:
      business.enterprise.stp.targetingStrategy,
    stpPositionCustomerClarity:
      business.enterprise.stp.position.customerClarity,
    stpPositionCompetitorDistinctiveness:
      business.enterprise.stp.position.competitorDistinctiveness,
    stpPositionEvidenceStrength:
      business.enterprise.stp.position.evidenceStrength,
    stpPositionDeliveryConsistency:
      business.enterprise.stp.position.deliveryConsistency,
    entryMode1Id: entryMode1.id,
    entryMode1LabelZh: entryMode1.label.zh,
    entryMode1LabelEn: entryMode1.label.en,
    entryMode1Control: entryMode1.fit.control,
    entryMode1CapitalEfficiency: entryMode1.fit.capitalEfficiency,
    entryMode1Speed: entryMode1.fit.speed,
    entryMode1Adaptation: entryMode1.fit.adaptation,
    entryMode1IpProtection: entryMode1.fit.ipProtection,
    entryMode1LocalKnowledge: entryMode1.fit.localKnowledge,
    entryMode1PartnerFeasibility: entryMode1.fit.partnerFeasibility,
    entryMode1SupplyAccess: entryMode1.fit.supplyAccess,
    entryMode1ExitFlexibility: entryMode1.fit.exitFlexibility,
    entryMode2Id: entryMode2.id,
    entryMode2LabelZh: entryMode2.label.zh,
    entryMode2LabelEn: entryMode2.label.en,
    entryMode2Control: entryMode2.fit.control,
    entryMode2CapitalEfficiency: entryMode2.fit.capitalEfficiency,
    entryMode2Speed: entryMode2.fit.speed,
    entryMode2Adaptation: entryMode2.fit.adaptation,
    entryMode2IpProtection: entryMode2.fit.ipProtection,
    entryMode2LocalKnowledge: entryMode2.fit.localKnowledge,
    entryMode2PartnerFeasibility: entryMode2.fit.partnerFeasibility,
    entryMode2SupplyAccess: entryMode2.fit.supplyAccess,
    entryMode2ExitFlexibility: entryMode2.fit.exitFlexibility,
    enterpriseMonthlyNetProfit:
      business.enterprise.financeProductivity.monthlyNetProfit,
    enterpriseTotalAssets:
      business.enterprise.financeProductivity.totalAssets,
    enterpriseAverageInventory:
      business.enterprise.financeProductivity.averageInventory,
    serviceExpectationReliability:
      business.enterprise.serviceGaps.expectations.reliability,
    serviceExpectationResponsiveness:
      business.enterprise.serviceGaps.expectations.responsiveness,
    serviceExpectationAssurance:
      business.enterprise.serviceGaps.expectations.assurance,
    serviceExpectationEmpathy:
      business.enterprise.serviceGaps.expectations.empathy,
    serviceExpectationTangibles:
      business.enterprise.serviceGaps.expectations.tangibles,
    servicePerceptionReliability:
      business.enterprise.serviceGaps.perceptions.reliability,
    servicePerceptionResponsiveness:
      business.enterprise.serviceGaps.perceptions.responsiveness,
    servicePerceptionAssurance:
      business.enterprise.serviceGaps.perceptions.assurance,
    servicePerceptionEmpathy:
      business.enterprise.serviceGaps.perceptions.empathy,
    servicePerceptionTangibles:
      business.enterprise.serviceGaps.perceptions.tangibles,
    organizationGapKnowledge:
      business.enterprise.serviceGaps.organizationGaps.knowledge,
    organizationGapStandards:
      business.enterprise.serviceGaps.organizationGaps.standards,
    organizationGapDelivery:
      business.enterprise.serviceGaps.organizationGaps.delivery,
    organizationGapCommunication:
      business.enterprise.serviceGaps.organizationGaps.communication,
    controlPolicyCoveragePct:
      business.enterprise.organizationControl.policyCoveragePct,
    controlProcessCoveragePct:
      business.enterprise.organizationControl.processCoveragePct,
    controlKpiCoveragePct:
      business.enterprise.organizationControl.kpiCoveragePct,
    controlReviewCadenceDays:
      business.enterprise.organizationControl.reviewCadenceDays,
    controlVarianceTolerancePct:
      business.enterprise.organizationControl.varianceTolerancePct,
    topRiskNameZh: business.enterprise.topRisk.name.zh,
    topRiskNameEn: business.enterprise.topRisk.name.en,
    topRiskLikelihood: business.enterprise.topRisk.likelihood,
    topRiskImpact: business.enterprise.topRisk.impact,
    topRiskControlEffectivenessPct:
      business.enterprise.topRisk.controlEffectivenessPct,
    topRiskKriDefined:
      business.enterprise.topRisk.kriDefined ? "yes" : "no",
    topRiskTriggerDefined:
      business.enterprise.topRisk.triggerDefined ? "yes" : "no",
    topRiskContingencyFunded:
      business.enterprise.topRisk.contingencyFunded ? "yes" : "no"
  };
}

export function scoreToReport(
  input: BusinessInput,
  score: BusinessScore
): RetailReportViewModel {
  const modelLabel = {
    physical: { zh: "实体零售", en: "Physical retail" },
    digital: { zh: "纯线上零售", en: "Digital-only retail" },
    hybrid: { zh: "混合 / 全渠道零售", en: "Hybrid / omnichannel retail" }
  }[input.model.type];
  const geography = Array.from(
    new Set(
      [
        ...input.geography.stateCity.split(",").map((value) => value.trim()),
        input.geography.targetCountry.trim()
      ].filter(Boolean)
    )
  ).join(", ");

  return {
    businessName: score.businessName,
    geography,
    modelLabelZh: modelLabel.zh,
    modelLabelEn: modelLabel.en,
    overallScore: score.overallScore,
    bandZh:
      score.gateOutcome === "blocked"
        ? `${score.band.label.zh} · 已阻断`
        : score.gateOutcome === "incomplete"
          ? `${score.band.label.zh} · 未完整`
          : score.gateOutcome === "conditional"
            ? `${score.band.label.zh} · 有条件`
            : score.band.label.zh,
    bandEn:
      score.gateOutcome === "blocked"
        ? `${score.band.label.en} · blocked`
        : score.gateOutcome === "incomplete"
          ? `${score.band.label.en} · incomplete`
          : score.gateOutcome === "conditional"
            ? `${score.band.label.en} · conditional`
            : score.band.label.en,
    confidence: score.confidence,
    completeness: score.completeness,
    dimensions: score.dimensions.map((dimension) => ({
      id: dimension.id,
      labelZh: dimension.label.zh,
      labelEn: dimension.label.en,
      weight: dimension.weight,
      score: dimension.score,
      evidenceHandles: dimension.evidenceHandles
    })),
    strengths: score.strengths.map((finding) => ({
      id: finding.id,
      titleZh: finding.title.zh,
      titleEn: finding.title.en,
      detailZh: finding.detail.zh,
      detailEn: finding.detail.en,
      evidence: finding.evidence
    })),
    gaps: score.gaps.map((finding) => ({
      id: finding.id,
      titleZh: finding.title.zh,
      titleEn: finding.title.en,
      detailZh: finding.detail.zh,
      detailEn: finding.detail.en,
      evidence: finding.evidence
    })),
    actions: score.actions.map((action) => ({
      priority: action.priority,
      actionZh: action.action.zh,
      actionEn: action.action.en,
      ownerZh: action.owner.zh,
      ownerEn: action.owner.en,
      horizonZh: action.horizon.zh,
      horizonEn: action.horizon.en,
      kpiZh: action.kpi.zh,
      kpiEn: action.kpi.en
    })),
    metrics: score.metrics.map((metric) => ({
      labelZh: metric.label.zh,
      labelEn: metric.label.en,
      value: metric.formattedValue,
      interpretationZh: metric.interpretation.zh,
      interpretationEn: metric.interpretation.en
    })),
    gates: score.gates.map((gate) => ({
      labelZh: gate.label.zh,
      labelEn: gate.label.en,
      status: gate.status,
      reasonZh: gate.reason.zh,
      reasonEn: gate.reason.en
    })),
    evidenceCount: score.evidenceCount,
    generatedAt: score.generatedAt
  };
}

export function businessToStrategyData(
  input: BusinessInput,
  score: BusinessScore
): StrategyFrameworkData {
  return {
    efe: {
      factors: input.frameworks.efe,
      score: score.frameworks.efe.score ?? undefined
    },
    ife: {
      factors: input.frameworks.ife,
      score: score.frameworks.ife.score ?? undefined
    },
    qspm: input.frameworks.qspm
  };
}

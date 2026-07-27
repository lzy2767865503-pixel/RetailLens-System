import type { BusinessInput } from "./types";

export const demoBusiness: BusinessInput = {
  identity: {
    name: "Kita Pantry Pilot",
    category: "Neighbourhood convenience groceries and ready-to-eat meals",
    stage: "pre_launch",
    objective:
      "Decide whether to run a 90-day Kuala Lumpur pilot before committing to a second site.",
    decisionHorizon: "Pilot go/no-go decision within 60 days"
  },
  geography: {
    homeCountry: "Malaysia",
    targetCountry: "Malaysia",
    stateCity: "Kuala Lumpur",
    catchment:
      "A 1.5 km urban residential and student catchment around a candidate transit-linked site",
    currency: "MYR"
  },
  model: {
    type: "hybrid",
    retailFormat: "Small-format convenience store with click-and-collect",
    channels: ["Physical store", "Mobile web", "Click-and-collect"],
    candidateEntryMode: "Organic pilot through a locally incorporated company"
  },
  customer: {
    targetSegment:
      "Students and young professionals aged 18–35 living or studying within the catchment",
    payerAndUser:
      "The shopper is usually both payer and user; occasional household top-up baskets are paid by a family member",
    jobOrPain:
      "Obtain a fast, affordable meal or household top-up after class or work without travelling to a hypermarket",
    buyingOccasion:
      "Weekday breakfast, lunch, late-evening meal, and urgent household top-up",
    currentAlternative:
      "Chain convenience stores, campus minimarts, food-delivery apps, and nearby supermarkets",
    willingnessToPayEvidence:
      "A synthetic pilot assumption based on 42 intended-customer interviews; prices require validation with real transactions",
    marketDemandEvidence:
      "Candidate-site footfall count and interview notes are recorded as internal pilot evidence, not a market-size claim",
    competitors:
      "Two chain convenience stores, one campus minimart, a supermarket, and delivery platforms within the proposed catchment"
  },
  offer: {
    valueProposition:
      "A reliable 10-minute neighbourhood top-up shop with locally relevant ready meals and transparent value bundles",
    assortment:
      "Approximately 650 SKUs: staple groceries, drinks, snacks, personal care, and 25 rotating ready-to-eat items",
    pricePosition:
      "Everyday-mid price with visible entry-price staples and meal bundles",
    differentiation:
      "Catchment-specific assortment, preorder pickup, and a smaller waste-controlled fresh-food range",
    reasonToBelieve:
      "Pilot interviews, site observation, and supplier quotations support a testable but not yet proven proposition",
    growthStrategy:
      "Market penetration through one pilot; no second site until repeat rate, waste, and contribution margin pass gates"
  },
  compliance: {
    ownership: "pass",
    licences: "review",
    productSafety: "review",
    privacyPayment: "pass",
    labourSupplier: "pass",
    fxTreasury: "pass",
    infrastructure: "pass",
    ethicsSanctions: "pass",
    currentEvidence:
      "Synthetic demo only: company eligibility checked; food-premise and signage approvals remain conditional tasks. Re-verify all requirements with current Malaysian authorities."
  },
  channelLocation: {
    channelRoles:
      "Store supports discovery and immediate purchase; mobile web supports preorder; pickup connects both channels",
    acquisitionRoute:
      "Catchment signage, student community partnerships, local search, referral, and opt-in CRM",
    fulfilmentRoute:
      "Ambient goods through a local distributor; chilled items delivered daily; store fulfils pickup orders",
    digitalConversionRate: 3.2,
    platformFeeRate: 2.5,
    siteType: "Ground-floor transit-adjacent neighbourhood unit",
    footfallPerMonth: 24_000,
    storeConversionRate: 8,
    usableArea: 95,
    annualOccupancyCost: 144_000,
    annualSiteSalesForecast: 1_320_000
  },
  supply: {
    supplierCount: 8,
    topSupplierShare: 42,
    leadTimeDays: 5,
    serviceLevel: 93,
    stockoutRate: 7,
    inventoryPlan:
      "ABC review weekly, daily fresh-food reorder, four-week open-to-buy control, and waste tracked by SKU",
    qualityLogisticsRisk:
      "Fresh-food shelf life, temperature control, distributor concentration, and holiday lead-time variability",
    mitigation:
      "Dual-source high-volume staples, set cold-chain checks, agree substitution rules, and maintain a critical-SKU buffer"
  },
  financial: {
    monthlyRevenue: 110_000,
    monthlyCogs: 68_200,
    monthlyVariableCosts: 8_800,
    monthlyFixedCosts: 29_000,
    monthlyUnits: 5_000,
    averagePrice: 22,
    monthlyOccupancyCost: 12_000,
    monthlyMarketingSpend: 4_000,
    launchCapex: 180_000,
    workingCapitalNeed: 85_000,
    fundingAvailable: 300_000,
    monthlyBurn: 42_000,
    cashRunwayMonths: 7.1,
    cac: 24,
    clv: 78,
    downsideMonthlyRevenue: 88_000
  },
  marketing: {
    positioning:
      "The dependable local pantry for quick meals and top-up essentials",
    acquisitionChannels:
      "Site visibility, local search, community partnerships, referrals, and consent-based messaging",
    crmRetention:
      "Simple points programme, visit-frequency cohorts, lapsed-customer prompt, and category-level share-of-wallet tests",
    servicePromise:
      "Fast checkout, accurate pickup, clear availability, and a same-day response to service failures",
    complaintReturnsProcess:
      "Receipt-linked issue log, empowered shift lead, refund or replacement rules, root-cause tag, and weekly gap review"
  },
  organization: {
    teamAndKeyRoles:
      "Founder as pilot owner, store manager, merchandise lead, finance adviser, and part-time digital operations support",
    retailCountryExperience:
      "Store manager has local convenience-retail experience; founder has Malaysian student-community research experience",
    capabilityGaps:
      "Fresh-food forecasting, formal food-safety documentation, and automated inventory integration",
    localPartner:
      "Local distributor and food-safety adviser identified; commercial and diligence checks are still required",
    decisionRights:
      "Store manager owns daily availability and service; founder owns budget, supplier contracts, and pilot go/no-go",
    milestones:
      "Licences, lease condition, supplier trial, soft launch, week-4 review, week-8 correction, day-90 decision",
    kpiOwners:
      "Store manager: service and waste; merchandise lead: availability and margin; founder: cash and pilot gates"
  },
  riskEvidence: {
    topRisks:
      "Licence timing, fresh-food waste, lower-than-planned conversion, supplier concentration, and rent burden",
    mitigations:
      "Conditional lease clause, phased fresh assortment, weekly conversion test, alternate distributor, and stop-loss gates",
    evidenceSource:
      "Synthetic RetailLens demonstration dataset: interview summary, candidate-site count, supplier quotations, and pilot financial model",
    evidenceDate: "2026-07-27",
    evidenceConfidence: "medium",
    assumptions:
      "All numbers are demonstration assumptions. No claim represents verified current Malaysian law, actual market size, or guaranteed performance."
  },
  enterprise: {
    fiveForces: {
      rivalry: 4,
      newEntrants: 3,
      substitutes: 4,
      buyerPower: 4,
      supplierPower: 3
    },
    cpm: {
      competitorAName: "Chain Convenience A (synthetic)",
      competitorBName: "Campus Minimart B (synthetic)",
      factors: [
        {
          id: "cpm-location",
          labelZh: "选址便利性",
          labelEn: "Location convenience",
          weight: 0.35,
          companyRating: 4,
          competitorARating: 4,
          competitorBRating: 3
        },
        {
          id: "cpm-assortment",
          labelZh: "商圈商品匹配度",
          labelEn: "Catchment assortment relevance",
          weight: 0.35,
          companyRating: 4,
          competitorARating: 3,
          competitorBRating: 3
        },
        {
          id: "cpm-value",
          labelZh: "价格与价值感知",
          labelEn: "Price-value perception",
          weight: 0.3,
          companyRating: 3,
          competitorARating: 3,
          competitorBRating: 4
        }
      ]
    },
    stp: {
      segmentAttractiveness: {
        sizeGrowth: 4,
        profitability: 4,
        accessibility: 4,
        measurability: 4,
        strategicFit: 3
      },
      rightToWin: {
        differentiation: 4,
        capability: 3,
        channelAccess: 4,
        credibility: 3
      },
      targetingStrategy: "concentrated",
      position: {
        customerClarity: 5,
        competitorDistinctiveness: 4,
        evidenceStrength: 3,
        deliveryConsistency: 3
      }
    },
    entryModes: [
      {
        id: "entry-organic-pilot",
        label: {
          zh: "自建小范围试点（合成方案）",
          en: "Organic focused pilot (synthetic option)"
        },
        fit: {
          control: 5,
          capitalEfficiency: 3,
          speed: 3,
          adaptation: 5,
          ipProtection: 4,
          localKnowledge: 4,
          partnerFeasibility: 3,
          supplyAccess: 4,
          exitFlexibility: 4
        }
      },
      {
        id: "entry-franchise",
        label: {
          zh: "本地特许合作（合成方案）",
          en: "Local franchise partnership (synthetic option)"
        },
        fit: {
          control: 2,
          capitalEfficiency: 5,
          speed: 4,
          adaptation: 3,
          ipProtection: 2,
          localKnowledge: 5,
          partnerFeasibility: 3,
          supplyAccess: 4,
          exitFlexibility: 3
        }
      }
    ],
    financeProductivity: {
      monthlyNetProfit: 4_000,
      totalAssets: 265_000,
      averageInventory: 45_000
    },
    serviceGaps: {
      expectations: {
        reliability: 6,
        responsiveness: 6,
        assurance: 6,
        empathy: 5,
        tangibles: 6
      },
      perceptions: {
        reliability: 5,
        responsiveness: 5,
        assurance: 5,
        empathy: 4,
        tangibles: 5
      },
      organizationGaps: {
        knowledge: 2,
        standards: 3,
        delivery: 3,
        communication: 2
      }
    },
    organizationControl: {
      policyCoveragePct: 70,
      processCoveragePct: 65,
      kpiCoveragePct: 80,
      reviewCadenceDays: 7,
      varianceTolerancePct: 10
    },
    topRisk: {
      name: {
        zh: "鲜食损耗高于试点容忍上限（合成风险）",
        en: "Fresh-food waste exceeds the pilot tolerance (synthetic risk)"
      },
      likelihood: 4,
      impact: 4,
      controlEffectivenessPct: 45,
      kriDefined: true,
      triggerDefined: true,
      contingencyFunded: true
    }
  },
  frameworks: {
    efe: [
      {
        id: "efe-demand",
        label: { zh: "商圈即时需求", en: "Catchment convenience demand" },
        weight: 0.3,
        rating: 3,
        note: {
          zh: "响应评分，不是市场好坏评分",
          en: "Response rating, not factor favourability"
        }
      },
      {
        id: "efe-competition",
        label: { zh: "连锁便利店竞争", en: "Chain-store competition" },
        weight: 0.25,
        rating: 2
      },
      {
        id: "efe-site",
        label: { zh: "交通点位可达性", en: "Transit-site accessibility" },
        weight: 0.25,
        rating: 3
      },
      {
        id: "efe-regulation",
        label: { zh: "食品许可准备", en: "Food-licence readiness" },
        weight: 0.2,
        rating: 2
      }
    ],
    ife: [
      {
        id: "ife-assortment",
        label: { zh: "本地化商品组合", en: "Localized assortment" },
        weight: 0.25,
        rating: 3
      },
      {
        id: "ife-cash",
        label: { zh: "试点现金跑道", en: "Pilot cash runway" },
        weight: 0.25,
        rating: 3
      },
      {
        id: "ife-fresh",
        label: { zh: "鲜食预测能力", en: "Fresh-food forecasting capability" },
        weight: 0.25,
        rating: 2
      },
      {
        id: "ife-supplier",
        label: { zh: "供应商集中度", en: "Supplier concentration" },
        weight: 0.25,
        rating: 2
      }
    ],
    qspm: {
      strategies: [
        { zh: "小范围 90 天试点", en: "Focused 90-day pilot" },
        { zh: "立即扩大完整业态", en: "Immediate full-format launch" }
      ],
      factors: [
        {
          id: "q-demand",
          label: { zh: "商圈即时需求", en: "Catchment convenience demand" },
          source: "EFE",
          weight: 0.3,
          attractivenessScores: [4, 2]
        },
        {
          id: "q-competition",
          label: { zh: "连锁便利店竞争", en: "Chain-store competition" },
          source: "EFE",
          weight: 0.25,
          attractivenessScores: [3, 2]
        },
        {
          id: "q-cash",
          label: { zh: "试点现金跑道", en: "Pilot cash runway" },
          source: "IFE",
          weight: 0.25,
          attractivenessScores: [4, 1]
        },
        {
          id: "q-fresh",
          label: { zh: "鲜食预测能力", en: "Fresh-food forecasting capability" },
          source: "IFE",
          weight: 0.2,
          attractivenessScores: [3, 1]
        }
      ]
    }
  }
};

export function createDemoBusiness(): BusinessInput {
  return structuredClone(demoBusiness);
}

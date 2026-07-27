import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  ClipboardList,
  Gauge,
  GitBranch,
  Route,
  ShieldCheck,
  Target
} from "lucide-react";
import type { ConsultingAssessment } from "../domain";
import type { Locale } from "../i18n";

export interface ExecutiveConsultingViewProps {
  locale: Locale;
  assessment: ConsultingAssessment;
}

interface BilingualValue {
  zh: string;
  en: string;
}

type UnknownRecord = Record<string, unknown>;

const recommendationLabels = {
  proceed: { zh: "推进", en: "Proceed" },
  conditional: { zh: "有条件推进", en: "Proceed conditionally" },
  pause: { zh: "暂停并验证", en: "Pause and validate" },
  stop: { zh: "停止", en: "Stop" }
} as const;

const readinessLabels = {
  ready: { zh: "决策就绪", en: "Decision-ready" },
  conditional: { zh: "有条件就绪", en: "Conditionally ready" },
  not_ready: { zh: "尚未就绪", en: "Not ready" }
} as const;

const targetBasisLabels = {
  mathematical_break_even: {
    zh: "按数学盈亏平衡点设定",
    en: "Set from mathematical break-even"
  },
  submitted_plan: {
    zh: "采用已提交管理计划",
    en: "Uses the submitted management plan"
  },
  management_target_required: {
    zh: "需管理层确认目标",
    en: "Management target required"
  }
} as const;

const dimensionLabels = {
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
} as const;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBilingual(value: unknown): value is BilingualValue {
  return (
    isRecord(value) &&
    typeof value.zh === "string" &&
    typeof value.en === "string"
  );
}

function localized(locale: Locale, value: BilingualValue | string) {
  return typeof value === "string" ? value : value[locale];
}

function emptyLabel(locale: Locale) {
  return locale === "zh" ? "未由现有证据提供" : "Not provided by current evidence";
}

function formatNumber(
  locale: Locale,
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions
) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return emptyLabel(locale);
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}

function statusText(locale: Locale, status: string) {
  const known: Record<string, BilingualValue> = {
    strong: { zh: "稳健", en: "Strong" },
    supported: { zh: "有证据支持", en: "Supported" },
    partial: { zh: "部分支持", en: "Partially supported" },
    partially_supported: { zh: "部分支持", en: "Partially supported" },
    caution: { zh: "需关注", en: "Caution" },
    risk: { zh: "风险", en: "Risk" },
    critical: { zh: "关键风险", en: "Critical risk" },
    unsupported: { zh: "证据不支持", en: "Unsupported" },
    not_supported: { zh: "证据不支持", en: "Not supported" },
    insufficient_evidence: { zh: "证据不足", en: "Insufficient evidence" },
    not_applicable: { zh: "不适用", en: "Not applicable" },
    untested: { zh: "尚未验证", en: "Untested" },
    unverified: { zh: "尚未验证", en: "Unverified" },
    contradicted: { zh: "存在矛盾", en: "Contradicted" },
    unknown: { zh: "未知", en: "Unknown" },
    P0: { zh: "P0 阻断项", en: "P0 blocker" },
    P1: { zh: "P1 高优先", en: "P1 high priority" },
    P2: { zh: "P2 改进项", en: "P2 improvement" },
    high: { zh: "高", en: "High" },
    medium: { zh: "中", en: "Medium" },
    low: { zh: "低", en: "Low" },
    ready: readinessLabels.ready,
    conditional: readinessLabels.conditional,
    not_ready: readinessLabels.not_ready,
    proceed: recommendationLabels.proceed,
    pause: recommendationLabels.pause,
    stop: recommendationLabels.stop
  };

  return known[status]?.[locale] ?? status.replaceAll("_", " ");
}

function statusClass(status: string) {
  return status.toLowerCase().replaceAll(/[^a-z0-9-]/g, "-");
}

function describeUnknown(locale: Locale, value: unknown): string {
  if (isBilingual(value)) return value[locale];
  if (typeof value === "string") return value;
  if (typeof value === "number") return formatNumber(locale, value);
  if (typeof value === "boolean") {
    return locale === "zh" ? (value ? "是" : "否") : value ? "Yes" : "No";
  }

  if (isRecord(value)) {
    const preferredKeys = [
      "label",
      "name",
      "statement",
      "definition",
      "description",
      "relationship",
      "metric",
      "value",
      "note"
    ];
    const parts = preferredKeys
      .map((key) => value[key])
      .filter((item) => item !== undefined)
      .map((item) => describeUnknown(locale, item))
      .filter(Boolean);

    return parts.length > 0 ? parts.join(" — ") : emptyLabel(locale);
  }

  return emptyLabel(locale);
}

function SourceHandles({
  locale,
  handles,
  compact = false
}: {
  locale: Locale;
  handles: string[];
  compact?: boolean;
}) {
  const uniqueHandles = [...new Set(handles.filter(Boolean))];

  if (uniqueHandles.length === 0) {
    return <span className="enterprise-empty">{emptyLabel(locale)}</span>;
  }

  return (
    <ul
      className={
        compact
          ? "enterprise-source-handles is-compact"
          : "enterprise-source-handles"
      }
      aria-label={locale === "zh" ? "来源句柄" : "Source handles"}
    >
      {uniqueHandles.map((handle) => (
        <li key={handle}>
          <code>{handle}</code>
        </li>
      ))}
    </ul>
  );
}

function DetailList({
  locale,
  values
}: {
  locale: Locale;
  values: unknown[];
}) {
  if (values.length === 0) {
    return <p className="enterprise-empty">{emptyLabel(locale)}</p>;
  }

  return (
    <ul className="enterprise-detail-list">
      {values.map((value, index) => (
        <li key={`${describeUnknown(locale, value)}-${index}`}>
          {describeUnknown(locale, value)}
        </li>
      ))}
    </ul>
  );
}

export function ExecutiveConsultingView({
  locale,
  assessment
}: ExecutiveConsultingViewProps) {
  const isZh = locale === "zh";
  const decision = assessment.executiveDecision;
  const readiness = assessment.decisionReadiness;
  const evidence = assessment.evidence;
  const collectedHandles = [
    ...assessment.executiveDecision.conditions.flatMap(
      (condition) => condition.sourceHandles
    ),
    ...assessment.issueTree.flatMap((branch) =>
      branch.hypotheses.flatMap((hypothesis) => hypothesis.evidenceHandles)
    ),
    ...assessment.assumptions.flatMap((assumption) => assumption.sourceHandles),
    ...assessment.scenarios.flatMap((scenario) => scenario.sourceHandles),
    ...assessment.kpis.flatMap((kpi) => kpi.sourceHandles),
    ...assessment.priorities.flatMap((priority) => priority.sourceHandles),
    ...assessment.courseSources.map((source) => source.handle)
  ];

  return (
    <article
      className="enterprise-report"
      aria-labelledby="enterprise-report-title"
    >
      <header className="page-title-row enterprise-report-header">
        <div>
          <h1 className="page-title" id="enterprise-report-title">
            {isZh ? "管理层决策备忘录" : "Management decision memo"}
          </h1>
          <p className="page-subtitle">
            {assessment.businessName} ·{" "}
            {isZh ? "咨询评估版本" : "Consulting assessment version"}{" "}
            {assessment.version} ·{" "}
            {new Date(assessment.generatedAt).toLocaleString(
              isZh ? "zh-CN" : "en-GB",
              { dateStyle: "medium", timeStyle: "short" }
            )}
          </p>
        </div>
        <div
          className={`enterprise-decision-stamp recommendation-${decision.recommendation}`}
        >
          <span>{isZh ? "管理层结论" : "Management call"}</span>
          <strong>
            {localized(
              locale,
              decision.label ??
                recommendationLabels[decision.recommendation]
            )}
          </strong>
        </div>
      </header>

      <section className="enterprise-decision-memo" aria-labelledby="decision-memo">
        <div className="enterprise-section-heading">
          <ClipboardList size={19} aria-hidden="true" />
          <div>
            <h2 id="decision-memo">
              {isZh ? "一页式决策结论" : "One-page decision conclusion"}
            </h2>
            <p>
              {isZh
                ? "结论、依据、决策规则与前置条件"
                : "Conclusion, rationale, decision rule, and preconditions"}
            </p>
          </div>
        </div>
        <div className="enterprise-memo-grid">
          <div className="enterprise-memo-lead">
            <h3>{localized(locale, decision.headline)}</h3>
            <p>{localized(locale, decision.rationale)}</p>
          </div>
          <dl className="enterprise-memo-rule">
            <div>
              <dt>{isZh ? "采用的决策规则" : "Decision rule applied"}</dt>
              <dd>{localized(locale, decision.rule)}</dd>
            </div>
          </dl>
        </div>
        <div className="enterprise-condition-block">
          <h3>{isZh ? "推进前置条件" : "Conditions before proceeding"}</h3>
          {decision.conditions.length > 0 ? (
            <ol className="enterprise-condition-list">
              {decision.conditions.map((condition) => (
                <li key={condition.id}>
                  <span
                    className={`priority-code ${condition.priority.toLowerCase()}`}
                  >
                    {condition.priority}
                  </span>
                  <div>
                    <strong>{localized(locale, condition.label)}</strong>
                    <p>{localized(locale, condition.test)}</p>
                    <SourceHandles
                      locale={locale}
                      handles={condition.sourceHandles}
                      compact
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="enterprise-empty">{emptyLabel(locale)}</p>
          )}
        </div>
      </section>

      <section
        className="enterprise-signal-grid"
        aria-label={isZh ? "决策质量信号" : "Decision-quality signals"}
      >
        <article className="enterprise-signal">
          <Target size={18} aria-hidden="true" />
          <span>{isZh ? "结论" : "Conclusion"}</span>
          <strong>{localized(locale, decision.label)}</strong>
          <small>{localized(locale, decision.headline)}</small>
        </article>
        <article className="enterprise-signal">
          <Gauge size={18} aria-hidden="true" />
          <span>{isZh ? "决策就绪度" : "Decision readiness"}</span>
          <strong>{formatNumber(locale, readiness.score)}/100</strong>
          <small>{localized(locale, readiness.label)}</small>
        </article>
        <article className="enterprise-signal">
          <BookOpenCheck size={18} aria-hidden="true" />
          <span>{isZh ? "证据质量" : "Evidence quality"}</span>
          <strong>{formatNumber(locale, evidence.qualityScore)}/100</strong>
          <small>
            {localized(locale, evidence.label)} · {evidence.evidenceCount}{" "}
            {isZh ? "项引用" : "references"}
          </small>
        </article>
        <article className="enterprise-signal">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>{isZh ? "证据置信度" : "Evidence confidence"}</span>
          <strong>{formatNumber(locale, evidence.confidenceScore)}/100</strong>
          <small>
            {isZh ? "由证据规则计算" : "Calculated from evidence rules"}
          </small>
        </article>
      </section>

      <div className="enterprise-two-column">
        <section
          className="enterprise-analysis-panel"
          aria-labelledby="readiness-components"
        >
          <h2 id="readiness-components">
            {isZh ? "就绪度构成" : "Readiness components"}
          </h2>
          <dl className="enterprise-component-list">
            {readiness.components.map((component) => (
              <div key={component.id}>
                <dt>
                  <span>{localized(locale, component.label)}</span>
                  <small>
                    {component.weight}% {isZh ? "权重" : "weight"}
                  </small>
                </dt>
                <dd>
                  <strong>{formatNumber(locale, component.score)}/100</strong>
                  <span>
                    {isZh ? "加权贡献" : "Weighted contribution"}{" "}
                    {formatNumber(locale, component.weightedContribution)}
                  </span>
                  <p>{localized(locale, component.evidence)}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="enterprise-method-note">
            <strong>{isZh ? "计算说明：" : "Calculation: "}</strong>
            <code>{readiness.calculation}</code>
          </p>
        </section>
        <section
          className="enterprise-analysis-panel"
          aria-labelledby="evidence-components"
        >
          <h2 id="evidence-components">
            {isZh ? "证据质量构成" : "Evidence-quality components"}
          </h2>
          <dl className="enterprise-component-list">
            {evidence.components.map((component) => (
              <div key={component.id}>
                <dt>
                  <span>{localized(locale, component.label)}</span>
                  <small>
                    {component.weight}% {isZh ? "权重" : "weight"}
                  </small>
                </dt>
                <dd>
                  <strong>{formatNumber(locale, component.score)}/100</strong>
                  <span>
                    {isZh ? "加权贡献" : "Weighted contribution"}{" "}
                    {formatNumber(locale, component.weightedContribution)}
                  </span>
                  <p>{localized(locale, component.rule)}</p>
                </dd>
              </div>
            ))}
          </dl>
          <p className="enterprise-method-note">
            <strong>{isZh ? "判定规则：" : "Rule: "}</strong>
            {localized(locale, evidence.rule)}
          </p>
          <div className="enterprise-limitations">
            <h3>{isZh ? "证据局限" : "Evidence limitations"}</h3>
            <DetailList locale={locale} values={evidence.limitations} />
          </div>
        </section>
      </div>

      <section className="enterprise-section" aria-labelledby="issue-tree-title">
        <div className="enterprise-section-heading">
          <GitBranch size={19} aria-hidden="true" />
          <div>
            <h2 id="issue-tree-title">MECE issue tree</h2>
            <p>
              {isZh
                ? "将管理层问题拆分为互斥、集体穷尽的可验证假设"
                : "Mutually exclusive, collectively exhaustive, testable hypotheses"}
            </p>
          </div>
        </div>
        <div className="enterprise-issue-tree">
          <div className="enterprise-issue-root">
            <span>{isZh ? "根决策命题" : "Root decision proposition"}</span>
            <strong>{localized(locale, decision.headline)}</strong>
          </div>
          {assessment.issueTree.length > 0 ? (
            assessment.issueTree.map((branch, branchIndex) => (
              <article className="enterprise-issue-branch" key={branch.id}>
                <header>
                  <span aria-hidden="true">
                    {String(branchIndex + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3>{localized(locale, branch.question)}</h3>
                    <p>
                      {isZh ? "分支评分" : "Branch score"}{" "}
                      <strong>{formatNumber(locale, branch.score)}/100</strong>
                    </p>
                  </div>
                  <span
                    className={`enterprise-status status-${statusClass(branch.status)}`}
                  >
                    {localized(locale, branch.statusLabel)}
                  </span>
                </header>
                <ol className="enterprise-hypothesis-list">
                  {branch.hypotheses.map((hypothesis) => (
                    <li key={hypothesis.id}>
                      <div className="enterprise-hypothesis-heading">
                        <strong>
                          {localized(locale, hypothesis.statement)}
                        </strong>
                        <span
                          className={`enterprise-status status-${statusClass(hypothesis.status)}`}
                        >
                          {localized(locale, hypothesis.statusLabel)}
                        </span>
                      </div>
                      <dl className="enterprise-hypothesis-meta">
                        <div>
                          <dt>{isZh ? "评分" : "Score"}</dt>
                          <dd>{formatNumber(locale, hypothesis.score)}/100</dd>
                        </div>
                        <div>
                          <dt>{isZh ? "验证测试" : "Validation test"}</dt>
                          <dd>{localized(locale, hypothesis.test)}</dd>
                        </div>
                      </dl>
                      <SourceHandles
                        locale={locale}
                        handles={hypothesis.evidenceHandles}
                        compact
                      />
                    </li>
                  ))}
                </ol>
              </article>
            ))
          ) : (
            <p className="enterprise-empty">{emptyLabel(locale)}</p>
          )}
        </div>
      </section>

      <section
        className="enterprise-section"
        aria-labelledby="scenario-table-title"
      >
        <div className="enterprise-section-heading">
          <AlertCircle size={19} aria-hidden="true" />
          <div>
            <h2 id="scenario-table-title">
              {isZh ? "三情景压力测试" : "Three-scenario stress test"}
            </h2>
            <p>
              {isZh
                ? "只呈现由已提交数据可计算的情景；不可用值保持为空"
                : "Only submitted-data scenarios are calculated; unavailable values remain explicit"}
            </p>
          </div>
        </div>
        <div className="table-scroll enterprise-table-wrap">
          <table className="data-table enterprise-table">
            <caption className="sr-only">
              {isZh ? "下行、基准与上行情景" : "Downside, base, and upside scenarios"}
            </caption>
            <thead>
              <tr>
                <th scope="col">{isZh ? "情景" : "Scenario"}</th>
                <th scope="col">{isZh ? "月收入" : "Monthly revenue"}</th>
                <th scope="col">
                  {isZh ? "月经营贡献" : "Monthly operating contribution"}
                </th>
                <th scope="col">
                  {isZh ? "盈亏平衡覆盖" : "Break-even coverage"}
                </th>
                <th scope="col">{isZh ? "依据与触发点" : "Basis and trigger"}</th>
                <th scope="col">{isZh ? "管理动作" : "Management action"}</th>
              </tr>
            </thead>
            <tbody>
              {assessment.scenarios.map((scenario) => (
                <tr key={scenario.id}>
                  <th scope="row">
                    <strong>{localized(locale, scenario.label)}</strong>
                    <span
                      className={
                        scenario.available
                          ? "enterprise-availability is-available"
                          : "enterprise-availability"
                      }
                    >
                      {scenario.available
                        ? isZh
                          ? "可计算"
                          : "Available"
                        : isZh
                          ? "数据不足"
                          : "Insufficient data"}
                    </span>
                  </th>
                  <td>{formatNumber(locale, scenario.monthlyRevenue)}</td>
                  <td>
                    {formatNumber(
                      locale,
                      scenario.monthlyOperatingContribution
                    )}
                  </td>
                  <td>
                    {scenario.breakEvenCoverage === null
                      ? emptyLabel(locale)
                      : `${formatNumber(locale, scenario.breakEvenCoverage)}×`}
                  </td>
                  <td>
                    <strong>{localized(locale, scenario.basis)}</strong>
                    <small>{localized(locale, scenario.trigger)}</small>
                  </td>
                  <td>
                    {localized(locale, scenario.managementAction)}
                    <SourceHandles
                      locale={locale}
                      handles={scenario.sourceHandles}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="enterprise-table-note">
          {isZh
            ? "金额沿用使用者提交模型的币种与口径；本工作底稿不进行汇率换算。"
            : "Monetary values retain the submitted model's currency and basis; this workpaper performs no FX conversion."}
        </p>
      </section>

      <section className="enterprise-section" aria-labelledby="kpi-tree-title">
        <div className="enterprise-section-heading">
          <Target size={19} aria-hidden="true" />
          <div>
            <h2 id="kpi-tree-title">
              {isZh ? "KPI 因果树" : "KPI causal tree"}
            </h2>
            <p>
              {isZh
                ? "Outcome → driver → guardrail，目标值必须带有依据"
                : "Outcome → driver → guardrail, with evidence-based targets"}
            </p>
          </div>
        </div>
        <div className="enterprise-kpi-tree">
          {assessment.kpis.length > 0 ? (
            assessment.kpis.map((kpi, index) => (
              <article className="enterprise-kpi-row" key={`${index}-${localized(locale, kpi.label)}`}>
                <div className="enterprise-kpi-outcome">
                  <span>{isZh ? "结果指标" : "Outcome"}</span>
                  <h3>{localized(locale, kpi.label)}</h3>
                  <p>{localized(locale, kpi.definition)}</p>
                  <dl>
                    <div>
                      <dt>{isZh ? "当前值" : "Current"}</dt>
                      <dd>{kpi.formattedValue || emptyLabel(locale)}</dd>
                    </div>
                    <div>
                      <dt>{isZh ? "目标" : "Target"}</dt>
                      <dd>{localized(locale, kpi.target)}</dd>
                    </div>
                    <div>
                      <dt>{isZh ? "节奏" : "Cadence"}</dt>
                      <dd>{localized(locale, kpi.cadence)}</dd>
                    </div>
                    <div>
                      <dt>{isZh ? "负责人" : "Owner"}</dt>
                      <dd>{localized(locale, kpi.owner)}</dd>
                    </div>
                  </dl>
                  <p className="enterprise-formula">
                    <strong>{isZh ? "公式：" : "Formula: "}</strong>
                    {kpi.formula}
                  </p>
                  <p className="enterprise-target-basis">
                    <strong>{isZh ? "目标依据：" : "Target basis: "}</strong>
                    {localized(locale, targetBasisLabels[kpi.targetBasis])}
                  </p>
                </div>
                <div className="enterprise-kpi-drivers">
                  <span>{isZh ? "驱动指标" : "Drivers"}</span>
                  {kpi.drivers.length > 0 ? (
                    <ul className="enterprise-linked-metrics">
                      {kpi.drivers.map((driver) => (
                        <li key={driver.id}>
                          <div>
                            <strong>{localized(locale, driver.label)}</strong>
                            <span
                              className={`enterprise-status status-${statusClass(driver.status)}`}
                            >
                              {statusText(locale, driver.status)}
                            </span>
                          </div>
                          <p>{driver.formattedValue || emptyLabel(locale)}</p>
                          <code>{driver.formula}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="enterprise-empty">{emptyLabel(locale)}</p>
                  )}
                </div>
                <div className="enterprise-kpi-guardrails">
                  <span>{isZh ? "护栏指标" : "Guardrails"}</span>
                  {kpi.guardrails.length > 0 ? (
                    <ul className="enterprise-linked-metrics">
                      {kpi.guardrails.map((guardrail) => (
                        <li key={guardrail.id}>
                          <div>
                            <strong>
                              {localized(locale, guardrail.label)}
                            </strong>
                            <span
                              className={`enterprise-status status-${statusClass(guardrail.status)}`}
                            >
                              {statusText(locale, guardrail.status)}
                            </span>
                          </div>
                          <p>{guardrail.formattedValue || emptyLabel(locale)}</p>
                          <code>{guardrail.formula}</code>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="enterprise-empty">{emptyLabel(locale)}</p>
                  )}
                  <SourceHandles
                    locale={locale}
                    handles={kpi.sourceHandles}
                    compact
                  />
                </div>
              </article>
            ))
          ) : (
            <p className="enterprise-empty">{emptyLabel(locale)}</p>
          )}
        </div>
      </section>

      <section
        className="enterprise-section"
        aria-labelledby="assumption-plan-title"
      >
        <div className="enterprise-section-heading">
          <CheckCircle2 size={19} aria-hidden="true" />
          <div>
            <h2 id="assumption-plan-title">
              {isZh ? "关键假设与验证计划" : "Critical assumptions and validation plan"}
            </h2>
            <p>
              {isZh
                ? "将未经验证的主张转化为有负责人、有触发条件的测试"
                : "Convert unverified claims into owned tests with explicit triggers"}
            </p>
          </div>
        </div>
        <div className="table-scroll enterprise-table-wrap">
          <table className="data-table enterprise-table">
            <thead>
              <tr>
                <th scope="col">{isZh ? "关键度 / 状态" : "Criticality / status"}</th>
                <th scope="col">{isZh ? "假设及现有依据" : "Assumption and current basis"}</th>
                <th scope="col">{isZh ? "验证测试" : "Validation test"}</th>
                <th scope="col">{isZh ? "负责人" : "Owner"}</th>
                <th scope="col">{isZh ? "触发条件" : "Trigger"}</th>
                <th scope="col">{isZh ? "来源" : "Sources"}</th>
              </tr>
            </thead>
            <tbody>
              {assessment.assumptions.map((assumption, index) => (
                <tr key={`${index}-${localized(locale, assumption.statement)}`}>
                  <td>
                    <span
                      className={`enterprise-status status-${statusClass(assumption.criticality)}`}
                    >
                      {statusText(locale, assumption.criticality)}
                    </span>
                    <span
                      className={`enterprise-status status-${statusClass(assumption.status)}`}
                    >
                      {localized(locale, assumption.statusLabel)}
                    </span>
                  </td>
                  <td>
                    <strong>{localized(locale, assumption.statement)}</strong>
                    <small>{localized(locale, assumption.submittedBasis)}</small>
                  </td>
                  <td>{localized(locale, assumption.validationTest)}</td>
                  <td>{localized(locale, assumption.owner)}</td>
                  <td>{localized(locale, assumption.trigger)}</td>
                  <td>
                    <SourceHandles
                      locale={locale}
                      handles={assumption.sourceHandles}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section
        className="enterprise-section"
        aria-labelledby="workplan-title"
      >
        <div className="enterprise-section-heading">
          <Route size={19} aria-hidden="true" />
          <div>
            <h2 id="workplan-title">
              {isZh ? "90 天管理层工作计划" : "90-day management workplan"}
            </h2>
            <p>
              {isZh
                ? "按风险与决策价值排序的工作流、负责人、节奏和退出标准"
                : "Risk-ranked workstreams with owners, cadence, and exit criteria"}
            </p>
          </div>
        </div>
        <div className="table-scroll enterprise-table-wrap">
          <table className="data-table enterprise-table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">{isZh ? "工作流" : "Workstream"}</th>
                <th scope="col">{isZh ? "风险 / 为何现在" : "Risk / why now"}</th>
                <th scope="col">{isZh ? "下一步" : "Next step"}</th>
                <th scope="col">{isZh ? "负责人" : "Owner"}</th>
                <th scope="col">
                  {isZh ? "节奏 / 时限" : "Cadence / horizon"}
                </th>
                <th scope="col">{isZh ? "退出标准" : "Exit criteria"}</th>
              </tr>
            </thead>
            <tbody>
              {assessment.priorities.map((item) => (
                <tr key={`${item.rank}-${localized(locale, item.workstream)}`}>
                  <td>
                    <strong>{item.rank}</strong>
                    <span className={`priority-code ${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <strong>{localized(locale, item.workstream)}</strong>
                    <small>
                      {localized(locale, dimensionLabels[item.linkedDimension])}
                    </small>
                  </td>
                  <td>
                    <span
                      className={`enterprise-status status-${statusClass(item.riskLevel)}`}
                    >
                      {statusText(locale, item.riskLevel)}
                    </span>
                    <strong>{localized(locale, item.risk)}</strong>
                    <small>{localized(locale, item.whyNow)}</small>
                  </td>
                  <td>{localized(locale, item.nextStep)}</td>
                  <td>{localized(locale, item.owner)}</td>
                  <td>{localized(locale, item.horizon)}</td>
                  <td>
                    {localized(locale, item.exitCriteria)}
                    <SourceHandles
                      locale={locale}
                      handles={item.sourceHandles}
                      compact
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="enterprise-section" aria-labelledby="source-map-title">
        <div className="enterprise-section-heading">
          <BookOpenCheck size={19} aria-hidden="true" />
          <div>
            <h2 id="source-map-title">
              {isZh ? "课程理论与来源句柄" : "Course theory and source handles"}
            </h2>
            <p>
              {isZh
                ? "来源句柄用于追溯分析逻辑，不等同于当前国家事实"
                : "Handles trace analytical logic; they are not current country facts"}
            </p>
          </div>
        </div>
        <div className="enterprise-source-layout">
          <div>
            <h3>{isZh ? "课程来源映射" : "Course-source map"}</h3>
            {assessment.courseSources.length > 0 ? (
              <ul className="enterprise-course-source-list">
                {assessment.courseSources.map((source) => (
                  <li key={source.handle}>
                    <code>{source.handle}</code>
                    <p>{localized(locale, source.note)}</p>
                    <span>
                      {source.appliedTo
                        .map((dimension) =>
                          localized(locale, dimensionLabels[dimension])
                        )
                        .join(" · ")}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="enterprise-empty">{emptyLabel(locale)}</p>
            )}
          </div>
          <div>
            <h3>{isZh ? "本报告引用句柄" : "Handles cited in this report"}</h3>
            <SourceHandles locale={locale} handles={collectedHandles} />
          </div>
        </div>
      </section>

      <footer className="notice enterprise-disclaimer">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <h2>{isZh ? "使用边界与免责声明" : "Use boundary and disclaimer"}</h2>
          <p>
            {isZh
              ? "本报告是基于使用者提交资料、可追溯规则与课程框架的管理决策支持，不构成法律、税务、监管、审计或投资意见。任何结论仅在输入、假设和来源仍然有效时成立；国家法律、许可、税费、市场与竞争事实必须由相应专业人士和有日期的权威来源独立核验。"
              : "This report is management decision support based on user-submitted inputs, traceable rules, and course frameworks. It is not legal, tax, regulatory, audit, or investment advice. Conclusions hold only while inputs, assumptions, and sources remain valid; country law, licensing, tax, market, and competitor facts require independent verification by relevant professionals and dated authoritative sources."}
          </p>
          <div className="enterprise-audit-meta">
            <span>
              {isZh ? "咨询方法版本" : "Consulting methodology"}{" "}
              {assessment.audit.methodologyVersion}
            </span>
            <span>
              {isZh ? "输入评分版本" : "Input scoring version"}{" "}
              {assessment.audit.inputScoringVersion}
            </span>
            <span>
              {isZh ? "确定性评估；AI 不可修改" : "Deterministic; AI cannot alter"}{" "}
              ✓
            </span>
          </div>
          <div className="enterprise-audit-register">
            <div>
              <h3>{isZh ? "公式登记" : "Formula register"}</h3>
              <DetailList
                locale={locale}
                values={assessment.audit.formulas}
              />
            </div>
            <div>
              <h3>{isZh ? "审计提示" : "Audit notices"}</h3>
              <DetailList
                locale={locale}
                values={assessment.audit.limitations}
              />
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}

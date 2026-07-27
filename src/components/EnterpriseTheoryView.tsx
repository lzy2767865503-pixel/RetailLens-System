import type { ReactNode } from "react";
import {
  Activity,
  BarChart3,
  BookOpenCheck,
  Building2,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Gauge,
  GitCompareArrows,
  Landmark,
  Network,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  XCircle
} from "lucide-react";
import type {
  BilingualLabel,
  EnterpriseModuleBase,
  EnterpriseModuleStatus,
  EnterpriseTheoryAssessment,
  StpScorecard
} from "../domain";
import type { Locale } from "../i18n";

export interface EnterpriseTheoryViewProps {
  locale: Locale;
  assessment: EnterpriseTheoryAssessment;
}

interface ModuleFrameProps {
  locale: Locale;
  id: string;
  index: string;
  title: BilingualLabel;
  subtitle: BilingualLabel;
  module: EnterpriseModuleBase;
  icon: ReactNode;
  children: ReactNode;
}

const statusTone: Record<EnterpriseModuleStatus, string> = {
  complete: "complete",
  incomplete: "incomplete",
  invalid: "invalid",
  blocked: "blocked",
  inconclusive: "inconclusive"
};

function localized(locale: Locale, value: BilingualLabel): string {
  return value[locale];
}

function missingLabel(locale: Locale): string {
  return locale === "zh" ? "未提供 / 无法计算" : "Not provided / not calculable";
}

function formatNumber(
  locale: Locale,
  value: number | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return missingLabel(locale);
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-GB", {
    maximumFractionDigits: 2,
    ...options
  }).format(value);
}

function formatMetric(
  locale: Locale,
  value: number | null | undefined,
  unit?: "%" | "x"
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return missingLabel(locale);
  }

  return `${formatNumber(locale, value)}${unit === "%" ? "%" : unit === "x" ? "×" : ""}`;
}

function formatDate(locale: Locale, value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString(locale === "zh" ? "zh-CN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function StatusIcon({ status }: { status: EnterpriseModuleStatus }) {
  const common = {
    size: 16,
    "aria-hidden": true
  } as const;

  if (status === "complete") return <CheckCircle2 {...common} />;
  if (status === "blocked") return <ShieldAlert {...common} />;
  if (status === "invalid") return <XCircle {...common} />;
  if (status === "inconclusive") return <CircleDashed {...common} />;
  return <CircleAlert {...common} />;
}

function ModuleStatus({
  locale,
  module
}: {
  locale: Locale;
  module: EnterpriseModuleBase;
}) {
  return (
    <span
      className={`theory-status theory-status-${statusTone[module.status]}`}
      aria-label={`${locale === "zh" ? "模块状态" : "Module status"}: ${localized(locale, module.statusLabel)}`}
    >
      <StatusIcon status={module.status} />
      {localized(locale, module.statusLabel)}
    </span>
  );
}

function Formula({
  locale,
  value
}: {
  locale: Locale;
  value: string;
}) {
  return (
    <div className="theory-formula">
      <span>{locale === "zh" ? "锁定公式" : "Locked formula"}</span>
      <code>{value}</code>
    </div>
  );
}

function SourceHandles({
  locale,
  handles
}: {
  locale: Locale;
  handles: string[];
}) {
  const uniqueHandles = [...new Set(handles.filter(Boolean))];

  if (uniqueHandles.length === 0) {
    return <span className="theory-empty">{missingLabel(locale)}</span>;
  }

  return (
    <ul
      className="theory-source-list"
      aria-label={locale === "zh" ? "课程来源句柄" : "Course source handles"}
    >
      {uniqueHandles.map((handle) => (
        <li key={handle}>
          <code>{handle}</code>
        </li>
      ))}
    </ul>
  );
}

function EvidenceRegister({
  locale,
  module
}: {
  locale: Locale;
  module: EnterpriseModuleBase;
}) {
  return (
    <div className="theory-evidence-block">
      <div className="theory-evidence-column">
        <h4>
          <BookOpenCheck size={16} aria-hidden="true" />
          {locale === "zh" ? "证据缺口与验收口径" : "Evidence gaps and acceptance"}
        </h4>
        {module.requiredEvidence.length > 0 ? (
          <ol className="theory-evidence-list">
            {module.requiredEvidence.map((requirement) => (
              <li key={requirement.id}>
                <strong>{localized(locale, requirement.label)}</strong>
                <p>{localized(locale, requirement.acceptanceCriteria)}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="theory-empty">{missingLabel(locale)}</p>
        )}
      </div>
      <div className="theory-source-column">
        <h4>{locale === "zh" ? "课程来源句柄" : "Course source handles"}</h4>
        <SourceHandles locale={locale} handles={module.sourceHandles} />
        <div className="theory-rule-note">
          <ShieldCheck size={16} aria-hidden="true" />
          <p>{localized(locale, module.internalRuleDisclaimer)}</p>
        </div>
      </div>
    </div>
  );
}

function ModuleFrame({
  locale,
  id,
  index,
  title,
  subtitle,
  module,
  icon,
  children
}: ModuleFrameProps) {
  return (
    <section className="theory-module" aria-labelledby={id}>
      <header className="theory-module-header">
        <div className="theory-module-identity">
          <span className="theory-module-index" aria-hidden="true">
            {index}
          </span>
          <span className="theory-module-icon" aria-hidden="true">
            {icon}
          </span>
          <div>
            <h2 id={id}>{localized(locale, title)}</h2>
            <p>{localized(locale, subtitle)}</p>
          </div>
        </div>
        <ModuleStatus locale={locale} module={module} />
      </header>
      <div className="theory-module-body">{children}</div>
      <EvidenceRegister locale={locale} module={module} />
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  emphasis = false
}: {
  label: string;
  value: string;
  detail?: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`theory-metric-card${emphasis ? " theory-metric-card-emphasis" : ""}`}
    >
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

function StpCard({
  locale,
  title,
  scorecard
}: {
  locale: Locale;
  title: string;
  scorecard: StpScorecard;
}) {
  return (
    <article className="theory-stp-card">
      <header>
        <h3>{title}</h3>
        <strong>
          {formatNumber(locale, scorecard.internalNormalizedScore)}/100
        </strong>
      </header>
      <p className="theory-stp-rating">
        {locale === "zh" ? "等权评分" : "Equal-weighted rating"}{" "}
        <strong>{formatNumber(locale, scorecard.weightedRating)}/5</strong>
      </p>
      <div className="theory-table-wrap">
        <table className="theory-table theory-table-compact">
          <thead>
            <tr>
              <th scope="col">{locale === "zh" ? "标准" : "Criterion"}</th>
              <th scope="col">{locale === "zh" ? "评分" : "Rating"}</th>
              <th scope="col">{locale === "zh" ? "权重" : "Weight"}</th>
              <th scope="col">{locale === "zh" ? "贡献" : "Contribution"}</th>
            </tr>
          </thead>
          <tbody>
            {scorecard.criteria.map((criterion) => (
              <tr key={criterion.id}>
                <th scope="row">{localized(locale, criterion.label)}</th>
                <td>{formatNumber(locale, criterion.rating)}/5</td>
                <td>{formatNumber(locale, criterion.weightPct)}%</td>
                <td>
                  {formatNumber(locale, criterion.weightedRatingContribution)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Formula locale={locale} value={scorecard.formula} />
    </article>
  );
}

function BooleanFlag({
  locale,
  label,
  value
}: {
  locale: Locale;
  label: string;
  value: boolean;
}) {
  return (
    <li
      className={`theory-control-flag theory-control-flag-${value ? "defined" : "missing"}`}
    >
      {value ? (
        <CheckCircle2 size={17} aria-hidden="true" />
      ) : (
        <CircleAlert size={17} aria-hidden="true" />
      )}
      <span>{label}</span>
      <strong>
        {value
          ? locale === "zh"
            ? "已定义"
            : "Defined"
          : locale === "zh"
            ? "待补充"
            : "Missing"}
      </strong>
    </li>
  );
}

export function EnterpriseTheoryView({
  locale,
  assessment
}: EnterpriseTheoryViewProps) {
  const isZh = locale === "zh";
  const modules: EnterpriseModuleBase[] = [
    assessment.fiveForces,
    assessment.cpm,
    assessment.stp,
    assessment.entryMode,
    assessment.financeProductivity,
    assessment.serviceGaps,
    assessment.organizationControl,
    assessment.topRisk
  ];
  const completeCount = modules.filter(
    ({ status }) => status === "complete"
  ).length;
  const attentionCount = modules.length - completeCount;
  const cpmLeader = assessment.cpm.companies.find(
    ({ id }) => id === assessment.cpm.relativeLeaderId
  );
  const entryLeader = assessment.entryMode.options.find(
    ({ id }) => id === assessment.entryMode.leadingModeId
  );

  return (
    <article
      className="theory-workpaper"
      aria-labelledby="theory-workpaper-title"
    >
      <header className="theory-page-header">
        <div className="theory-page-title">
          <div className="theory-page-icon" aria-hidden="true">
            <Network size={24} />
          </div>
          <div>
            <h1 id="theory-workpaper-title">
              {isZh ? "企业理论工作台" : "Enterprise theory workbench"}
            </h1>
            <p>
              {assessment.businessName} · RetailLens{" "}
              {isZh ? "方法版本" : "methodology version"}{" "}
              {assessment.version} · {formatDate(locale, assessment.generatedAt)}
            </p>
          </div>
        </div>
        <div className="theory-audit-lock">
          <ShieldCheck size={19} aria-hidden="true" />
          <div>
            <span>{isZh ? "计算锁定" : "Calculation locked"}</span>
            <strong>
              {isZh ? "AI 不得修改结果" : "AI cannot alter results"}
            </strong>
          </div>
        </div>
      </header>

      <section
        className="theory-summary"
        aria-label={isZh ? "模块组合概览" : "Module portfolio overview"}
      >
        <MetricCard
          label={isZh ? "结构化理论模块" : "Structured theory modules"}
          value={formatNumber(locale, modules.length)}
          detail={
            isZh
              ? "相同输入产生相同计算结果"
              : "Same inputs produce the same calculations"
          }
          emphasis
        />
        <MetricCard
          label={isZh ? "计算完整" : "Calculation complete"}
          value={`${completeCount}/${modules.length}`}
          detail={isZh ? "不代表证据已验证" : "Does not mean evidence is verified"}
        />
        <MetricCard
          label={isZh ? "需管理层关注" : "Management attention"}
          value={formatNumber(locale, attentionCount)}
          detail={
            isZh
              ? "不完整、无效、阻断或无明确结论"
              : "Incomplete, invalid, blocked, or inconclusive"
          }
        />
        <MetricCard
          label={isZh ? "审计来源句柄" : "Audit source handles"}
          value={formatNumber(locale, assessment.audit.sourceHandles.length)}
          detail={
            isZh
              ? "课程定位符，不是实时市场证据"
              : "Course locators, not live market evidence"
          }
        />
      </section>

      <div className="theory-scope-note">
        <CircleAlert size={18} aria-hidden="true" />
        <p>
          {isZh
            ? "本工作台把结构化输入转化为可复算的管理底稿。模块状态描述计算完整性，不等于证据验证、外部审计意见或行业 benchmark。"
            : "This workbench converts structured inputs into reproducible management workpapers. Module status describes calculation completeness; it is not evidence validation, an external audit opinion, or an industry benchmark."}
        </p>
      </div>

      <ModuleFrame
        locale={locale}
        id="theory-five-forces"
        index="01"
        title={{ zh: "行业结构：五力分析", en: "Industry structure: Five Forces" }}
        subtitle={{
          zh: "区分行业力量强度与企业应对能力",
          en: "Separates industry-force intensity from company response capability"
        }}
        module={assessment.fiveForces}
        icon={<Activity size={20} />}
      >
        <div className="theory-metric-strip">
          <MetricCard
            label={isZh ? "平均力量强度" : "Mean force intensity"}
            value={`${formatNumber(locale, assessment.fiveForces.overallIntensity)}/5`}
            detail={localized(locale, assessment.fiveForces.scale)}
          />
          <MetricCard
            label={isZh ? "内部行业吸引力换算" : "Internal attractiveness conversion"}
            value={`${formatNumber(locale, assessment.fiveForces.internalIndustryAttractiveness)}/100`}
            detail={
              isZh
                ? "仅为 RetailLens 可视化换算"
                : "RetailLens visualization only"
            }
            emphasis
          />
        </div>
        <div className="theory-table-wrap">
          <table className="theory-table">
            <thead>
              <tr>
                <th scope="col">{isZh ? "行业力量" : "Industry force"}</th>
                <th scope="col">{isZh ? "提交强度" : "Submitted intensity"}</th>
                <th scope="col">
                  {isZh ? "内部吸引力换算" : "Internal attractiveness"}
                </th>
              </tr>
            </thead>
            <tbody>
              {assessment.fiveForces.forces.map((force) => (
                <tr key={force.id}>
                  <th scope="row">{localized(locale, force.label)}</th>
                  <td>
                    <div className="theory-value-with-meter">
                      <strong>{formatNumber(locale, force.intensity)}/5</strong>
                      <progress
                        className="theory-meter"
                        max={5}
                        value={force.intensity ?? 0}
                        aria-label={`${localized(locale, force.label)} ${isZh ? "强度" : "intensity"}`}
                      />
                    </div>
                  </td>
                  <td>
                    {formatNumber(locale, force.internalAttractivenessScore)}/100
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Formula locale={locale} value={assessment.fiveForces.formula} />
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-cpm"
        index="02"
        title={{ zh: "竞争态势矩阵（CPM）", en: "Competitive Profile Matrix (CPM)" }}
        subtitle={{
          zh: "同一组关键成功因素下的相对竞争比较",
          en: "Relative competitive comparison using common success factors"
        }}
        module={assessment.cpm}
        icon={<GitCompareArrows size={20} />}
      >
        <div className="theory-metric-strip">
          <MetricCard
            label={isZh ? "权重合计" : "Weight total"}
            value={formatNumber(locale, assessment.cpm.weightTotal)}
            detail={
              assessment.cpm.weightValid
                ? isZh
                  ? "校验通过：合计 1"
                  : "Validated: totals 1"
                : isZh
                  ? "校验未通过"
                  : "Validation failed"
            }
          />
          <MetricCard
            label={isZh ? "相对领先者" : "Relative leader"}
            value={
              assessment.cpm.tiedForLead
                ? isZh
                  ? "并列"
                  : "Tie"
                : cpmLeader?.name ?? missingLabel(locale)
            }
            detail={
              isZh
                ? "只在三家已提交企业之间成立"
                : "Only among the three submitted companies"
            }
            emphasis
          />
          <MetricCard
            label={isZh ? "评分量表" : "Rating scale"}
            value="1–4"
            detail={localized(locale, assessment.cpm.ratingScale)}
          />
        </div>
        <div className="theory-table-wrap">
          <table className="theory-table">
            <thead>
              <tr>
                <th scope="col">{isZh ? "企业" : "Company"}</th>
                <th scope="col">{isZh ? "加权总分" : "Weighted total"}</th>
                <th scope="col">{isZh ? "相对名次" : "Relative rank"}</th>
              </tr>
            </thead>
            <tbody>
              {assessment.cpm.companies.map((company) => (
                <tr
                  key={company.id}
                  className={
                    company.id === assessment.cpm.relativeLeaderId
                      ? "theory-table-highlight"
                      : undefined
                  }
                >
                  <th scope="row">{company.name || missingLabel(locale)}</th>
                  <td>{formatNumber(locale, company.weightedTotal)}</td>
                  <td>
                    {company.relativeRank === null
                      ? missingLabel(locale)
                      : `#${formatNumber(locale, company.relativeRank)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="theory-table-wrap">
          <table className="theory-table theory-table-wide">
            <thead>
              <tr>
                <th scope="col">{isZh ? "关键成功因素" : "Success factor"}</th>
                <th scope="col">{isZh ? "权重" : "Weight"}</th>
                <th scope="col">{assessment.cpm.companies[0]?.name}</th>
                <th scope="col">{assessment.cpm.companies[1]?.name}</th>
                <th scope="col">{assessment.cpm.companies[2]?.name}</th>
                <th scope="col">
                  {isZh ? "相对最佳竞品加权差" : "Weighted gap to best competitor"}
                </th>
              </tr>
            </thead>
            <tbody>
              {assessment.cpm.factors.map((factor) => (
                <tr key={factor.id}>
                  <th scope="row">{localized(locale, factor.label)}</th>
                  <td>{formatNumber(locale, factor.weight)}</td>
                  <td>
                    {formatNumber(locale, factor.ratings.company)}{" "}
                    <small>
                      ({formatNumber(locale, factor.weightedScores.company)})
                    </small>
                  </td>
                  <td>
                    {formatNumber(locale, factor.ratings.competitorA)}{" "}
                    <small>
                      ({formatNumber(locale, factor.weightedScores.competitorA)})
                    </small>
                  </td>
                  <td>
                    {formatNumber(locale, factor.ratings.competitorB)}{" "}
                    <small>
                      ({formatNumber(locale, factor.weightedScores.competitorB)})
                    </small>
                  </td>
                  <td
                    className={
                      (factor.weightedGapToBestCompetitor ?? 0) < 0
                        ? "theory-value-negative"
                        : "theory-value-positive"
                    }
                  >
                    {formatNumber(locale, factor.weightedGapToBestCompetitor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Formula locale={locale} value={assessment.cpm.formula} />
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-stp"
        index="03"
        title={{ zh: "STP 与定位完整度", en: "STP and positioning completeness" }}
        subtitle={{
          zh: "客群吸引力、取胜权与定位证据分开计算",
          en: "Separates segment attractiveness, right to win, and positioning evidence"
        }}
        module={assessment.stp}
        icon={<Target size={20} />}
      >
        <div className="theory-targeting-call">
          <span>{isZh ? "已提交目标策略" : "Submitted targeting strategy"}</span>
          <strong>{localized(locale, assessment.stp.targeting.label)}</strong>
          <small>
            {isZh
              ? "策略名称不是推荐；应由客群经济性和取胜证据支持"
              : "The label is not a recommendation; segment economics and right-to-win evidence must support it"}
          </small>
        </div>
        <div className="theory-stp-grid">
          <StpCard
            locale={locale}
            title={isZh ? "客群吸引力" : "Segment attractiveness"}
            scorecard={assessment.stp.segmentAttractiveness}
          />
          <StpCard
            locale={locale}
            title={isZh ? "取胜权" : "Right to win"}
            scorecard={assessment.stp.rightToWin}
          />
          <StpCard
            locale={locale}
            title={isZh ? "定位完整度" : "Positioning completeness"}
            scorecard={assessment.stp.positioningCompleteness}
          />
        </div>
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-entry-mode"
        index="04"
        title={{ zh: "市场进入模式 MCDA", en: "Market-entry mode MCDA" }}
        subtitle={{
          zh: "硬门槛优先于加权方案比较",
          en: "Hard gates take precedence over weighted option comparison"
        }}
        module={assessment.entryMode}
        icon={<Landmark size={20} />}
      >
        <div className="theory-metric-strip">
          <MetricCard
            label={isZh ? "硬门槛结果" : "Hard-gate outcome"}
            value={
              assessment.entryMode.hardGateOutcome === "blocked"
                ? isZh
                  ? "阻断"
                  : "Blocked"
                : isZh
                  ? "未阻断"
                  : "Not blocked"
            }
            detail={
              isZh
                ? "阻断时不得输出进入模式推荐"
                : "No entry-mode recommendation is issued when blocked"
            }
          />
          <MetricCard
            label={isZh ? "领先方案" : "Leading option"}
            value={
              entryLeader
                ? localized(locale, entryLeader.label)
                : missingLabel(locale)
            }
            detail={
              entryLeader
                ? `${isZh ? "内部加权分" : "Internal weighted score"} ${formatNumber(locale, entryLeader.internalWeightedScore)}/100`
                : localized(locale, assessment.entryMode.tieRule)
            }
            emphasis
          />
          <MetricCard
            label={isZh ? "前两名差距" : "Top-two score gap"}
            value={formatNumber(locale, assessment.entryMode.scoreGap)}
            detail={localized(locale, assessment.entryMode.tieRule)}
          />
          <MetricCard
            label={isZh ? "权重合计" : "Weight total"}
            value={`${formatNumber(locale, assessment.entryMode.weightTotal)}%`}
            detail={isZh ? "RetailLens 1.0 固定内部权重" : "RetailLens 1.0 fixed internal weights"}
          />
        </div>
        <div className="theory-entry-options">
          {assessment.entryMode.options.map((option) => (
            <article
              className={`theory-entry-option${option.id === assessment.entryMode.leadingModeId ? " theory-entry-option-leading" : ""}`}
              key={option.id}
            >
              <span>
                {option.rank === null
                  ? isZh
                    ? "未排名"
                    : "Unranked"
                  : `#${option.rank}`}
              </span>
              <h3>{localized(locale, option.label)}</h3>
              <strong>
                {formatNumber(locale, option.internalWeightedScore)}/100
              </strong>
            </article>
          ))}
        </div>
        <div className="theory-table-wrap">
          <table className="theory-table theory-table-wide">
            <thead>
              <tr>
                <th scope="col">{isZh ? "评价标准" : "Criterion"}</th>
                <th scope="col">{isZh ? "权重" : "Weight"}</th>
                {assessment.entryMode.options.map((option) => (
                  <th scope="col" key={option.id}>
                    {localized(locale, option.label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assessment.entryMode.criteria.map((criterion) => (
                <tr key={criterion.id}>
                  <th scope="row">{localized(locale, criterion.label)}</th>
                  <td>{formatNumber(locale, criterion.weightPct)}%</td>
                  {assessment.entryMode.options.map((option) => {
                    const optionCriterion = option.criteria.find(
                      ({ id }) => id === criterion.id
                    );
                    return (
                      <td key={option.id}>
                        {formatNumber(locale, optionCriterion?.rating)}/5{" "}
                        <small>
                          ({formatNumber(locale, optionCriterion?.weightedContribution)})
                        </small>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Formula locale={locale} value={assessment.entryMode.formula} />
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-finance-productivity"
        index="05"
        title={{
          zh: "战略利润模型与 GMROI",
          en: "Strategic Profit Model and GMROI"
        }}
        subtitle={{
          zh: "同时检查利润路径、资产周转与库存生产力",
          en: "Reviews the profit path, asset turnover, and inventory productivity together"
        }}
        module={assessment.financeProductivity}
        icon={<TrendingUp size={20} />}
      >
        <div className="theory-finance-bridge">
          <div>
            <span>{isZh ? "年化净销售额" : "Annualized net sales"}</span>
            <strong>
              {formatNumber(locale, assessment.financeProductivity.annualizedRevenue)}
            </strong>
          </div>
          <span aria-hidden="true">→</span>
          <div>
            <span>{isZh ? "年化净利润" : "Annualized net profit"}</span>
            <strong>
              {formatNumber(locale, assessment.financeProductivity.annualizedNetProfit)}
            </strong>
          </div>
          <span aria-hidden="true">+</span>
          <div>
            <span>{isZh ? "年化毛利额" : "Annualized gross margin"}</span>
            <strong>
              {formatNumber(locale, assessment.financeProductivity.annualizedGrossMargin)}
            </strong>
          </div>
        </div>
        <div className="theory-finance-grid">
          {assessment.financeProductivity.metrics.map((metric) => (
            <article className="theory-finance-metric" key={metric.id}>
              <span>{localized(locale, metric.label)}</span>
              <strong>{formatMetric(locale, metric.value, metric.unit)}</strong>
              <code>{metric.formula}</code>
            </article>
          ))}
        </div>
        <div className="theory-benchmark-warning">
          <Scale size={18} aria-hidden="true" />
          <p>
            {isZh
              ? "不设置跨业态统一的 GMROI、ROA、净利率或资产周转率通过线。请与同口径的企业历史、批准预算及当前可比同业对比。"
              : "No universal cross-format pass line is applied to GMROI, ROA, margin, or asset turnover. Compare like-for-like against company history, approved budget, and current peers."}
          </p>
        </div>
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-service-gaps"
        index="06"
        title={{ zh: "Service GAPS 服务差距", en: "Service GAPS" }}
        subtitle={{
          zh: "把顾客期望—感知差距与四类组织成因分开",
          en: "Separates customer expectation–perception gaps from four organizational causes"
        }}
        module={assessment.serviceGaps}
        icon={<Gauge size={20} />}
      >
        <div className="theory-metric-strip">
          <MetricCard
            label={isZh ? "平均顾客差距（P−E）" : "Average customer gap (P−E)"}
            value={formatNumber(locale, assessment.serviceGaps.averageCustomerGap)}
            detail={
              isZh
                ? "负值表示感知低于期望"
                : "A negative value means perception is below expectation"
            }
            emphasis
          />
          <MetricCard
            label={isZh ? "负差距维度" : "Negative-gap dimensions"}
            value={`${assessment.serviceGaps.negativeGapCount}/${assessment.serviceGaps.customerGaps.length}`}
            detail={isZh ? "用于排查优先级，不证明因果" : "Prioritizes investigation; does not prove causality"}
          />
          <MetricCard
            label={isZh ? "平均组织差距强度" : "Mean organizational-gap intensity"}
            value={`${formatNumber(locale, assessment.serviceGaps.averageOrganizationGapIntensity)}/5`}
            detail={isZh ? "提交的内部诊断量表" : "Submitted internal diagnostic scale"}
          />
        </div>
        <div className="theory-service-grid">
          <div className="theory-table-wrap">
            <table className="theory-table">
              <thead>
                <tr>
                  <th scope="col">{isZh ? "RATER 维度" : "RATER dimension"}</th>
                  <th scope="col">{isZh ? "期望 E" : "Expectation E"}</th>
                  <th scope="col">{isZh ? "感知 P" : "Perception P"}</th>
                  <th scope="col">{isZh ? "差距 P−E" : "Gap P−E"}</th>
                </tr>
              </thead>
              <tbody>
                {assessment.serviceGaps.customerGaps.map((gap) => (
                  <tr key={gap.id}>
                    <th scope="row">{localized(locale, gap.label)}</th>
                    <td>{formatNumber(locale, gap.expectation)}/7</td>
                    <td>{formatNumber(locale, gap.perception)}/7</td>
                    <td
                      className={
                        (gap.gap ?? 0) < 0
                          ? "theory-value-negative"
                          : "theory-value-positive"
                      }
                    >
                      {formatNumber(locale, gap.gap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="theory-organization-gap-list">
            <h3>{isZh ? "组织差距强度" : "Organizational-gap intensity"}</h3>
            {assessment.serviceGaps.organizationGaps.map((gap) => (
              <div key={gap.id}>
                <span>{localized(locale, gap.label)}</span>
                <strong>{formatNumber(locale, gap.intensity)}/5</strong>
                <progress
                  className="theory-meter"
                  max={5}
                  value={gap.intensity}
                  aria-label={localized(locale, gap.label)}
                />
              </div>
            ))}
          </div>
        </div>
        <Formula locale={locale} value={assessment.serviceGaps.formula} />
        <p className="theory-interpretation">
          {localized(locale, assessment.serviceGaps.interpretation)}
        </p>
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-organization-control"
        index="07"
        title={{ zh: "组织、决策权与控制", en: "Organization, decision rights, and control" }}
        subtitle={{
          zh: "覆盖、复核节奏和例外容忍度按原始输入呈现",
          en: "Shows coverage, review cadence, and exception tolerance as submitted"
        }}
        module={assessment.organizationControl}
        icon={<Building2 size={20} />}
      >
        <div className="theory-control-layout">
          <div className="theory-control-score">
            <span>{isZh ? "平均控制覆盖" : "Average control coverage"}</span>
            <strong>
              {formatMetric(
                locale,
                assessment.organizationControl.averageCoveragePct,
                "%"
              )}
            </strong>
            <p>
              {isZh
                ? "仅为政策、流程与 KPI 三项提交覆盖率的算术平均"
                : "Arithmetic mean of submitted policy, process, and KPI coverage only"}
            </p>
          </div>
          <div className="theory-control-register">
            {assessment.organizationControl.coverage.map((control) => (
              <div key={control.id}>
                <span>{localized(locale, control.label)}</span>
                <strong>{formatMetric(locale, control.coveragePct, "%")}</strong>
                <progress
                  className="theory-meter"
                  max={100}
                  value={control.coveragePct}
                  aria-label={localized(locale, control.label)}
                />
              </div>
            ))}
          </div>
        </div>
        <dl className="theory-operating-cadence">
          <div>
            <dt>{isZh ? "复核节奏" : "Review cadence"}</dt>
            <dd>{localized(locale, assessment.organizationControl.cadenceLabel)}</dd>
          </div>
          <div>
            <dt>{isZh ? "偏差容忍度" : "Variance tolerance"}</dt>
            <dd>{localized(locale, assessment.organizationControl.varianceLabel)}</dd>
          </div>
        </dl>
      </ModuleFrame>

      <ModuleFrame
        locale={locale}
        id="theory-risk-monitoring"
        index="08"
        title={{ zh: "首要风险与战略监控", en: "Top risk and strategic monitoring" }}
        subtitle={{
          zh: "固有风险、控制有效性、残余风险和应急准备分层呈现",
          en: "Layers inherent risk, control effectiveness, residual risk, and contingency readiness"
        }}
        module={assessment.topRisk}
        icon={<ShieldAlert size={20} />}
      >
        <div className="theory-risk-statement">
          <span>{isZh ? "首要风险" : "Top risk"}</span>
          <h3>{localized(locale, assessment.topRisk.name)}</h3>
        </div>
        <div className="theory-risk-equation">
          <div>
            <span>{isZh ? "可能性" : "Likelihood"}</span>
            <strong>{formatNumber(locale, assessment.topRisk.likelihood)}/5</strong>
          </div>
          <span aria-hidden="true">×</span>
          <div>
            <span>{isZh ? "影响" : "Impact"}</span>
            <strong>{formatNumber(locale, assessment.topRisk.impact)}/5</strong>
          </div>
          <span aria-hidden="true">=</span>
          <div>
            <span>{isZh ? "固有风险" : "Inherent risk"}</span>
            <strong>{formatNumber(locale, assessment.topRisk.inherentScore)}</strong>
          </div>
          <span aria-hidden="true">→</span>
          <div className="theory-risk-residual">
            <span>{isZh ? "残余风险" : "Residual risk"}</span>
            <strong>{formatNumber(locale, assessment.topRisk.residualScore)}</strong>
          </div>
        </div>
        <div className="theory-risk-control-grid">
          <MetricCard
            label={isZh ? "提交控制有效性" : "Submitted control effectiveness"}
            value={formatMetric(
              locale,
              assessment.topRisk.controlEffectivenessPct,
              "%"
            )}
            detail={
              isZh
                ? "须由控制设计与运行测试验证"
                : "Requires design and operating-effectiveness testing"
            }
          />
          <MetricCard
            label={isZh ? "控制准备度" : "Control readiness"}
            value={formatMetric(locale, assessment.topRisk.controlReadinessPct, "%")}
            detail={isZh ? "基于三项已定义标记" : "Based on three definition flags"}
          />
          <ul className="theory-control-flags">
            {assessment.topRisk.controlFlags.map((flag) => (
              <BooleanFlag
                key={flag.id}
                locale={locale}
                label={localized(locale, flag.label)}
                value={flag.defined}
              />
            ))}
          </ul>
        </div>
        <div className="theory-formula-pair">
          <Formula locale={locale} value={assessment.topRisk.formulas.inherent} />
          <Formula locale={locale} value={assessment.topRisk.formulas.residual} />
        </div>
      </ModuleFrame>

      <section
        className="theory-audit-register"
        aria-labelledby="theory-audit-register-title"
      >
        <header className="theory-audit-header">
          <div>
            <ShieldCheck size={21} aria-hidden="true" />
            <h2 id="theory-audit-register-title">
              {isZh ? "方法与模型风险登记册" : "Method and model-risk register"}
            </h2>
          </div>
          <span>
            {isZh ? "方法版本" : "Methodology"}{" "}
            {assessment.audit.methodologyVersion} ·{" "}
            {isZh ? "评分版本" : "Scoring"}{" "}
            {assessment.audit.inputScoringVersion}
          </span>
        </header>
        <div className="theory-audit-declarations">
          <div>
            <CheckCircle2 size={17} aria-hidden="true" />
            <span>{isZh ? "确定性计算" : "Deterministic calculation"}</span>
            <strong>{assessment.audit.deterministic ? (isZh ? "是" : "Yes") : (isZh ? "否" : "No")}</strong>
          </div>
          <div>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>{isZh ? "AI 可修改评估" : "AI may alter assessment"}</span>
            <strong>{assessment.audit.aiMayAlterAssessment ? (isZh ? "是" : "Yes") : (isZh ? "否" : "No")}</strong>
          </div>
        </div>
        <div className="theory-audit-grid">
          <div>
            <h3>{isZh ? "锁定内部规则" : "Locked internal rules"}</h3>
            <ol>
              {assessment.audit.internalRules.map((rule, index) => (
                <li key={`${localized(locale, rule)}-${index}`}>
                  {localized(locale, rule)}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h3>{isZh ? "模型局限" : "Model limitations"}</h3>
            <ol>
              {assessment.audit.limitations.map((limitation, index) => (
                <li key={`${localized(locale, limitation)}-${index}`}>
                  {localized(locale, limitation)}
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="theory-audit-sources">
          <h3>{isZh ? "完整课程来源索引" : "Complete course source index"}</h3>
          <SourceHandles locale={locale} handles={assessment.audit.sourceHandles} />
        </div>
        <p className="theory-independence-note">
          <BarChart3 size={18} aria-hidden="true" />
          {isZh
            ? "RetailLens 是独立构建的管理分析系统。上述公式、换算、权重及判定规则属于 RetailLens 版本化内部方法；不宣称任何四大会计师事务所、咨询公司或课程作者的背书、归属或专有方法复制。"
            : "RetailLens is an independently built management-analysis system. The formulas, conversions, weights, and decision rules above are versioned RetailLens internal methods; no endorsement, affiliation, or copying of proprietary methods from any Big Four firm, consulting company, or course author is claimed."}
        </p>
      </section>
    </article>
  );
}

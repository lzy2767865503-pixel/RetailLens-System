import { useMemo, useState, type ReactNode } from "react";
import {
  AlertCircle,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Download,
  FilePenLine,
  Gauge,
  Lightbulb,
  LockKeyhole,
  Network,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Target
} from "lucide-react";
import type { AiAnalysis } from "../api";
import type { Locale } from "../i18n";

export interface DimensionView {
  id: string;
  labelZh: string;
  labelEn: string;
  weight: number;
  score: number;
  evidenceHandles?: string[];
}

export interface FindingView {
  id: string;
  titleZh: string;
  titleEn: string;
  detailZh: string;
  detailEn: string;
  evidence?: string[];
}

export interface ActionView {
  priority: "P0" | "P1" | "P2";
  actionZh: string;
  actionEn: string;
  ownerZh: string;
  ownerEn: string;
  horizonZh: string;
  horizonEn: string;
  kpiZh: string;
  kpiEn: string;
}

export interface MetricView {
  labelZh: string;
  labelEn: string;
  value: string;
  interpretationZh: string;
  interpretationEn: string;
}

export interface GateView {
  labelZh: string;
  labelEn: string;
  status: "pass" | "review" | "fail" | "unknown";
  reasonZh: string;
  reasonEn: string;
}

export interface RetailReportViewModel {
  businessName: string;
  geography: string;
  modelLabelZh: string;
  modelLabelEn: string;
  overallScore: number;
  bandZh: string;
  bandEn: string;
  confidence: number;
  completeness: number;
  dimensions: DimensionView[];
  strengths: FindingView[];
  gaps: FindingView[];
  actions: ActionView[];
  metrics: MetricView[];
  gates: GateView[];
  evidenceCount: number;
  generatedAt: string;
}

interface ReportViewProps {
  locale: Locale;
  report: RetailReportViewModel;
  ai: AiAnalysis | null;
  aiLoading: boolean;
  executiveContent: ReactNode;
  theoryContent: ReactNode;
  matrixContent: ReactNode;
  onRetryAi: () => void;
  onEdit: () => void;
  onOpenMethodology: () => void;
}

type ReportSection =
  | "executive"
  | "theory"
  | "summary"
  | "dimensions"
  | "matrices"
  | "roadmap"
  | "evidence";

const reportNav = [
  ["executive", BriefcaseBusiness, "管理层底稿", "Executive workpaper"],
  ["theory", Network, "企业理论引擎", "Theory engine"],
  ["summary", Gauge, "总览", "Summary"],
  ["dimensions", BarChart3, "评分维度", "Dimensions"],
  ["matrices", Target, "战略矩阵", "Strategy matrices"],
  ["roadmap", Route, "改进路线图", "Improvement roadmap"],
  ["evidence", BookOpenCheck, "证据与门槛", "Evidence & gates"]
] as const;

const gateLabels = {
  pass: { zh: "通过", en: "Pass" },
  review: { zh: "需复核", en: "Review" },
  fail: { zh: "失败", en: "Fail" },
  unknown: { zh: "未知", en: "Unknown" }
} as const;

function localized(locale: Locale, zh: string, en: string) {
  return locale === "zh" ? zh : en;
}

function scoreColor(score: number) {
  if (score >= 75) return "var(--teal)";
  if (score >= 55) return "var(--amber)";
  return "var(--red)";
}

export function ReportView({
  locale,
  report,
  ai,
  aiLoading,
  executiveContent,
  theoryContent,
  matrixContent,
  onRetryAi,
  onEdit,
  onOpenMethodology
}: ReportViewProps) {
  const [section, setSection] = useState<ReportSection>("executive");
  const isZh = locale === "zh";
  const failedGates = report.gates.filter(
    ({ status }) => status === "fail"
  ).length;
  const unresolvedGates = report.gates.filter(
    ({ status }) => status === "review" || status === "unknown"
  ).length;
  const visibleStrengths = useMemo(
    () => report.strengths.slice(0, 5),
    [report.strengths]
  );
  const visibleGaps = useMemo(
    () => report.gaps.slice(0, 5),
    [report.gaps]
  );

  const renderSummary = () => (
    <>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">
            {isZh ? "规则评分报告" : "Deterministic assessment report"}
          </p>
          <h1 className="page-title">{report.businessName}</h1>
          <p className="page-subtitle">
            {report.geography} ·{" "}
            {localized(locale, report.modelLabelZh, report.modelLabelEn)} ·{" "}
            {isZh ? "生成于" : "Generated"}{" "}
            {new Date(report.generatedAt).toLocaleString(
              isZh ? "zh-CN" : "en-GB",
              { dateStyle: "medium", timeStyle: "short" }
            )}
          </p>
        </div>
        <div className="button-group">
          <button className="button" type="button" onClick={onEdit}>
            <FilePenLine size={16} aria-hidden="true" />
            {isZh ? "编辑资料" : "Edit inputs"}
          </button>
          <button
            className="button"
            type="button"
            onClick={() => window.print()}
          >
            <Download size={16} aria-hidden="true" />
            {isZh ? "打印 / 导出 PDF" : "Print / export PDF"}
          </button>
        </div>
      </div>

      <section className="score-band" aria-label="Assessment summary">
        <div className="score-primary">
          <div className="score-number">
            {Math.round(report.overallScore)}
            <small>/100</small>
          </div>
          <div>
            <p className="score-label">
              {localized(locale, report.bandZh, report.bandEn)}
            </p>
            <p className="score-lock">
              <LockKeyhole size={14} aria-hidden="true" />
              {isZh
                ? "规则分数已锁定，AI 无权修改"
                : "Deterministic score locked; AI cannot alter it"}
            </p>
          </div>
        </div>
        <dl className="score-metric">
          <dt>{isZh ? "证据置信度" : "Evidence confidence"}</dt>
          <dd>{Math.round(report.confidence)}%</dd>
        </dl>
        <dl className="score-metric">
          <dt>{isZh ? "资料完整度" : "Input completeness"}</dt>
          <dd>{Math.round(report.completeness)}%</dd>
        </dl>
        <dl
          className={
            failedGates > 0 || unresolvedGates > 0
              ? "score-metric is-alert"
              : "score-metric"
          }
        >
          <dt>{isZh ? "硬门槛提醒" : "Gate alerts"}</dt>
          <dd>{failedGates + unresolvedGates}</dd>
        </dl>
      </section>

      <section className="dimension-section">
        <div>
          <h2 className="section-title">
            {isZh ? "10 维度评分" : "10-dimension score"}
          </h2>
          <p className="section-copy">
            {isZh
              ? "条形长度代表该维度的 0–100 表现；权重用于计算总分。"
              : "Bar length shows 0–100 performance; weights determine the total."}
          </p>
        </div>
        <div className="dimension-list">
          {report.dimensions.map((dimension) => (
            <div className="dimension-row" key={dimension.id}>
              <div className="dimension-label">
                <strong>
                  {localized(
                    locale,
                    dimension.labelZh,
                    dimension.labelEn
                  )}
                </strong>
                <span>
                  {localized(
                    locale,
                    dimension.labelEn,
                    dimension.labelZh
                  )}
                </span>
              </div>
              <div className="dimension-weight">{dimension.weight}%</div>
              <div
                className="dimension-track"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={dimension.score}
              >
                <div
                  className="dimension-fill"
                  style={{
                    width: `${Math.max(0, Math.min(100, dimension.score))}%`,
                    background: scoreColor(dimension.score)
                  }}
                />
              </div>
              <div className="dimension-score">
                {Math.round(dimension.score)}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="strength-gap-grid">
        <div className="finding-column">
          <h2 className="finding-title is-strength">
            <CheckCircle2 size={17} aria-hidden="true" />
            {isZh ? "主要优势" : "Principal strengths"}
          </h2>
          <ul className="finding-list">
            {visibleStrengths.length > 0 ? (
              visibleStrengths.map((finding) => (
                <li key={finding.id}>
                  <CheckCircle2
                    size={14}
                    color="var(--teal)"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>
                      {localized(
                        locale,
                        finding.titleZh,
                        finding.titleEn
                      )}
                    </strong>{" "}
                    —{" "}
                    {localized(
                      locale,
                      finding.detailZh,
                      finding.detailEn
                    )}
                  </span>
                </li>
              ))
            ) : (
              <li>{isZh ? "暂无可确认优势。" : "No confirmed strengths yet."}</li>
            )}
          </ul>
        </div>
        <div className="finding-column">
          <h2 className="finding-title is-gap">
            <AlertCircle size={17} aria-hidden="true" />
            {isZh ? "关键缺口" : "Critical gaps"}
          </h2>
          <ul className="finding-list">
            {visibleGaps.length > 0 ? (
              visibleGaps.map((finding) => (
                <li key={finding.id}>
                  <AlertCircle
                    size={14}
                    color="var(--red)"
                    aria-hidden="true"
                  />
                  <span>
                    <strong>
                      {localized(
                        locale,
                        finding.titleZh,
                        finding.titleEn
                      )}
                    </strong>{" "}
                    —{" "}
                    {localized(
                      locale,
                      finding.detailZh,
                      finding.detailEn
                    )}
                  </span>
                </li>
              ))
            ) : (
              <li>
                {isZh
                  ? "没有检测到关键缺口。"
                  : "No critical gaps detected."}
              </li>
            )}
          </ul>
        </div>
      </section>

      <section className="priority-section">
        <h2 className="section-title">
          {isZh ? "首要行动" : "Priority actions"}
        </h2>
        <p className="section-copy">
          {isZh
            ? "先解决硬门槛与高影响证据缺口，再扩大投入。"
            : "Resolve hard gates and high-impact evidence gaps before scaling investment."}
        </p>
        <ActionTable locale={locale} actions={report.actions.slice(0, 5)} />
      </section>
    </>
  );

  const renderDimensions = () => (
    <section>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">{isZh ? "评分明细" : "Score detail"}</p>
          <h1 className="page-title">
            {isZh ? "维度与关键指标" : "Dimensions and key metrics"}
          </h1>
          <p className="page-subtitle">
            {isZh
              ? "指标阈值是 RetailLens 的内部筛选护栏，不是课程提供的行业通用标准。"
              : "Metric thresholds are internal RetailLens screening guardrails, not universal course-supplied industry standards."}
          </p>
        </div>
      </div>

      <section className="dimension-section">
        <div className="dimension-list">
          {report.dimensions.map((dimension) => (
            <article className="dimension-detail-card" key={dimension.id}>
              <div>
                <span className="dimension-detail-score">
                  {Math.round(dimension.score)}
                </span>
                <h2>
                  {localized(
                    locale,
                    dimension.labelZh,
                    dimension.labelEn
                  )}
                </h2>
                <p>
                  {dimension.weight}% {isZh ? "权重" : "weight"}
                </p>
              </div>
              <div className="dimension-detail-evidence">
                <strong>{isZh ? "课程依据" : "Course evidence"}</strong>
                <span>
                  {dimension.evidenceHandles?.join(" · ") ||
                    (isZh ? "见来源映射" : "See source map")}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="priority-section">
        <h2 className="section-title">
          {isZh ? "关键经营指标" : "Key operating metrics"}
        </h2>
        <div className="metric-card-grid">
          {report.metrics.map((metric) => (
            <article className="metric-card" key={metric.labelEn}>
              <span>{localized(locale, metric.labelZh, metric.labelEn)}</span>
              <strong>{metric.value}</strong>
              <p>
                {localized(
                  locale,
                  metric.interpretationZh,
                  metric.interpretationEn
                )}
              </p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );

  const renderRoadmap = () => (
    <section>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">
            {isZh ? "程序化改进建议" : "Programmatic recommendations"}
          </p>
          <h1 className="page-title">
            {isZh ? "90 天改进路线图" : "90-day improvement roadmap"}
          </h1>
          <p className="page-subtitle">
            {isZh
              ? "行动按阻断风险、评分影响和证据价值排序；负责人和 KPI 应在执行前确认。"
              : "Actions are ranked by blocking risk, score impact, and evidence value; owners and KPIs should be confirmed before execution."}
          </p>
        </div>
      </div>
      <ActionTable locale={locale} actions={report.actions} />
    </section>
  );

  const renderEvidence = () => (
    <section>
      <div className="page-title-row">
        <div>
          <p className="eyebrow">
            {isZh ? "决策前检查" : "Pre-decision checks"}
          </p>
          <h1 className="page-title">
            {isZh ? "证据与硬门槛" : "Evidence and hard gates"}
          </h1>
          <p className="page-subtitle">
            {isZh
              ? `本次评估记录 ${report.evidenceCount} 项证据引用。失败门槛不能被高分抵消；未知门槛必须先核实。`
              : `${report.evidenceCount} evidence references were recorded. Failed gates cannot be offset by a high score; unknown gates require validation.`}
          </p>
        </div>
      </div>

      <div className="gate-grid">
        {report.gates.map((gate) => (
          <article
            className={`gate-card gate-${gate.status}`}
            key={gate.labelEn}
          >
            <div className="gate-card-heading">
              <ShieldCheck size={17} aria-hidden="true" />
              <strong>{localized(locale, gate.labelZh, gate.labelEn)}</strong>
              <span>{gateLabels[gate.status][locale]}</span>
            </div>
            <p>{localized(locale, gate.reasonZh, gate.reasonEn)}</p>
          </article>
        ))}
      </div>

      <div className="notice">
        <ClipboardList size={18} aria-hidden="true" />
        <span>
          {isZh
            ? "国家法律、税费、许可、市场规模与竞争事实必须使用有日期的权威最新来源。课程案例只提供分析方法，不作为当前事实。"
            : "Country law, tax, licensing, market-size, and competitor claims require current, dated, authoritative sources. Course cases provide method, not current fact."}
        </span>
      </div>
      <button
        className="button methodology-shortcut"
        type="button"
        onClick={onOpenMethodology}
      >
        <BookOpenCheck size={16} aria-hidden="true" />
        {isZh ? "打开完整方法与来源映射" : "Open full method and source map"}
      </button>
    </section>
  );

  const content = {
    executive: (
      <>
        <div className="enterprise-command-bar">
          <div>
            <LockKeyhole size={14} aria-hidden="true" />
            <span>
              {isZh
                ? "已锁定的管理层决策底稿 · AI 不可修改"
                : "Locked management decision workpaper · AI cannot alter"}
            </span>
          </div>
          <div className="button-group">
            <button className="button" type="button" onClick={onEdit}>
              <FilePenLine size={15} aria-hidden="true" />
              {isZh ? "编辑输入" : "Edit inputs"}
            </button>
            <button
              className="button"
              type="button"
              onClick={() => window.print()}
            >
              <Download size={15} aria-hidden="true" />
              {isZh ? "导出 PDF" : "Export PDF"}
            </button>
            <button
              className="button"
              type="button"
              onClick={onOpenMethodology}
            >
              <BookOpenCheck size={15} aria-hidden="true" />
              {isZh ? "方法与审计" : "Method & audit"}
            </button>
          </div>
        </div>
        {executiveContent}
      </>
    ),
    theory: (
      <section>
        <div className="page-title-row">
          <div>
            <p className="eyebrow">
              {isZh
                ? "结构化理论诊断"
                : "Structured theory diagnostics"}
            </p>
            <h1 className="page-title">
              {isZh
                ? "企业理论引擎"
                : "Enterprise theory engine"}
            </h1>
            <p className="page-subtitle">
              {isZh
                ? "八个模块分别保留公式、证据要求、状态与课程来源；自由文本长度和 AI 输出均不能改变结果。"
                : "Eight modules retain their own formulas, evidence requirements, status, and course sources; neither narrative length nor AI output can alter the result."}
            </p>
          </div>
        </div>
        {theoryContent}
      </section>
    ),
    summary: renderSummary(),
    dimensions: renderDimensions(),
    matrices: (
      <section>
        <div className="page-title-row">
          <div>
            <p className="eyebrow">
              {isZh ? "战略匹配与选择" : "Strategic matching and choice"}
            </p>
            <h1 className="page-title">
              {isZh ? "EFE / IFE / IE / QSPM" : "EFE / IFE / IE / QSPM"}
            </h1>
            <p className="page-subtitle">
              {isZh
                ? "这些矩阵保留各自的课程定义，不会被合并成一个不透明总分。"
                : "Each matrix retains its course-defined meaning and is not collapsed into an opaque master score."}
            </p>
          </div>
        </div>
        {matrixContent}
      </section>
    ),
    roadmap: renderRoadmap(),
    evidence: renderEvidence()
  } satisfies Record<ReportSection, ReactNode>;

  return (
    <div className="report-shell">
      <aside className="report-nav">
        <ul className="report-nav-list">
          {reportNav.map(([id, Icon, zh, en]) => (
            <li key={id}>
              <button
                className={
                  section === id
                    ? "report-nav-button is-active"
                    : "report-nav-button"
                }
                type="button"
                onClick={() => setSection(id)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>
                  {localized(locale, zh, en)}
                  <small>{localized(locale, en, zh)}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="report-main">{content[section]}</main>

      <aside className="report-ai-rail">
        <div className="report-ai-inner">
          <section className="ai-panel">
            <header className="ai-panel-header">
              <h2>
                <Sparkles size={16} aria-hidden="true" />{" "}
                {isZh ? "AI 深度解读" : "AI interpretation"}
              </h2>
              <AiStatus locale={locale} ai={ai} loading={aiLoading} />
            </header>
            <div className="ai-panel-body">
              <AiBody locale={locale} ai={ai} loading={aiLoading} />
            </div>
            <div className="ai-panel-actions">
              <button
                className="button primary"
                type="button"
                disabled={aiLoading}
                onClick={onRetryAi}
              >
                {aiLoading ? (
                  <RefreshCw
                    className="spin"
                    size={16}
                    aria-hidden="true"
                  />
                ) : (
                  <Lightbulb size={16} aria-hidden="true" />
                )}
                {ai?.status === "complete"
                  ? isZh
                    ? "重新生成解读"
                    : "Regenerate interpretation"
                  : isZh
                    ? "生成深度解读"
                    : "Generate interpretation"}
              </button>
              <p className="ai-score-note">
                <LockKeyhole size={13} aria-hidden="true" />
                {isZh
                  ? "AI 只解释锁定结果，不参与计算分数。"
                  : "AI interprets the locked result; it does not score."}
              </p>
              <p className="ai-data-note">
                <ShieldCheck size={13} aria-hidden="true" />
                {isZh
                  ? "只有点击此按钮，已提交的商业模型与锁定评分才会发送给 OpenAI。API 用量与 ChatGPT 订阅分开计费。"
                  : "Only this button sends the submitted business model and locked score to OpenAI. API usage is billed separately from ChatGPT."}
              </p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

function ActionTable({
  locale,
  actions
}: {
  locale: Locale;
  actions: ActionView[];
}) {
  const isZh = locale === "zh";

  return (
    <div className="table-scroll action-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{isZh ? "优先级" : "Priority"}</th>
            <th>{isZh ? "行动" : "Action"}</th>
            <th>{isZh ? "负责人" : "Owner"}</th>
            <th>{isZh ? "时间" : "Horizon"}</th>
            <th>KPI</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((action, index) => (
            <tr key={`${action.priority}-${index}`}>
              <td>
                <span
                  className={`priority-code ${action.priority.toLowerCase()}`}
                >
                  {action.priority}
                </span>
              </td>
              <td>
                {localized(locale, action.actionZh, action.actionEn)}
              </td>
              <td>
                {localized(locale, action.ownerZh, action.ownerEn)}
              </td>
              <td>
                {localized(locale, action.horizonZh, action.horizonEn)}
              </td>
              <td>{localized(locale, action.kpiZh, action.kpiEn)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AiStatus({
  locale,
  ai,
  loading
}: {
  locale: Locale;
  ai: AiAnalysis | null;
  loading: boolean;
}) {
  const isZh = locale === "zh";
  const className =
    loading || !ai
      ? "ai-status"
      : ai.status === "complete"
        ? "ai-status is-ready"
        : ai.status === "error"
          ? "ai-status is-error"
          : "ai-status";
  const label = loading
    ? isZh
      ? "正在生成…"
      : "Generating…"
    : ai?.status === "complete"
      ? isZh
        ? `已由 ${ai.model} 生成`
        : `Generated by ${ai.model}`
      : ai?.status === "error"
        ? isZh
          ? "生成失败，可重试"
          : "Generation failed; retry available"
        : isZh
          ? "规则报告可用；AI 尚未连接"
          : "Rule report ready; AI not connected";

  return (
    <div className={className}>
      <span className="ai-status-dot" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

function AiBody({
  locale,
  ai,
  loading
}: {
  locale: Locale;
  ai: AiAnalysis | null;
  loading: boolean;
}) {
  const isZh = locale === "zh";

  if (loading) {
    return (
      <p>
        {isZh
          ? "正在基于锁定分数与已提交证据生成解释。"
          : "Interpreting the locked score and submitted evidence."}
      </p>
    );
  }

  if (ai?.status === "complete") {
    const insight = ai.interpretation;
    return (
      <>
        <div className="ai-insight">
          <h3>{isZh ? "执行摘要" : "Executive summary"}</h3>
          <p>{insight.executiveSummary}</p>
        </div>
        <div className="ai-insight">
          <h3>{isZh ? "首要建议" : "Top recommendation"}</h3>
          <p>
            {insight.prioritizedActions[0]?.action ||
              (isZh ? "暂无建议。" : "No recommendation returned.")}
          </p>
        </div>
        <div className="ai-insight">
          <h3>{isZh ? "需要验证的假设" : "Assumption to validate"}</h3>
          <p>
            {insight.assumptions[0]?.assumption ||
              (isZh ? "暂无假设。" : "No assumption returned.")}
          </p>
        </div>
      </>
    );
  }

  if (ai?.status === "error") {
    return (
      <p>
        {isZh
          ? "AI 服务没有返回合格的结构化结果。固定评分和报告仍然有效。"
          : "The AI service did not return a valid structured result. The deterministic score and report remain valid."}
      </p>
    );
  }

  return (
    <p>
      {isZh
        ? "未配置密钥时，全部规则评分、指标、优缺点与行动建议仍可生成。点击页面上方的 API 设置，使用者可为当前页面配置自己的 OpenAI API 密钥。"
        : "Without a configured key, all rule scoring, metrics, strengths, gaps, and actions still work. Use API settings above to configure the user's own OpenAI API key for this page."}
    </p>
  );
}

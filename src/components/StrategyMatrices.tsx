import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp } from "lucide-react";
import type { Locale } from "../i18n";

export type StrategyMatrixLabel =
  | string
  | {
      zh: string;
      en: string;
    };

export interface WeightedStrategyFactor {
  id?: string;
  label: StrategyMatrixLabel;
  /** Decimal weight from 0 to 1. EFE and IFE weights should each total 1. */
  weight: number;
  /** EFE / IFE rating from 1 to 4. */
  rating: number;
  note?: StrategyMatrixLabel;
}

export interface WeightedFactorMatrix {
  factors?: WeightedStrategyFactor[];
  /**
   * Optional audited total from an upstream rules engine. When omitted, the
   * component calculates Σ(weight × rating) after the factor weights total 1.
   */
  score?: number;
}

export interface QspmFactor {
  id?: string;
  label: StrategyMatrixLabel;
  source?: "EFE" | "IFE";
  /** Reuse the corresponding EFE / IFE factor weight. */
  weight: number;
  /**
   * One AS value per strategy. Use null when a factor has no bearing on the
   * alternatives; otherwise values must be integers from 1 to 4.
   */
  attractivenessScores: Array<number | null | undefined>;
}

export interface QspmFramework {
  strategies: StrategyMatrixLabel[];
  factors?: QspmFactor[];
}

export interface StrategyFrameworkData {
  efe?: WeightedFactorMatrix;
  ife?: WeightedFactorMatrix;
  qspm?: QspmFramework;
}

export interface StrategyMatricesProps {
  locale: Locale;
  data?: StrategyFrameworkData;
  className?: string;
}

type MatrixTab = "efe" | "ife" | "qspm";
type IePosture = "grow" | "hold" | "harvest";

interface IeCell {
  roman: string;
  posture: IePosture;
}

const IE_CELLS: IeCell[][] = [
  [
    { roman: "III", posture: "hold" },
    { roman: "II", posture: "grow" },
    { roman: "I", posture: "grow" }
  ],
  [
    { roman: "VI", posture: "harvest" },
    { roman: "V", posture: "hold" },
    { roman: "IV", posture: "grow" }
  ],
  [
    { roman: "IX", posture: "harvest" },
    { roman: "VIII", posture: "harvest" },
    { roman: "VII", posture: "hold" }
  ]
];

const POSTURE_COPY = {
  grow: {
    zh: "增长与建设",
    en: "Grow & Build"
  },
  hold: {
    zh: "保持与维持",
    en: "Hold & Maintain"
  },
  harvest: {
    zh: "收获或退出",
    en: "Harvest / Divest"
  }
} satisfies Record<IePosture, { zh: string; en: string }>;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isValidWeight = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 0 && value <= 1;

const isValidRating = (value: unknown): value is number =>
  isFiniteNumber(value) && value >= 1 && value <= 4;

const isValidAs = (value: unknown): value is number =>
  isFiniteNumber(value) &&
  Number.isInteger(value) &&
  value >= 1 &&
  value <= 4;

const labelFor = (label: StrategyMatrixLabel, locale: Locale) =>
  typeof label === "string" ? label : label[locale];

const formatScore = (value: number | undefined) =>
  value === undefined ? "—" : value.toFixed(2);

const formatWeight = (value: number) =>
  isValidWeight(value) ? `${(value * 100).toFixed(1).replace(/\.0$/, "")}%` : "—";

function analyseFactorMatrix(matrix: WeightedFactorMatrix | undefined) {
  const factors = matrix?.factors ?? [];
  const validRows = factors.filter(
    (factor) => isValidWeight(factor.weight) && isValidRating(factor.rating)
  );
  const allRowsValid = factors.length > 0 && validRows.length === factors.length;
  const weightTotal = validRows.reduce((sum, factor) => sum + factor.weight, 0);
  const weightedTotal = validRows.reduce(
    (sum, factor) => sum + factor.weight * factor.rating,
    0
  );
  const weightsComplete = Math.abs(weightTotal - 1) <= 0.005;
  const providedScore = isValidRating(matrix?.score) ? matrix.score : undefined;
  const score =
    providedScore ??
    (allRowsValid && weightsComplete ? weightedTotal : undefined);

  return {
    factors,
    score,
    weightedTotal,
    weightTotal,
    allRowsValid,
    weightsComplete,
    hasInvalidRows: validRows.length !== factors.length
  };
}

function bandIndex(score: number) {
  if (score >= 3) return 2;
  if (score >= 2) return 1;
  return 0;
}

function getIePlacement(ife: number | undefined, efe: number | undefined) {
  if (ife === undefined || efe === undefined) return undefined;

  const column = bandIndex(ife);
  const row = 2 - bandIndex(efe);
  const cell = IE_CELLS[row]?.[column];

  if (!cell) return undefined;

  return {
    ...cell,
    column,
    row,
    left: `${((ife - 1) / 3) * 100}%`,
    top: `${((4 - efe) / 3) * 100}%`
  };
}

function MatrixNotice({
  children,
  tone = "warning"
}: {
  children: React.ReactNode;
  tone?: "warning" | "success";
}) {
  return (
    <div className={tone === "success" ? "notice success" : "notice"}>
      {tone === "success" ? (
        <CheckCircle2 size={17} aria-hidden="true" />
      ) : (
        <AlertTriangle size={17} aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}

function FactorTable({
  locale,
  kind,
  matrix
}: {
  locale: Locale;
  kind: "EFE" | "IFE";
  matrix: ReturnType<typeof analyseFactorMatrix>;
}) {
  const isZh = locale === "zh";

  if (matrix.factors.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <MatrixNotice>
          {isZh
            ? `尚无 ${kind} 因素。请提供权重及 1–4 评分；系统不会自动补造市场或企业事实。`
            : `No ${kind} factors were supplied. Add weights and 1–4 ratings; the system will not invent market or company facts.`}
        </MatrixNotice>
      </div>
    );
  }

  return (
    <>
      <div className="table-scroll" style={{ borderWidth: 0, borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>{isZh ? "关键因素" : "Key factor"}</th>
              <th>{isZh ? "权重" : "Weight"}</th>
              <th>{isZh ? "评分" : "Rating"}</th>
              <th>
                {isZh ? "加权分" : "Weighted score"}
                <small className="table-secondary">Weight × rating</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.factors.map((factor, index) => {
              const valid =
                isValidWeight(factor.weight) && isValidRating(factor.rating);
              return (
                <tr key={factor.id ?? `${kind}-${index}`}>
                  <td>
                    <strong>{labelFor(factor.label, locale)}</strong>
                    {factor.note && (
                      <small className="table-secondary">
                        {labelFor(factor.note, locale)}
                      </small>
                    )}
                  </td>
                  <td>{formatWeight(factor.weight)}</td>
                  <td>{isValidRating(factor.rating) ? factor.rating.toFixed(1) : "—"}</td>
                  <td>{valid ? (factor.weight * factor.rating).toFixed(2) : "—"}</td>
                </tr>
              );
            })}
            <tr>
              <td>
                <strong>{isZh ? "合计" : "Total"}</strong>
              </td>
              <td>
                <strong>{(matrix.weightTotal * 100).toFixed(1)}%</strong>
              </td>
              <td>—</td>
              <td>
                <strong>{matrix.weightedTotal.toFixed(2)}</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ display: "grid", gap: 8, padding: 14 }}>
        {matrix.hasInvalidRows && (
          <MatrixNotice>
            {isZh
              ? "有一项或多项权重/评分超出有效范围。权重必须为 0–1，评分必须为 1–4。"
              : "One or more weights or ratings are outside the valid range. Weights must be 0–1 and ratings must be 1–4."}
          </MatrixNotice>
        )}
        {!matrix.weightsComplete && (
          <MatrixNotice>
            {isZh
              ? "因素权重尚未合计为 1.00；在补齐前，系统不会用该合计确定 IE 单元格。"
              : "Factor weights do not yet total 1.00; the total will not locate the IE cell until the matrix is complete."}
          </MatrixNotice>
        )}
        {matrix.allRowsValid && matrix.weightsComplete && (
          <MatrixNotice tone="success">
            {kind === "EFE"
              ? isZh
                ? "EFE 评分代表当前策略对机会与威胁的响应效果，而不是因素本身“好或坏”。"
                : "EFE ratings measure how effectively the current strategy responds to opportunities and threats—not whether a factor is inherently good or bad."
              : isZh
                ? "IFE 评分使用 1–2 表示内部劣势，3–4 表示内部优势。"
                : "IFE ratings use 1–2 for internal weaknesses and 3–4 for internal strengths."}
          </MatrixNotice>
        )}
      </div>
    </>
  );
}

function QspmTable({
  locale,
  qspm
}: {
  locale: Locale;
  qspm: QspmFramework | undefined;
}) {
  const isZh = locale === "zh";
  const strategies = qspm?.strategies ?? [];
  const factors = qspm?.factors ?? [];

  const totals = strategies.map((_, strategyIndex) => {
    let usedScores = 0;
    const total = factors.reduce((sum, factor) => {
      const score = factor.attractivenessScores[strategyIndex];
      if (!isValidWeight(factor.weight) || !isValidAs(score)) return sum;
      usedScores += 1;
      return sum + factor.weight * score;
    }, 0);
    return usedScores > 0 ? total : undefined;
  });

  const rankedTotals = totals
    .map((total, index) => ({ total, index }))
    .filter(
      (item): item is { total: number; index: number } =>
        item.total !== undefined
    )
    .sort((a, b) => b.total - a.total);
  const leadingIndex = rankedTotals[0]?.index;

  const hasInvalidValues = factors.some(
    (factor) =>
      !isValidWeight(factor.weight) ||
      factor.attractivenessScores.some(
        (score) => score !== null && score !== undefined && !isValidAs(score)
      )
  );

  if (strategies.length === 0 || factors.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <MatrixNotice>
          {isZh
            ? "尚无 QSPM 比较。请先定义两个或以上可执行策略，并复用 EFE/IFE 因素权重；没有证据时系统不会生成虚假排序。"
            : "No QSPM comparison was supplied. Define two or more executable strategies and reuse EFE/IFE factor weights; the system will not create a false ranking without evidence."}
        </MatrixNotice>
      </div>
    );
  }

  return (
    <>
      <div className="table-scroll" style={{ borderWidth: 0, borderRadius: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan={2}>{isZh ? "关键因素" : "Key factor"}</th>
              <th rowSpan={2}>{isZh ? "来源" : "Source"}</th>
              <th rowSpan={2}>{isZh ? "权重" : "Weight"}</th>
              {strategies.map((strategy, index) => (
                <th colSpan={2} key={`strategy-${index}`}>
                  {labelFor(strategy, locale)}
                </th>
              ))}
            </tr>
            <tr>
              {strategies.flatMap((_, index) => [
                <th key={`as-${index}`}>AS</th>,
                <th key={`tas-${index}`}>TAS</th>
              ])}
            </tr>
          </thead>
          <tbody>
            {factors.map((factor, factorIndex) => (
              <tr key={factor.id ?? `qspm-${factorIndex}`}>
                <td>{labelFor(factor.label, locale)}</td>
                <td>{factor.source ?? "—"}</td>
                <td>{formatWeight(factor.weight)}</td>
                {strategies.flatMap((_, strategyIndex) => {
                  const score = factor.attractivenessScores[strategyIndex];
                  const tas =
                    isValidWeight(factor.weight) && isValidAs(score)
                      ? factor.weight * score
                      : undefined;
                  return [
                    <td key={`as-${factorIndex}-${strategyIndex}`}>
                      {isValidAs(score) ? score : "—"}
                    </td>,
                    <td key={`tas-${factorIndex}-${strategyIndex}`}>
                      {tas === undefined ? "—" : tas.toFixed(2)}
                    </td>
                  ];
                })}
              </tr>
            ))}
            <tr>
              <td colSpan={3}>
                <strong>
                  {isZh ? "吸引力总分（STAS）" : "Sum Total Attractiveness Score (STAS)"}
                </strong>
              </td>
              {strategies.flatMap((_, strategyIndex) => [
                <td key={`total-as-${strategyIndex}`}>—</td>,
                <td key={`total-tas-${strategyIndex}`}>
                  <strong>{formatScore(totals[strategyIndex])}</strong>
                  {leadingIndex === strategyIndex && totals[strategyIndex] !== undefined && (
                    <small className="table-secondary">
                      {isZh ? "相对最高" : "Highest relative"}
                    </small>
                  )}
                </td>
              ])}
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: "grid", gap: 8, padding: 14 }}>
        {hasInvalidValues && (
          <MatrixNotice>
            {isZh
              ? "QSPM 含无效值：权重必须为 0–1；有影响的因素，其 AS 必须是 1–4 的整数。"
              : "The QSPM contains invalid values: weights must be 0–1 and AS must be an integer from 1 to 4 whenever a factor affects the choice."}
          </MatrixNotice>
        )}
        <MatrixNotice tone="success">
          {isZh
            ? "AS 是策略之间的相对吸引力（1=不吸引，4=高度吸引）；TAS = 权重 × AS。STAS 只用于本次备选策略的相对排序。"
            : "AS is relative attractiveness across the alternatives (1 = not attractive, 4 = highly attractive); TAS = weight × AS. STAS ranks only the strategies compared here."}
        </MatrixNotice>
      </div>
    </>
  );
}

export function StrategyMatrices({
  locale,
  data,
  className
}: StrategyMatricesProps) {
  const [activeTab, setActiveTab] = useState<MatrixTab>("efe");
  const isZh = locale === "zh";

  const efe = useMemo(() => analyseFactorMatrix(data?.efe), [data?.efe]);
  const ife = useMemo(() => analyseFactorMatrix(data?.ife), [data?.ife]);
  const placement = getIePlacement(ife.score, efe.score);

  const tabCopy: Array<{ id: MatrixTab; zh: string; en: string }> = [
    { id: "efe", zh: "EFE 外部因素", en: "EFE External" },
    { id: "ife", zh: "IFE 内部因素", en: "IFE Internal" },
    { id: "qspm", zh: "QSPM 策略比较", en: "QSPM Comparison" }
  ];

  const activeTitle =
    activeTab === "efe"
      ? isZh
        ? "外部因素评价矩阵"
        : "External Factor Evaluation"
      : activeTab === "ife"
        ? isZh
          ? "内部因素评价矩阵"
          : "Internal Factor Evaluation"
        : isZh
          ? "定量战略规划矩阵"
          : "Quantitative Strategic Planning Matrix";

  return (
    <section
      className={className}
      aria-labelledby="strategy-matrices-title"
      data-testid="strategy-matrices"
    >
      <div className="page-title-row">
        <div>
          <p className="eyebrow">
            {isZh ? "战略组合与选择" : "Strategic synthesis & choice"}
          </p>
          <h1 className="page-title" id="strategy-matrices-title">
            {isZh ? "EFE、IFE、IE 与 QSPM" : "EFE, IFE, IE & QSPM"}
          </h1>
          <p className="page-subtitle">
            {isZh
              ? "先审计外部与内部因素，再以 IE 矩阵确定总体姿态，最后用 QSPM 比较可执行策略。所有分数只来自传入证据。"
              : "Audit external and internal factors, locate the portfolio posture in the IE matrix, then compare executable options with QSPM. Every score comes only from supplied evidence."}
          </p>
        </div>
      </div>

      <div className="matrix-summary" aria-label={isZh ? "战略矩阵摘要" : "Strategy matrix summary"}>
        <div className="matrix-summary-item">
          <span>EFE · {isZh ? "外部响应" : "External response"}</span>
          <strong>{formatScore(efe.score)}</strong>
        </div>
        <div className="matrix-summary-item">
          <span>IFE · {isZh ? "内部实力" : "Internal strength"}</span>
          <strong>{formatScore(ife.score)}</strong>
        </div>
        <div className="matrix-summary-item">
          <span>{isZh ? "IE 单元格" : "IE cell"}</span>
          <strong>{placement?.roman ?? "—"}</strong>
        </div>
        <div className="matrix-summary-item">
          <span>{isZh ? "总体战略姿态" : "Portfolio posture"}</span>
          <strong style={{ fontSize: 15, lineHeight: 1.3 }}>
            {placement ? POSTURE_COPY[placement.posture][locale] : isZh ? "等待完整证据" : "Awaiting complete evidence"}
          </strong>
        </div>
      </div>

      <div className="matrix-tabs" role="tablist" aria-label={isZh ? "矩阵详情" : "Matrix details"}>
        {tabCopy.map((tab) => (
          <button
            aria-controls="strategy-matrix-detail"
            aria-selected={activeTab === tab.id}
            className={`matrix-tab${activeTab === tab.id ? " is-active" : ""}`}
            id={`matrix-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {isZh ? tab.zh : tab.en}
          </button>
        ))}
      </div>

      <div className="matrix-layout">
        <article className="matrix-panel">
          <div className="matrix-panel-header">
            <h2>{isZh ? "IE 矩阵定位" : "IE matrix position"}</h2>
            <span className="table-secondary">
              {placement
                ? `${isZh ? "单元格" : "Cell"} ${placement.roman}`
                : isZh
                  ? "等待 EFE 与 IFE 完整总分"
                  : "Awaiting complete EFE and IFE totals"}
            </span>
          </div>
          <div className="ie-grid-wrap">
            <div className="ie-chart">
              <div
                className="axis-label"
                style={{ gridColumn: 2, gridRow: 1, alignSelf: "center" }}
              >
                {isZh
                  ? "IFE 横轴：弱 1.00–1.99 → 平均 2.00–2.99 → 强 3.00–4.00"
                  : "IFE x-axis: Weak 1.00–1.99 → Average 2.00–2.99 → Strong 3.00–4.00"}
              </div>
              <div className="axis-label ie-y-label">
                {isZh
                  ? "EFE 纵轴：高 3.00–4.00 → 中 2.00–2.99 → 低 1.00–1.99"
                  : "EFE y-axis: High 3.00–4.00 → Medium 2.00–2.99 → Low 1.00–1.99"}
              </div>
              <div className="ie-grid">
                {IE_CELLS.flat().map((cell) => (
                  <div
                    aria-label={`Cell ${cell.roman}: ${POSTURE_COPY[cell.posture][locale]}`}
                    className={`ie-cell ${cell.posture}`}
                    key={cell.roman}
                  >
                    <span>
                      {cell.roman}
                      <small
                        style={{
                          display: "block",
                          marginTop: 5,
                          fontFamily: "inherit",
                          fontSize: 9,
                          fontWeight: 600
                        }}
                      >
                        {POSTURE_COPY[cell.posture][locale]}
                      </small>
                    </span>
                  </div>
                ))}
                {placement && (
                  <span
                    aria-label={
                      isZh
                        ? `当前位置：IFE ${formatScore(ife.score)}，EFE ${formatScore(efe.score)}`
                        : `Current position: IFE ${formatScore(ife.score)}, EFE ${formatScore(efe.score)}`
                    }
                    className="ie-point"
                    data-testid="ie-point"
                    style={{ left: placement.left, top: placement.top }}
                    title={`IFE ${formatScore(ife.score)} · EFE ${formatScore(efe.score)}`}
                  />
                )}
              </div>
            </div>

            <div
              aria-label={isZh ? "IE 矩阵图例" : "IE matrix legend"}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 14,
                marginTop: 14,
                color: "var(--muted)",
                fontSize: 10
              }}
            >
              {(["grow", "hold", "harvest"] as const).map((posture) => (
                <span key={posture}>
                  <i
                    aria-hidden="true"
                    className={`ie-cell ${posture}`}
                    style={{
                      display: "inline-block",
                      width: 10,
                      minHeight: 10,
                      marginRight: 5,
                      border: "1px solid var(--line)",
                      verticalAlign: "-1px"
                    }}
                  />
                  {POSTURE_COPY[posture][locale]}
                </span>
              ))}
            </div>
          </div>
        </article>

        <article
          aria-labelledby={`matrix-tab-${activeTab}`}
          className="matrix-panel"
          id="strategy-matrix-detail"
          role="tabpanel"
        >
          <div className="matrix-panel-header">
            <h2>{activeTitle}</h2>
            <CircleHelp
              aria-label={
                isZh
                  ? "矩阵仅使用用户提交或规则引擎验证的数据"
                  : "The matrix uses only user-supplied or rules-engine-validated data"
              }
              color="var(--muted)"
              size={17}
            />
          </div>
          {activeTab === "efe" && (
            <FactorTable kind="EFE" locale={locale} matrix={efe} />
          )}
          {activeTab === "ife" && (
            <FactorTable kind="IFE" locale={locale} matrix={ife} />
          )}
          {activeTab === "qspm" && (
            <QspmTable locale={locale} qspm={data?.qspm} />
          )}
        </article>
      </div>

      <p className="section-copy" style={{ marginTop: 14 }}>
        {isZh
          ? "边界规则：1.00–1.99 = 弱/低，2.00–2.99 = 平均/中，3.00–4.00 = 强/高。IE 只提供总体战略姿态，不能替代合规硬门槛、现金流审查或管理判断。"
          : "Boundary rule: 1.00–1.99 = weak/low, 2.00–2.99 = average/medium, 3.00–4.00 = strong/high. IE provides a portfolio posture; it does not replace hard-gate compliance, cash-flow review, or management judgment."}
      </p>
    </section>
  );
}

export default StrategyMatrices;

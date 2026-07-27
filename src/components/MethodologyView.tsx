import { AlertTriangle, CheckCircle2, LockKeyhole, Scale } from "lucide-react";
import type { Locale } from "../i18n";

interface MethodologyViewProps {
  locale: Locale;
}

const dimensions = [
  ["市场与顾客", "Market & customer", 14],
  ["战略与差异化", "Strategy & differentiation", 12],
  ["国家与合规", "Country & compliance", 8],
  ["渠道与数字化", "Channels & digital", 9],
  ["地点与商圈", "Location & trade area", 9],
  ["商品与供应链", "Merchandise & supply chain", 12],
  ["财务与单位经济", "Financial & unit economics", 16],
  ["营销、CRM 与服务", "Marketing, CRM & service", 9],
  ["组织与执行", "Organization & execution", 6],
  ["风险与可持续性", "Risk & sustainability", 5]
] as const;

const formulas = [
  ["毛利率", "Gross margin %", "(Sales − COGS) ÷ Sales"],
  ["净利率", "Net margin", "Net profit ÷ Sales"],
  ["资产周转率", "Asset turnover", "Sales ÷ Assets"],
  ["资产回报率", "ROA", "Net margin × Asset turnover"],
  ["库存周转率", "Inventory turnover", "Sales ÷ Average retail inventory"],
  ["GMROI", "GMROI", "Gross margin ÷ Average inventory"],
  ["盈亏平衡量", "Break-even units", "Fixed costs ÷ (Price − Variable cost)"],
  ["服务水平", "Service level", "Items sold ÷ Items demanded"],
  ["CLV:CAC", "CLV:CAC", "Customer lifetime value ÷ Acquisition cost"],
  ["租售比", "Rent-to-sales", "Occupancy cost ÷ Sales"]
] as const;

const intakeSteps = [
  ["业务与评估任务", "Business & decision brief", "6"],
  ["国家、城市与经营形态", "Market, city & operating model", "10"],
  ["目标客户与需求证据", "Target customer & demand evidence", "8"],
  ["价值、商品与竞争", "Value, merchandise & competition", "11"],
  ["合规门槛与渠道", "Compliance gates & channels", "16"],
  ["门店与供应链", "Site & supply chain", "20"],
  ["财务与单位经济", "Financials & unit economics", "18"],
  ["增长、团队、风险与证据", "Growth, team, risks & evidence", "19"],
  ["企业工作台", "Enterprise workbench", "91"]
] as const;

const enterpriseEngines = [
  [
    "五力",
    "Five Forces",
    "5 × 1–5",
    "100 × (5 − mean force intensity) ÷ 4"
  ],
  [
    "竞争态势矩阵",
    "Competitive Profile Matrix (CPM)",
    "≥3 factors; Σ weight = 1; rating 1–4",
    "Σ(factor weight × relative rating)"
  ],
  [
    "STP 与定位",
    "STP & positioning",
    "1–5 fixed scales",
    "100 × (equal-weighted rating − 1) ÷ 4"
  ],
  [
    "进入模式 MCDA",
    "Entry-mode MCDA",
    "2 modes × 9 criteria",
    "Σ(weight % × fit rating ÷ 5)"
  ],
  [
    "战略利润模型与 GMROI",
    "Strategic Profit Model & GMROI",
    "Revenue, profit, assets, inventory",
    "ROA = net margin × asset turnover; GMROI = annual gross margin ÷ average inventory"
  ],
  [
    "服务差距",
    "Service GAPS",
    "RATER E/P 1–7; organization gaps 1–5",
    "Customer gap = perception (P) − expectation (E)"
  ],
  [
    "组织与控制",
    "Organization & control",
    "Coverage, cadence, tolerance",
    "Mean(policy, process, KPI coverage)"
  ],
  [
    "首要风险与监控",
    "Top risk & monitoring",
    "Likelihood, impact, controls, KRI, trigger",
    "Residual risk = likelihood × impact × (1 − control effectiveness %)"
  ]
] as const;

export function MethodologyView({ locale }: MethodologyViewProps) {
  const isZh = locale === "zh";

  return (
    <main className="methodology-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">
            {isZh ? "可审计的分析方法" : "Auditable analytical method"}
          </p>
          <h1 className="page-title">
            {isZh ? "RetailLens 评分方法" : "RetailLens methodology"}
          </h1>
          <p className="page-subtitle">
            {isZh
              ? "把课程理论转化为固定规则、证据要求和可追踪建议。第 9 步企业工作台包含 91 个结构化输入；相同输入始终得到相同规则分数与八模块理论评估，AI 只能解释，不能改写结果。"
              : "Course theory is converted into fixed rules, evidence requirements, and traceable recommendations. The ninth-step Enterprise workbench contains 91 structured inputs; identical inputs always produce the same score and eight-module theory assessment, which AI may interpret but never alter."}
          </p>
        </div>
        <div className="method-badge">
          <LockKeyhole size={18} aria-hidden="true" />
          <span>
            {isZh
              ? "评分与八模块理论评估已锁定"
              : "Score + eight-module assessment locked"}
          </span>
        </div>
      </div>

      <div className="method-grid">
        <div>
          <section className="method-section">
            <h2>{isZh ? "分析架构" : "Assessment architecture"}</h2>
            <p>
              {isZh
                ? "系统把课程理论组织成一条可审计的管理决策链：先明确决策问题并检查不可抵消的硬门槛，再形成证据登记、MECE 假设树、三情景、KPI 因果树与负责人明确的工作流，最后才给出管理层建议。"
                : "Course theory is organized into an auditable management decision chain: define the decision, test non-compensatory gates, build the evidence register and MECE hypothesis tree, stress-test scenarios, connect causal KPIs and owned workstreams, and only then issue a management call."}
            </p>
            <div className="architecture-flow" aria-label="Assessment sequence">
              {[
                isZh ? "1. 决策问题" : "1. Decision question",
                isZh ? "2. 硬门槛" : "2. Hard gates",
                isZh ? "3. 证据质量" : "3. Evidence quality",
                isZh ? "4. MECE 假设树" : "4. MECE issue tree",
                isZh ? "5. 三情景" : "5. Three scenarios",
                isZh ? "6. KPI 因果树" : "6. KPI causal tree",
                isZh ? "7. 90 天工作流" : "7. 90-day workstreams",
                isZh ? "8. 管理层关口" : "8. Management gate"
              ].map((item, index) => (
                <div className="architecture-step" key={item}>
                  <span>{item}</span>
                  {index < 7 && <b aria-hidden="true">→</b>}
                </div>
              ))}
            </div>
          </section>

          <section className="method-section">
            <h2>
              {isZh
                ? "9 步填写与 91 项企业结构化输入"
                : "Nine-step intake and 91 enterprise inputs"}
            </h2>
            <p>
              {isZh
                ? "前 8 步建立业务、市场、顾客、产品、合规、运营、财务和执行底稿；第 9 步用 91 个必填结构化字段运行企业理论引擎。自由文本只证明信息是否覆盖，增加篇幅不会增加经营得分。系统仅接受中文或英文界面与主要叙述。"
                : "The first eight steps establish the business, market, customer, offer, compliance, operating, financial, and execution workpapers. Step nine supplies 91 required structured fields to the enterprise theory engines. Narrative establishes coverage only; adding words never increases business performance. The interface and primary narrative support Chinese or English only."}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? "步骤" : "Step"}</th>
                    <th>{isZh ? "资料模块" : "Input block"}</th>
                    <th>{isZh ? "结构化字段" : "Structured fields"}</th>
                  </tr>
                </thead>
                <tbody>
                  {intakeSteps.map(([zh, en, count], index) => (
                    <tr key={en}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{isZh ? zh : en}</strong>
                        <small className="table-secondary">
                          {isZh ? en : zh}
                        </small>
                      </td>
                      <td>
                        <strong>{count}</strong>
                        {index === 8 && (
                          <small className="table-secondary">
                            {isZh
                              ? "企业工作台固定输入"
                              : "fixed Enterprise workbench inputs"}
                          </small>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="method-section">
            <h2>
              {isZh
                ? "八个确定性企业理论引擎"
                : "Eight deterministic enterprise theory engines"}
            </h2>
            <p>
              {isZh
                ? "每个模块都保留原始输入、固定量表、公式、状态、所需证据与课程来源句柄。下列换算、MCDA 权重和 5 分近似平局规则属于 RetailLens 1.0 内部、可版本化控制，不是教材、行业或任何咨询公司的通用通过线。"
                : "Every module retains raw inputs, fixed scales, formulas, status, evidence requirements, and course source handles. The conversions, MCDA weights, and five-point near-tie rule below are versioned RetailLens 1.0 internal controls—not universal course, industry, or consulting-firm pass lines."}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? "引擎" : "Engine"}</th>
                    <th>{isZh ? "结构化输入" : "Structured input"}</th>
                    <th>{isZh ? "锁定计算" : "Locked calculation"}</th>
                  </tr>
                </thead>
                <tbody>
                  {enterpriseEngines.map(([zh, en, input, formula]) => (
                    <tr key={en}>
                      <td>
                        <strong>{isZh ? zh : en}</strong>
                        <small className="table-secondary">
                          {isZh ? en : zh}
                        </small>
                      </td>
                      <td>{input}</td>
                      <td>
                        <code>{formula}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="notice">
              <Scale size={18} aria-hidden="true" />
              <span>
                {isZh
                  ? "CPM 只做相对竞争比较；进入模式在硬门槛失败时阻断，前两名差距小于 5 分时不宣布优胜者；SPM、GMROI、组织覆盖率与风险分数没有跨业态通用合格线。"
                  : "CPM is relative only; entry-mode selection is blocked by a failed hard gate and remains inconclusive when the top-two gap is below five points. SPM, GMROI, organization coverage, and risk scores have no universal cross-format pass line."}
              </span>
            </div>
          </section>

          <section className="method-section">
            <h2>
              {isZh
                ? "管理层建议、就绪度与证据质量"
                : "Management call, readiness, and evidence quality"}
            </h2>
            <p>
              {isZh
                ? "管理层建议不是 AI 判断，也不是简单按总分分档。它先执行不可抵消条件，再依次检查就绪度、置信度、现金和下行情景。决策就绪度与证据质量分开显示，避免把资料齐全误当成商业模式优秀。"
                : "The management call is neither an AI judgement nor a simple score band. Non-compensatory conditions run first, followed by readiness, confidence, cash, and downside tests. Decision readiness and evidence quality remain separate so well-documented inputs are not mistaken for a strong business."}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? "输出" : "Output"}</th>
                    <th>{isZh ? "程序化规则" : "Deterministic rule"}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{isZh ? "决策就绪度" : "Decision readiness"}</td>
                    <td>
                      <code>
                        35% performance + 25% confidence + 20% completeness +
                        20% hard-gate readiness
                      </code>
                    </td>
                  </tr>
                  <tr>
                    <td>{isZh ? "证据质量" : "Evidence quality"}</td>
                    <td>
                      <code>
                        35% declared confidence + 30% source traceability +
                        15% evidence date + 20% compliance traceability
                      </code>
                    </td>
                  </tr>
                  <tr>
                    <td>STOP / {isZh ? "停止" : "Stop"}</td>
                    <td>
                      {isZh
                        ? "硬门槛失败、总分低于 40，或贡献毛利不为正"
                        : "Failed gate, score below 40, or non-positive contribution margin"}
                    </td>
                  </tr>
                  <tr>
                    <td>PAUSE / {isZh ? "暂停" : "Pause"}</td>
                    <td>
                      {isZh
                        ? "关键门槛未知、就绪度或总分低于 55，或现金跑道进入风险"
                        : "Incomplete critical gates, readiness or score below 55, or cash-runway risk"}
                    </td>
                  </tr>
                  <tr>
                    <td>CONDITIONAL / {isZh ? "有条件" : "Conditional"}</td>
                    <td>
                      {isZh
                        ? "门槛需复核、就绪度或总分低于 75、置信度低于 70，或下行未覆盖盈亏平衡"
                        : "Gate review, readiness or score below 75, confidence below 70, or downside below break-even"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="method-section">
            <h2>{isZh ? "10 个评分维度" : "10 scoring dimensions"}</h2>
            <p>
              {isZh
                ? "实体/全渠道模型使用以下权重，总和为 100。纯线上模型会将地点与商圈标记为不适用，并按预先固定的规则把 9 分重新分配到相关维度。"
                : "Physical and omnichannel models use the weights below, totaling 100. For digital-only models, Location & trade area is marked not applicable and its nine points are redistributed by a fixed rule."}
            </p>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? "维度" : "Dimension"}</th>
                    <th>{isZh ? "权重" : "Weight"}</th>
                    <th>{isZh ? "主要证据" : "Core evidence"}</th>
                  </tr>
                </thead>
                <tbody>
                  {dimensions.map(([zh, en, weight], index) => (
                    <tr key={en}>
                      <td>
                        <strong>{isZh ? zh : en}</strong>
                        <small className="table-secondary">
                          {isZh ? en : zh}
                        </small>
                      </td>
                      <td>{weight}%</td>
                      <td>
                        {isZh
                          ? [
                              "细分、需求、竞争",
                              "定位、优势、选择",
                              "许可、法律、限制",
                              "7C、全渠道整合",
                              "商圈、流量、成本",
                              "组合、供应商、库存",
                              "利润、现金、敏感性",
                              "获取、留存、服务差距",
                              "人员、系统、里程碑",
                              "情景、集中度、ESG"
                            ][index]
                          : [
                              "segments, demand, competition",
                              "positioning, advantage, choices",
                              "licences, laws, constraints",
                              "7C and channel integration",
                              "trade area, traffic, occupancy",
                              "assortment, vendors, inventory",
                              "profit, cash, sensitivity",
                              "acquisition, retention, service gaps",
                              "people, systems, milestones",
                              "scenarios, concentration, ESG"
                            ][index]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="method-section">
            <h2>{isZh ? "分数、完整度与置信度" : "Score, completeness, and confidence"}</h2>
            <p>
              {isZh
                ? "总分是 10 个维度得分的加权结果。完整度回答“必填信息是否齐全”；置信度回答“这份结论是否有足够可靠的证据”。置信度由必填完整度 45%、证据质量 35%、数据一致性 20% 组成。缺少证据不会被伪装成商业表现差，而是降低置信度并形成验证任务。"
                : "The total is the weighted result across ten dimensions. Completeness asks whether required inputs exist; confidence asks whether the conclusion is sufficiently evidenced. Confidence comprises 45% required-field completeness, 35% evidence quality, and 20% data consistency. Missing evidence is not disguised as poor performance; it reduces confidence and creates a validation task."}
            </p>
            <div className="score-band-legend">
              {[
                ["85–100", isZh ? "稳健" : "Robust"],
                ["70–84", isZh ? "有潜力，但有实质缺口" : "Promising, material gaps"],
                ["55–69", isZh ? "有条件可行" : "Conditional"],
                ["40–54", isZh ? "脆弱" : "Fragile"],
                ["0–39", isZh ? "高风险" : "High risk"]
              ].map(([range, label]) => (
                <div key={range}>
                  <strong>{range}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="method-section">
            <h2>{isZh ? "关键公式" : "Core formulas"}</h2>
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isZh ? "指标" : "Metric"}</th>
                    <th>{isZh ? "公式" : "Formula"}</th>
                  </tr>
                </thead>
                <tbody>
                  {formulas.map(([zh, en, formula]) => (
                    <tr key={en}>
                      <td>
                        {isZh ? zh : en}
                        <small className="table-secondary">
                          {isZh && zh !== en ? en : ""}
                        </small>
                      </td>
                      <td>
                        <code>{formula}</code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="method-section">
            <h2>{isZh ? "AI 的边界" : "AI boundaries"}</h2>
            <div className="notice success">
              <CheckCircle2 size={18} aria-hidden="true" />
              <span>
                {isZh
                  ? "AI 接收只读的锁定评分与八模块理论评估，用于总结、解释优缺点、梳理假设、生成三种情景和行动建议。所有建议必须关联用户证据与课程框架。"
                  : "AI receives the locked score and eight-module theory assessment as read-only snapshots only to summarize, interpret strengths and gaps, articulate assumptions, develop three conditional scenarios, and propose actions linked to user evidence and course frameworks."}
              </span>
            </div>
            <div className="notice error">
              <AlertTriangle size={18} aria-hidden="true" />
              <span>
                {isZh
                  ? "AI 不得修改分数、理论模块状态或公式结果，不得捏造法规/市场数据/竞争事实、把假设写成事实，或把课程中的历史公司、国家与财务案例当作当前基准。"
                  : "AI may not alter scores, theory-module status, or formula outputs; invent regulation, market or competitor facts; present assumptions as facts; or treat historical company, country, or financial examples as current benchmarks."}
              </span>
            </div>
          </section>
        </div>

        <aside>
          <section className="method-section">
            <h2>{isZh ? "不可抵消的硬门槛" : "Non-compensatory hard gates"}</h2>
            <ul className="source-list">
              {[
                ["合法经营与所有权", "Legality & ownership"],
                ["许可、产品与场地批准", "Licensing, product & site approval"],
                ["数据隐私与消费者保护", "Privacy & consumer protection"],
                ["劳动、伦理与供应商合规", "Labour, ethics & supplier compliance"],
                ["外汇、支付与关键基础设施", "FX, payments & critical infrastructure"]
              ].map(([zh, en]) => (
                <li className="source-item" key={en}>
                  <strong>{isZh ? zh : en}</strong>
                  <span>{isZh ? en : zh}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="method-section">
            <h2>{isZh ? "策略工具" : "Strategy tools"}</h2>
            <ul className="source-list">
              {[
                ["EFE / IFE", "外部与内部因素加权审计", "weighted external/internal factor audit"],
                ["IE Matrix", "横轴 IFE、纵轴 EFE 的九宫格", "nine-cell matrix: IFE x-axis, EFE y-axis"],
                ["QSPM", "用 EFE/IFE 权重比较策略吸引力", "compare strategic attractiveness using EFE/IFE weights"],
                ["Sustainable advantage & TOWS", "验证零售可持续优势并组合战略选项", "test sustainable retail advantage and combine strategic options"],
                ["7C 与 Gaps Model", "审查数字体验与服务差距", "audit digital experience and service gaps"]
              ].map(([name, zh, en]) => (
                <li className="source-item" key={name}>
                  <strong>{name}</strong>
                  <span>{isZh ? zh : en}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="method-section">
            <h2>{isZh ? "证据规则" : "Evidence rules"}</h2>
            <div className="notice">
              <Scale size={18} aria-hidden="true" />
              <span>
                {isZh
                  ? "国家、法律、租金、市场规模和竞争数据必须记录来源、日期与可信度。课程历史案例只能说明框架，不能作为当前 benchmark；文化维度用于判断适应需求，不能直接给国家贴“好/坏”标签。"
                  : "Country, legal, rent, market-size, and competitor data should record source, date, and confidence. Historical course cases may illustrate a framework but cannot serve as current benchmarks; culture indicates adaptation needs and is never a good/bad country score."}
              </span>
            </div>
          </section>

          <section className="method-section">
            <h2>{isZh ? "课程来源" : "Course foundations"}</h2>
            <ul className="source-list">
              {[
                [
                  "Retailing Management, 11e, Ch. 1–18",
                  "零售战略、渠道、选址、商品、财务、CRM、服务与运营",
                  "Retail strategy, channels, location, merchandise, finance, CRM, service, and operations"
                ],
                [
                  "Strategic Management lectures",
                  "EFE/IFE、SWOT/TOWS、SPACE、BCG、IE、QSPM",
                  "EFE/IFE, SWOT/TOWS, SPACE, BCG, IE, and QSPM"
                ],
                [
                  "Global Marketing lectures",
                  "国家环境、进入模式、全球整合与本地响应",
                  "Country context, entry modes, global integration, and local responsiveness"
                ],
                [
                  "International Business / OB materials",
                  "跨文化、组织、HR、伦理、控制与执行",
                  "Cross-cultural management, organization, HR, ethics, control, and execution"
                ]
              ].map(([source, zh, en]) => (
                <li className="source-item" key={source}>
                  <strong>{source}</strong>
                  <span>{isZh ? zh : en}</span>
                </li>
              ))}
            </ul>
            <p className="source-link-note">
              {isZh
                ? "详细追踪见 docs/SOURCE_MAP.md。课程中发现的算术、坐标与术语错误已记录并在程序中纠正。"
                : "See docs/SOURCE_MAP.md for detailed traceability. Arithmetic, axis, and terminology errors identified in the course materials are documented and corrected in the implementation."}
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

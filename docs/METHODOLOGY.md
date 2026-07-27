# RetailLens Assessment Methodology / RetailLens 零售商业评估方法

Version / 版本：1.0
Scope / 适用范围：retail business-model screening, country-entry analysis, and strategy comparison / 零售商业模式初筛、国家进入分析与战略方案比较

## 1. Purpose and boundaries / 目的与边界

RetailLens is a decision-support system. It turns a user's retail-business assumptions, operating data, and evidence into a reproducible assessment. It is not a valuation, audit, legal opinion, tax opinion, investment recommendation, or promise of commercial success.

RetailLens 是一套决策支持系统。它把用户提交的零售商业假设、运营数据与证据转化为可重复计算的评估结果。它不等同于企业估值、审计、法律或税务意见、投资建议，也不承诺商业成功。

The methodology combines three course families:

- Retailing Management: customer, format, channel, location, merchandise, supply chain, pricing, communication, store operations, CRM, and service.
- Strategic Management: external and internal audit, strategy matching, implementation, monitoring, EFE, IFE, IE, and QSPM.
- Global Marketing and International Management: country and political risk, legal feasibility, culture, market entry, international strategy, organization, ethics, and human resources.

本方法结合三类课程理论：

- 零售管理：顾客、业态、渠道、选址、商品、供应链、定价、传播、门店运营、CRM 与服务。
- 战略管理：外部与内部审计、战略匹配、执行与监控，以及 EFE、IFE、IE、QSPM。
- 全球营销与国际管理：国家及政治风险、法律可行性、文化、市场进入、国际战略、组织、伦理与人力资源。

Every course-derived rule is distinguished from a RetailLens internal screening rule. Course examples are never silently converted into universal industry benchmarks. Source handles used below are defined in [SOURCE_MAP.md](./SOURCE_MAP.md).

所有课程原有规则与 RetailLens 内部筛选规则均明确区分。课程案例中的数字不会被默认当作通用行业基准。下文使用的证据编号见 [SOURCE_MAP.md](./SOURCE_MAP.md)。

### Chinese-and-English-only rule / 仅支持中文与英文

RetailLens supports **Chinese and English only**. The interface, intake guidance, deterministic report, and AI interpretation are available only in Chinese or English. Proper nouns, brand names, country names, formulas, and standard business terms may remain in their established form. A submission whose main narrative is in another language must be rewritten in Chinese or English before analysis; RetailLens does not promise third-language detection, translation, or reporting.

RetailLens **仅支持中文与英文**。界面、资料填写指引、程序化报告与 AI 解读只提供中文或英文。专有名词、品牌名、国家名、公式与标准商业术语可保留通用写法。若主要叙述使用其他语言，用户必须先改写成中文或英文；系统不承诺第三语言的识别、翻译或报告输出。

Language choice changes presentation, not scoring. The same inputs must produce the same deterministic result in Chinese and English.

语言选择只影响呈现，不影响评分。同一组输入在中文与英文模式下必须得到相同的程序化结果。

## 2. Assessment architecture / 评估架构

RetailLens deliberately keeps the following outputs separate:

1. **Hard gates / 硬门槛** — whether the proposed model can legally and operationally proceed.
2. **Performance score / 经营表现分** — a weighted 0–100 assessment across ten retail dimensions.
3. **Evidence confidence / 证据置信度** — how complete, reliable, and internally consistent the submitted evidence is.
4. **Country attractiveness / 国家吸引力** — the external opportunity and risk of the target market.
5. **Firm readiness / 企业准备度** — the firm's resources and ability to execute.
6. **Entry-mode fit / 进入模式匹配度** — the relative fit of feasible entry modes.
7. **Course matrices / 课程矩阵** — EFE, IFE, IE, and QSPM, each retaining its source-defined meaning.
8. **Enterprise theory assessment / 企业理论评估** — eight deterministic modules covering industry structure, relative competition, STP, entry mode, financial productivity, service gaps, organization/control, and top risk.

RetailLens 有意把以下结果分开呈现：

1. **硬门槛**——拟议商业模式是否在法律和运营上可以继续。
2. **经营表现分**——按十个零售维度计算的 0–100 加权分数。
3. **证据置信度**——提交证据的完整性、可靠性与内部一致性。
4. **国家吸引力**——目标市场的外部机会与风险。
5. **企业准备度**——企业的资源与执行能力。
6. **进入模式匹配度**——各可行进入模式之间的相对适配。
7. **课程矩阵**——EFE、IFE、IE 与 QSPM，各自保留课程定义。
8. **企业理论评估**——八个确定性模块，覆盖行业结构、相对竞争、STP、进入模式、财务生产力、服务差距、组织控制与首要风险。

These outputs are not added into one opaque “master score.” A failed legal gate cannot be compensated for by a strong market score, and weak evidence cannot be hidden inside a seemingly precise performance score.

这些结果不会被相加成一个不透明的“总总分”。法律硬门槛失败不能由高市场分抵消；薄弱证据也不能藏在看似精确的经营分数中。

### 2.1 Enterprise decision-workpaper layer / 企业级决策底稿层

The consulting layer does not add a second subjective score. It organizes the deterministic outputs into a management decision sequence:

`decision question → MECE issue tree → hypothesis status → evidence and assumptions → downside/base/upside scenarios → KPI causal tree → 30/60/90-day workstreams → decision gate`

咨询层不会再增加一个主观分数，而是把确定性结果组织成管理层决策顺序：

`决策问题 → MECE 问题树 → 假设状态 → 证据与假设 → 下行/基准/上行情景 → KPI 因果树 → 30/60/90 天工作流 → 决策关口`

The five issue-tree branches are:

1. **Commercial thesis / 商业命题** — customer need and differentiation.
2. **Route to customer / 触达顾客** — channels, location, marketing, CRM, and service.
3. **Operating model / 运营模式** — merchandise and supply-chain delivery.
4. **Economics / 经济性** — unit economics, cost structure, cash, and funding.
5. **Feasibility and execution / 可行性与执行** — compliance, organization, risk, monitoring, and control.

Each applicable ten-dimension result becomes one testable hypothesis. `≥75` is supported, `55–74.9` is partially supported, and `<55` is not supported. If scoring confidence is below `45`, the status is “insufficient evidence” rather than a false negative. A branch score is the weighted average of its applicable dimensions.

每个适用的十维结果都会转化为一个可验证假设：`≥75` 为已支持，`55–74.9` 为部分支持，`<55` 为未支持。若评分置信度低于 `45`，状态会显示“证据不足”，而不是制造一个虚假的负面结论。分支分数是该分支适用维度的加权平均。

### 2.2 Decision readiness and evidence quality / 决策就绪度与证据质量

Decision readiness is intentionally separate from commercial attractiveness:

\[
Readiness = 35\%\times Performance + 25\%\times Confidence + 20\%\times Completeness + 20\%\times GateReadiness
\]

where gate readiness maps `PASS=100`, `REVIEW=55`, `UNKNOWN=25`, and `FAIL=0`, then averages all hard gates. `≥75` is decision-ready, `55–74.9` is conditionally ready, and `<55` is not decision-ready, subject to the non-compensatory stop rules.

决策就绪度与商业吸引力分开：

\[
决策就绪度 = 35\%\times 经营分 + 25\%\times 证据置信度 + 20\%\times 完整度 + 20\%\times 门槛准备度
\]

其中门槛准备度按 `通过=100`、`需复核=55`、`未知=25`、`失败=0` 后取全部硬门槛平均值。`≥75` 为可进入决策，`55–74.9` 为有条件就绪，`<55` 为尚不可决策，同时仍受不可抵消停止规则约束。

Evidence quality is a separate audit signal:

\[
EvidenceQuality = 35\%\times DeclaredConfidence + 30\%\times SourceTraceability + 15\%\times EvidenceDate + 20\%\times ComplianceTraceability
\]

- Declared confidence maps low/medium/high to `35/65/90`.
- Source and compliance traceability are `100` when a reference is submitted and `0` when absent. Narrative length adds no points; source validity remains a human verification task.
- Evidence date is `100` only when parseable; this does **not** prove that the source remains current.
- Evidence quality `≥75` with scoring confidence `≥70` is High; `≥50` with confidence `≥45` is Medium; otherwise Low.

证据质量是另一项独立审计信号：

\[
证据质量 = 35\%\times 申报置信度 + 30\%\times 来源可追溯性 + 15\%\times 证据日期 + 20\%\times 合规证据可追溯性
\]

- 低/中/高申报置信度映射为 `35/65/90`。
- 普通来源和合规证据引用已提交时为 `100`，缺失时为 `0`。文字长度不加分；来源是否真实有效仍须人工核验。
- 证据日期只有在可解析时为 `100`；这**不代表**内容仍然有效。
- 证据质量 `≥75` 且评分置信度 `≥70` 为高；质量 `≥50` 且置信度 `≥45` 为中；其余为低。

### 2.3 Management recommendation rules / 管理层建议规则

The executive recommendation is deterministic and ordered from strongest stop condition to weakest:

1. **STOP / 停止** — any failed hard gate, performance score `<40`, or contribution margin `≤0`.
2. **PAUSE AND VALIDATE / 暂停并验证** — incomplete hard gates, readiness `<55`, performance score `<55`, or a cash-runway risk.
3. **PROCEED CONDITIONALLY / 有条件推进** — conditional gates, readiness `<75`, performance score `<75`, confidence `<70`, or downside break-even coverage `<1.0×`.
4. **PROCEED / 推进** — none of the above applies.

The system attaches explicit preconditions, tests, source handles, owners, triggers, and exit criteria. AI cannot promote or downgrade the recommendation.

管理层建议按最强停止条件到最弱条件依次判定，并为未解决事项附上明确的前置条件、验证测试、来源句柄、负责人、触发条件与退出标准。AI 无权升级或降级建议。

### 2.4 Scenario and KPI operating contract / 情景与 KPI 运营规范

- **Downside / 下行：** uses the submitted downside monthly revenue.
- **Base / 基准：** uses the submitted base monthly revenue.
- **Upside / 上行：** only when a valid downside exists below base, calculated symmetrically as `base + (base − downside)`.
- **Operating contribution / 经营贡献：** `scenario revenue × base contribution-margin rate − base fixed cost`.
- **Break-even coverage / 盈亏平衡覆盖：** `scenario revenue ÷ mathematical break-even revenue`.
- Missing scenario inputs remain unavailable; the system never fabricates a market growth rate.

The KPI tree contains only three decision outcomes by default—monthly operating contribution, downside break-even coverage, and supplier service level. Each outcome has one or two causal drivers, one or two guardrails, a formula, current value, target basis, owner, cadence, and source handles. A target is either mathematical break-even, the submitted management plan, or explicitly “management target required”; no external target is silently invented.

KPI 因果树默认只保留三个与决策直接相关的结果指标——月度经营贡献、下行盈亏平衡覆盖和供应服务水平。每个结果指标均带 1–2 个驱动指标、1–2 个护栏指标、公式、当前值、目标依据、负责人、复核节奏和来源句柄。目标只能来自数学盈亏平衡、已提交管理计划，或明确标记“需管理层确认”；系统不会悄悄捏造外部目标。

### 2.5 Public professional-practice references / 公开专业实践参考

The delivery controls above are informed by publicly available professional practices—not by copied or claimed proprietary methods:

- KPMG, [driver-based planning](https://kpmg.com/us/en/articles/2023/innovate-fp-and-a-driver-planning.html): connect financial and operational drivers and use scenario/sensitivity analysis.
- Deloitte, [scenario thinking in strategic decisions](https://www.deloitte.com/global/en/issues/resilience/build-scenario-thinking-or-sensing-into-strategic-decision-making.html): define plausible alternate futures, reforecast, and connect scenarios to decisions.
- PwC, [data stewardship](https://www.pwc.com/mt/en/publications/other/the-rising-importance-of-data-stewards-in-the-digital-age.html): govern accuracy, completeness, consistency, traceability, and accountability.
- Deloitte, [strategic sensing](https://www.deloitte.com/uk/en/services/consulting/services/strategic-sensing-and-insight-services.html): connect drivers, scenarios, strategic options, and monitoring.

这些公开资料只用于提高交付治理、情景规划与证据责任的专业程度。RetailLens 与四大会计师事务所或其成员机构没有隶属、授权或背书关系，也不声称复制其专有方法。

### 2.6 Nine-step intake and enterprise theory-engine layer / 九步填写与企业理论引擎层

RetailLens uses nine ordered intake steps. The first eight build the decision brief and operating workpapers; the ninth, **Enterprise workbench / 企业工作台**, contains exactly **91 required structured inputs**. Those 91 inputs drive the eight theory modules below. They are fixed-scale numbers, selections, competitor-factor rows, bilingual labels, and control flags—not a request for longer prose.

RetailLens 采用九个有序填写步骤。前八步建立决策任务与运营底稿；第九步 **企业工作台 / Enterprise workbench** 包含恰好 **91 个必填结构化输入**。这 91 项直接驱动下列八个理论模块，包括固定量表数值、选项、竞争因素行、双语标签和控制标记，并不要求用户通过增加文字篇幅来“争取分数”。

| Step / 步骤 | Input block / 资料模块 | Defined fields / 已定义字段 |
|---:|---|---:|
| 1 | Business & decision brief / 业务与评估任务 | 6 |
| 2 | Market, city & operating model / 国家、城市与经营形态 | 10 |
| 3 | Target customer & demand evidence / 目标客户与需求证据 | 8 |
| 4 | Value, merchandise & competition / 价值、商品与竞争 | 11 |
| 5 | Compliance gates & channels / 合规门槛与渠道 | 16 |
| 6 | Site & supply chain / 门店与供应链 | 20 |
| 7 | Financials & unit economics / 财务与单位经济 | 18 |
| 8 | Growth, team, risks & evidence / 增长、团队、风险与证据 | 19 |
| 9 | **Enterprise workbench / 企业工作台** | **91** |

The enterprise assessment is deterministic and versioned as `Enterprise Theory 1.0`:

| Module / 模块 | Structured calculation / 结构化计算 | Interpretation control / 解释边界 |
|---|---|---|
| Five Forces / 五力 | Five submitted intensities on 1–5; `internal attractiveness = 100 × (5 − mean intensity) ÷ 4` | Internal visualization only; force intensity is not the firm's response capability / 仅为内部可视化；力量强度不等于企业应对能力 |
| CPM / 竞争态势矩阵 | At least three factors; weights total 1; 1–4 relative ratings; `total = Σ(weight × rating)` | Relative comparison of the company and two submitted competitors; no absolute go/no-go score / 只比较本企业和两家已提交竞品；不是绝对进入线 |
| STP and positioning / STP 与定位 | Equal-weight 1–5 scales; `normalized score = 100 × (weighted rating − 1) ÷ 4` | Internal diagnosis, not a universal segment-attractiveness cutoff / 内部诊断，不是通用细分吸引力门槛 |
| Entry-mode MCDA / 进入模式 MCDA | Two options across nine fixed criteria; `total = Σ(weight % × fit rating ÷ 5)` | Any failed hard gate blocks a recommendation; top-two gap `<5` is inconclusive. The weights and five-point rule are internal controls / 硬门槛失败即阻断；前两名差距 `<5` 为无明确优胜者；权重与 5 分规则属于内部控制 |
| Strategic Profit Model and GMROI / 战略利润模型与 GMROI | Net margin, asset turnover, `ROA = net margin × asset turnover`; `annual GMROI = annual gross margin ÷ average inventory` | No cross-format universal pass line; compare like-for-like with current company history, budget, and peers / 没有跨业态通用通过线，须与当前企业历史、预算及同口径同业比较 |
| Service GAPS / 服务差距 | RATER expectation/perception 1–7; `customer gap = P − E`; four organization gaps on 1–5 | Negative P−E prioritizes investigation but does not prove causality / 负差距用于确定调查优先级，不能单独证明因果 |
| Organization and control / 组织与控制 | Arithmetic mean of policy, process, and KPI coverage; submitted cadence and tolerance remain unchanged | No invented universal coverage, cadence, or tolerance threshold / 不发明通用覆盖率、复核频率或容忍度标准 |
| Top risk and monitoring / 首要风险与监控 | `inherent = likelihood × impact`; `residual = inherent × (1 − control effectiveness %)`, plus KRI, trigger, and funded-contingency flags | No universal colour or pass band unless the organization separately approves and versions one / 除非组织另行批准并版本化，否则不套用通用颜色或通过区间 |

Every module returns a status, formula, raw-input trace, evidence requirements, course source handles, and an internal-rule disclaimer. “Calculation complete” means only that the submitted values can be calculated; it does **not** mean the evidence has been independently verified.

每个模块都会输出状态、公式、原始输入追踪、所需证据、课程来源句柄和内部规则免责声明。“计算完整”只表示提交数值可被计算，**不代表**证据已经独立核实。

## 3. Required user information / 用户必须提供的信息

### 3.1 Core required fields / 核心必填资料

The following information must be provided before a final assessment can be issued. An early-stage business may use a clearly labelled estimate, but it may not leave a scoring-critical field blank without an “unknown” explanation.

正式评估前必须填写以下资料。早期项目可以提交明确标记的估算值，但不能在没有说明“未知原因”的情况下留空关键评分字段。

The ninth-step Enterprise workbench contributes 91 structured fields to this contract. Narrative fields establish coverage and context only; their length is never used as a proxy for quality or performance.

第九步企业工作台为本资料规范增加 91 个结构化字段。自由文本只用于证明资料覆盖与提供背景；系统绝不会用文字长度代替质量或经营表现。

| Required block / 必填模块 | Minimum information / 最低必填内容 | Why it is required / 必填原因 |
|---|---|---|
| Business identity and decision / 企业与决策 | Business or concept name; category; development stage; assessment objective; planned launch date or decision horizon / 企业或项目名称、品类、发展阶段、评估目的、计划开业日期或决策期限 | Fixes the unit and timing of analysis / 明确分析对象与时间范围 |
| Geography / 地理范围 | Home country; target country; target state/province and city or catchment; operating currency / 母国、目标国家、目标州省及城市或商圈、经营币种 | National averages alone are insufficient for retail decisions / 零售决策不能只依赖全国平均值 |
| Retail model / 零售模式 | Physical-only, digital-only, or hybrid; proposed format; owned, marketplace, wholesale, franchise, or other channel; candidate entry mode / 纯实体、纯线上或混合；拟议业态；自营、平台、批发、加盟或其他渠道；候选进入模式 | Activates conditional questions and weights / 决定条件问题与权重 |
| Customer and problem / 顾客与需求 | Target segment; buying user and paying customer; need or job-to-be-done; buying occasion; current alternative; willingness-to-pay evidence / 目标细分、使用者与付款者、需求或任务、购买场景、现有替代方案、支付意愿证据 | Anchors customer and market fit / 锚定顾客与市场匹配 |
| Offer and differentiation / 产品与差异化 | Products or services; assortment breadth/depth; value proposition; price architecture; defensible difference; reason to believe / 产品或服务、品类宽度与深度、价值主张、价格体系、可防守差异、可信理由 | Tests strategic clarity and competitive advantage / 检验战略清晰度与竞争优势 |
| Market and competition / 市场与竞争 | Category size or catchment demand; growth assumption; named direct and indirect competitors; competitor price/channel/strength comparison / 品类规模或商圈需求、增长假设、直接和间接竞争者、竞争者价格渠道与优势比较 | Supports external audit and market scoring / 支持外部审计与市场评分 |
| Revenue model / 收入模型 | Revenue streams; unit or basket price; forecast transaction volume; frequency or repeat rate; returns/refunds; base and downside forecast / 收入来源、单件或客单价、预计交易量、频次或复购率、退退货、基准与下行情景 | Makes the model numerically testable / 使商业模式可以量化检验 |
| Cost and unit economics / 成本与单位经济 | Landed COGS; variable fulfilment/payment/channel cost; labour; occupancy; marketing; fixed overhead; gross and contribution margin; break-even sales / 到岸成本、履约支付渠道等变动成本、人工、租赁、营销、固定费用、毛利与贡献毛利、盈亏平衡销售额 | Tests economic feasibility / 检验经济可行性 |
| Capital and cash / 资本与现金 | Launch CAPEX; working-capital need; funding available; monthly net burn; cash runway; financing constraints / 启动资本开支、营运资金、可用资金、月度净消耗、现金跑道、融资限制 | Tests feasibility and downside survival / 检验可执行性与下行情景生存能力 |
| Channel and location / 渠道与选址 | Channel roles and sales mix; customer acquisition route; fulfilment route; for stores, site type, catchment, footfall/conversion evidence, area and rent / 渠道角色与销售占比、获客路径、履约路径；若有门店，需填写点位类型、商圈、客流与转化证据、面积与租金 | Supports omnichannel and location analysis / 支持全渠道与选址分析 |
| Merchandise and supply / 商品与供应 | Supplier count and countries; largest-supplier share; lead time and variability; minimum order; inventory plan; service/fill rate; stockout, shrinkage, quality and logistics risks / 供应商数量与国家、最大供应商占比、交期及波动、最小订量、库存计划、服务或满足率、缺货损耗质量及物流风险 | Tests assortment and operating resilience / 检验商品规划与运营韧性 |
| Marketing, CRM and service / 营销、CRM 与服务 | Positioning; acquisition channels; CAC; retention/loyalty approach; CLV basis; service promise; complaint/return process / 定位、获客渠道、CAC、留存与忠诚方案、CLV 依据、服务承诺、投诉与退货流程 | Tests demand creation and relationship economics / 检验需求创造与顾客关系经济性 |
| Organization and execution / 组织与执行 | Founders and key roles; retail/country experience; capability gaps; local partner; decision rights; launch milestones; KPI owners / 创始人与关键岗位、零售及目标国经验、能力缺口、本地伙伴、决策权、开业里程碑、KPI 负责人 | Tests whether the plan can be executed / 检验计划能否被执行 |
| Country, law and compliance / 国家、法律与合规 | Foreign-ownership position; licences; product/labelling rules; tax/tariff; labour; consumer protection; privacy/data; payment/FX/repatriation; anti-bribery and supplier compliance / 外资持股、牌照、产品与标签、税费与关税、劳动、消费者保护、隐私数据、支付外汇与利润汇回、反贿赂及供应商合规 | Resolves hard gates and country exposure / 判断硬门槛与国家风险 |
| Risk and evidence / 风险与证据 | Top risks; likelihood and financial/operating impact; mitigation; owner and trigger; data source, date, unit, and confidence for each material claim / 主要风险、发生概率与财务运营影响、缓解措施、负责人和触发点；每项重大主张的数据来源、日期、单位与可信度 | Prevents unsupported precision / 防止没有证据的精确假象 |

### 3.2 Conditional required fields / 条件必填资料

- **Physical or hybrid retail / 实体或混合零售：** site address or search area, catchment definition, usable area, annual occupancy cost, footfall, conversion, opening hours, store capacity, licences, utilities, safety, and accessibility.
- **Digital or hybrid retail / 线上或混合零售：** web/app/marketplace route, traffic source, conversion, payment acceptance, platform fees, delivery promise, return rate, fraud risk, privacy/data flows, and local-language customer journey.
- **Cross-border sourcing / 跨境采购：** Incoterms or equivalent responsibility split, tariff and tax, customs process, freight/insurance, FX exposure, border delay, product compliance, and landed-cost build-up.
- **Franchise, licensing, or joint venture / 加盟、许可或合资：** partner identity, financial and reputation due diligence, territory, fees/profit share, governance rights, brand/IP controls, audit rights, dispute resolution, and exit terms.
- **Acquisition / 收购：** target financials, liabilities, store quality, lease terms, customer and supplier concentration, integration plan, and valuation assumptions.

### 3.3 Missing and unknown data / 缺失与未知数据

“Not applicable” and “unknown” are different:

- **N/A** is allowed only when system logic proves a factor does not apply, such as physical site metrics for a truly digital-only model.
- **Unknown** means the factor applies but the user has not established the answer.
- A missing scoring-critical field must never be silently converted to zero, fifty, or an optimistic industry average.
- RetailLens may show a provisional diagnostic, but it withholds a final recommendation when a critical hard gate is unknown.

“不适用”与“未知”含义不同：

- 只有系统逻辑确认该因素确实不适用时才能选择 **N/A**，例如真正纯线上的模式无需实体点位指标。
- **未知**表示该因素适用，但用户尚未查明答案。
- 关键评分字段缺失时，不得悄悄替换成 0、50 或乐观行业平均值。
- 系统可以展示暂定诊断，但关键硬门槛未知时不能给出最终进入建议。

## 4. Hard gates / 硬门槛

Hard gates are assessed before the performance score. Each gate has one of four statuses: `PASS`, `REVIEW`, `FAIL`, or `UNKNOWN`.

硬门槛先于经营分数评估。每项硬门槛只有四种状态：`通过`、`需复核`、`失败` 或 `未知`。

| Gate / 门槛 | Examples of evidence / 证据示例 | Treatment / 处理方式 |
|---|---|---|
| Legal right to operate / 合法经营权 | Foreign ownership, business licence, franchise or sector restriction / 外资持股、营业牌照、加盟或行业限制 | A confirmed prohibition is `FAIL` / 已确认禁止即失败 |
| Product and customer safety / 产品与顾客安全 | Product registration, food/drug rules, labelling, recalls, site safety / 产品注册、食品药品规则、标签、召回、场所安全 | Unmitigable safety failure is `FAIL` / 无法缓解的安全问题即失败 |
| Data, privacy, and payment legality / 数据、隐私与支付合法性 | Consent, data transfer/localization, payment licence, cybersecurity duties / 同意、数据跨境或本地化、支付牌照、网络安全义务 | Illegal data/payment flow is `FAIL` / 非法数据或支付流程即失败 |
| FX, repatriation, and treasury access / 外汇、汇回与资金可得性 | Convertibility, trapped cash, remittance approval, banking access / 可兑换性、受困资金、汇款审批、银行渠道 | A model that cannot fund or repatriate as required fails until redesigned / 无法按模式融资或汇回时须先重构 |
| Critical infrastructure / 关键基础设施 | Reliable power, transport, cold chain, connectivity, warehouse, last mile / 电力、交通、冷链、网络、仓储、末端配送 | A non-substitutable operating failure is `FAIL` / 无替代方案的运营缺口即失败 |
| Labour and supplier compliance / 劳动与供应商合规 | Employment rights, forced/child labour, supplier audit, work permits / 劳动权利、强迫或童工、供应商审计、工作许可 | Serious unresolved breach is `FAIL` / 严重且未解决的违规即失败 |
| Anti-bribery, sanctions, and ethics / 反贿赂、制裁与伦理 | Beneficial ownership, sanctions screening, facilitation payments, conflicts / 实益所有人、制裁筛查、疏通费、利益冲突 | A prohibited party or required corrupt payment is `FAIL` / 禁止交易对象或必须行贿即失败 |
| Minimum financial operability / 最低财务可运营性 | Funding committed, ability to meet payroll/tax/stock obligations, downside liquidity / 已落实资金、支付工资税费库存义务的能力、下行情景流动性 | Insolvency at launch without a funded remedy is `FAIL` / 开业即资不抵债且无资金方案即失败 |

Decision logic / 决策逻辑：

```text
if any gate == FAIL:
    outcome = BLOCKED
else if any critical gate == UNKNOWN:
    outcome = INCOMPLETE
else if any gate == REVIEW:
    outcome = CONDITIONAL
else:
    outcome = ELIGIBLE_FOR_SCORING
```

A high performance score may still be displayed for diagnostic purposes after a `REVIEW`, but it must carry the gate warning. A `FAIL` can never be overridden by score, evidence confidence, or AI commentary. Source basis: `IM12Q-C02`, `IM12Q-C03`, `IM12Q-C10`, `GM10-C15`, `SM-EXT`, and `SM-ETH`.

在 `需复核` 状态下可以为了诊断而显示经营分数，但必须同时显示门槛警告。`失败` 永远不能由分数、证据置信度或 AI 文字覆盖。课程依据：`IM12Q-C02`、`IM12Q-C03`、`IM12Q-C10`、`GM10-C15`、`SM-EXT` 与 `SM-ETH`。

## 5. Ten performance dimensions / 十个经营评分维度

### 5.1 Default and conditional weights / 默认与条件权重

The default profile applies to physical and hybrid retail. For a digital-only model, `location_trade_area` is genuinely N/A and its nine points are redistributed by a fixed rule. The redistribution is deterministic; AI cannot choose it.

默认权重适用于实体零售和混合零售。对真正的纯线上模式，`location_trade_area` 为 N/A，其 9 分按固定规则重新分配。重新分配是程序化规则，AI 无权决定。

| Dimension ID | Dimension / 维度 | Physical or hybrid / 实体或混合 | Digital-only / 纯线上 | Main assessment focus / 主要评估内容 |
|---|---|---:|---:|---|
| `market_customer` | Market and customer / 市场与顾客 | 14 | 15 | Segment need, demand, growth, willingness to pay, competition, cultural/customer fit / 细分需求、需求量、增长、支付意愿、竞争、文化与顾客匹配 |
| `strategy_differentiation` | Strategy and differentiation / 战略与差异化 | 12 | 12 | Targeting, positioning, value proposition, defensibility, format fit, strategic coherence / 目标、定位、价值主张、可防守性、业态匹配、战略一致性 |
| `country_compliance` | Country and compliance / 国家与合规 | 8 | 8 | Political, legal, tax, ownership, FX, privacy, ethics, and sector risk / 政治、法律、税务、持股、外汇、隐私、伦理与行业风险 |
| `channels_digital` | Channels and digital / 渠道与数字化 | 9 | 12 | Channel role, omnichannel consistency, platform economics, payments, fulfilment, conversion / 渠道角色、全渠道一致性、平台经济、支付、履约、转化 |
| `location_trade_area` | Location and trade area / 选址与商圈 | 9 | 0 (N/A) | Catchment, accessibility, footfall, conversion, competition, occupancy economics, site capacity / 商圈、可达性、客流、转化、竞争、租赁经济、点位容量 |
| `merchandise_supply_chain` | Merchandise and supply chain / 商品与供应链 | 12 | 13 | Assortment, buying, price architecture, supplier resilience, lead time, inventory, quality, logistics / 商品组合、采购、价格体系、供应商韧性、交期、库存、质量、物流 |
| `financial_unit_economics` | Financial and unit economics / 财务与单位经济 | 16 | 18 | Gross and contribution margin, break-even, cash, working capital, CAC/CLV, sensitivity / 毛利与贡献毛利、盈亏平衡、现金、营运资金、CAC/CLV、敏感性 |
| `marketing_crm_service` | Marketing, CRM, and service / 营销、CRM 与服务 | 9 | 10 | Communication, acquisition efficiency, retention, loyalty, service promise, returns and recovery / 传播、获客效率、留存、忠诚、服务承诺、退货与服务补救 |
| `organization_execution` | Organization and execution / 组织与执行 | 6 | 6 | Team capability, governance, partner fit, milestones, systems, controls, KPI ownership / 团队能力、治理、伙伴匹配、里程碑、系统、控制、KPI 责任 |
| `risk_sustainability` | Risk and sustainability / 风险与可持续性 | 5 | 6 | Scenario resilience, concentration, contingency, stakeholder, environmental and social exposure / 情景韧性、集中度、应急方案、利益相关者、环境与社会风险 |
|  | **Total / 合计** | **100** | **100** |  |

Digital-only redistribution / 纯线上重分配：

```text
market_customer             +1
channels_digital            +3
merchandise_supply_chain    +1
financial_unit_economics    +2
marketing_crm_service       +1
risk_sustainability         +1
location_trade_area         -9 and marked N/A
```

These weights are **RetailLens defaults**, not source-defined industry facts. They are versioned configuration. If a future sector profile changes them, the report must disclose the profile and weights used.

这些权重是 **RetailLens 默认配置**，并非课程或行业事实。它们必须版本化管理。若未来某行业配置调整权重，报告必须披露所用配置及权重。

### 5.2 Dimension calculation / 维度计算

Each dimension contains deterministic subcriteria. A subcriterion score \(x_{d,i}\) is normalized to 0–100 using a declared rubric or a declared quantitative guardrail. Subcriterion importance \(a_{d,i}\) is fixed in the scoring configuration.

每个维度包含程序化子指标。子指标分数 \(x_{d,i}\) 依据已披露的评分量表或量化筛选线标准化到 0–100；子指标重要度 \(a_{d,i}\) 固定在评分配置中。

For dimension \(d\):

\[
D_d=\frac{\sum_i a_{d,i}x_{d,i}}{\sum_i a_{d,i}}
\]

For an applicable-dimension set \(A\), the performance score is:

\[
P=\frac{\sum_{d\in A}W_dD_d}{\sum_{d\in A}W_d}
\]

Under the supplied profiles, applicable weights sum to 100, so:

\[
P=\sum_{d\in A}\frac{W_d}{100}D_d
\]

Rules / 规则：

- Inputs are converted to scores by deterministic rules only.
- Unrounded values are used in all calculations; rounding occurs once for display.
- A valid `N/A` is handled by the declared profile, not ad hoc redistribution.
- A scoring-critical `UNKNOWN` prevents a final score; it is not treated as neutral.
- Text length, confident wording, and AI fluency do not earn points.
- Once a narrative field is meaningfully present, additional words do not increase its score; performance differences must come from structured values, explicit checks, and evidence.
- The report retains each raw input, unit, date, rule, subscore, and dimension contribution for audit.

- 所有输入只能通过程序化规则换算为分数。
- 计算过程使用未四舍五入数值，只在最终显示时舍入一次。
- 合法的 `N/A` 由已声明配置处理，不能临时随意重分权重。
- 关键评分项为 `UNKNOWN` 时不出正式分数，不能按中性值处理。
- 文字篇幅、语气自信或 AI 表达流畅度均不加分。
- 自由文本只要已实质填写，继续增加字数不会提高分数；经营表现差异必须来自结构化数值、明确检查与证据。
- 报告保留原始输入、单位、日期、规则、子分与维度贡献，便于审计。

### 5.3 Qualitative anchor scale / 定性评分锚点

Where no direct numeric guardrail applies, the deterministic rubric uses the following anchors. Intermediate values require an explicit rule and evidence.

若某项没有直接量化筛选线，则采用以下程序化锚点。中间分必须由明确规则和证据支持。

| Score / 分数 | Anchor / 锚点 |
|---:|---|
| 0 | Contradicted, infeasible, or no relevant answer / 与事实矛盾、不可行或完全无相关回答 |
| 25 | Weakly defined; material gap; assertion only / 定义薄弱、重大缺口、仅有主张 |
| 50 | Plausible baseline with partial operating detail / 基本合理，但运营细节或证据不完整 |
| 75 | Supported, coherent, benchmarked, and executable / 有证据、逻辑一致、有基准、可执行 |
| 100 | Strong current evidence, demonstrated economics/capability, and downside resilience / 当前证据强、经济性或能力已验证、具备下行情景韧性 |

## 6. Score bands / 分数区间

| Performance score / 经营分 | Label / 结论 | Interpretation / 解释 |
|---:|---|---|
| 85–100 | Robust / 稳健 | Strong cross-dimensional model; remaining issues are targeted rather than structural / 跨维度表现强，剩余问题主要是局部优化而非结构性缺陷 |
| 70–84 | Promising, with material gaps / 有前景，但有重大缺口 | Viable direction, but named weaknesses must be resolved before scaling / 方向可行，但扩张前必须解决明确弱点 |
| 55–69 | Conditional viability / 有条件可行 | Several assumptions or capabilities require validation, redesign, or a controlled pilot / 多项假设或能力需验证、重构或小规模试点 |
| 40–54 | Fragile; major redesign / 脆弱，需重大重构 | Economics, fit, or execution contains structural weaknesses / 经济性、匹配度或执行存在结构性弱点 |
| 0–39 | High risk / 高风险 | The current model is not decision-ready and may be commercially unsound / 当前模式尚不具备决策条件，可能缺乏商业可行性 |

The band never changes a gate result. A score of 90 with a failed licence gate remains `BLOCKED`. A score of 90 with low confidence remains a high-scoring but weakly evidenced hypothesis.

分数区间不会改变硬门槛结果。即使得分 90，只要牌照门槛失败，结论仍为 `阻断`。得分 90 但置信度低，表示这是一个高分但证据不足的假设。

## 7. RetailLens internal screening guardrails / RetailLens 内部筛选线

The following values are **configurable RetailLens internal screens**. They are not presented in the course materials as universal cutoffs, and they are not universal retail-industry facts. Sector, country, format, accounting policy, business stage, and risk appetite may justify a different configuration.

以下数字是**可配置的 RetailLens 内部筛选线**。课程资料没有把它们定义为通用标准，它们也不是通用零售行业事实。行业、国家、业态、会计政策、企业阶段与风险偏好不同，配置可以调整。

| Indicator / 指标 | Formula / 公式 | Internal screen / 内部筛选线 |
|---|---|---|
| Break-even coverage / 盈亏平衡覆盖倍数 | Forecast net sales ÷ break-even net sales / 预计净销售额 ÷ 盈亏平衡净销售额 | ≥1.20 strong / 强；1.00–1.19 viable / 可行；0.80–0.99 risk / 风险；<0.80 critical / 严重 |
| Rent-to-sales / 租售比 | Annual occupancy cost ÷ annual net sales / 年度占用成本 ÷ 年度净销售额 | ≤10% healthy / 健康；>10%–15% caution / 谨慎；>15% risk / 风险 |
| Cash runway / 现金跑道 | Unrestricted cash ÷ average monthly net cash burn / 不受限制现金 ÷ 平均月度净现金消耗 | ≥6 months resilient / 有韧性；3–5 months caution / 谨慎；<3 months critical / 严重 |
| CLV:CAC / 顾客终身价值与获客成本比 | Contribution-margin-based customer lifetime value ÷ fully loaded acquisition cost / 基于贡献毛利的顾客终身价值 ÷ 完全口径获客成本 | ≥3.00 strong / 强；1.00–2.99 caution / 谨慎；<1.00 critical / 严重 |
| Top-supplier share / 最大供应商占比 | Purchases from largest supplier ÷ total purchases / 最大供应商采购额 ÷ 总采购额 | ≤35% resilient / 有韧性；>35%–60% caution / 谨慎；>60% risk / 风险 |
| Inventory service / 库存服务水平 | Demand fulfilled in full ÷ total valid demand / 足量满足的有效需求 ÷ 总有效需求 | ≥95% strong / 强；90%–94.99% caution / 谨慎；<90% risk / 风险 |

Boundary convention / 边界规则：

- A value exactly on a stated inclusive boundary belongs to the more favourable band only where the table uses `≥` or `≤`.
- Percentages are calculated from unrounded values.
- The system must display the formula inputs and period.
- “Rent” means the configured occupancy-cost definition and must disclose whether service charges, common-area charges, tax, and turnover rent are included.
- CLV and CAC must use consistent cohorts and contribution-margin logic; revenue-only CLV is not comparable.

## 8. Evidence confidence / 证据置信度

Evidence confidence is reported separately from commercial performance:

\[
EC=0.45R+0.35Q+0.20K
\]

where:

- \(R\) = required-field completeness, 0–100.
- \(Q\) = evidence quality, 0–100.
- \(K\) = cross-field consistency, 0–100.

其中：

- \(R\) = 必填字段完整度，0–100。
- \(Q\) = 证据质量，0–100。
- \(K\) = 跨字段一致性，0–100。

### Completeness / 完整度

\[
R=100\times\frac{\text{completed applicable required fields}}{\text{all applicable required fields}}
\]

A field marked `UNKNOWN` is not complete. A system-validated `N/A` is removed from both numerator and denominator.

标记为 `UNKNOWN` 的字段不算完成。经系统逻辑确认的 `N/A` 同时从分子和分母移除。

### Evidence quality / 证据质量

Each material evidence item receives a deterministic quality level. The dimension-level result is weighted by the materiality of the claim.

每项重大证据都获得程序化质量等级；维度结果按该主张的重要性加权。

| Quality score / 质量分 | Evidence type / 证据类型 |
|---:|---|
| 100 | Current, traceable, decision-specific primary or audited evidence / 当前、可追溯、与决策直接相关的原始或审计证据 |
| 75 | Current, reputable external source or controlled internal measurement / 当前可信外部来源或受控内部测量 |
| 50 | Reasonable estimate with method, date, unit, and owner disclosed / 披露方法、日期、单位与负责人的合理估算 |
| 25 | Undated, weakly sourced, anecdotal, or not decision-specific / 无日期、来源薄弱、轶事或与决策不直接相关 |
| 0 | No evidence, unverifiable source, or evidence contradicted by a stronger source / 无证据、无法核验或被更强证据否定 |

Freshness is assessed relative to the factor. A licence rule or tax rate may require immediate refresh; a stable internal process description may remain useful for longer. The course materials themselves are theory sources, not live country data.

时效性按因素判断。牌照或税率可能必须立即刷新；稳定的内部流程说明可在更长时间内有效。课程资料本身是理论来源，不是实时国家数据。

### Cross-field consistency / 跨字段一致性

Consistency checks compare related fields, for example:

- price × units against stated sales;
- sales, COGS, and gross margin;
- fixed cost, contribution margin, and break-even sales;
- cash, burn, and runway;
- channel mix totals;
- supplier shares and totals;
- physical/digital format against activated fields;
- target country against currency, tax, licence, and data-flow answers;
- customer promise against inventory, fulfilment, staffing, and service capacity.

一致性检查对比相互关联的字段，例如：

- 价格 × 销量与申报销售额；
- 销售额、销售成本与毛利；
- 固定成本、贡献毛利与盈亏平衡销售额；
- 现金、月度消耗与现金跑道；
- 渠道占比合计；
- 供应商占比与总额；
- 实体或线上模式与被启用字段；
- 目标国家与币种、税务、牌照及数据流；
- 顾客承诺与库存、履约、人员及服务能力。

RetailLens records each contradiction. It does not let AI “explain away” a failed arithmetic or logical check.

RetailLens 会记录每项矛盾，不允许 AI 用文字“解释掉”算术或逻辑检查失败。

## 9. Country attractiveness, firm readiness, and entry-mode fit / 国家吸引力、企业准备度与进入模式匹配度

### 9.1 Country attractiveness / 国家吸引力

Country attractiveness uses external factors only: target-segment demand, category economics, political/legal environment, competitive structure, customer-cultural fit, channel/site environment, infrastructure and logistics, and achievable local unit economics.

国家吸引力只使用外部因素：目标细分需求、品类经济、政治法律环境、竞争结构、顾客文化匹配、渠道与点位环境、基础设施与物流、可实现的本地单位经济。

For external factor \(j\):

\[
CA=\frac{\sum_j c_jA_j}{\sum_j c_j}
\]

where \(A_j\) is the normalized 0–100 attractiveness of the external factor and \(c_j\) is its declared importance. Country attractiveness is **not** an EFE score: EFE rates the effectiveness of the firm's current response, while \(CA\) rates the market condition itself.

其中 \(A_j\) 是外部因素的 0–100 吸引力标准分，\(c_j\) 是公开的重要度。国家吸引力**不是** EFE 分数：EFE 评价企业现有战略的应对效果，而 \(CA\) 评价市场条件本身。

### 9.2 Firm readiness / 企业准备度

Firm readiness uses internal factors only: capital, retail capabilities, brand and differentiation, merchandise and supplier capabilities, systems and data, local management, governance, HR, controls, and contingency capacity.

企业准备度只使用内部因素：资本、零售能力、品牌与差异化、商品和供应商能力、系统与数据、本地管理、治理、人力资源、控制与应急能力。

\[
FR=\frac{\sum_k r_kR_k}{\sum_k r_k}
\]

where \(R_k\) is the normalized 0–100 readiness rating and \(r_k\) is its declared importance. Firm readiness may use the same evidence as IFE, but the 0–100 score does not replace the source-defined IFE scale.

其中 \(R_k\) 为 0–100 准备度评分，\(r_k\) 为公开的重要度。企业准备度可使用与 IFE 相同的证据，但 0–100 分数不会替代课程定义的 IFE 量表。

### 9.3 Entry-mode fit / 进入模式匹配度

Only modes that pass relevant hard gates are compared. Candidate modes may include organic/greenfield growth, export-led supply, franchise, licensing, joint venture, minority equity, acquisition, and wholly owned operation.

只有通过相关硬门槛的模式才进入比较。候选模式可包括自建增长、出口供货、特许经营、许可、合资、少数股权、收购与全资经营。

For candidate mode \(m\):

\[
EMF_m=\frac{\sum_l e_lF_{l,m}}{\sum_l e_l}
\]

Fit criteria include legal availability, cultural/adaptation need, desired control, IP and brand exposure, capital, risk tolerance, speed, local knowledge, partner availability and quality, channel/site access, supply-chain feasibility, governance, repatriation, and exit flexibility.

匹配标准包括法律可用性、文化与适配需求、控制要求、知识产权和品牌暴露、资本、风险承受、速度、本地知识、伙伴可得性与质量、渠道点位、供应链可行性、治理、利润汇回与退出灵活性。

`GM10-C12-S27` provides a useful 2×2 starting hypothesis:

| Cultural distance / 文化距离 | Easier market entry / 较易进入 | Difficult market entry / 较难进入 |
|---|---|---|
| Close / 接近 | Organic growth / 自建增长 | Chain acquisition / 收购连锁 |
| Distant / 差异大 | Franchise / 特许经营 | Joint venture or licensing / 合资或许可 |

This matrix is a starting hypothesis, not an automatic answer. “Easy/difficult” must be established from regulation, competition, commercial-space and channel access, infrastructure, capital, partners, and supply chain. Cultural distance means adaptation requirements in customer behaviour, language, service, and management; it is not a good-country/bad-country judgement. `GM10-C09` adds the involvement-and-cost continuum, while `IM12Q-C09` and `IM12Q-C10` add control, partner, and political-risk considerations.

该矩阵只是起点，不会自动给出答案。“容易或困难”必须根据监管、竞争、商业空间与渠道、基础设施、资本、伙伴及供应链判断。文化距离表示顾客行为、语言、服务与管理的适配要求，不是“好国家或坏国家”的判断。`GM10-C09` 补充参与度与成本连续体；`IM12Q-C09` 与 `IM12Q-C10` 补充控制、伙伴与政治风险因素。

Country attractiveness, firm readiness, and entry-mode fit are displayed side by side. They are not added to the ten-dimension performance score because doing so would double-count many drivers.

国家吸引力、企业准备度与进入模式匹配度并列显示，不与十维经营分相加，以避免同一驱动因素被重复计分。

## 10. EFE, IFE, IE, and QSPM / EFE、IFE、IE 与 QSPM

These matrices follow their course-defined scales. They are separate analytical tools, not aliases for the RetailLens 0–100 score.

这些矩阵遵循课程定义量表，是独立分析工具，不是 RetailLens 0–100 分数的另一种写法。

### 10.1 EFE — External Factor Evaluation / 外部因素评价矩阵

1. List material external opportunities and threats.
2. Assign importance weight \(w_i\) from 0.0 to 1.0; all EFE weights must sum to 1.00.
3. Assign a response rating: 4 = superior response, 3 = above-average response, 2 = average response, 1 = poor response.
4. Compute weighted score \(w_i\times rating_i\).
5. Sum weighted scores.

1. 列出重大外部机会与威胁。
2. 给予 0.0–1.0 的重要性权重 \(w_i\)，全部 EFE 权重合计必须为 1.00。
3. 给予应对评分：4 = 卓越应对，3 = 高于平均，2 = 平均，1 = 较差。
4. 计算加权分 \(w_i\times rating_i\)。
5. 汇总加权分。

The total ranges from 1.0 to 4.0; 2.5 is the course average reference. The rating measures the effectiveness of the firm's strategy response. It does **not** measure whether an opportunity is attractive or a threat is severe. Source: `SM-EXT-P47-P50`.

总分范围为 1.0–4.0，2.5 是课程平均基准。Rating 评价企业战略应对效果，**不**表示机会有多好或威胁有多严重。来源：`SM-EXT-P47-P50`。

### 10.2 IFE — Internal Factor Evaluation / 内部因素评价矩阵

1. List material internal strengths and weaknesses.
2. Assign importance weights summing to 1.00.
3. Rate each factor: 4 = major strength, 3 = minor strength, 2 = minor weakness, 1 = major weakness.
4. Compute and sum \(weight\times rating\).

1. 列出重大内部优势与劣势。
2. 给予重要性权重，合计为 1.00。
3. Rating：4 = 重大优势，3 = 次要优势，2 = 次要劣势，1 = 重大劣势。
4. 计算并汇总 \(weight\times rating\)。

The total ranges from 1.0 to 4.0; 2.5 is the course average reference. Source: `SM-INT`.

总分范围为 1.0–4.0，2.5 是课程平均基准。来源：`SM-INT`。

### 10.3 IE — Internal–External Matrix / 内外部矩阵

The IE Matrix uses IFE on the x-axis and EFE on the y-axis:

IE 矩阵以 IFE 为横轴、EFE 为纵轴：

| Axis band / 轴区间 | IFE x-axis / IFE 横轴 | EFE y-axis / EFE 纵轴 |
|---|---|---|
| 3.00–4.00 | Strong, left / 强，左侧 | High, top / 高，上方 |
| 2.00–2.99 | Average, middle / 平均，中间 | Medium, middle / 中间 |
| 1.00–1.99 | Weak, right / 弱，右侧 | Low, bottom / 低，下方 |

| Cells / 单元格 | Region / 区域 | Course strategy direction / 课程战略方向 |
|---|---|---|
| I, II, IV | Grow and build / 增长与建立 | Integration or intensive strategies / 一体化或密集型战略 |
| III, V, VII | Hold and maintain / 保持与维持 | Commonly market penetration or product development / 通常为市场渗透或产品开发 |
| VI, VIII, IX | Harvest or divest / 收获或剥离 | Retrenchment, divestiture, or other defensive choice as justified / 依据情况采取紧缩、剥离或其他防御选择 |

The strong IFE side is on the **left**, not the right. IE is a post-analysis strategic-positioning tool, not a country-entry gate and not a substitute for retail unit economics. Source: `SM-FORM-P35-P37`.

IFE 强的一侧在**左边**，不是右边。IE 是分析后的战略定位工具，不是国家进入硬门槛，也不能替代零售单位经济分析。来源：`SM-FORM-P35-P37`。

### 10.4 QSPM — Quantitative Strategic Planning Matrix / 定量战略规划矩阵

QSPM compares at least two feasible alternatives after the input and matching stages:

QSPM 在输入与匹配阶段之后比较至少两个可行方案：

1. Carry forward the material EFE opportunities/threats and IFE strengths/weaknesses.
2. Reuse their EFE/IFE weights; do not invent a new importance weight for QSPM.
3. Compare only feasible alternatives produced by matching analysis.
4. For a factor that affects the choice, assign an Attractiveness Score (AS): 1 = not attractive, 2 = somewhat attractive, 3 = reasonably attractive, 4 = highly attractive.
5. \(TAS_{i,m}=weight_i\times AS_{i,m}\).
6. Sum TAS by strategy. The higher total is relatively more attractive within that comparison.

1. 沿用 EFE 的机会威胁与 IFE 的优势劣势。
2. 沿用 EFE/IFE 权重，不为 QSPM 重新发明重要性权重。
3. 只比较匹配阶段产生的可行方案。
4. 若某因素会影响选择，则给予吸引力分数 AS：1 = 不具吸引力，2 = 略具吸引力，3 = 较有吸引力，4 = 很有吸引力。
5. \(TAS_{i,m}=weight_i\times AS_{i,m}\)。
6. 按战略汇总 TAS；较高总分只表示在本次比较中相对更有吸引力。

Following the supplied course deck, a row is left blank when it has no relative bearing on the alternatives; the deck also instructs users not to score a factor when only one strategy can address it and not to assign equal AS to compared alternatives on a scored row. The report must identify judgement-based AS values and their evidence.

按照所提供课程课件，若某因素对方案之间没有相对影响，则该行留空；课件也要求，当只有一个战略能处理该因素时不评分，并且在已评分行中不向被比较方案给予相同 AS。报告必须标明基于判断的 AS 及其证据。

QSPM has **no absolute pass score**. It ranks alternatives only, is only as good as its input and matching analysis, and cannot override a hard gate. Source: `SM-FORM-P43-P50`.

QSPM **没有绝对合格线**。它只用于方案相对排序，质量取决于前置输入与匹配分析，并且不能覆盖硬门槛。来源：`SM-FORM-P43-P50`。

## 11. Source-defined values versus internal screens / 课程定义数值与内部筛选线

| Type / 类型 | Values / 数值 | Allowed interpretation / 合法解释 |
|---|---|---|
| Source-defined / 课程定义 | EFE/IFE weights sum 1.00; ratings 1–4; total 1–4; 2.5 average reference / EFE/IFE 权重合计 1.00、Rating 1–4、总分 1–4、2.5 平均基准 | Use exactly for EFE/IFE / 仅按 EFE/IFE 原义使用 |
| Source-defined / 课程定义 | IE bands 1.00–1.99, 2.00–2.99, 3.00–4.00 and cell regions / IE 区间及单元格区域 | Strategy positioning after IFE/EFE / IFE/EFE 后的战略定位 |
| Source-defined / 课程定义 | QSPM AS 1–4 and relative TAS comparison / QSPM AS 1–4 与相对 TAS | Relative alternative ranking only / 只做方案相对排序 |
| RetailLens internal / 系统内部 | Ten weights, digital redistribution, 0–100 bands / 十维权重、纯线上重分配、0–100 区间 | Versioned screening configuration / 版本化筛选配置 |
| RetailLens internal / 系统内部 | Break-even coverage, rent-to-sales, runway, CLV:CAC, supplier concentration, service-level screens / 盈亏覆盖、租售比、现金跑道、CLV:CAC、供应商集中度与服务水平线 | Configurable alerts, not universal facts / 可配置预警，不是通用事实 |
| RetailLens internal / 系统内部 | Five Forces and STP 0–100 conversions; entry-mode MCDA weights and `<5` near-tie rule / 五力与 STP 的 0–100 换算、进入模式 MCDA 权重与 `<5` 近似平局规则 | Versioned diagnostic controls, not source-defined or consulting-industry thresholds / 版本化诊断控制，不是课件或咨询行业通用阈值 |
| Formula only / 仅公式 | SPM ratios, GMROI, organization coverage, inherent/residual risk / 战略利润模型比率、GMROI、组织覆盖率、固有与残余风险 | Calculate from submitted data; do not create a universal pass line / 只按提交数据计算，不创造通用合格线 |

Financial ratios presented in the course should be compared over time and against like-for-like competitors or sector norms. The source provides formulas, not universal pass/fail cutoffs. RetailLens must not label an internal threshold as “from the PPT.”

课程中的财务比率应做纵向比较，并与同类竞争者或行业基准比较。课程提供公式，但没有提供通用通过或失败线。RetailLens 不得把内部筛选线标注成“来自 PPT”。

## 12. AI role and deterministic controls / AI 角色与程序化控制

The deterministic engine owns:

- required-field and language validation;
- hard-gate status;
- input arithmetic and consistency checks;
- conditional weight profile;
- all subcriteria, dimension, performance, confidence, country-attractiveness, firm-readiness, and entry-fit numbers;
- score bands and internal threshold flags;
- EFE, IFE, IE, and QSPM calculations.
- all eight enterprise theory modules, their statuses, evidence requirements, formulas, source handles, and internal-rule disclaimers.

程序化引擎负责：

- 必填字段与语言验证；
- 硬门槛状态；
- 输入算术与一致性检查；
- 条件权重配置；
- 全部子指标、维度、经营、置信度、国家吸引力、企业准备度与进入匹配数字；
- 分数区间与内部筛选线预警；
- EFE、IFE、IE 与 QSPM 计算。
- 八个企业理论模块及其状态、证据要求、公式、来源句柄与内部规则免责声明。

The AI may:

- explain the deterministic result in Chinese or English;
- explain the locked eight-module theory assessment in Chinese or English;
- summarize strengths, weaknesses, evidence gaps, and contradictions;
- connect observations to course frameworks using evidence handles;
- propose prioritized improvement actions, owners, KPIs, experiments, and review triggers;
- compare scenarios without altering the submitted scenario values.

AI 可以：

- 用中文或英文解释程序化结果；
- 用中文或英文解释已经锁定的八模块理论评估；
- 总结优势、劣势、证据缺口与矛盾；
- 用证据编号把观察结果连接到课程框架；
- 提出有优先级的改进措施、负责人、KPI、实验与复核触发点；
- 在不修改用户情景数值的前提下比较情景。

The AI may **not**:

- change a deterministic number, weight, band, matrix cell, gate, or threshold result;
- change an enterprise-module status, formula output, relative rank, evidence requirement, or internal disclaimer;
- invent missing business data, legal status, competitor facts, sources, or citations;
- turn a low-confidence claim into a confirmed fact;
- create an unsupported third language;
- recommend bypassing law, safety, ethics, sanctions, or privacy duties.

AI **不得**：

- 修改任何程序化数值、权重、区间、矩阵单元格、硬门槛或筛选线结果；
- 修改任何企业模块状态、公式结果、相对排名、证据要求或内部免责声明；
- 捏造缺失商业数据、法律状态、竞争事实、来源或引用；
- 把低置信度主张写成确定事实；
- 生成未经支持的第三语言；
- 建议绕过法律、安全、伦理、制裁或隐私义务。

The AI receives two read-only snapshots: the locked 100-point assessment and the locked eight-module enterprise theory assessment. Its output is narrative only. If AI is unavailable, both deterministic assessments remain usable. Any AI statement that conflicts with either snapshot is discarded or flagged.

AI 接收两份只读快照：已锁定的 100 分评估与已锁定的八模块企业理论评估。AI 输出只属于文字解释。即使 AI 不可用，两套程序化评估仍可使用。任何与任一快照冲突的 AI 陈述都应被丢弃或标记。

## 13. Known course-data cautions / 课程资料已知注意事项

**Non-negotiable freshness rule / 不可例外的时效规则：** historical company, country, legal, market, transaction, and financial examples in the course files may demonstrate a framework or serve as calculation fixtures, but they must never be treated as a user's current benchmark. Current decisions require dated, authoritative, jurisdiction- and unit-specific evidence.

课程文件中的历史公司、国家、法律、市场、交易与财务案例只能用于说明框架或作为计算测试数据，绝不能作为用户当前评估的 benchmark。当前决策必须采用具日期、权威性、适用法域与计量单位的最新证据。

1. **EFE wording typo / EFE 用词笔误：** `SM-EXT-P48` says an outstanding response to “threats and weaknesses.” EFE concerns external opportunities and threats; “weaknesses” is incorrect here.
2. **SPACE arithmetic typo / SPACE 算术笔误：** the example lists Stability Position items totalling −16 and a result of −3.2, but prints −14/5. The consistent calculation is −16/5 = −3.2.
3. **Filename/content mismatches / 文件名与内容编号不一致：** `LECTURE 2 - CHAPTER 2 - NOR LIZA 2024.pdf` contains Vision and Mission Analysis, Chapter Five; `LECTURE 5 - CHAPTER 5 - NOR LIZA 2024.pdf` contains Types of Strategies, Chapter Four. Evidence handles follow content, not the misleading filename number.
4. **Historical country and retailer examples / 历史国家与零售案例：** country rankings, tax rates, political conditions, retailer rankings, store counts, market shares, and company cases dated roughly 2014–2021 are teaching snapshots, not current operating facts.
5. **Stale legal reference / 已过时法律引用：** any Privacy Shield reference in the decks must not be treated as current privacy law. Current data-transfer, privacy, and localization rules require live verification.
6. **Illustrative figures / 案例数字：** the cinema EFE growth figures, the 15–20% convenience-store markup, cited lean-efficiency gains, expatriate cost/failure figures, and similar numbers are examples, not scoring thresholds.
7. **Culture / 文化：** Hofstede, Trompenaars, GLOBE, leadership, and motivation examples are used to identify adaptation questions. Raw national culture scores are not “good/bad country” points and must not become stereotypes about an individual customer or employee.
8. **Named historical fixtures / 具名历史测试案例：** Target/Walmart FY2020 ratios, example bakery/canned-food GMROI values, old India/China/Russia retail shares, historical population/market-size tables, past JV/acquisition cases, BlackBerry and Exxon/Rosneft facts, cinema EFE/CPM, retail-computer QSPM, and the Apple circa-2015 exercise are not current benchmarks.

## 14. Reporting contract / 报告输出规范

Every final report must show:

- selected language and explicit “Chinese and English only / 仅支持中文与英文” notice;
- assessment version, weight profile, currency, target geography, and data cutoff date;
- management recommendation (`PROCEED`, `PROCEED CONDITIONALLY`, `PAUSE`, or `STOP`) with the exact deterministic rule and preconditions;
- decision readiness and evidence quality as separate audit signals;
- a five-branch MECE issue tree with testable hypothesis status and source handles;
- hard-gate table before any score;
- ten dimension scores, weights, contributions, and evidence handles;
- performance score and band;
- evidence confidence with \(R\), \(Q\), and \(K\) components;
- country attractiveness, firm readiness, and entry-mode fit as separate views;
- internal-screen flags labelled “RetailLens internal, configurable”;
- EFE/IFE/IE/QSPM only when required inputs are present;
- the eight enterprise theory modules with module status, formula, raw structured result, evidence requirements, source handles, and internal-rule disclaimer;
- top strengths, weaknesses, contradictions, assumptions, and missing evidence;
- downside/base/upside scenarios with calculation basis, trigger, and management response;
- an outcome/driver/guardrail KPI tree with formula, target basis, owner, and cadence;
- prioritized 30/60/90-day workstreams with risk level, owner, exit criteria, and source handles;
- AI narrative clearly labelled and prohibited from changing deterministic results.

每份正式报告必须显示：

- 所选语言及“仅支持中文与英文”声明；
- 评估版本、权重配置、币种、目标地区与数据截止日期；
- 管理层建议（推进、有条件推进、暂停或停止）、采用的确切程序化规则及推进前置条件；
- 分开呈现的决策就绪度与证据质量；
- 带可验证假设状态与来源句柄的五分支 MECE 问题树；
- 位于所有分数之前的硬门槛表；
- 十个维度的分数、权重、贡献与证据编号；
- 经营总分与分数区间；
- 证据置信度及 \(R\)、\(Q\)、\(K\) 三个组成部分；
- 分开呈现的国家吸引力、企业准备度与进入模式匹配度；
- 标为“RetailLens 内部、可配置”的内部筛选线预警；
- 只在输入充分时生成 EFE/IFE/IE/QSPM；
- 八个企业理论模块，并显示模块状态、公式、结构化计算结果、证据要求、来源句柄与内部规则免责声明；
- 主要优势、劣势、矛盾、假设与缺失证据；
- 带计算依据、触发点与管理动作的下行/基准/上行情景；
- 带公式、目标依据、负责人及复核节奏的结果/驱动/护栏 KPI 树；
- 带风险等级、负责人、退出标准与来源句柄的 30/60/90 天优先工作流；
- 清晰标记的 AI 解读，并明确 AI 不得修改程序化结果。

## 15. Governance and change control / 治理与变更控制

Any change to required fields, hard gates, weights, scoring anchors, enterprise-module formulas or statuses, score bands, or internal guardrails requires:

1. a new methodology/configuration version;
2. a written reason and effective date;
3. regression tests using fixed bilingual cases;
4. confirmation that Chinese and English produce identical numbers;
5. migration rules for old assessments;
6. source-map updates where course interpretation changes.

任何对必填字段、硬门槛、权重、评分锚点、企业模块公式或状态、分数区间或内部筛选线的修改都必须：

1. 发布新的方法或配置版本；
2. 记录修改原因与生效日期；
3. 使用固定中英文案例进行回归测试；
4. 确认中英文模式计算结果完全一致；
5. 为旧评估规定迁移规则；
6. 若课程解释改变，同步更新来源映射。

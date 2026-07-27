# RetailLens Source and Evidence Map / RetailLens 来源与证据映射

Version / 版本：1.0

Original course corpus / 原始课程资料库：used during methodology development but intentionally not included in this public repository / 在方法开发阶段使用，但有意不包含在本公开仓库中

## 1. Purpose / 用途

This file identifies which supplied course files are canonical, which are duplicates or translations, and how each source family informs RetailLens. It is a provenance map, not a reproduction of the copyrighted slides or books.

本文件说明所提供课程资料中哪些属于规范来源、哪些属于重复或翻译副本，以及各来源如何映射到 RetailLens。它是来源追踪表，不复制受版权保护的课件或教材正文。

Source priority / 来源优先级：

1. Original course PPTX/PDF and instructor deck / 原始课程 PPTX、PDF 与教师课件。
2. Course question banks and worked exercises for interpretation checks / 题库与练习，用于核对概念应用。
3. Chinese translations, revision decks, champion notes, class screenshots, and summaries for terminology/search only / 中文翻译、复习课件、状元笔记、课堂截图与总结只用于术语和检索。
4. Current external primary evidence for live country, law, tax, market, competitor, and company facts / 涉及当前国家、法律、税务、市场、竞争者与企业事实时，必须补充当前外部原始证据。

When sources conflict, the original course source controls the course interpretation. A current authoritative external source controls live facts. A translated or summarized copy never overrides its original.

若来源冲突，课程概念以原始课程资料为准；实时事实以当前权威外部原始来源为准；翻译或总结副本不得覆盖原文。

## 2. Evidence-handle convention / 证据编号规则

RetailLens reports cite compact handles rather than embedding long slide text.

RetailLens 报告使用简短证据编号，不嵌入大段课件原文。

| Pattern / 格式 | Meaning / 含义 | Example / 示例 |
|---|---|---|
| `RM11-Cnn` | Retailing Management, 11th edition, chapter / 零售管理第 11 版章节 | `RM11-C06` |
| `RM11-Cnn-Snn` | Exact retail slide when verified / 已核对的零售课件页 | `RM11-C06-S12` |
| `SM-<topic>` | Strategic Management lecture by content / 战略管理课程主题 | `SM-EXT` |
| `SM-<topic>-Pnn` | Exact PDF page / PDF 页 | `SM-EXT-P48` |
| `GM10-Cnn` | Global Marketing, 10th edition, chapter / 全球营销第 10 版章节 | `GM10-C12` |
| `GM10-Cnn-Snn` | Exact slide / 幻灯片页 | `GM10-C12-S27` |
| `IM12Q-Cnn` | International Management 12e question-bank chapter / 国际管理第 12 版题库章节 | `IM12Q-C10` |
| `IM11-Cnn` | International Management 11e instructor deck / 国际管理第 11 版教师课件 | `IM11-C14` |
| `DER-*` | Derived translation, note, or revision aid / 翻译、笔记或复习衍生资料 | `DER-3363-CH06-ZH` |

Rules / 规则：

- A chapter-level handle supports a framework or topic, not an unverified verbatim quote.
- Exact page or slide locators are added only after inspection.
- Each stored evidence item should also retain source path, source version, locator, paraphrased claim, extraction date, and freshness status.
- Derived handles may help terminology, but they cannot be the only evidence for a deterministic rule.

- 章节级编号只支持框架或主题，不能支持未经核对的逐字引文。
- 只有完成核对后才能添加精确页码。
- 每项证据还应保存来源路径、版本、页码、释义后的主张、提取日期与时效状态。
- 衍生资料可辅助术语，但不能成为程序化规则的唯一依据。

## 3. Canonical retail-management sources / 规范零售管理来源

Canonical directory / 规范目录：`3363/`

| Handle / 编号 | Canonical file / 规范文件 | Chapter title / 章节主题 | RetailLens mapping / 系统映射 |
|---|---|---|---|
| `RM11-C01` | `3363/Levy_11e_PPT_Ch01_ACCESS_revised.pptx` | Introduction to the World of Retailing / 零售世界导论 | Scope, ecosystem, value creation, retail-model intake / 范围、生态、价值创造、零售模式填写 |
| `RM11-C02` | `3363/Levy_11e_PPT_Ch02_ACCESS.pptx` | Types of Retailers / 零售商类型 | `strategy_differentiation`, format classification / 战略差异化、业态分类 |
| `RM11-C03` | `3363/Levy_11e_PPT_Ch03_ACCESS.pptx` | Digital Retailing / 数字零售 | `channels_digital`, digital-only conditional profile / 渠道数字化、纯线上条件配置 |
| `RM11-C04` | `3363/Levy_11e_PPT_Ch04_ACCESS.pptx` | Multichannel and Omnichannel Retailing / 多渠道与全渠道零售 | `channels_digital`, channel roles, customer journey / 渠道数字化、渠道角色、顾客旅程 |
| `RM11-C05` | `3363/Levy_11e_PPT_Ch05_ACCESS.pptx` | Consumer Behavior / 消费者行为 | `market_customer`, buying process, customer evidence / 市场顾客、购买过程、顾客证据 |
| `RM11-C06` | `3363/Levy_11e_PPT_Ch06_ACCESS.pptx` | Retail Market Strategy / 零售市场战略 | `strategy_differentiation`, target market, advantage, growth / 战略差异化、目标市场、优势、增长 |
| `RM11-C07` | `3363/Levy_11e_PPT_Ch07_ACCESS.pptx` | Financial Strategy / 财务战略 | `financial_unit_economics`, retail financial logic / 财务与单位经济、零售财务逻辑 |
| `RM11-C08` | `3363/Levy_11e_PPT_Ch08_ACCESS.pptx` | Retail Locations / 零售区位 | `location_trade_area`, location type and fit / 选址商圈、区位类型与匹配 |
| `RM11-C09` | `3363/Levy_11e_PPT_Ch09_ACCESS.pptx` | Retail Site Location / 零售点位选择 | `location_trade_area`, catchment, demand, site comparison / 选址商圈、商圈需求、点位比较 |
| `RM11-C10` | `3363/Levy_11e_PPT_Ch10_ACCESS.pptx` | Information Systems and Supply Chain Management / 信息系统与供应链管理 | `merchandise_supply_chain`, `channels_digital`, data and fulfilment / 商品供应链、渠道数字化、数据与履约 |
| `RM11-C11` | `3363/Levy_11e_PPT_Ch11_ACCESS.pptx` | Customer Relationship Management / 顾客关系管理 | `marketing_crm_service`, retention and customer value / 营销 CRM 服务、留存与顾客价值 |
| `RM11-C12` | `3363/Levy_11e_PPT_Ch12_ACCESS.pptx` | Managing the Merchandise Planning Process / 商品规划流程管理 | `merchandise_supply_chain`, inventory and planning / 商品供应链、库存与规划 |
| `RM11-C13` | `3363/Levy_11e_PPT_Ch13_ACCESS.pptx` | Buying Merchandise / 商品采购 | `merchandise_supply_chain`, supplier and buying process / 商品供应链、供应商与采购流程 |
| `RM11-C14` | `3363/Levy_11e_PPT_Ch14_ACCESS.pptx` | Retail Pricing / 零售定价 | `financial_unit_economics`, `strategy_differentiation`, price architecture / 财务单位经济、战略差异化、价格体系 |
| `RM11-C15` | `3363/Levy_11e_PPT_Ch15_ACCESS.pptx` | Retail Communication Mix / 零售传播组合 | `marketing_crm_service`, acquisition and communication / 营销 CRM 服务、获客与传播 |
| `RM11-C16` | `3363/Levy_11e_PPT_Ch16_ACCESS.pptx` | Human Resources and Managing the Store / 人力资源与门店管理 | `organization_execution`, store controls and staffing / 组织执行、门店控制与人员 |
| `RM11-C17` | `3363/Levy_11e_PPT_Ch17_ACCESS.pdf` | Store Layout, Design, and Visual Merchandising / 门店布局、设计与视觉陈列 | `location_trade_area`, physical customer journey, store capacity / 选址商圈、实体顾客旅程、门店容量 |
| `RM11-C18` | `3363/Levy_11e_PPT_Ch18_ACCESS.pptx` | Customer Service / 顾客服务 | `marketing_crm_service`, service promise, recovery and returns / 营销 CRM 服务、服务承诺、补救与退货 |

The ten RetailLens dimensions are a system synthesis of these chapters; the course does not prescribe the system's 100-point weighting.

RetailLens 十维评分是对这些章节的系统化综合；课程本身没有规定本系统的 100 分权重。

## 4. Canonical strategic-management sources / 规范战略管理来源

The handle follows the **content title**, because two filenames contain misleading chapter numbers.

编号依据**文件实际内容标题**，因为其中两个文件名的章节编号具有误导性。

| Handle / 编号 | Canonical file / 规范文件 | Content / 内容 | RetailLens mapping / 系统映射 |
|---|---|---|---|
| `SM-ESS` | `4014/LECTURE 1 - CHAPTER 1 - NOR LIZA 2024.pdf` | Strategic Management Essentials / 战略管理基础 | Assessment flow, formulation–implementation–evaluation cycle / 评估流程、制定执行评价循环 |
| `SM-VIS` | `4014/LECTURE 2 - CHAPTER 2 - NOR LIZA 2024.pdf` | Vision and Mission Analysis, content Chapter Five / 愿景使命分析，内容为第五章 | Purpose, customer, market, technology, concern for survival/growth/profitability / 目的、顾客、市场、技术、生存增长盈利 |
| `SM-INT` | `4014/4014期末重点看/LECTURE 3 - CHAPTER 6 - NOR LIZA 2024.pdf` | Internal Audit / 内部审计 | Firm readiness, value chain, management, marketing, finance, operations, R&D, MIS, IFE / 企业准备度、价值链及 IFE |
| `SM-EXT` | `4014/4014期末重点看/LECTURE 4 - CHAPTER 3 - NOR LIZA 2024.pdf` | External Audit / 外部审计 | Country attractiveness, macro forces, Five Forces, EFE, CPM / 国家吸引力、宏观因素、五力、EFE、CPM |
| `SM-TYPES` | `4014/4014期末重点看/LECTURE 5 - CHAPTER 5 - NOR LIZA 2024.pdf` | Types of Strategies, content Chapter Four / 战略类型，内容为第四章 | Integration, intensive, diversification, defensive, generic strategy, alliance/acquisition / 一体化、密集、多元、防御、通用战略、联盟收购 |
| `SM-FORM` | `4014/4014期末重点看/LECTURE 6 - CHAPTER 8 - NOR LIZA 2021 complete.pdf` | Strategy Generation and Selection / 战略生成与选择 | SWOT, SPACE, BCG, IE, Grand Strategy, QSPM / SWOT、SPACE、BCG、IE、大战略、QSPM |
| `SM-EXEC-ORG` | `4014/LECTURE 7 - CHAPTER 10 - NOR LIZA 2020.pdf` | Strategy Execution / 战略执行 | Objectives, policies, resources, structure, operations, HR / 目标、政策、资源、结构、运营、人力 |
| `SM-EXEC-FIN` | `4014/LECTURE 8 - CHAPTER 9 - NOR LIZA 2020.pdf` | Strategy Implementation / 战略实施 | Segmentation, positioning, finance, projected statements, R&D, MIS / 细分、定位、财务、预测报表、研发、MIS |
| `SM-MON` | `4014/LECTURE 9 - CHAPTER 11 - NOR LIZA 2020 (1) (1).pdf` | Strategy Monitoring / 战略监控 | Consistency, consonance, advantage, feasibility, scorecard, contingency, corrective action / 一致性、协调性、优势、可行性、计分卡、应急、纠正 |
| `SM-ETH` | `4014/LECTURE 10 - CHAPTER 3 NOR LIZA 2022.pdf` | Ethics, Social Responsibility, and Sustainability / 伦理、社会责任与可持续性 | Ethics hard gates, anti-bribery, stakeholder and sustainability risk / 伦理硬门槛、反贿赂、利益相关者与可持续风险 |
| `SM-GLOBAL` | `4014/LECTURE 11 - CHAPTER 2 - NOR LIZA 2022.pdf` | Outside-USA Strategic Planning / 美国以外战略规划 | Global business context, language, tax, culture, country climate / 全球商业环境、语言、税务、文化、国家环境 |

High-value exact locators / 关键精确页码：

| Handle / 编号 | Rule or model / 规则或模型 |
|---|---|
| `SM-EXT-P47-P50` | EFE purpose, steps, and cinema example / EFE 用途、步骤与影院案例 |
| `SM-INT-P46-P50` | Financial-ratio formulas and contextual interpretation / 财务比率公式与情境化解释 |
| `SM-FORM-P35-P37` | IE dimensions and matrix / IE 维度与矩阵 |
| `SM-FORM-P43-P50` | QSPM definition, steps, limitations, and retail-computer example / QSPM 定义、步骤、局限与零售电脑案例 |
| `SM-MON-P5-P6` | Consistency, consonance, advantage, and feasibility / 一致性、协调性、优势与可行性 |

## 5. Global-marketing sources / 全球营销来源

Canonical directory / 规范目录：`4014/3424/`

| Handle / 编号 | File / 文件 | Chapter / 章节 | RetailLens mapping / 系统映射 |
|---|---|---|---|
| `GM10-C07` | `4014/3424/Chapter 7.pptx` | Segmentation, Targeting, and Positioning / 细分、目标与定位 | `market_customer`, `strategy_differentiation`, localization / 市场顾客、战略差异化、本地化 |
| `GM10-C08` | `4014/3424/Chapter 8.pptx` | Importing, Exporting, and Sourcing / 进口、出口与采购 | Cross-border landed cost, sourcing, logistics, FX, supply risk / 跨境到岸成本、采购、物流、外汇、供应风险 |
| `GM10-C09` | `4014/3424/Chapter 9.pptx` | Global Market-Entry Strategies / 全球市场进入战略 | Entry-mode candidates, control, cost, alliances, investment / 进入模式、控制、成本、联盟、投资 |
| `GM10-C12` | `4014/3424/Chapter 12.pptx` | Global Marketing Channels and Physical Distribution / 全球营销渠道与实体分销 | Channel structure, intermediaries, retail formats, distribution, entry-mode 2×2 / 渠道结构、中间商、零售业态、分销、进入模式 2×2 |
| `GM10-C15` | `4014/3424/Chapter 15.pptx` | Global Marketing and the Digital Revolution / 全球营销与数字革命 | Digital channel, payments/data/privacy questions, digital customer journey / 数字渠道、支付数据隐私问题、数字顾客旅程 |
| `GM10-C17` | `4014/3424/Chapter 17.pptx` | Leadership, Organization, and Corporate Social Responsibility / 领导、组织与企业社会责任 | `organization_execution`, `risk_sustainability`, global/local coordination / 组织执行、风险可持续、全球与本地协调 |

Key locators / 关键页码：

- `GM10-C07-S3-S30`: segmentation, targeting, positioning, and adaptation questions.
- `GM10-C08-S8` and `GM10-C08-S13-S34`: sourcing and cross-border operating considerations.
- `GM10-C09-S4-S39`: entry-mode involvement and investment continuum.
- `GM10-C12-S3-S34`: channels, intermediaries, global retail formats, and distribution.
- `GM10-C12-S27`: cultural-distance × entry-difficulty retail-entry matrix.
- `GM10-C15-S10-S26`: digital operating and market considerations.
- `GM10-C17-S4-S22`: organization, leadership, and CSR.

Historical retailer tables, market shares, store counts, markups, and country examples in these slides are not current benchmarks.

这些课件中的历史零售商排名、市场份额、门店数量、加价率与国家案例不是当前基准。

## 6. International-management and country-risk sources / 国际管理与国家风险来源

### 6.1 Doh 12e course question banks / Doh 第 12 版课程题库

Directory / 目录：`3414题/`

These DOCX files are question banks rather than full textbook chapters. They are useful for checking concepts and identifying assessment questions, but they are not live country databases.

这些 DOCX 是题库而非教材全文，适合核对概念与生成评估问题，但不是实时国家数据库。

| Handle / 编号 | File / 文件 | Main concept / 主要概念 | RetailLens mapping / 系统映射 |
|---|---|---|---|
| `IM12Q-C01` | `3414题/Doh12eCh01.docx` | Globalization and international linkages / 全球化与国际联系 | Country context and market-system questions / 国家环境与市场体系问题 |
| `IM12Q-C02` | `3414题/Doh12eCh02.docx` | Political, legal, and technological environment / 政治、法律与技术环境 | `country_compliance`, legal hard gates / 国家合规、法律硬门槛 |
| `IM12Q-C03` | `3414题/Doh12eCh03.docx` | Ethics, social responsibility, sustainability / 伦理、社会责任、可持续性 | Ethics hard gates and `risk_sustainability` / 伦理硬门槛与风险可持续 |
| `IM12Q-C04` | `3414题/Doh12eCh04.docx` | Meanings and dimensions of culture / 文化含义与维度 | Customer-cultural adaptation; stereotype guardrail / 顾客文化适配、防止刻板印象 |
| `IM12Q-C05` | `3414题/Doh12eCh05.docx` | Managing across cultures / 跨文化管理 | Localization and strategic disposition / 本地化与战略取向 |
| `IM12Q-C06` | `3414题/Doh12eCh06.docx` | Organizational culture and diversity / 组织文化与多样性 | `organization_execution`, collaboration / 组织执行、协作 |
| `IM12Q-C07` | `3414题/Doh12eCh07.docx` | Cross-cultural communication and negotiation / 跨文化沟通与谈判 | Marketing, service, partner communication / 营销、服务、伙伴沟通 |
| `IM12Q-C08` | `3414题/Doh12eCh08.docx` | International strategy formulation and implementation / 国际战略制定与实施 | Integration–responsiveness strategy, execution / 整合响应战略、执行 |
| `IM12Q-C09` | `3414题/Doh12eCh09.docx` | Entry strategies and organizational structures / 进入战略与组织结构 | Entry-mode fit, control, capital, partner form / 进入匹配、控制、资本、伙伴形式 |
| `IM12Q-C10` | `3414题/Doh12eCh10.docx` | Political risk, government relations, and alliances / 政治风险、政府关系与联盟 | Macro/micro political risk, ownership, transfer and operating exposure / 宏观微观政治风险、持股、资金转移与运营暴露 |
| `IM12Q-C11` | `3414题/Doh12eCh11.docx` | Management decision and control / 管理决策与控制 | Governance, centralization, controls, monitoring / 治理、集权、控制、监控 |
| `IM12Q-C12` | `3414题/Doh12eCh12.docx` | Motivation across cultures / 跨文化激励 | HR readiness; not a country-attractiveness score / 人力准备度，不作为国家吸引力分 |
| `IM12Q-C13` | `3414题/Doh12eCh13.docx` | Leadership across cultures / 跨文化领导 | Leadership readiness; not a national quality judgement / 领导准备度，不评价国家好坏 |
| `IM12Q-C14` | `3414题/Doh12eCh14.docx` | HR selection and development across cultures / 跨文化人员选拔与发展 | Staffing, training, expatriate/local talent readiness / 人员配置、培训、外派与本地人才准备 |

### 6.2 International Management 11e instructor decks / 国际管理第 11 版教师课件

Canonical directory despite its mixed folder name / 虽目录名称混合，以下文件仍作为规范课件：`4014期末复习笔记/3414期末/`

| Handle / 编号 | File / 文件 | RetailLens mapping / 系统映射 |
|---|---|---|
| `IM11-C07` | `Luthans_IM_11e_Chapter07.pptx` | Cross-cultural communication, customer/partner interaction / 跨文化沟通、顾客与伙伴互动 |
| `IM11-C11` | `Luthans_IM_11e_Chapter11.pptx` | Decision authority, controls, corrective action / 决策权、控制与纠正行动 |
| `IM11-C12` | `Luthans_IM_11e_Chapter12.pptx` | Motivation and workforce adaptation / 激励与人员适配 |
| `IM11-C13` | `Luthans_IM_11e_Chapter13.pptx` | Leadership readiness and local-management fit / 领导准备度与本地管理匹配 |
| `IM11-C14` | `Luthans_IM_11e_Chapter14.pptx` | Selection, training, expatriate/local staffing, retention / 选拔、培训、外派与本地人员、留存 |

Leadership and motivation content maps to **firm readiness**, not raw country attractiveness.

领导与激励内容映射到**企业准备度**，不能直接作为国家吸引力分。

## 7. Verified duplicates and translated derivatives / 已核对重复文件与翻译衍生资料

### 7.1 Byte-identical priority copies / 字节完全一致的重点副本

The following files under `3363重点看/` were SHA-256 checked and are byte-identical to their same-named canonical files under `3363/`:

以下 `3363重点看/` 文件经 SHA-256 核对，与 `3363/` 中同名规范文件字节完全一致：

- `Levy_11e_PPT_Ch02_ACCESS.pptx`
- `Levy_11e_PPT_Ch06_ACCESS.pptx`
- `Levy_11e_PPT_Ch08_ACCESS.pptx`
- `Levy_11e_PPT_Ch12_ACCESS.pptx`
- `Levy_11e_PPT_Ch13_ACCESS.pptx`
- `Levy_11e_PPT_Ch17_ACCESS.pdf`

They are convenience copies, not six additional independent sources. Reports cite the `RM11-*` canonical handles only.

它们只是方便复习的副本，不是六个额外独立来源。报告只引用规范 `RM11-*` 编号。

### 7.2 Chinese translated copies / 中文翻译副本

Directory / 目录：`3363重点看翻译版/`

| Derived handle / 衍生编号 | File / 文件 | Canonical parent / 规范母本 |
|---|---|---|
| `DER-3363-C02-ZH` | `Levy_11e_PPT_Ch02_ACCESS_中文翻译.pptx` | `RM11-C02` |
| `DER-3363-C06-ZH` | `Levy_11e_PPT_Ch06_ACCESS_中文翻译.pptx` | `RM11-C06` |
| `DER-3363-C08-ZH` | `Levy_11e_PPT_Ch08_ACCESS_中文翻译.pptx` | `RM11-C08` |
| `DER-3363-C12-ZH` | `Levy_11e_PPT_Ch12_ACCESS_中文翻译.pptx` | `RM11-C12` |
| `DER-3363-C13-ZH` | `Levy_11e_PPT_Ch13_ACCESS_中文翻译.pptx` | `RM11-C13` |
| `DER-3363-C17-ZH` | `Levy_11e_PPT_Ch17_ACCESS_中文翻译.pdf` | `RM11-C17` |

These copies support bilingual terminology. They do not create a second vote for a rule, and the English original controls if wording differs.

这些副本用于支持双语术语，不会让同一规则获得“双重证据”；若措辞不一致，以英文原版为准。

### 7.3 Revision notes and class summaries / 复习笔记与课堂总结

The following are secondary, derived aids:

- `3363重点看翻译版/3363上课总结汇总.docx`
- `3363重点看翻译版/EPPM3363_期末综合复习笔记_中英结合.docx`
- `3363重点看翻译版/Retailing_Management_Final_Exam_Master_Notes_Bilingual.docx`
- `状元笔记夹/EPPM3363_期末考试真状元笔记_中英结合_优化背诵版.docx`
- `状元笔记夹/EPPM3363_期末考试真状元笔记_中英结合_优化背诵版.pdf`
- `3363上课总结/3363上课总结汇总.html` and its supporting screenshots.
- `4014/EPPM4014_期末考试重点模型_中英结合.pptx`
- `4014/EPPM4014_期末考试重点模型_中英结合.pdf`
- `4014/EPPM4014_期末纯背诵判断清单.docx`
- `4014/EPPM4014_期末纯背诵判断清单.pdf`
- `4014期末复习笔记/EPPM4014_期末复习笔记_中英结合.docx`

Use / 用途：

- bilingual labels and search terms / 双语标签与检索词；
- locating likely canonical slides / 定位可能的原始课件页；
- identifying known course typos / 识别已知课件笔误。

Do not use / 禁止用途：

- independent corroboration of a rule already taken from its parent deck / 不能把母本规则再“独立验证”一次；
- live country or market evidence / 不能作为实时国家或市场证据；
- replacing the canonical source when wording differs / 不能在措辞冲突时替代规范来源。

## 8. Historical exercises and assessment materials / 历史练习与考核资料

| File group / 文件组 | Status / 状态 | Permitted use / 允许用途 |
|---|---|---|
| `4014/8e. EPPM4014. Exercise. APPLE Inc. SWOT + IE + CPM Analysis. ANSWER ####.pdf` | Historical worked example, centred on Apple 2015-era facts / 以 2015 年前后 Apple 数据为主的历史练习 | Matrix workflow and test fixtures only; never current Apple evidence / 只用于矩阵流程与测试，不能作为当前 Apple 事实 |
| `4014/4014期末真题2022_可编辑版.docx` | Exam material / 考试材料 | Test cases for factor classification and calculations / 用作因素分类与计算测试案例 |
| `3414题/Doh12eCh01–14.docx` | Question banks / 题库 | Concept checks and question design; not empirical thresholds / 概念核对与问题设计，不提供实证阈值 |

## 9. Source-to-system module map / 来源到系统模块映射

| System module / 系统模块 | Primary handles / 主要证据编号 | What is derived / 系统提取内容 |
|---|---|---|
| Intake and format routing / 填写与业态路由 | `RM11-C01-C04`, `RM11-C06`, `GM10-C07`, `SM-VIS` | Required business, customer, geography, format, channel, and objective fields / 企业、顾客、地理、业态、渠道、目的必填项 |
| Enterprise workbench: 91 structured inputs / 企业工作台：91 项结构化输入 | `SM-EXT`, `SM-MON`, `RM11-C07`, `RM11-C12`, `RM11-C18`, `GM10-C07`, `GM10-C09`, `GM10-C17`, `IM11-C11` | Fixed-scale Five Forces, CPM, STP, two entry modes, financial productivity, RATER/service gaps, organization controls, and top-risk monitoring inputs; narrative length is excluded / 五力、CPM、STP、两个进入模式、财务生产力、RATER/服务差距、组织控制与首要风险监控的固定量表输入；排除自由文本长度 |
| `market_customer` | `RM11-C05-C06`, `GM10-C07`, `SM-EXT`, `IM12Q-C04` | Need, segment, demand, competition, willingness to pay, adaptation / 需求、细分、规模、竞争、支付意愿、适配 |
| `strategy_differentiation` | `RM11-C02`, `RM11-C06`, `RM11-C14`, `SM-TYPES`, `GM10-C07` | Format fit, positioning, value proposition, advantage, growth logic / 业态匹配、定位、价值主张、优势、增长逻辑 |
| `country_compliance` | `SM-EXT`, `SM-GLOBAL`, `SM-ETH`, `IM12Q-C02-C03`, `IM12Q-C10`, `GM10-C15` | Political/legal/FX/data/ethics factors and hard gates / 政治、法律、外汇、数据、伦理因素与硬门槛 |
| `channels_digital` | `RM11-C03-C04`, `RM11-C10`, `GM10-C12`, `GM10-C15` | Channel roles, omnichannel flow, platform economics, payment and fulfilment / 渠道角色、全渠道流程、平台经济、支付履约 |
| `location_trade_area` | `RM11-C08-C09`, `RM11-C17`, `GM10-C12` | Catchment, site, access, footfall, occupancy and physical experience / 商圈、点位、可达、客流、租赁与实体体验 |
| `merchandise_supply_chain` | `RM11-C10`, `RM11-C12-C13`, `GM10-C08`, `GM10-C12` | Assortment, buying, suppliers, inventory, landed cost, logistics / 商品组合、采购、供应商、库存、到岸成本、物流 |
| `financial_unit_economics` | `RM11-C07`, `RM11-C14`, `SM-INT-P46-P50`, `SM-EXEC-FIN` | Margin, break-even, working capital, cash, ratios, scenarios / 毛利、盈亏平衡、营运资金、现金、比率、情景 |
| `marketing_crm_service` | `RM11-C11`, `RM11-C15`, `RM11-C18`, `GM10-C07`, `GM10-C15` | Acquisition, communication, retention, CLV/CAC, service and recovery / 获客、传播、留存、CLV/CAC、服务与补救 |
| `organization_execution` | `RM11-C16`, `SM-INT`, `SM-EXEC-ORG`, `SM-MON`, `GM10-C17`, `IM11-C11-C14` | Capability, people, structure, controls, milestones and KPIs / 能力、人员、结构、控制、里程碑与 KPI |
| `risk_sustainability` | `SM-EXT`, `SM-MON`, `SM-ETH`, `IM12Q-C03`, `IM12Q-C10`, `GM10-C17` | Risk register, scenarios, contingency, ethics, stakeholder and sustainability / 风险清单、情景、应急、伦理、利益相关者与可持续 |
| Hard-gate engine / 硬门槛引擎 | `IM12Q-C02-C03`, `IM12Q-C10`, `SM-ETH`, `SM-GLOBAL`, `GM10-C15` | Legal, ownership, licence, safety, privacy, sanctions, labour, FX, infrastructure gates / 法律、持股、牌照、安全、隐私、制裁、劳动、外汇、基础设施门槛 |
| Country-attractiveness lens / 国家吸引力视图 | `SM-EXT`, `SM-GLOBAL`, `GM10-C07-C12`, `IM12Q-C02`, `IM12Q-C04`, `IM12Q-C10` | External market condition only / 只评价外部市场条件 |
| Firm-readiness lens / 企业准备度视图 | `SM-INT`, `SM-EXEC-ORG`, `SM-EXEC-FIN`, `SM-MON`, `IM11-C11-C14` | Internal resource and execution capability only / 只评价内部资源与执行能力 |
| Entry-mode engine / 进入模式引擎 | `GM10-C09`, `GM10-C12-S27`, `IM12Q-C08-C10` | Feasible mode comparison, control, cost, partner, distance and risk / 可行模式比较、控制、成本、伙伴、距离与风险 |
| EFE/CPM / EFE 与 CPM | `SM-EXT-P47-P53` | External factors, response ratings, competitor comparison / 外部因素、应对评分、竞争者比较 |
| IFE / IFE | `SM-INT` | Internal factors and strength/weakness ratings / 内部因素与强弱评分 |
| IE/QSPM / IE 与 QSPM | `SM-FORM-P35-P50` | Strategy positioning and relative alternative selection / 战略定位与方案相对选择 |
| Enterprise Theory 1.0 / 企业理论评估 1.0 | The eight executable engine rows in section 9.1 / 第 9.1 节八个可执行引擎行 | Locked module status, formula result, evidence requirements, source handles, and internal-rule disclaimer; no opaque aggregate score / 锁定模块状态、公式结果、证据要求、来源句柄与内部规则免责声明；不生成不透明综合分 |
| Executive recommendation / 管理层建议 | All ten dimension handles plus hard-gate results; RetailLens Consulting Method 1.0 / 十维来源句柄加硬门槛结果；RetailLens 咨询方法 1.0 | Deterministic Proceed / Conditional / Pause / Stop decision; the decision thresholds are internal, versioned controls rather than PPT benchmarks / 程序化推进、有条件、暂停或停止；决策线是内部版本化控制，不是 PPT 行业基准 |
| MECE issue tree / MECE 问题树 | All ten dimension handles grouped into commercial thesis, route to customer, operating model, economics, and feasibility/execution / 十维来源按商业命题、触达顾客、运营模式、经济性、可行性执行分组 | Converts each dimension into a testable hypothesis without creating new business facts / 将每个维度转化为可验证假设，不创造新的商业事实 |
| Decision readiness and evidence quality / 决策就绪度与证据质量 | Deterministic score, input completeness, evidence metadata, hard gates; RetailLens Consulting Method 1.0 / 程序化评分、输入完整度、证据元数据、硬门槛；RetailLens 咨询方法 1.0 | Separate internal audit signals; formulas and thresholds are explicitly not course-supplied external ratings / 分开的内部审计信号；公式与阈值明确不属于课程提供的外部评级 |
| Scenario and KPI causal tree / 情景与 KPI 因果树 | `RM11-C07`, `RM11-C10`, `RM11-C12-C14`, `SM-INT-P46-P50`, `SM-EXEC-FIN`, `SM-MON` | Submitted downside/base economics, symmetric sensitivity, mathematical break-even, outcome/driver/guardrail metrics, cadence and owners / 已提交下行基准经济性、对称敏感性、数学盈亏平衡、结果驱动护栏指标、复核节奏与负责人 |
| Assumption and workstream register / 假设与工作流登记 | Relevant dimension handles plus `SM-MON`, `SM-EXEC-ORG`, `RM11-C16`, `RM11-C18`, `IM11-C11-C14` | Criticality, current basis, validation test, owner, trigger, horizon, next step and exit criteria / 关键度、当前依据、验证测试、负责人、触发点、周期、下一步与退出标准 |
| Monitoring and action plan / 监控与行动方案 | `SM-MON`, `SM-EXEC-ORG`, `RM11-C16`, `RM11-C18` | Owners, KPIs, trigger points, contingency and corrective actions / 负责人、KPI、触发点、应急与纠正行动 |
| Bilingual terminology / 双语术语 | Canonical handles plus `DER-*` cross-checks / 规范编号加衍生资料核对 | Chinese and English labels only; scoring IDs remain language-neutral / 仅中文英文标签，评分 ID 与语言无关 |
| AI interpretation / AI 解读 | Read-only locked score and locked eight-module theory assessment plus evidence handles / 只读的锁定评分、锁定八模块理论评估与证据编号 | Explanation and recommendations only; no score, formula, module-status, or relative-rank mutation / 只做解释与建议，不修改分数、公式、模块状态或相对排名 |

### 9.1 Enterprise theory-engine locators / 企业理论引擎精确定位

The executable Enterprise Theory 1.0 layer contains exactly eight modules. Sustainable retail advantage is a course foundation used elsewhere in the ten-dimension model, not a ninth executable engine.

可执行的企业理论评估 1.0 恰好包含八个模块。零售可持续优势是十维模型使用的课程基础，不作为第九个可执行引擎。

| Engine / 引擎 | Exact course locators / 精确课件定位 | Programmatic use and formula boundary / 程序化用途与公式边界 |
|---|---|---|
| Five Forces / 五力 | `SM-EXT` (External Audit section; exact page locator still retained at canonical-deck level) | Five force intensity and evidence register; feed consistent external factors into EFE / 五力强度与证据登记，并向 EFE 提供一致的外部因素 |
| CPM | `SM-EXT-P51-P53` | Critical-success-factor weights, 1–4 relative ratings, company/competitor totals and factor gaps; never an absolute go/no-go score / 关键成功因素权重、1–4 相对评分、企业竞品总分与单项差距；不得作为绝对进入门槛 |
| STP and positioning / STP 与定位 | `GM10-C07-S3-S21`, `GM10-C07-S25-S26`, `GM10-C07-S27-S30` | Segment attractiveness, feasibility/compatibility, targeting strategy and positioning proof / 细分吸引力、可行适配、目标策略与定位证据 |
| Entry-mode MCDA / 进入模式 MCDA | `GM10-C09-S4-S24`, `GM10-C12-S27`, `IM12Q-C09-C10` | Legal feasibility first, then control/capital/speed/adaptation/IP/local knowledge/partner/supply access/exit flexibility comparison / 先做法律可行性，再比较控制资本速度适配知识产权本地知识伙伴供应准入和退出灵活性 |
| Strategic Profit Model and GMROI / 战略利润模型与 GMROI | `RM11-C07-S4`, `RM11-C07-S15-S21`, `RM11-C07-S28-S36`, `RM11-C12-S7-S11`, `RM11-C12-S43`, `RM11-C12-S58` | Net margin, asset turnover, ROA decomposition, and annual gross margin divided by average inventory; formulas require like-for-like current comparisons and have no universal course pass line / 净利率、资产周转、ROA 分解及年度毛利除以平均库存；公式须采用同口径当前比较，课程没有通用合格线 |
| Service GAPS and recovery / 服务差距与补救 | `RM11-C18-S8`, `RM11-C18-S13-S20`, `RM11-C18-S24-S25`, `RM11-C18-S33` | RATER expectation/perception gaps, knowledge/standards/delivery/communication gaps, recovery speed and fairness / RATER 期望感知差距、知识标准交付传播差距及补救速度与公平 |
| Organization and control / 组织与控制 | `GM10-C17-S7-S15`, `IM11-C11-S2-S4`, `IM11-C11-S8-S9`, `IM11-C11-S11-S23`, `IM11-C11-S27` | Structure, centralization/decentralization, decision-control loop, direct/indirect controls and finance/quality/people performance / 结构、集权分权、决策控制闭环、直接间接控制及财务质量人员绩效 |
| Top risk, monitoring, and contingency / 首要风险、监控与应急 | `SM-MON-P5-P6`, `SM-MON`, `IM11-C11-S8-S9`, `IM11-C11-S15-S20`, `RM11-C06-S54` | Inherent risk = likelihood × impact; residual risk = inherent × (1 − control effectiveness %), plus KRI/trigger/funded contingency and evaluate-adjust cycle. The score has no universal colour or pass band / 固有风险=可能性×影响；残余风险=固有风险×(1−控制有效性%)，并登记 KRI、触发器、已获资金的应急方案与评价调整循环；该分数没有通用颜色或合格区间 |

All 0–100 conversions, entry-mode MCDA weights, and the `<5` near-tie rule are versioned RetailLens 1.0 internal controls. They are not course-defined, industry-wide, or consulting-firm thresholds. “Calculation complete” does not mean evidence verified.

所有 0–100 换算、进入模式 MCDA 权重与 `<5` 近似平局规则均为 RetailLens 1.0 内部版本化控制，不是课件、行业或咨询公司的通用阈值。“计算完整”不等于“证据已核实”。

Course foundation, not a standalone engine: sustainable-retail-advantage logic uses `RM11-C06-S3`, `RM11-C06-S7-S8`, `RM11-C06-S14-S17`, `RM11-C06-S23`, `RM11-C06-S36`, and `RM11-C06-S54`.

课程基础而非独立引擎：零售可持续优势逻辑使用 `RM11-C06-S3`、`RM11-C06-S7-S8`、`RM11-C06-S14-S17`、`RM11-C06-S23`、`RM11-C06-S36` 与 `RM11-C06-S54`。

`VRIO` is deliberately not assigned an exact slide handle in this version. The current source map has not yet verified a precise locator in the canonical strategic-management PDF. Until that locator is verified, RetailLens uses the course-verified `RM11-C06` sustainable-retail-advantage model and must not claim a slide-specific VRIO source.

本版本故意不为 `VRIO` 编造精确页码。当前来源映射尚未在规范战略管理原始 PDF 中核实 VRIO 的准确位置；核实之前，系统只使用已有精确课件定位的 `RM11-C06` 零售可持续优势模型。

## 10. Known source-quality and freshness warnings / 已知来源质量与时效警告

### Confirmed course issues / 已确认课件问题

- `SM-EXT-P48` uses “threats and weaknesses” in one EFE sentence. EFE evaluates external opportunities and threats; “weaknesses” is a typo.
- The SPACE example in `SM-FORM` shows Stability Position items totalling −16 and a result of −3.2, but prints `−14/5`. The internally consistent calculation is `−16/5 = −3.2`.
- `4014/LECTURE 2 - CHAPTER 2 - NOR LIZA 2024.pdf` is content Chapter Five, Vision and Mission Analysis.
- `4014/4014期末重点看/LECTURE 5 - CHAPTER 5 - NOR LIZA 2024.pdf` is content Chapter Four, Types of Strategies.

### Historical facts that require live refresh / 必须实时更新的历史事实

- country and business-climate rankings;
- tax, tariff, foreign-ownership, licence, sanctions, labour, privacy, and data-transfer rules;
- the decks' Privacy Shield references;
- NAFTA-era wording where USMCA or newer policy applies;
- 2017 global-retailer rankings and sales;
- historical store counts, market shares, markups, and country retail shares;
- Apple 2015 exercise data and other named-company snapshots;
- India “organized retail” share and similar country-market examples;
- retailer expansion, exit, acquisition, and partner status.
- Target/Walmart FY2020 values and ratios in `RM11-C07-S9`, `S17`, and `S20`;
- bakery/canned-food GMROI example values in `RM11-C12-S58` (the formula may be used; the example values may not);
- population, income, purchasing-power and market-size figures in `GM10-C07-S6-S10` and `S16`;
- Geely/Proton, JV, ownership and acquisition transaction figures in `GM10-C09-S18-S23`;
- historical BlackBerry share and Exxon/Rosneft JV events in `IM11-C11-S8-S9`;
- cinema EFE/CPM and retail-computer QSPM examples in `SM-EXT-P47-P53` and `SM-FORM-P43-P50`, except as calculation test fixtures.

These examples may illustrate a framework but must never auto-fill a user's current assessment.

这些案例可以说明框架，但绝不能自动填入用户的当前评估。

## 11. Copyright-safe use / 版权安全使用

RetailLens should store:

- source metadata and evidence handles;
- short paraphrased framework statements;
- formulas and original system rules;
- user-provided facts and current evidence;
- brief quotations only where necessary and legally permitted.

RetailLens 应保存：

- 来源元数据与证据编号；
- 简短释义后的框架说明；
- 公式与系统原创规则；
- 用户提供的事实与当前证据；
- 仅在必要且合法时保存简短引文。

RetailLens should not embed or redistribute full slide text, textbook chapters, question banks, screenshots, or long copyrighted extracts. Course files remain local source material; generated reports cite handles and paraphrase the relevant principle.

RetailLens 不应嵌入或再分发完整课件文字、教材章节、题库、截图或长篇受版权保护内容。课程文件保持为本地来源；生成报告只引用证据编号并释义相关原则。

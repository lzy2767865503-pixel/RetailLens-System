# RetailLens / 零售透镜

[![CI](https://github.com/lzy2767865503-pixel/RetailLens-System/actions/workflows/ci.yml/badge.svg)](https://github.com/lzy2767865503-pixel/RetailLens-System/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F766E.svg)](LICENSE)

**Author / 作者： [LAI ZEYU（来泽宇）](https://github.com/lzy2767865503-pixel)**

RetailLens is a bilingual, evidence-led retail business assessment system developed from a private course corpus covering retail management, strategic management, global marketing, and international business. The public repository includes the executable methodology and source map, not the copyrighted course files.

RetailLens 是一套以证据为基础的零售商业评估系统，分析框架来自涵盖零售管理、战略管理、全球营销与国际商业的私人课程资料库。公开仓库只包含可执行方法与来源映射，不包含受版权保护的课程原文件。

> Language support / 语言支持：**仅支持中文与 English / Chinese & English only**

## What it does / 系统功能

- Collects the minimum information needed to evaluate a retail business, including country, city, retail format, target customer, channel model, location, compliance, supply chain, unit economics, organization, risks, and evidence.
- Uses a nine-step intake. The ninth **Enterprise workbench** contains 91 required structured inputs; narrative length never earns additional performance points.
- Uses a deterministic 100-point rubric across 10 dimensions. The same input always receives the same base score.
- Applies non-compensatory hard gates for legality, ownership restrictions, licensing, privacy, labour, foreign-exchange, infrastructure, supplier, and ethics risks.
- Produces strengths, gaps, priority actions, metric calculations, evidence quality, and confidence/completeness scores.
- Runs eight deterministic enterprise theory engines: Five Forces, CPM, STP and positioning, entry-mode MCDA, Strategic Profit Model/GMROI, Service GAPS, organization/control, and top-risk monitoring.
- Converts the locked assessment into an executive decision workpaper: management call, decision readiness, evidence-quality register, five-branch MECE issue tree, critical assumptions, three-scenario stress test, KPI causal tree, and owned 30/60/90-day workstreams.
- Builds strategic outputs including EFE, IFE, IE, and QSPM views.
- Optionally uses the OpenAI Responses API for deeper bilingual interpretation. AI receives the locked score and locked eight-module theory assessment as read-only snapshots and cannot alter either.

- 收集零售商业评估所需的最低信息，包括国家、城市、零售业态、目标顾客、渠道模式、选址、合规、供应链、单位经济、组织、风险与证据。
- 采用九步填写流程；第九步 **企业工作台** 包含 91 个必填结构化输入，自由文本增加篇幅不会增加经营得分。
- 使用 10 个维度、总分 100 分的确定性评分规则；相同输入会得到相同基础分。
- 对合法性、外资限制、许可、隐私、劳动、外汇、基础设施、供应商与伦理风险设置不可被其他高分抵消的硬门槛。
- 输出优势、缺口、优先行动、指标计算、证据质量、完整度与置信度。
- 运行八个确定性企业理论引擎：五力、CPM、STP 与定位、进入模式 MCDA、战略利润模型/GMROI、Service GAPS、组织控制，以及首要风险监控。
- 把锁定评估转化为管理层决策底稿：管理建议、决策就绪度、证据质量登记、五分支 MECE 问题树、关键假设、三情景压力测试、KPI 因果树，以及明确责任人的 30/60/90 天工作流。
- 生成 EFE、IFE、IE 与 QSPM 等战略分析视图。
- 可选接入 OpenAI Responses API，生成更深入的中英文解释；AI 只读取已锁定的评分和八模块理论评估，不能修改任一结果。

## Method positioning / 方法定位

RetailLens targets the evidence discipline, reproducibility, workpaper traceability, scenario thinking, and management-action clarity expected from a rigorous professional advisory deliverable. It is an independent system built from the supplied course materials and public professional-practice references. It is **not affiliated with, endorsed by, or using claimed proprietary methods from any Big Four firm**.

RetailLens 以严谨专业咨询交付应具备的证据纪律、可重复计算、底稿追溯、情景分析与管理行动清晰度为质量目标。它是基于用户提供课程资料与公开专业实践参考建立的独立系统，**不隶属于任何四大会计师事务所，不受其背书，也不声称使用其专有方法**。

## Reproduce from a clean clone / 从零复刻

Requirements / 环境要求：

- Node.js `22.13.0+`; the tested reference runtime is pinned in `.nvmrc` / Node.js `22.13.0+`；已测试的参考运行环境固定在 `.nvmrc`
- Git
- Internet access for the first dependency installation / 首次安装依赖时需要联网
- An OpenAI API key is optional and is **not** required for deterministic assessment / OpenAI API 密钥可选，固定规则评估无需密钥

```bash
git clone https://github.com/lzy2767865503-pixel/RetailLens-System.git
cd RetailLens-System
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm start
```

Open `http://127.0.0.1:8787`, select **Load demo / 加载演示**, and generate the assessment. A correct clean reproduction passes 81 unit/API/security/release-policy tests, completes the renderer and Electron-main production build, and loads the nine-step bilingual assessment. See [docs/REPRODUCIBILITY.md](docs/REPRODUCIBILITY.md) for the exact verification checklist.

打开 `http://127.0.0.1:8787`，选择 **加载演示 / Load demo**，然后生成评估。正确的干净复刻应通过 81 项单元/API/安全/发布策略测试、完成前端与 Electron 主进程构建，并显示九步双语评估。完整核验清单见 [docs/REPRODUCIBILITY.md](docs/REPRODUCIBILITY.md)。

## One-click use / 一键使用

Double-click `启动 RetailLens.command` in Finder. The script installs missing packages, builds the verified local application, starts it on `127.0.0.1`, and opens the browser.

在 Finder 中双击 `启动 RetailLens.command`。脚本会自动安装缺少的依赖、构建本地程序、在 `127.0.0.1` 启动并打开浏览器。

The deterministic assessment works without an API key. To enable AI interpretation, open **API settings** in the header and enter the user's own OpenAI API key. The key is held only in memory for the current open page and is cleared on refresh or close. Only the non-secret model preference is saved in browser storage.

没有 API 密钥时，固定规则评分仍可完整使用。若要启用 AI 深度解读，请打开页面上方的 **API 设置**，由使用者输入自己的 OpenAI API 密钥。密钥只保留在当前打开页面的内存中，刷新或关闭页面后即清除；浏览器只保存不含密钥的模型偏好。

Applying the settings does not contact OpenAI. **Test connection** checks only the selected model and key. The submitted business model is sent to OpenAI only after the user explicitly clicks **Generate interpretation** in a report. OpenAI API usage is billed separately from any ChatGPT subscription.

启用设置本身不会连接 OpenAI。**测试连接**只检查所选模型与密钥。只有使用者在报告中明确点击 **生成深度解读** 后，已提交的商业模型才会发送给 OpenAI。OpenAI API 用量与 ChatGPT 订阅分开计费。

For a private developer-managed installation, `.env.local` remains available as an optional server-side fallback. Never place a key in source files, screenshots, reports, chat, or a public deployment.

如果是由开发者管理的私人安装，仍可选择使用 `.env.local` 作为服务端备用配置。不要把密钥写入源代码、截图、报告、聊天或公开部署。

## Developer commands / 开发命令

```bash
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install
pnpm dev
pnpm test
pnpm build
```

Local development uses `http://127.0.0.1:5173`; the production build uses `http://127.0.0.1:8787`.

本地开发地址为 `http://127.0.0.1:5173`；生产构建地址为 `http://127.0.0.1:8787`。

## Windows desktop / Windows 桌面版

The public Windows product name is **Retail Decision Studio by LAI ZEYU**. It
is built from this RetailLens open-source repository; RetailLens remains the
internal project and methodology name. No Microsoft Store publication or
certification is claimed until Partner Center confirms it.

公开 Windows 产品名称为 **Retail Decision Studio by LAI ZEYU**。该产品基于本
RetailLens 开源仓库构建；RetailLens 继续作为内部项目与方法名称。在 Partner Center
正式确认前，本仓库不宣称已通过 Microsoft Store 认证或已经公开上架。

```bash
pnpm test:desktop
pnpm metadata:attribution
pnpm metadata:notices:check
pnpm metadata:sbom
pnpm package:windows
```

`package:windows` creates one unsigned unpacked x64 Electron directory for
internal Windows quality testing. The public GitHub format is an auditable
portable-directory ZIP, not an NSIS or self-extracting EXE container.
Microsoft Store AppX packaging requires exact Partner Center identity values
in build environment variables; see [docs/WINDOWS_RELEASE.md](docs/WINDOWS_RELEASE.md).
The ordinary quality workflow keeps every internal non-release PE and ZIP inside
one Windows job, verifies the same frozen archive twice, deletes the complete
candidate roots, rejects disguised PE/archive evidence by real PE/ZIP magic,
and uploads no Windows binary or evidence artifact. The Store workflow likewise
uploads neither its AppX nor its private WACK run records to GitHub Actions.
Public GitHub publication uses the
official SSL.com eSigner Cloud Key Adapter: the author-owned certificate remains
in the cloud HSM, CKA exposes it through Windows CNG/KSP, and Windows SignTool
signs every real PE discovered in the unpacked directory. No PFX is exported,
stored, or passed to electron-builder. Every PE in the final ZIP must have a
trusted RFC 3161 timestamp, a trusted online-revocation chain, and an exact signer
SimpleName and Subject CN of `LAI ZEYU` or `来泽宇`; any unsigned or third-party-
signed PE blocks staging. Two independent Windows lifecycle rounds extract,
byte-copy-install, prove the real DOM plus exact executable/PID/listener binding,
run the packaged smoke gate, and perform bounded removal before a draft release
is redownloaded, hash-checked, and made public.

Microsoft Store WACK runs only on a specifically labelled, elevated,
active-interactive self-hosted Windows runner. The exact model selected through
the protected repository variable must also pass two live `/v1/models/{model}`
lookups and two strict structured `/v1/responses` round trips bound to the same
commit/model/candidate with independent nonces and response IDs. WACK runs twice
on the unchanged temporary-signed AppX; its local JSON is explicitly private,
non-cryptographic, and non-transferable. Without the dedicated key or labelled
runner, the Store workflow is deliberately blocked.

The desktop shell embeds the existing Express API at the stable, loopback-only
origin `http://127.0.0.1:47824`, so its local application storage survives a
real restart. The desktop origin receives exact Host, Origin, and Fetch Metadata
checks; the command-line loopback server also rejects every non-loopback Host,
preventing DNS-rebinding. Renderer Node integration is disabled, context
isolation and sandboxing are enabled, permissions and non-local navigation are
denied, production DevTools are disabled, and the Windows executable uses
hardened Electron fuses. Packaged smoke tests require real React-root content,
the visible product and bilingual author, and the About/privacy entry; API
health alone cannot pass. Use **About & privacy → Clear local data** to remove
the saved business draft and model preference and clear the in-memory API key
and current report state.

## Repository map / 仓库结构

| Path / 路径 | Purpose / 用途 |
|---|---|
| `src/domain/` | Deterministic scoring, consulting, matrix, and enterprise-theory engines / 确定性评分、咨询、矩阵与企业理论引擎 |
| `src/components/` | Chinese/English intake and report interface / 中英文输入与报告界面 |
| `server/` | Local Express API and optional OpenAI integration / 本地 Express API 与可选 OpenAI 接入 |
| `electron/` | Hardened desktop process and security policy / 加固桌面主进程与安全策略 |
| `docs/METHODOLOGY.md` | Formulas, weights, decision gates, evidence rules, and limitations / 公式、权重、决策门槛、证据规则与限制 |
| `docs/SOURCE_MAP.md` | Course-framework provenance without copyrighted source files / 不包含受版权保护原文件的课程框架来源映射 |
| `docs/REPRODUCIBILITY.md` | Clean-clone reproduction and verification protocol / 干净克隆复刻与验收协议 |
| `docs/PRIVACY.md` | Windows privacy statement / Windows 隐私声明 |
| `docs/WINDOWS_RELEASE.md` | Windows, AppX, WACK, and release gates / Windows、AppX、WACK 与发布门禁 |
| `.github/workflows/ci.yml` | Automated clean install, test, and build / 自动化干净安装、测试与构建 |
| `.github/workflows/windows-quality.yml` | Two-round Windows build/install gates / 两轮 Windows 构建与安装门禁 |

## Privacy and limits / 隐私与限制

- A key entered in the API settings dialog stays only in React page memory. It is sent to the loopback RetailLens server only for connection testing or an explicit AI interpretation request; it is never written to localStorage, sessionStorage, a database, reports, or project files.
- This bring-your-own-key window is intended only for the trusted local/private app bound to `127.0.0.1`. Do not expose this build as a shared public service.
- Draft business data is saved only in this browser's local storage unless the user submits it for AI interpretation.
- Course formulas and theory are used as analytical structure, not as claims about current laws, market size, or country rankings.
- Historical company, country, legal, market, transaction, and financial examples in the course files are framework illustrations or test fixtures only; they must never be used as current benchmarks.
- Internal 0–100 conversions, MCDA weights, and the five-point near-tie rule are versioned RetailLens controls, not universal course, industry, or consulting-firm thresholds.
- Country-specific conclusions require current, dated evidence from authoritative sources.
- This is a decision-support tool, not legal, tax, accounting, investment, or regulatory advice.
- Original course PPTX, PDF, DOCX, books, and private study files are not included in this repository. Their filenames and source handles are retained only for provenance.

- 在 API 设置窗口输入的密钥只保留在 React 页面内存中；仅在测试连接或明确请求 AI 解读时发送给本机 RetailLens 服务，不会写入 localStorage、sessionStorage、数据库、报告或项目文件。
- 此“使用者自带密钥”窗口只适用于绑定在 `127.0.0.1` 的可信本机/私人程序，不应把这个版本作为多人共享的公开服务。
- 商业模型草稿仅保存在当前浏览器的本地存储中；只有用户主动生成 AI 解读时才会提交给 API。
- 课程公式与理论仅作为分析结构，不代表当前法律、市场规模或国家排名事实。
- 课程文件中的历史公司、国家、法律、市场、交易与财务案例只用于说明框架或作为测试数据，绝不能作为当前 benchmark。
- 0–100 内部换算、MCDA 权重与 5 分近似平局规则属于 RetailLens 版本化内部控制，不是课件、行业或咨询公司的通用阈值。
- 国家相关结论必须使用有日期的权威最新证据。
- 本系统是决策支持工具，不构成法律、税务、会计、投资或监管建议。
- 本仓库不包含原始课程 PPTX、PDF、DOCX、教材或私人学习文件，仅保留文件名和证据编号用于来源追踪。

See [docs/METHODOLOGY.md](docs/METHODOLOGY.md) and [docs/SOURCE_MAP.md](docs/SOURCE_MAP.md) for the scoring method and course-source traceability.

## Authorship and license / 作者与许可证

RetailLens was designed and authored by **LAI ZEYU（来泽宇）**. Source code and original project documentation in this repository are released under the [MIT License](LICENSE). Course materials, third-party trademarks, and third-party reference content remain the property of their respective owners and are not redistributed.

RetailLens 由 **LAI ZEYU（来泽宇）** 设计并署名。本仓库原创源代码及项目文档按 [MIT License](LICENSE) 发布。课程资料、第三方商标及第三方参考内容仍归各自权利人所有，本仓库不对其进行再分发。

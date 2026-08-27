# Retail Decision Studio by LAI ZEYU Privacy Statement / 隐私声明

Effective date / 生效日期: 2026-08-27
Applies to / 适用于: Retail Decision Studio by LAI ZEYU Windows v1 (1.1.x)

## English

Retail Decision Studio by LAI ZEYU is a local, bilingual retail decision-support application built from the open-source RetailLens project. The application does not create user accounts and does not include advertising, analytics, crash-reporting, or developer-operated telemetry.

Designed and authored by **LAI ZEYU（来泽宇）**.

### Data stored on the device

- A business assessment draft is stored in the application's local browser storage when the user saves it or closes the application.
- The selected OpenAI model preference may be stored locally. An OpenAI API key entered by the user is kept only in the current renderer's memory and is not written to local storage, session storage, a database, reports, logs, or project files.
- The Chinese/English language preference is stored locally.

The application has no developer-operated cloud database. Local business data remains on the device unless the user explicitly requests an optional OpenAI connection test or AI interpretation.

### Optional OpenAI processing

Deterministic scoring, hard gates, enterprise-theory analysis, and report generation work without AI. Applying API settings does not contact OpenAI.

If the user explicitly selects **Test connection**, the selected model and user-provided API key are sent through the RetailLens service bound to `127.0.0.1` and then to OpenAI. If the user explicitly selects **Generate interpretation**, the API key, selected model, submitted business model, locked deterministic score, and locked theory assessment are sent to OpenAI to produce an interpretation. AI output cannot change the locked score or locked theory assessment.

OpenAI processes that request under the user's own OpenAI account and applicable OpenAI terms and privacy policy. RetailLens does not receive the user's API key or request through a developer-operated server. OpenAI is a separate third-party service. Retail Decision Studio does not include an OpenAI API key, API credits, or a ChatGPT subscription; API usage may incur separate charges under the user's OpenAI account.

### Deletion and retention

Select **About & privacy → Clear local data** to remove the saved business draft and model preference and to clear the in-memory API key and current report state. The language preference remains. Use this control before removal when explicit deletion is required. The GitHub build is an auditable portable directory: close the app and delete that directory to remove program files. The release lifecycle also verifies bounded removal of the exact product-owned `%APPDATA%\retaillens-system` directory. Removal of the exact Store AppX package and its package-local data is a mandatory Windows release test.

The Partner Center submission must leave automatic Windows/OneDrive product-data backup unselected. The application does not initiate OneDrive or other cloud backups. A user or administrator may still choose separate operating-system, disk-image, or file backup tools outside the application; those tools are governed by their own settings and policies.

### Network and permissions

The desktop shell binds its local service to the stable, loopback-only origin `http://127.0.0.1:47824`. The stable origin allows the application-local draft, model, and language preferences to survive a restart. Exact Host, Origin, and Fetch Metadata checks reject DNS-rebinding and cross-site requests. The shell denies renderer permission requests and navigation away from the local origin. Internet access is used only for user-requested OpenAI calls and trusted GitHub documentation links. The AppX declares `runFullTrust`, required for an Electron desktop app, and `internetClient` for optional outbound calls.

### Contact

Privacy or security questions can be filed in the project's [GitHub issue tracker](https://github.com/lzy2767865503-pixel/RetailLens-System/issues). Do not include API keys, personal data, or confidential business information in an issue.

## 中文

Retail Decision Studio by LAI ZEYU 是基于 RetailLens 开源项目构建的本机中英文零售商业决策支持应用。本应用不建立用户账户，也不包含广告、分析追踪、崩溃上报或开发者运营的遥测。

设计与作者：**LAI ZEYU（来泽宇）**。

### 保存在设备上的数据

- 使用者保存草稿或关闭应用时，商业评估草稿会保存在应用的本机浏览器存储中。
- 所选 OpenAI 模型偏好可以保存在本机。使用者输入的 OpenAI API 密钥只保留在当前渲染页面的内存中，不会写入 localStorage、sessionStorage、数据库、报告、日志或项目文件。
- 中英文语言偏好会保存在本机。

应用没有由开发者运营的云端数据库。本机商业数据不会离开设备，除非使用者主动执行可选的 OpenAI 连接测试或 AI 解读。

### 可选 OpenAI 处理

确定性评分、硬门槛、企业理论分析和报告生成完全不需要 AI。仅应用 API 设置不会联系 OpenAI。

使用者主动选择 **测试连接** 时，所选模型和使用者提供的 API 密钥会先经过绑定在 `127.0.0.1` 的 RetailLens 本机服务，再发送给 OpenAI。使用者主动选择 **生成深度解读** 时，API 密钥、所选模型、已提交商业模型、锁定的确定性评分和锁定的理论评估会发送给 OpenAI 生成解释。AI 输出不能修改已锁定的评分或理论评估。

OpenAI 会根据使用者自己的 OpenAI 账户及适用条款与隐私政策处理请求。RetailLens 不会经由开发者运营的服务器接收使用者的 API 密钥或请求。OpenAI 属于独立第三方服务；Retail Decision Studio 不附带 OpenAI API 密钥、API 额度或 ChatGPT 订阅，通过使用者自己的 OpenAI 账户调用 API 时可能需要另行付费。

### 删除与保留

选择 **关于与隐私 → 清除本机数据**，可删除已保存商业草稿和模型偏好，并清除内存中的 API 密钥及当前报告状态；语言偏好会保留。需要明确删除时，请在移除程序前使用此功能。GitHub 版本采用可审计的便携目录；关闭程序并删除完整目录即可移除程序文件，发布生命周期还会验证对产品专属 `%APPDATA%\retaillens-system` 目录的有界清理。最终 Store AppX 及其软件包本机数据的移除是强制 Windows 发布测试。

Partner Center 提交时必须取消自动 Windows/OneDrive 产品数据备份选项。应用本身不会发起 OneDrive 或其他云端备份。使用者或管理员仍可能在应用之外自行使用操作系统、磁盘映像或文件备份工具；这些工具受其自身设置与政策约束。

### 网络与权限

桌面壳把本机服务绑定在稳定且仅限回环的来源 `http://127.0.0.1:47824`，使应用本机草稿、模型及语言偏好可在重启后保留。严格的 Host、Origin 与 Fetch Metadata 检查会拒绝 DNS rebinding 和跨站请求。桌面壳同时拒绝渲染页面权限请求及离开本机来源的导航。网络仅用于使用者主动请求的 OpenAI 调用及受信任的 GitHub 文档链接。AppX 声明 Electron 桌面应用所需的 `runFullTrust`，以及可选外连所需的 `internetClient`。

### 联系方式

隐私或安全问题可提交到项目的 [GitHub issue tracker](https://github.com/lzy2767865503-pixel/RetailLens-System/issues)。请勿在 issue 中填写 API 密钥、个人资料或机密商业信息。

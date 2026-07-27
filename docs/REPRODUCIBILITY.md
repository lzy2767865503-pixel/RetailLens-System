# RetailLens reproducibility protocol / RetailLens 复刻协议

Version / 版本：1.0.0

Author / 作者：LAI ZEYU

Repository / 仓库：`https://github.com/lzy2767865503-pixel/RetailLens-System`

This protocol verifies that an independent user can reproduce the application
from a clean clone without access to the author's computer, course folder, or
OpenAI credentials.

本协议用于验证其他使用者无需访问作者电脑、课程文件夹或 OpenAI 密钥，也能从干净克隆
完整复刻程序。

## 1. Reference environment / 参考环境

- Node.js: `>=22.13.0` (tested reference runtime: Node.js `24.16.0`
  in `.nvmrc`)
- Package manager: `pnpm 11.9.0`
- Lock file: `pnpm-lock.yaml`
- Supported user interface languages: Simplified Chinese and English only
- Operating systems: macOS, Linux, or Windows with a supported Node.js runtime

The Finder launcher is macOS-specific. The command-line workflow works across
the supported operating systems.

Finder 启动器仅适用于 macOS；命令行流程可用于上述支持 Node.js 的操作系统。

## 2. Clean-clone procedure / 干净克隆步骤

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

Open `http://127.0.0.1:8787`.

## 3. Expected verification results / 预期验收结果

1. `pnpm install --frozen-lockfile` completes without modifying
   `pnpm-lock.yaml`.
2. `pnpm test` reports four passing test files and 50 passing tests.
3. `pnpm build` completes TypeScript checking and creates `dist/`.
4. `GET http://127.0.0.1:8787/api/health` returns `status: "ok"`,
   `languages: ["zh", "en"]`, and
   `ai.clientManagedKeysSupported: true`.
5. **Load demo / 加载演示** completes all nine intake steps.
6. The demonstration route reports 199/199 visible fields, including 91
   structured Enterprise workbench inputs.
7. **Generate assessment / 生成评估** creates:
   - the deterministic ten-dimension score;
   - Executive workpaper / 管理层底稿;
   - eight Enterprise theory modules;
   - EFE, IFE, IE, and QSPM views;
   - evidence, gate, scenario, KPI, and 30/60/90-day action workpapers.
8. Switching between Chinese and English does not change the deterministic
   result.

The synthetic demonstration result may display a locked score of 74.3 and a
Conditional Proceed management call. These are test-fixture outputs, not a
market recommendation.

合成演示数据可能显示锁定分数 74.3 和“有条件推进”结论；这些只是测试数据结果，不是市场建议。

## 4. Optional OpenAI configuration / 可选 OpenAI 配置

The complete deterministic assessment works without an OpenAI API key.

For local bring-your-own-key interpretation:

1. Start RetailLens.
2. Open **API settings / API 设置**.
3. Enter the user's own key.
4. Test the connection.
5. Explicitly choose **Generate interpretation / 生成深度解读**.

The browser holds the key only in current-page memory. Refreshing or closing
the page clears it. Never commit a populated `.env`, `.env.local`, API key, or
real business/customer dataset.

固定规则评估无需 OpenAI API 密钥。浏览器只在当前页面内存中持有使用者输入的密钥；刷新或
关闭页面即清除。不得提交已填写的 `.env`、`.env.local`、API 密钥或真实商业/客户数据。

## 5. Source-material boundary / 课程资料边界

Original PPTX, PDF, DOCX, textbook, assessment, and private study files are
not part of the repository. The program contains executable rules, original
documentation, compact provenance handles, and synthetic test data. The
application does not require the original course corpus at runtime.

原始 PPTX、PDF、DOCX、教材、考核资料和私人学习文件不属于本仓库。程序仅包含可执行规则、
原创文档、简短来源编号及合成测试数据；运行时不需要原始课程资料库。

## 6. Determinism boundary / 确定性边界

- Structured inputs, fixed formulas, versioned weights, and hard gates drive
  the base result.
- Narrative length does not increase performance scores.
- AI output cannot alter locked scores, formula results, module status,
  relative ranking, or management decision.
- Current country, legal, tax, market, competitor, and company conclusions
  still require dated authoritative evidence and professional review.

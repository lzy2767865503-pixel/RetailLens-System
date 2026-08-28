# Changelog

All notable changes to RetailLens are documented here.

## 1.1.0 — Unreleased

- Added the public Windows product name **Retail Decision Studio by LAI ZEYU**
  while retaining RetailLens as the source repository and internal method name.
- Added a hardened Electron desktop shell with stable loopback origin
  `http://127.0.0.1:47824`, restart-persistent local application storage,
  exact Host/Origin/Fetch Metadata checks, sandboxing, context isolation,
  denied permissions, restricted navigation, single-instance behavior,
  production DevTools blocking, ASAR integrity enforcement, and explicit
  hardened Electron fuses.
- Added equivalent lazy loading for report, methodology, strategy, AI settings,
  and About/privacy workspaces.
- Added one-action local business-data clearing and bilingual privacy/About
  disclosures without changing deterministic scoring or AI read-only controls.
- Added NSIS, portable, and environment-injected AppX packaging with the stable
  Electron Builder release line, plus two-round
  Windows GitHub Actions gates and a manual WACK runner.
- Added fail-closed private Partner Center certification-note/declaration gates,
  Store manifest and installed-process probes, NSIS userData deletion sentinels,
  and a protected two-round trusted Authenticode GitHub release workflow.
- Bound public Authenticode publication to built-in exact SimpleName and Subject
  CN/O/OU rules containing only `LAI ZEYU` and `来泽宇`; third-party signer
  Subjects cannot be enabled by a workflow variable. PE files are discovered by
  MZ magic across unpacked, recursively extracted setup/portable, ASAR, installed,
  and uninstaller payloads; every one must pass exact signer, timestamp, and
  online-chain checks before the strict signed staging inventory is uploaded.
- Replaced health-only package smoke checks with real React DOM/product/author/
  privacy assertions, version-and-candidate-hash-bound Store `ui_ready.json`
  evidence bound to the installed process ID, health-listener owner PID, canonical
  install path, and final PE metadata readback.
- Added clean-state NSIS/Store preflights that refuse to replace existing installs,
  data, processes, uninstall records, packages, listeners, or probe state and
  restrict cleanup to objects proven to have been created by the current run.
- Kept unsigned Windows candidates inside one ephemeral job, deleted complete
  candidate roots, rejected disguised PE/archive evidence by magic, and prohibited
  the unsigned Store AppX from GitHub Actions artifacts.
- Made WACK evidence fresh-run-bound and fail closed on stale, incomplete,
  partial, skipped, not-run, ambiguous, or non-passing result records.
- Added an after-pack readback gate for all Electron fuses and disabled the
  browser-process-specific V8 snapshot fuse to match the packaged Windows
  payload and prevent a fatal pre-main startup failure.
- Added SPDX 2.3 SBOM generation and deterministic third-party notices.
- Standardized bilingual authorship as **LAI ZEYU（来泽宇）** and added an
  automated attribution gate.
- Resolved the development-only `nanoid` advisory by locking `nanoid@3.3.18`.

## 1.0.0 — 2026-07-27

- Published the nine-step Chinese/English retail assessment workflow.
- Added the deterministic ten-dimension scoring and hard-gate engine.
- Added EFE, IFE, IE, and QSPM strategic workpapers.
- Added the Executive workpaper with MECE issue tree, scenarios, KPI causal
  trees, evidence governance, and owned 30/60/90-day actions.
- Added eight deterministic Enterprise theory modules.
- Added optional in-memory bring-your-own-key OpenAI interpretation.
- Added reproducibility, CI, authorship, licensing, contribution, and security
  documentation.

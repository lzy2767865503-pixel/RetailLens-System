# Retail Decision Studio by LAI ZEYU — Windows v1 Test Report

Version: 1.1.0
Branch: `codex/windows-store-v1`
Status: implementation-stage evidence; Microsoft Store certification is not yet claimed.

## Current local evidence (2026-08-27)

| Check | Environment | Result | Evidence |
|---|---|---|---|
| Locked dependency install | macOS 26.5.2, Node 24.16.0, pnpm 11.9.0 | **Pass** | `pnpm install --frozen-lockfile` completed from the checked-in lockfile |
| Production dependency audit | Same | **Pass** | `pnpm audit:prod`: no known vulnerabilities |
| Full dependency audit | Same | **Pass** | `pnpm audit:all`: no known vulnerabilities; `pnpm why nanoid` resolves only `3.3.18` |
| Unit/API/security tests | Same | **Pass in two consecutive final-tree rounds: 11 files, 81 tests each** | The suite covers deterministic scoring, API isolation, desktop Host/Origin/Fetch Metadata rejection, command-line Host rejection, stable-origin navigation, PID-bound health, storage clearing, structured package-author/PE metadata source enforcement, strict packaged-DOM/candidate evidence, real-PE/ZIP policy, eSigner CKA/no-PFX workflow policy, live-model binding gates, WACK private-record limitations, Store/release workflow hardening, and third-party signer negative cases |
| Production renderer + Electron main build | Same | **Pass in two consecutive final-tree rounds** | Main renderer chunk 453.69 kB / 145.34 kB gzip; lazy chunks emitted; no source maps; bundled Electron main 2.7 MB |
| Desktop Electron flow | Same | **Pass in two consecutive final-tree rounds** | Each real Electron E2E round ran at 1024 x 768 and passed title/security checks, demo report `74.3 / 100`, valid draft/model/locale persistence across a full close and relaunch using the same isolated profile, exact bilingual About attribution, clear-local-data flow, and zero renderer console errors |
| Notices and SPDX SBOM | Same | **Pass in two consecutive final-tree rounds** | Notices check passed and SPDX 2.3 SBOM regenerated in each round |
| Bilingual authorship gate | Same | **Pass in two consecutive final-tree rounds** | Exact `LAI ZEYU（来泽宇）` attribution verified in 21 application, package, policy, and release surfaces in each round |
| macOS packaged-directory smoke | Same | **Pass** | Packaged ASAR contains only release resources; the packaged executable executed the new real DOM/product/author/privacy plus health smoke gate successfully |
| Workflow and secret scans | Same | **Pass in two consecutive final-tree rounds** | `actionlint`, YAML parsing, every PowerShell script AST, `git diff --check`, and a targeted current-tree private-key/API-key/exported-certificate scan passed. Earlier snapshots passed Gitleaks; Gitleaks was not installed for these two local rounds |
| Windows unpacked cross-build | Same | **Pass in two consecutive final-tree rounds for packaging only** | Both rounds produced the Windows x64 directory payload with stable `electron-builder@26.15.7`; all nine supported Electron fuses were explicitly verified after packing; `signExts` enumerated the main EXE and every runtime DLL; ASAR contains only release files. This unsigned macOS cross-build does not prove Windows execution or Authenticode |
| Windows public distribution architecture | Same | **Replaced; native execution pending** | NSIS and self-extracting portable EXE were removed because embedded bootstrap/plugin PEs could violate the exact-author signer invariant. The new output is one auditable portable-directory ZIP assembled only after every unpacked real PE is cloud-signed. Native CKA signing, ZIP lifecycle, and trusted signature execution remain pending |
| Windows package visual assets | Same | **Pass at source** | 1024-square icon and 310 x 150 wide tile rendered and visually inspected with no clipping; final Store screenshots remain pending |
| Store identity guard | Same | **Pass at source; native package pending** | Product ID `9NVNLQWQBKHD`, `Identity.Name=LAIZEYU.RetailDecisionStudiobyLAIZEYU`, technical Publisher `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`, `PublisherDisplayName=LAI ZEYU`, and manifest executable `app\Retail Decision Studio by LAI ZEYU.exe` are immutable literals; protected variables must match |
| Store certification/declarations guard | Same | **Static pass; live external gate pending** | Secret-free template validated; missing/private-note, dedicated limited/expiring/revocable reviewer-key, exact public model/endpoint/steps, generative-AI declaration, or disabled-backup attestations fail closed. The exact repository-variable model must additionally pass live `/v1/models/{model}` plus strict structured `/v1/responses`; no dedicated key is currently claimed |
| GitHub executable signing guard | Static/local validation; native signature run pending | **Implemented, publication blocked pending certificate/key** | Protected manual workflow pins official SSL.com eSigner CKA, loads the cloud certificate through CNG/KSP, strips any pre-existing embedded signature, invokes SignTool on every real PE by content, forbids PFX/Base64/`WIN_CSC_LINK`, creates one portable-directory ZIP, safely re-extracts it and ASAR, requires one exact signature index plus trusted signer/timestamp/online chains, cleans CKA, then repeats locked source, live model/structured-response, and bounded install/DOM/listener/smoke/removal gates on the same exact bytes before any candidate transfer. The isolated no-checkout publication job immediately deletes the transient Actions transfer by numeric artifact ID, then locks main/tag and numeric Release ID through draft/public hash closure. Native trusted-signature and live-key execution are still pending |
| Store AppX native run | Same | **Blocked by host platform as expected** | macOS cannot produce/install/run the final AppX/WACK path. No fake or development-identity AppX is treated as evidence; no AppX was produced, uploaded, or published locally |

The pre-Windows baseline on the original web implementation passed 50 tests, production build, production server health, and production-only audit. The pre-change full audit identified one high-severity development-only `nanoid@3.3.16` advisory through PostCSS/Vite. Windows v1 overrides it to `3.3.18`; both production and full audits now report no known vulnerabilities.

One repeat made while several repository builds were competing for the same host
produced two Vitest timeouts at the former 5-second default (53 of 55 tests
completed). There were no failed assertions. The suite now serializes test files
and uses an explicit 20-second per-test and hook ceiling suitable for a shared
Windows runner. The final suite count is 81 tests across 11 files. Two consecutive
post-hardening local rounds on 2026-08-27 passed locked install, production/full
audits, all 81 tests, attribution, notices/SBOM, production build, Windows x64
directory packaging, real Electron restart E2E, real-PE/signing/staging policies,
strict WACK XML policy fixtures, PowerShell AST/YAML/actionlint parsing, Store
identity positive and negative controls, private-key/secret scans, and diff checks.
These local macOS rounds do not replace the pending native Windows gates. The restart E2E first
exposed a footer control hidden beneath the fixed action bar; conditional footer
clearance fixed that accessibility defect. Two complete post-fix restart E2E
rounds then passed.

### Superseded local container evidence

Earlier unsigned NSIS/portable-EXE cross-build hashes are intentionally removed
from release consideration. Those formats are no longer generated or accepted
by staging. No local macOS cross-build hash is a trusted Windows release hash.

## Windows Round 1 — build gate

| Field | Value |
|---|---|
| Workflow run URL | Pending |
| Commit SHA | Pending |
| Runner image | `windows-latest` (record exact image from log) |
| Locked install | Pending |
| Production/full audit | Pending |
| Unit/API/security tests | Pending |
| Production build | Pending |
| Desktop Electron flow | Pending |
| PowerShell signer-policy positive/negative tests | Pending native Windows repetition; local PowerShell 7.6.5 pass |
| Notices/SBOM | Pending |
| Portable-directory ZIP SHA-256 | Pending native Windows build/sign |
| Every real PE signed through eSigner CKA/KSP SignTool | Pending issued certificate and protected secrets |

## Windows Round 2 — fresh install gate

| Field | Value |
|---|---|
| Workflow run URL | Pending |
| Fresh locked install/test/build repetition | Pending |
| Safe ZIP extraction plus bounded byte-copy install | Pending |
| Exact installed executable/DOM/nonce/PID/listener binding | Pending |
| Installed app `--smoke-test` with timeout/process-tree kill | Pending |
| Clean install/process/data/proof/port preflight | Pending native Windows execution |
| Final portable/installed primary PE metadata | Pending native Windows execution |
| Every real PE in ZIP/ASAR/installed tree exact signer, timestamp, and online chains | Pending trusted certificate and native Windows execution |
| Bounded uninstall plus install-directory, userData, process, proof, and listener removal | Pending |
| Clear-local-data flow | Covered in Round 1 Electron test; repeat manually on final package |

## Store release gates

| Gate | Result |
|---|---|
| Partner Center identity copied exactly | **Reserved and hard-locked:** Store ID `9NVNLQWQBKHD`; Identity `LAIZEYU.RetailDecisionStudiobyLAIZEYU`; Publisher `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`; Publisher display `LAI ZEYU` |
| Private certification note with dedicated limited/expiring/revocable key, exact endpoint/model, and complete test steps | Pending private Partner Center entry; no key belongs in this repository |
| Two live exact model lookups plus strict structured Responses round trips | Pending protected dedicated review key; both rounds bind one commit/model/candidate and distinct nonces/response IDs; absence blocks build |
| Generative-AI Product declaration selected | Pending Partner Center confirmation |
| Automatic Windows/OneDrive product-data backup left unselected | Pending Partner Center confirmation |
| Initial-submission **What's new** field left empty | Pending Partner Center confirmation |
| Exact production-identity AppX built on Windows | Pending; unsigned source is destroyed immediately after one run-owned copy is temporary-signed |
| AppX manifest identity/language/capability inspection | Pending |
| Temporary-copy signing, sideload, launch probe, removal, and package-data removal | Pending |
| Windows App Certification Kit | Pending labelled elevated active-interactive self-hosted runner; two bounded complete non-partial/latest-kit reports must pass on identical signed AppX bytes. Private JSON is explicitly non-cryptographic/non-transferable and no external-attestation fallback exists |
| Store candidate/evidence GitHub Actions artifact | Forbidden: the Store workflow has no artifact upload and destroys candidate, reports, records, certificate/private key, and run state |
| Windows 10 x64 clean-machine test | Pending |
| Windows 11 x64 clean-machine test | Pending |
| Final Store screenshots from packaged app | Pending |
| Partner Center upload | Not performed |
| Microsoft certification | Not performed |
| Public Store availability | Not performed |

## Invariants

- The demo's deterministic score remains `74.3`.
- `/api/score` never invokes AI.
- AI receives cloned, locked score and theory snapshots and cannot mutate response scoring.
- An API key is never persisted or echoed in API responses.
- Business draft and model preference can be removed from the application; locale preference remains.
- Renderer Node integration is disabled, context isolation and sandboxing are enabled, navigation is restricted to the exact stable origin `http://127.0.0.1:47824`, Host/Origin/Fetch Metadata checks reject rebinding and cross-site requests, permission requests are denied, and production DevTools are disabled.

## Sign-off rule

Do not mark this report **release-ready** until both Windows workflow rounds pass for the same protected-main commit and exact ZIP, every embedded release PE has one exact-author trusted/timestamped certificate thumbprint, both live OpenAI rounds pass for the exact review model/key/candidate, two complete WACK runs pass the unchanged signed Store package on the labelled interactive runner, final hashes are recorded, private certification access and Product declarations are confirmed, and any Store certification result is linked. Local JSON is not an attestation, and uploading a package alone is not certification or publication.

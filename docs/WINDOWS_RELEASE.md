# Retail Decision Studio by LAI ZEYU — Windows Release Runbook

Status: implementation and local validation in progress. No Microsoft Store
certification, public Store listing, trusted Windows GitHub release, or external
availability is claimed until the corresponding external result is recorded.

Designed and authored by **LAI ZEYU（来泽宇）**. The Microsoft Store
`PublisherDisplayName` is fixed to the exact value **LAI ZEYU**.

## Release formats

| Channel | Exact format | Trust rule |
|---|---|---|
| GitHub Release | `RetailDecisionStudioByLAIZEYU-<version>-x64-portable-directory.zip` | Every real PE inside the ZIP must carry trusted, timestamped Authenticode whose exact author-owned signer is `LAI ZEYU` or `来泽宇` |
| Microsoft Store | `RetailDecisionStudioByLAIZEYU-<version>-x64.appx` | Built with the exact Partner Center identity and transferred privately only after WACK/lifecycle gates; Microsoft applies final Store signing |

The GitHub distribution is deliberately a portable directory, not NSIS, MSI,
or a self-extracting portable EXE. Those executable containers can embed
third-party bootstrap/plugin PEs that cannot all be replaced with the exact
author-owned signer after container construction. The ZIP keeps every PE
individually visible, signable, hashable, extractable, and auditable.

After extraction, launch `Retail Decision Studio by LAI ZEYU.exe`. Removal is
bounded deletion of the extracted product directory and the product-owned
`%APPDATA%\retaillens-system` data directory. The app installs no service or
system-wide driver.

## Immutable identities

- Visible author: `LAI ZEYU（来泽宇）`
- Store Publisher Display Name: `LAI ZEYU`
- Partner Center Product/Store ID: `9NVNLQWQBKHD`
- Store `Identity.Name`: `LAIZEYU.RetailDecisionStudiobyLAIZEYU`
- Store technical Publisher: `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8`
- Store manifest executable: `app\Retail Decision Studio by LAI ZEYU.exe`
- Allowed Authenticode SimpleName: exactly `LAI ZEYU` or `来泽宇`
- Allowed Authenticode Subject CN: exactly `LAI ZEYU` or `来泽宇`
- Subject O/OU, if present: must also be exactly one of those author names
- Product: `Retail Decision Studio by LAI ZEYU`
- Package version source: `package.json`

Partner Center's technical Publisher CN/GUID is a system identity and is not a
replacement for visible authorship or the GitHub Authenticode signer.

## OpenAI certification gate

The selectable API model IDs are restricted to official public API model names:

- `gpt-5` (default)
- `gpt-5-mini`
- `gpt-5-nano`

The protected repository variable
`RETAILLENS_CERTIFICATION_OPENAI_MODEL` selects the exact model that Microsoft
review instructions use. Static model-name validation is not enough. After one
candidate is frozen, `scripts/validate-openai-certification.mjs` uses the
dedicated secret `RETAILLENS_CERTIFICATION_OPENAI_API_KEY` in two independent
rounds. Each round must complete both:

1. `GET https://api.openai.com/v1/models/{exact-model}`; and
2. a real, non-stored `POST https://api.openai.com/v1/responses` strict
   JSON-schema round trip that echoes the exact commit SHA, candidate SHA-256,
   round number, and a fresh random nonce.

The script writes only non-secret, run-private consistency records. Store records
stay under the run-owned temporary root and are destroyed; release records are
not public assets. The API key and business data are never written or logged.
The two rounds must use one exact model/commit/candidate while response IDs and
nonce hashes differ and Round 2 is later. A missing key, inaccessible model,
unsupported structured response, mismatched binding, or provider failure blocks
the workflow.

Official API references:

- https://platform.openai.com/docs/api-reference/models
- https://platform.openai.com/docs/quickstart

## Microsoft Store environment

The protected `microsoft-store` environment supplies:

| Name | Kind | Requirement |
|---|---|---|
| `RETAILLENS_WINDOWS_IDENTITY_NAME` | variable | Must equal `LAIZEYU.RetailDecisionStudiobyLAIZEYU` |
| `WINDOWS_PUBLISHER` | variable | Must equal `CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8` |
| `RETAILLENS_CERTIFICATION_OPENAI_MODEL` | variable | One exact selectable public model above |
| `RETAILLENS_CERTIFICATION_OPENAI_API_KEY` | secret | Dedicated, limited, expiring, independently revocable reviewer key |
| `RETAILLENS_CERTIFICATION_LIVE_API_CHECK_REQUIRED` | variable | exactly `true` |
| `RETAILLENS_APPROVED_WACK_FILE_VERSION` | variable | Exact four-part `FileVersionRaw` of the approved canonical `appcert.exe` |
| `RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT` | variable | Pre-provisioned local fixed-NTFS `RetailLensStoreHandoff` directory with protected exact runner/SYSTEM/Administrators ACL |
| Other `RETAILLENS_CERTIFICATION_*` declarations | variables | exactly match the private-note, key-scope, connection, interpretation, generative-AI, and backup declarations enforced by the workflow |

No credential belongs in source, a workflow log, a screenshot, an issue, an
artifact, or a public release. The real reviewer key is placed only in the
protected secret and Partner Center's private certification note, then revoked
after certification.

## Store runner and WACK

`.github/workflows/windows-store.yml` targets only a runner with all labels:

- `self-hosted`
- `Windows`
- `X64`
- `retaillens-wack`
- `interactive`
- `elevated`

The job independently verifies an active Explorer session in its own session,
`[Environment]::UserInteractive`, elevation, and the Windows App Certification
Kit path. A generic `windows-latest` hosted runner is not accepted for WACK.

The workflow builds once, copies the unsigned output into a run-owned Partner
Center submission file, makes a separate QA copy, and signs only that QA copy
with one short-lived RSA-3072 non-exportable technical-Publisher certificate.
`scripts/windows-appx-payload-equivalence.ps1` inventories every ZIP entry except
the sole `AppxSignature.p7x`, rejects traversal/duplicates/budget violations, and
proves that the unsigned submission and QA copy have the identical payload tree.
The workspace build root is then removed. Both WACK rounds and both lifecycle
rounds use the unchanged QA SHA-256 while the unsigned original remains private
under the same run root. `scripts/windows-wack.ps1`:

- refuses any pre-existing report, status, or run record;
- binds every record to the exact AppX SHA-256 and a fresh run UUID;
- runs both `appcert reset` and `appcert test` with explicit time limits;
- accepts AppCert exit code `1` only as the documented “report needs
  finalization” state, then runs bounded `appcert finalizereport` before any
  XML result is trusted;
- kills the complete `appcert` process tree on timeout;
- requires a fresh, non-trivial XML report;
- requires one unambiguous overall `PASS`/`PASSED` value;
- requires exactly `PARTIAL_RUN=FALSE` so a partial execution cannot pass;
- accepts only exact PASS/PASSED/NOT_APPLICABLE terminal test-level values;
  failure, not-run, missing, duplicate, orphaned, or ambiguous results fail;
- records the exact package/report/AppCert hashes, complete test inventory,
  workflow run identity, protected-main commit, interactive session, and times.
- accepts only the canonical Windows Kits `appcert.exe`, a valid Microsoft code
  signature, and the exact protected `RETAILLENS_APPROVED_WACK_FILE_VERSION`;
  both rounds must record the same approved FileVersion and AppCert SHA-256.

After both WACK and lifecycle rounds pass,
`scripts/windows-retain-private-store-handoff.ps1` rechecks the unsigned/QA
payload equivalence and both WACK records, then atomically renames an
`.incomplete` directory under the pre-provisioned local fixed-NTFS exact-ACL
root. It retains the unsigned AppX, its checksum, and a lineage receipt.
It also retains four exact 1366 x 768 PNG listing screenshots and their capture
manifest. The screenshots are produced by Electron `capturePage` from the
installed Round-2 QA candidate, use only the built-in synthetic demo, and cover
the assessment, enterprise inputs, executive workpaper, and strategy matrices.
The capture fails closed on secret-bearing inputs, high-confidence credential or
personal-path patterns, non-PNG data, text/EXIF metadata, wrong dimensions, an
unexpected file, or any candidate/nonce/hash mismatch. Repository concept art
under `docs/design` is never accepted. The receipt says `NOT_SUBMITTED` and
`NOT_CERTIFIED`; no QA certificate or QA package is retained. Full cleanup then removes the QA package, temporary key,
certificate stores, reports, state, and run root without touching the completed
private handoff.

The JSON is deliberately named `WACK-private-run-record.json`. It sets
`cryptographicallyAttested=false` and `transferable=false` and explicitly says
that local JSON is not an unforgeable attestation. Its value is limited to an
immediate consistency check inside this owner-restricted, protected-main,
environment-gated run; it must not be used as portable proof. No Store candidate,
WACK report, JSON record, or evidence artifact is uploaded to GitHub by the
workflow. Neither the private unsigned handoff nor the screenshot bundle leaves
the exact local NTFS boundary in this workflow. A human may transfer only the
four verified, privacy-gated PNGs from that handoff to Partner Center; GitHub
artifact upload is intentionally still disabled because the same Store job also
handles the unsigned package and protected certification configuration.
If the labelled interactive runner is unavailable, Store validation remains
blocked; there is no hand-edited external-attestation fallback.

## Store lifecycle

The workflow refuses to overwrite or remove any pre-existing exact identity
package, package-data directory, product/package process, loopback listener, or
UI-proof state. It then:

1. inspects exact identity, Publisher, x64 architecture, four-part version,
   display name,
   `PublisherDisplayName=LAI ZEYU`, language, capabilities, Application ID, and
   the manifest's exact `Application.Executable`;
2. signs only a run-owned copy with a temporary sideload certificate;
3. performs bounded AppX installation through a child PowerShell process;
4. writes a one-use candidate-hash/version/nonce probe;
5. performs a bounded AUMID launch command and waits at most 30 seconds;
6. requires real React-root, product, author, and privacy-entry DOM evidence;
   in Round 2 it additionally drives only the built-in demo and captures four
   exact 1366 x 768 renderer PNGs from the installed candidate;
7. requires exactly one `127.0.0.1:47824` listener whose owning PID's canonical
   executable path is exactly the installed path derived from
   `Application.Executable`, not merely any file under the package directory;
8. binds UI evidence PID, health-response PID, listener PID, candidate hash,
   version, and nonce;
9. performs bounded process-tree shutdown and bounded AppX removal; and
10. binds each PNG to the QA SHA-256/version/nonce, rejects sensitive text/input
    indicators and PNG metadata, and atomically copies the verified set into the
    run root for private handoff; and
11. proves package, package data, temporary certificate, proof state, process,
    and listener cleanup.

Cleanup steps use `if: always()` and independently aggregate package, data,
process, listener, proof, certificate/private-key, candidate, run-root, and
state-file removal failures. The temporary certificate is removed with
`-DeleteKey`, then all exact targets are queried again. The workflow contains no
artifact upload action, so neither success nor failure can transfer the AppX or
its run-private records.

## GitHub trusted signing boundary

The protected `github-release` environment and runner configuration supply:

| Name | Kind | Requirement |
|---|---|---|
| `RETAILLENS_RELEASE_HANDOFF_ROOT` | variable | Pre-provisioned same-host local fixed-NTFS `RetailLensReleaseHandoff` root |
| `RETAILLENS_RELEASE_BUILD_SID` / `...SIGNING_SID` / `...PUBLISHER_SID` | variables | Three distinct Windows service-account SIDs |
| `RETAILLENS_TRUSTED_SIGNING_HARNESS_PATH` | variable | Pre-provisioned out-of-repository signing harness on the clean signing runner |
| `RETAILLENS_TRUSTED_SIGNING_HARNESS_SHA256` | variable | Exact pinned harness hash |
| `RETAILLENS_ESIGNER_CKA_INSTALLER_SHA256` / `...UNINSTALLER_SHA256` | variables | Exact hashes of the verified CKA installer and the installed uninstaller |
| `WINDOWS_SIGNER_SUBJECT` / `WINDOWS_SIGNER_THUMBPRINT` | variables | Exact publicly trusted LAI author certificate identity |
| `RETAILLENS_CERTIFICATION_OPENAI_MODEL` | variable | Exact public model selected for both source/capability rounds |
| `RETAILLENS_CERTIFICATION_OPENAI_API_KEY` | secret | Dedicated limited/revocable key used only in the non-signing build job |

There are three separate organization runner groups and service accounts:

1. `retaillens-trusted-windows-build` checks out and executes repository code,
   tests twice, builds once, and atomically writes the unsigned tree to the
   private local ACL handoff. It has no CKA credential access.
2. `retaillens-trusted-windows-signing` is fresh, ephemeral, and no-checkout. It
   accepts only the exact same-host handoff and pinned out-of-repository harness.
   Reusable SSL.com credentials and the TOTP seed are supplied only through a
   machine-bound broker inside that harness; they never enter workflow
   environment variables, repository scripts, or command lines.
3. `retaillens-trusted-windows-publisher` is also fresh and no-checkout. It can
   read only the signed private handoff and is the sole job with `contents: write`.

Unsigned bytes never use `actions/upload-artifact` or any other GitHub transfer.
The timestamp is pinned to `http://ts.ssl.com`. CKA `1.0.6` is pinned by archive,
installer, and installed-uninstaller hashes. A schema-v3 cleanup receipt is
mandatory: it proves CKA unload, certificate `DeleteKey`, private-key-container,
master-key, `%APPDATA%\eSignerCKA`, process, provider, registry, installer, and
uninstaller cleanup, then independently rechecks every baseline. A missing or
mismatched receipt blocks the signed handoff. No PFX is accepted or exported.

Official eSigner CKA integration guide:

- https://www.ssl.com/how-to/how-to-integrate-esigner-cka-with-ci-cd-tools-for-automated-code-signing/

## Every-PE rule

`scripts/windows-file-policy.ps1` recognizes a PE only after validating `MZ`,
the DOS `e_lfanew` pointer, and the exact `PE\0\0` signature. Windows policy
tests compile a real C# PE fixture; a four-byte `MZ` mock is explicitly rejected.

After `electron-builder --dir`, the pinned external signing harness discovers
every real PE by content, not extension, across EXE, DLL, `.node`, renamed, or
disguised files. It removes any pre-existing embedded third-party signature,
proves no signer remains, and invokes CKA-backed SignTool to create one
author-owned timestamped signature on each file. Only then does it create the ZIP
and run two lifecycle rounds on the identical final archive SHA-256. The workflow
independently expands that archive and verifies every visible MZ/PE before private
handoff and again in the publisher account.

`scripts/windows-verify-authenticode.ps1` safely extracts the ZIP, rejects path
traversal, case-insensitive duplicate entries, symlinks, nested archives, and
invalid MZ payloads, expands `app.asar`, and verifies every discovered PE for:

- valid Authenticode;
- trusted RFC 3161 timestamp;
- exact configured Subject plus exact author SimpleName/CN/O/OU policy;
- non-self-signed code-signing certificate with Code Signing EKU;
- online-revocation trusted signer and timestamp chains; and
- Windows SignTool `/pa /all` trust verification with exactly one reported
  `Signature Index: 0` and no appended signature.

Any unsigned PE or PE whose active signer belongs to Electron, Microsoft, an
installer vendor, SignPath, SSL.com, or another third party blocks publication.
Third-party components remain acknowledged in `THIRD_PARTY_NOTICES.txt`, but
their release PE bytes must carry the exact author-owned Authenticode signature.

## Two independent GitHub rounds and exact-ID publication

The build account packages once, freezes one unsigned payload-tree hash, and
performs two bounded portable lifecycle rounds on one temporary unsigned ZIP:

- clean preflight for exact install path, user data, proof state, product
  process, and port;
- safe ZIP extraction;
- bounded `robocopy` installation with byte-for-byte tree equality;
- exact primary PE metadata and every-PE signature verification;
- real DOM/candidate/nonce/PID/health evidence;
- listener PID bound to the one exact installed executable;
- bounded process-tree shutdown;
- bounded packaged `--smoke-test`; and
- bounded removal with complete directory/process/listener cleanup.

Round 2 recreates the locked dependency installation and repeats audit, unit,
attribution, metadata, policy, desktop, and live OpenAI gates. Both OpenAI rounds
bind the same commit/model/unsigned payload tree with distinct response IDs and
nonce hashes. The build account then atomically hands that tree to the signing
account. The pinned harness signs once and its own two lifecycle rounds must bind
the identical final archive SHA-256 before cleanup evidence and a signed private
handoff can be created.

The write-capable publisher checks out no repository code. It independently
revalidates the signed handoff, archive hash, every visible PE signer/timestamp,
current protected main, peeled immutable tag, repository ID `1313443623`, and the
live no-bypass rulesets. It creates a draft only with `POST /releases`; ownership
exists only when the exact call returns HTTP `201` with a valid numeric `id`,
`node_id`, `created_at`, and author identity. A timeout, non-201 response, missing
response, or malformed JSON is diagnostic-only: the workflow may list visible
same-tag IDs but never adopts or edits one.

After ownership, every Release read and mutation uses that exact ID. Every asset
upload uses its exact Release ID and freezes the returned asset `id`/`node_id`;
content type, size, digest, URL, and authenticated exact asset-ID redownload hash
must match. Only then does an exact-ID PATCH set `draft=false`. Rollback uses only
the frozen immutable Release ID/node ID/creation time/author fields; it never
depends on mutable title, body, or marker text. Failures return only that exact
owned Release to a confirmed private draft. The private signed handoff is removed
only after final exact-ID public verification.

Repository tag ruleset `21631606` (`Immutable Windows release tags`) is also an
exact publication gate: it must remain active for `refs/tags/v*`, contain only
update/deletion protection, expose no bypass actor, and report that the current
actor can never bypass it. Every main/tag check in the publication step rechecks
that live ruleset rather than relying on this document.

Main ruleset `21633558` (`Protected main release lineage`) is likewise checked
live. It must remain active and non-bypassable for only `refs/heads/main`, forbid
deletion and non-fast-forward updates, and retain the single-maintainer PR rule
with stale-review dismissal and required review-thread resolution. The permitted
zero-approval setting does not bypass the PR requirement; it avoids making a
single-owner repository impossible to merge.

## External blockers before release-ready

- SSL.com must issue a publicly trusted cloud code-signing certificate whose
  exact validated signer identity satisfies `LAI ZEYU` or `来泽宇`.
- The repository must be transferred to a GitHub organization that can enforce
  three restricted runner groups for separate build, signing, and publisher
  service accounts; personal public repositories cannot provide this boundary.
- Same-host ephemeral Windows runners, distinct SIDs, the fixed-NTFS exact-ACL
  handoff root, and the pinned out-of-repository machine-bound signing
  harness/broker must be provisioned and independently audited.
- Exact harness, CKA installer/uninstaller, signer Subject, and signer thumbprint
  protected variables must be configured. Static CKA credentials must not be
  added to GitHub secrets or workflow environment variables.
- Both source/lifecycle rounds and the harness's two signed lifecycle rounds must
  pass natively on Windows.
- Partner Center identity reservation is complete for Product ID
  `9NVNLQWQBKHD`; the remaining Store submission fields and package run are not.
- A dedicated limited/revocable reviewer API key must pass the live model and
  structured-response gate in both trusted GitHub rounds and the Store gate,
  and be entered only in protected secrets/private certification notes.
- A labelled elevated active-interactive self-hosted Windows runner must produce
  two strict WACK PASS reports on the unchanged signed Store candidate.
- Store install/DOM/listener/removal and Windows 10/11 clean-machine checks must
  pass on the exact final candidate.
- The user must explicitly authorize Partner Center product creation/reservation,
  any certificate purchase, and final certification submission at their
  respective external-action boundaries.

Until all blockers are cleared, source/workflow improvements may be pushed, but
no unsigned or third-party-signed Windows binary may be published.

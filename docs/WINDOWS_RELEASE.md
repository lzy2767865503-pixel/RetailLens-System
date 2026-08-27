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

The workflow builds once, verifies the literal manifest, creates one short-lived
RSA-3072 non-exportable sideload key, signs one run-owned AppX copy once, deletes
the entire unsigned workspace source, and runs both WACK rounds plus both
lifecycle rounds on those unchanged signed bytes. `scripts/windows-wack.ps1`:

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

The JSON is deliberately named `WACK-private-run-record.json`. It sets
`cryptographicallyAttested=false` and `transferable=false` and explicitly says
that local JSON is not an unforgeable attestation. Its value is limited to an
immediate consistency check inside this owner-restricted, protected-main,
environment-gated run; it must not be used as portable proof. No Store candidate,
WACK report, JSON record, or evidence artifact is uploaded by the workflow.
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
7. requires exactly one `127.0.0.1:47824` listener whose owning PID's canonical
   executable path is exactly the installed path derived from
   `Application.Executable`, not merely any file under the package directory;
8. binds UI evidence PID, health-response PID, listener PID, candidate hash,
   version, and nonce;
9. performs bounded process-tree shutdown and bounded AppX removal; and
10. proves package, package data, temporary certificate, proof state, process,
    and listener cleanup.

Cleanup steps use `if: always()` and independently aggregate package, data,
process, listener, proof, certificate/private-key, candidate, run-root, and
state-file removal failures. The temporary certificate is removed with
`-DeleteKey`, then all exact targets are queried again. The workflow contains no
artifact upload action, so neither success nor failure can transfer the AppX or
its run-private records.

## GitHub trusted signing environment

The protected `github-release` environment supplies:

| Name | Kind | Requirement |
|---|---|---|
| `ESIGNER_CKA_USERNAME` | secret | SSL.com eSigner account username |
| `ESIGNER_CKA_PASSWORD` | secret | SSL.com eSigner account password |
| `ESIGNER_CKA_TOTP_SECRET` | secret | automation TOTP secret authorized for eSigner CKA |
| `WINDOWS_SIGNER_SUBJECT` | variable | exact full certificate Subject; author-owned SimpleName/CN rules still apply |
| `RETAILLENS_CERTIFICATION_OPENAI_MODEL` | variable | exact public model selected for both publication rounds |
| `RETAILLENS_CERTIFICATION_OPENAI_API_KEY` | secret | dedicated limited/revocable key used for two live release gates |

The timestamp is pinned to `http://ts.ssl.com`. The workflow downloads official
SSL.com eSigner CKA `1.0.6` and verifies SHA-256
`e4971440e4ebed94328492cf36e18999554c5c657c856f1cb14a6072c8b1c263`
before installation. SSL.com's documented integration loads the certificate
through CNG/KSP and invokes Windows SignTool by certificate thumbprint. This
repository follows that route.

No workflow secret contains a PFX. No Base64 certificate is decoded. No private
key is exported. `WIN_CSC_LINK` and exportable certificate-password paths are
forbidden. The workflow unloads CKA, removes its exact certificate
representation, runs the bundled uninstaller when present, removes the exact
temporary master-key/install/download and `%APPDATA%\eSignerCKA` state, rejects
any `.pfx`/`.p12` in the workspace, and never uploads CKA logs.

Official eSigner CKA integration guide:

- https://www.ssl.com/how-to/how-to-integrate-esigner-cka-with-ci-cd-tools-for-automated-code-signing/

## Every-PE rule

`scripts/windows-file-policy.ps1` recognizes a PE only after validating `MZ`,
the DOS `e_lfanew` pointer, and the exact `PE\0\0` signature. Windows policy
tests compile a real C# PE fixture; a four-byte `MZ` mock is explicitly rejected.

After `electron-builder --dir`, `scripts/windows-sign-cloud.ps1` discovers every
real PE by content, not extension, across EXE, DLL, `.node`, renamed, or disguised
files. It uses SignTool `remove /s` to strip any pre-existing embedded third-party
signature, proves no signer remains, and then invokes the CKA-backed SignTool to
create the one author-owned timestamped signature on each file. Only after
signing does the workflow create the ZIP.

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

## Two independent GitHub rounds

Round 1 builds once, cloud-signs once, freezes one ZIP SHA-256, then performs a
bounded portable lifecycle:

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

After Round 1, CKA is unloaded and its complete run-owned state is removed. On
the same controlled hosted Windows job, Round 2 recreates the locked dependency
installation and repeats audit, unit, attribution, metadata, real-PE fixture,
desktop tests, and the exact live `/v1/models` plus structured `/v1/responses`
gate; it re-verifies staging, the exact one-signature invariant, and every PE,
then repeats the entire bounded lifecycle on the same signed ZIP bytes. Both live
OpenAI rounds occur after the ZIP hash is frozen and bind the same
commit/model/candidate with distinct response IDs and nonce hashes. The signed
staging directory is transferred to the isolated publication job only after both
complete rounds pass, so a source, signing, cleanup, lifecycle, or OpenAI gate
failure uploads no candidate. The isolated job downloads that one transient
Actions transfer and immediately deletes it by exact numeric artifact ID before
performing any publication work, so a later draft/publication failure does not
leave the transferred candidate as an Actions artifact.

The write-capable publication job checks out no repository code; `GH_TOKEN`
exists only in two narrow `gh` steps: transient-artifact deletion and the final
release transaction. Publication first rechecks remote main and the
peeled tag, creates a private draft release, locks every later read/mutation to
the workflow-created numeric Release ID, verifies the
exact asset-name set, redownloads every draft asset, compares every SHA-256 to
the locally verified staging bytes, and only then changes `draft=false`. It then
re-reads public state, downloads every public asset anonymously, compares every
hash, and performs final main/tag/Release-ID checks. A failure before publication
deletes only the owned draft by numeric ID. Any ambiguous publication failure
attempts to return only that same owned Release ID to draft and fails loudly if
ownership or rollback cannot be proven.

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
- The protected CKA secrets and exact `WINDOWS_SIGNER_SUBJECT` must be configured.
- Both trusted GitHub rounds must pass natively on Windows.
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

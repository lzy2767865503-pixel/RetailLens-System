import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);
const read = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

describe("fail-closed Windows workflow source policy", () => {
  it("never enables the isolated self-signed fixture allowance in a workflow", () => {
    for (const workflowPath of [
      ".github/workflows/windows-quality.yml",
      ".github/workflows/windows-store.yml",
      ".github/workflows/windows-github-release.yml"
    ]) {
      expect(read(workflowPath)).not.toContain(
        "TestOnlyAllowUntrustedSigner"
      );
      expect(read(workflowPath)).not.toContain(
        "RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT"
      );
    }
  });

  it("never uploads a Store candidate or evidence artifact", () => {
    const workflow = read(".github/workflows/windows-store.yml");
    const cleanup = read("scripts/windows-store-cleanup.ps1");
    expect(workflow).not.toContain("actions/upload-artifact");
    expect(workflow).toContain("Candidate/evidence artifact upload: none");
    expect(workflow).toContain("windows-store-cleanup.ps1");
    expect(cleanup).toContain("-DeleteKey");
    expect(cleanup).toContain('if (-not $state) { return }');
    expect(workflow).toContain("LAIZEYU.RetailDecisionStudiobyLAIZEYU");
    expect(workflow).toContain("CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8");
    expect(workflow).toContain("vars.RETAILLENS_WINDOWS_IDENTITY_NAME");
    expect(workflow).toContain("vars.WINDOWS_PUBLISHER");
    expect(workflow.match(/windows-wack\.ps1/g)).toHaveLength(2);
    expect(workflow.match(/windows-store-lifecycle\.ps1/g)).toHaveLength(2);
    expect(
      workflow.match(/validate-openai-certification\.mjs/g)
    ).toHaveLength(2);
  });

  it("uses a strict signed staging inventory for every binary transfer", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    expect(workflow).toContain("windows-stage-release.ps1");
    expect(workflow).toContain("windows-verify-staging.ps1");
    expect(workflow).toContain("ExpectedSignerThumbprint");
    expect(workflow).toContain("path: signed-staging/");
    expect(workflow).toContain("portable-directory.zip");
    expect(workflow).not.toMatch(/release\/windows\/\*\.exe/);
    expect(workflow.match(/actions\/upload-artifact/g)).toHaveLength(1);
    expect(workflow).toContain("include-hidden-files: false");
    expect(workflow.indexOf("Transfer candidate only after both complete rounds passed"))
      .toBeGreaterThan(workflow.lastIndexOf("validate-openai-certification.mjs"));
  });

  it("discovers PE files by magic and requires signer plus timestamp chains", () => {
    const builder = read("electron-builder.config.cjs");
    const verifier = read("scripts/windows-verify-authenticode.ps1");
    expect(builder).toContain('signExts: [".exe", ".dll", ".node"]');
    expect(verifier).toContain("Get-RetailLensPortableExecutable");
    expect(verifier).toContain("InspectEmbeddedPayload");
    expect(verifier).toContain("pinned @electron/asar CLI");
    expect(verifier).toContain("could conceal an unsigned PE");
    expect(verifier).toContain("TimeStamperCertificate");
    expect(verifier).toContain("1.3.6.1.5.5.7.3.8");
    expect(verifier).toContain("ExpectedSignerThumbprint");
    expect(verifier).toContain("X509RevocationMode]::Online");
    expect(verifier).toContain("Signature Index:");
    expect(verifier).toContain("exactly one Authenticode signature index");
  });

  it("uses SSL.com eSigner CKA plus Windows SignTool and forbids PFX export", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    const signer = read("scripts/windows-sign-cloud.ps1");
    const cleaner = read("scripts/windows-clean-esigner.ps1");
    expect(workflow).toContain("ESIGNER_CKA_VERSION: 1.0.6");
    expect(workflow).toContain("e4971440e4ebed94328492cf36e18999554c5c657c856f1cb14a6072c8b1c263");
    expect(workflow).toContain("eSignerCKATool.exe");
    expect(workflow).toContain("'load'");
    expect(workflow).toContain("RETAILLENS_ESIGNER_APPDATA_STATE");
    expect(workflow).toContain("GITHUB_RUN_ATTEMPT");
    expect(cleaner).toContain("eSigner CKA uninstall");
    expect(cleaner).toContain('if (-not $preexistingState) { return }');
    expect(cleaner).toContain("final CKA recheck");
    expect(signer).toContain("signtool.exe");
    expect(signer).toContain('@("remove", "/s"');
    expect(signer).toContain('"/sha1"');
    expect(workflow).not.toContain("WINDOWS_SIGNING_CERTIFICATE_BASE64");
    expect(workflow).not.toContain("WIN_CSC_LINK");
    expect(workflow).not.toMatch(/Base64 PFX|exportable PFX/i);
  });

  it("removes whole unsigned candidate roots and rejects disguised evidence", () => {
    const workflow = read(".github/workflows/windows-quality.yml");
    expect(workflow).toContain("Remove-Item -LiteralPath $candidateRoot -Recurse -Force");
    expect(workflow).not.toContain("actions/upload-artifact");
    expect(workflow).toContain("without uploading evidence");
    expect(workflow).toContain("No Windows binary or evidence artifact is uploaded");
  });

  it("requires bounded install/run/uninstall, exact manifest listener, and interactive WACK", () => {
    const round2 = read("scripts/windows-round2.ps1");
    const store = read(".github/workflows/windows-store.yml");
    const wack = read("scripts/windows-wack.ps1");
    const wackPolicy = read("scripts/windows-wack-policy.ps1");
    const process = read("scripts/windows-process.ps1");
    const storePrepare = read("scripts/windows-prepare-store-candidate.ps1");
    const storeLifecycle = read("scripts/windows-store-lifecycle.ps1");
    expect(round2).toContain("Round 2 preflight");
    expect(round2).toContain("Portable-directory installation");
    expect(round2).toContain("Portable-directory uninstall");
    expect(round2).toContain("TimeoutSeconds");
    expect(storePrepare).toContain("Store preflight found an existing exact-identity package");
    expect(storePrepare).toContain('"app\\Retail Decision Studio by LAI ZEYU.exe"');
    expect(storePrepare).toContain("SignatureStatus]::NotSigned");
    expect(storeLifecycle).toContain("expectedInstalledExecutable");
    expect(store).toContain("retaillens-wack");
    expect(store).toContain("self-hosted");
    expect(store).toContain("- interactive");
    expect(store).toContain("- elevated");
    expect(wack).toContain("Invoke-RetailLensBoundedProcess");
    expect(wackPolicy).toContain("non-whitelisted result");
    expect(process).toContain("TIMEOUT");
    expect(wack).toContain("WACK report is stale");
    expect(wackPolicy).toContain("complete non-partial run");
    expect(wack).toContain('"finalizereport"');
    expect(wack).toContain("-AllowedExitCode @(0, 1)");
    const recordVerifier = read("scripts/windows-verify-wack-run-record.ps1");
    const policy = read("scripts/windows-wack-policy.ps1");
    expect(wack).toContain("cryptographicallyAttested = $false");
    expect(wack).toContain("transferable = $false");
    expect(wack).toContain("not an unforgeable attestation");
    expect(recordVerifier).toContain("Get-FileHash -LiteralPath $package");
    expect(recordVerifier).toContain("Get-FileHash -LiteralPath $report");
    expect(recordVerifier).toContain("not a cryptographic attestation");
    expect(policy).toContain("non-whitelisted result");
    expect(store).not.toContain("windows-wack-attestation");
  });

  it("isolates GitHub write permission and binds tag, main, draft, and public assets", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    const publishJob = workflow.slice(workflow.indexOf("  publish_verified_release:"));
    expect(workflow).toContain("persist-credentials: false");
    expect(workflow).toContain("github.repository_owner == 'lzy2767865503-pixel'");
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain("tag must peel to the exact current protected main commit");
    expect(workflow).toContain("contents: write");
    expect(workflow.match(/contents: write/g)).toHaveLength(1);
    expect(workflow.match(/environment: github-release/g)).toHaveLength(2);
    expect(workflow.match(/GH_TOKEN:/g)).toHaveLength(2);
    expect(workflow.match(/GH_REPO:/g)).toHaveLength(2);
    expect(workflow).toContain("actions: write");
    expect(workflow).toContain("Delete transient Actions transfer immediately after download");
    expect(workflow).toContain("without checking out repository code");
    expect(workflow).toContain("$Release.draft -ne $ExpectedDraft");
    expect(workflow).toContain("Assert-MainAndTag");
    expect(workflow).toContain("ownedReleaseId");
    expect(workflow).toContain("ownershipMarker");
    expect(workflow).toContain("createExitCode");
    expect(workflow).toContain("$PSNativeCommandUseErrorActionPreference = $false");
    expect(workflow).toContain("releases?per_page=100");
    expect(workflow).toContain("releases/$script:ownedReleaseId");
    expect(workflow).toContain("Release ID ownership");
    expect(workflow.indexOf("$script:ownedReleaseId = [long]$draft.id"))
      .toBeLessThan(workflow.indexOf("Assert-MainAndTag", workflow.indexOf("$script:ownedReleaseId = [long]$draft.id")));
    expect(workflow).toContain('RETAILLENS_RELEASE_TAG_RULESET_ID: "21631606"');
    expect(workflow).toContain('RETAILLENS_RELEASE_MAIN_RULESET_ID: "21633558"');
    expect(workflow).toContain("Assert-ImmutableTagRuleset");
    expect(workflow).toContain("Assert-ProtectedMainRuleset");
    expect(workflow).toContain("refs/tags/v*");
    expect(workflow).toContain("refs/heads/main");
    expect(workflow).toContain("current_user_can_bypass");
    expect(publishJob).not.toContain("actions/checkout");
    expect(publishJob).toContain("contents: write");
    expect(publishJob).toContain("github.repository_owner == 'lzy2767865503-pixel'");
    expect(publishJob).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain("anonymous");
    expect(workflow).toContain("rollback");
  });

  it("requires live public-model lookup and structured Responses API evidence", () => {
    const source = read("scripts/validate-openai-certification.mjs");
    const staticGate = read("scripts/validate-certification-gates.mjs");
    const githubRelease = read(".github/workflows/windows-github-release.yml");
    expect(source).toContain("client.models.retrieve(model)");
    expect(source).toContain("client.responses.create");
    expect(source).toContain('type: "json_schema"');
    expect(source).toContain("RETAILLENS_CERTIFICATION_COMMIT_SHA");
    expect(source).toContain("RETAILLENS_CERTIFICATION_CANDIDATE_SHA256");
    expect(source).toContain("nonceSha256");
    expect(githubRelease).toContain("candidate changed during the live call");
    expect(staticGate).toContain('"gpt-5"');
    expect(staticGate).not.toContain("gpt-5.6-sol");
    expect(
      githubRelease.match(/validate-openai-certification\.mjs/g)
    ).toHaveLength(2);
  });
});

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
  it("never enables the isolated self-signed fixture allowance in production workflows", () => {
    for (const workflowPath of [
      ".github/workflows/windows-quality.yml",
      ".github/workflows/windows-store.yml",
      ".github/workflows/windows-github-release.yml"
    ]) {
      const workflow = read(workflowPath);
      expect(workflow).not.toContain("TestOnlyAllowUntrustedSigner");
      expect(workflow).not.toContain("RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT");
    }
  });

  it("keeps one unsigned Store submission, proves QA payload equivalence, and retains only a private local handoff", () => {
    const workflow = read(".github/workflows/windows-store.yml");
    const prepare = read("scripts/windows-prepare-store-candidate.ps1");
    const equivalence = read("scripts/windows-appx-payload-equivalence.ps1");
    const retention = read("scripts/windows-retain-private-store-handoff.ps1");
    const screenshots = read("scripts/windows-collect-store-screenshots.ps1");
    const cleanup = read("scripts/windows-store-cleanup.ps1");
    const electron = read("electron/main.ts");

    expect(workflow).not.toContain("actions/upload-artifact");
    expect(workflow).toContain("Candidate/evidence artifact upload: none");
    expect(workflow).toContain("RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT");
    expect(workflow).toContain("windows-retain-private-store-handoff.ps1");
    expect(workflow).toContain("unsigned submission");
    expect(workflow).toContain("payload-tree SHA-256");
    expect(prepare).toContain("submissionPath");
    expect(prepare).toContain("privateHandoffRetained");
    expect(prepare).toContain("windows-appx-payload-equivalence.ps1");
    expect(prepare).toContain("SignatureStatus]::NotSigned");
    expect(equivalence).toContain('"AppxSignature.p7x"');
    expect(equivalence).toContain("payloadTreeSha256");
    expect(equivalence).toContain("Unsigned submission and signed QA AppX payload trees differ");
    expect(retention).toContain("DriveType]::Fixed");
    expect(retention).toContain('DriveFormat -cne "NTFS"');
    expect(retention).toContain("Assert-ExactPrivateAcl");
    expect(retention).toContain(".incomplete");
    expect(retention).toContain("[System.IO.Directory]::Move");
    expect(retention).toContain("UNSIGNED_FOR_PARTNER_CENTER");
    expect(retention).toContain("NOT_SUBMITTED");
    expect(retention).toContain("NOT_CERTIFIED");
    expect(retention).toContain("store-listing-screenshots");
    expect(retention).toContain("screenshotsFromExactQaCandidate = $true");
    expect(retention).toContain('screenshotDimensions = "1366x768"');
    expect(screenshots).toContain("Packaged candidate did not produce Store screenshots");
    expect(screenshots).toContain("Store screenshot is not exactly 1366 x 768 pixels");
    expect(screenshots).toContain('"BUILT_IN_DEMO_ONLY"');
    expect(screenshots).toContain("text or EXIF metadata that could carry sensitive data");
    expect(electron).toContain("captureStoreScreenshots");
    expect(electron).toContain("webContents.capturePage");
    expect(electron).toContain("STORE_SCREENSHOT_WIDTH = 1366");
    expect(electron).toContain("STORE_SCREENSHOT_HEIGHT = 768");
    expect(electron).toContain("assertScreenshotPrivacy");
    expect(electron).toContain("BUILT_IN_DEMO_ONLY");
    expect(electron).not.toContain("docs/design");
    expect(cleanup).toContain("-DeleteKey");
    expect(cleanup).not.toContain("RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT");
  });

  it("requires two WACK and two lifecycle rounds on one QA hash and one approved canonical appcert version/hash", () => {
    const workflow = read(".github/workflows/windows-store.yml");
    const wack = read("scripts/windows-wack.ps1");
    const verifier = read("scripts/windows-verify-wack-run-record.ps1");
    const policy = read("scripts/windows-wack-policy.ps1");

    expect(workflow.match(/windows-wack\.ps1/g)).toHaveLength(2);
    expect(workflow.match(/windows-store-lifecycle\.ps1/g)).toHaveLength(2);
    expect(workflow.match(/windows-verify-wack-run-record\.ps1/g)).toHaveLength(2);
    expect(workflow).toContain("RETAILLENS_APPROVED_WACK_FILE_VERSION");
    expect(workflow).toContain("$round1.appcert.sha256 -cne $round2.appcert.sha256");
    expect(workflow).toContain("$round1.package.sha256 -cne $round2.package.sha256");
    expect(wack).toContain("ApprovedWackFileVersion");
    expect(wack).toContain("FileVersionRaw");
    expect(wack).toContain("Windows Kits\\10\\App Certification Kit\\appcert.exe");
    expect(wack).toContain("O=Microsoft Corporation");
    expect(wack).toContain("approvedFileVersion = $ApprovedWackFileVersion");
    expect(wack).toContain("cryptographicallyAttested = $false");
    expect(wack).toContain("transferable = $false");
    expect(wack).toContain("not an unforgeable attestation");
    expect(verifier).toContain("ExpectedApprovedWackFileVersion");
    expect(verifier).toContain("FileVersionRaw");
    expect(verifier).toContain("windows-appx-payload-equivalence.ps1");
    expect(policy).toContain("complete non-partial run");
    expect(policy).toContain("non-whitelisted result");
  });

  it("never transfers unsigned GitHub release bytes through Actions artifacts", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    const handoff = read("scripts/windows-stage-private-release-handoff.ps1");

    expect(workflow).not.toContain("actions/upload-artifact");
    expect(workflow).not.toContain("actions/download-artifact");
    expect(workflow).toContain("build_private_unsigned_candidate:");
    expect(workflow).toContain("sign_private_candidate:");
    expect(workflow).toContain("publish_verified_release:");
    expect(workflow).toContain("retaillens-trusted-windows-build");
    expect(workflow).toContain("retaillens-trusted-windows-signing");
    expect(workflow).toContain("retaillens-trusted-windows-publisher");
    expect(workflow).toContain("windows-stage-private-release-handoff.ps1");
    expect(workflow).toContain("Unsigned Windows bytes were removed from the workspace and were never uploaded as a GitHub artifact");
    expect(handoff).toContain("RetailLensReleaseHandoff");
    expect(handoff).toContain("DriveType]::Fixed");
    expect(handoff).toContain('DriveFormat -cne "NTFS"');
    expect(handoff).toContain("Build, signing, and publisher runner accounts must have three distinct SIDs");
    expect(handoff).toContain("githubArtifactTransfer = $false");
    expect(handoff).toContain(".incomplete");
    expect(handoff).toContain("[System.IO.Directory]::Move");
  });

  it("keeps static CKA secrets out of the no-checkout signer and requires pinned machine-bound cleanup evidence", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    const signJob = workflow.slice(
      workflow.indexOf("  sign_private_candidate:"),
      workflow.indexOf("  publish_verified_release:")
    );

    expect(signJob).not.toContain("actions/checkout");
    expect(signJob).toContain("permissions: {}");
    expect(signJob).toContain("no-checkout");
    expect(signJob).toContain("RETAILLENS_TRUSTED_SIGNING_HARNESS_SHA256");
    expect(signJob).toContain("machine-bound-broker");
    expect(signJob).toContain("DriveType]::Fixed");
    expect(signJob).toContain("DriveFormat -cne 'NTFS'");
    expect(signJob).toContain("Assert-ExactBoundaryAcl");
    expect(signJob).toContain("Unsigned private handoff child");
    expect(signJob).toContain("contains an unrecorded or missing file");
    expect(signJob).not.toContain("${{ secrets.ESIGNER_CKA_USERNAME }}");
    expect(signJob).not.toContain("${{ secrets.ESIGNER_CKA_PASSWORD }}");
    expect(signJob).not.toContain("${{ secrets.ESIGNER_CKA_TOTP_SECRET }}");
    expect(signJob).not.toContain("${{ secrets.SSL_ESIGNER_USERNAME }}");
    expect(signJob).not.toContain("${{ secrets.SSL_ESIGNER_PASSWORD }}");
    expect(signJob).not.toContain("${{ secrets.SSL_ESIGNER_TOTP_SECRET }}");
    expect(signJob).not.toContain("WINDOWS_SIGNING_CERTIFICATE_BASE64: ${{");
    expect(signJob).not.toContain("WIN_CSC_LINK: ${{");
    expect(signJob).toContain("RETAILLENS_ESIGNER_CKA_INSTALLER_SHA256");
    expect(signJob).toContain("RETAILLENS_ESIGNER_CKA_UNINSTALLER_SHA256");
    expect(signJob).toContain("expected-state-schema 3");
    expect(signJob).toContain("require-delete-key");
    expect(signJob).toContain("require-provider-baseline");
    expect(signJob).toContain("require-registry-baseline");
    expect(signJob).toContain("require-zero-cka-processes");
    expect(signJob).toContain("providerBaselineRestored");
    expect(signJob).toContain("certificateRepresentationsRemoved");
    expect(signJob).toContain("privateKeyContainersRemoved");
    expect(signJob).toContain("masterKeyRemoved");
    expect(signJob).toContain("appDataRemoved");
    expect(signJob).toContain("registryBaselineRestored");
    expect(signJob).toContain("uninstallerHashReverified");
    expect(signJob).toContain("cleanupRecheckCompleted");
  });

  it("publishes only from an HTTP 201 REST response and freezes immutable Release and asset IDs", () => {
    const workflow = read(".github/workflows/windows-github-release.yml");
    const publishJob = workflow.slice(workflow.indexOf("  publish_verified_release:"));
    const immutableFunction = publishJob.slice(
      publishJob.indexOf("function Assert-ImmutableReleaseOwnership"),
      publishJob.indexOf("function Assert-ReleasePublicationContract")
    );
    const rollbackFunction = publishJob.slice(
      publishJob.indexOf("function Restore-OwnedReleaseToDraft"),
      publishJob.indexOf(
        "\n          Assert-RepositoryAndLineage\n          $preexisting",
        publishJob.indexOf("function Restore-OwnedReleaseToDraft")
      )
    );

    expect(workflow.match(/contents: write/g)).toHaveLength(1);
    expect(publishJob).not.toContain("actions/checkout");
    expect(publishJob).not.toContain("gh release create");
    expect(publishJob).toContain("-Method POST");
    expect(publishJob).toContain('Uri "$ApiBase/releases"');
    expect(publishJob).toContain("-ExpectedStatus @(201)");
    expect(publishJob).toContain("before exact HTTP 201 ownership; no Release will be edited");
    expect(publishJob).toContain("NOT OWNED");
    expect(publishJob).toContain("candidateOwnership");
    expect(publishJob).toContain("repositoryId = [long]1313443623");
    expect(immutableFunction).toContain("Release.id");
    expect(immutableFunction).toContain("Release.node_id");
    expect(immutableFunction).toContain("Release.created_at");
    expect(immutableFunction).toContain("Release.author.id");
    expect(immutableFunction).toContain("Release.author.login");
    expect(immutableFunction).not.toContain("Release.name");
    expect(immutableFunction).not.toContain("Release.body");
    expect(publishJob).toContain("releases/$($Ownership.id)");
    expect(publishJob).toContain("releases/$($ownership.id)");
    expect(publishJob).toContain("releases/assets/$($frozen.id)");
    expect(publishJob).toContain("FrozenAssets");
    expect(publishJob).toContain("asset.node_id");
    expect(publishJob).toContain("asset.content_type");
    expect(publishJob).toContain("asset.digest");
    expect(rollbackFunction).not.toContain("ExpectedTitle");
    expect(rollbackFunction).not.toContain("ExpectedBody");
    expect(rollbackFunction).not.toContain("Assert-RepositoryAndLineage");
    expect(rollbackFunction).toContain("Assert-CanonicalRepository");
    expect(rollbackFunction).toContain("Ownership.id");
    expect(publishJob).toContain('RETAILLENS_RELEASE_TAG_RULESET_ID: "21631606"');
    expect(publishJob).toContain('RETAILLENS_RELEASE_MAIN_RULESET_ID: "21633558"');
    expect(publishJob).toContain("current_user_can_bypass");
  });

  it("discovers PE files by magic and requires exact signer and timestamp chains", () => {
    const builder = read("electron-builder.config.cjs");
    const verifier = read("scripts/windows-verify-authenticode.ps1");
    const workflow = read(".github/workflows/windows-github-release.yml");
    expect(builder).toContain('signExts: [".exe", ".dll", ".node"]');
    expect(verifier).toContain("Get-RetailLensPortableExecutable");
    expect(verifier).toContain("InspectEmbeddedPayload");
    expect(verifier).toContain("pinned @electron/asar CLI");
    expect(verifier).toContain("could conceal an unsigned PE");
    expect(verifier).toContain("TimeStamperCertificate");
    expect(verifier).toContain("1.3.6.1.5.5.7.3.8");
    expect(verifier).toContain("X509RevocationMode]::Online");
    expect(verifier).toContain("exactly one Authenticode signature index");
    expect(workflow).toContain("$stream.ReadByte() -eq 0x4D");
    expect(workflow).toContain("signerSimpleName -notin @('LAI ZEYU', '来泽宇')");
    expect(workflow).toContain("lifecycleRounds -ne 2");
  });

  it("keeps quality workflows artifact-free and uses bounded lifecycle controls", () => {
    const workflow = read(".github/workflows/windows-quality.yml");
    const round2 = read("scripts/windows-round2.ps1");
    const storeLifecycle = read("scripts/windows-store-lifecycle.ps1");
    const process = read("scripts/windows-process.ps1");
    expect(workflow).not.toContain("actions/upload-artifact");
    expect(workflow).toContain("Remove-Item -LiteralPath $candidateRoot -Recurse -Force");
    expect(workflow).toContain("No Windows binary or evidence artifact is uploaded");
    expect(round2).toContain("Portable-directory installation");
    expect(round2).toContain("Portable-directory uninstall");
    expect(round2).toContain("TimeoutSeconds");
    expect(storeLifecycle).toContain("expectedInstalledExecutable");
    expect(process).toContain("TIMEOUT");
  });

  it("requires two live public-model structured Responses API rounds", () => {
    const source = read("scripts/validate-openai-certification.mjs");
    const staticGate = read("scripts/validate-certification-gates.mjs");
    const release = read(".github/workflows/windows-github-release.yml");
    const store = read(".github/workflows/windows-store.yml");
    expect(source).toContain("client.models.retrieve(model)");
    expect(source).toContain("client.responses.create");
    expect(source).toContain('type: "json_schema"');
    expect(source).toContain("RETAILLENS_CERTIFICATION_COMMIT_SHA");
    expect(source).toContain("RETAILLENS_CERTIFICATION_CANDIDATE_SHA256");
    expect(source).toContain("nonceSha256");
    expect(staticGate).toContain('"gpt-5"');
    expect(staticGate).not.toContain("gpt-5.6-sol");
    expect(release.match(/validate-openai-certification\.mjs/g)).toHaveLength(2);
    expect(store.match(/validate-openai-certification\.mjs/g)).toHaveLength(2);
  });
});

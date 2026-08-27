param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [string]$ReportPath,
  [Parameter(Mandatory = $true)] [string]$RunRecordPath,
  [Parameter(Mandatory = $true)] [ValidateSet(1, 2)] [int]$ExpectedRound,
  [Parameter(Mandatory = $true)] [string]$ExpectedRepository,
  [Parameter(Mandatory = $true)] [string]$ExpectedCommitSha,
  [Parameter(Mandatory = $true)] [string]$ExpectedWorkflowRef,
  [Parameter(Mandatory = $true)] [string]$ExpectedWorkflowRunId,
  [Parameter(Mandatory = $true)] [string]$ExpectedWorkflowRunAttempt,
  [Parameter(Mandatory = $true)] [string]$ExpectedApprovedWackFileVersion
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-wack-policy.ps1"
. "$PSScriptRoot/windows-file-policy.ps1"

function Assert-ExactKeys($Object, [string[]]$ExpectedKeys, [string]$Context) {
  $actualKeys = @($Object.PSObject.Properties.Name) | Sort-Object
  if (@(Compare-Object ($ExpectedKeys | Sort-Object) $actualKeys -CaseSensitive).Count -ne 0) {
    throw "$Context contains missing or unexpected fields."
  }
}

$state = Get-Content -LiteralPath (Resolve-Path -LiteralPath $StatePath).Path -Raw | ConvertFrom-Json
$package = (Resolve-Path -LiteralPath ([string]$state.candidatePath)).Path
$submission = (Resolve-Path -LiteralPath ([string]$state.submissionPath)).Path
$report = (Resolve-Path -LiteralPath $ReportPath).Path
$recordPath = (Resolve-Path -LiteralPath $RunRecordPath).Path
$record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
Assert-ExactKeys $state @(
  "applicationId", "candidatePath", "candidateSha256", "certificateFriendlyName",
  "certificateThumbprint", "executable", "identityName", "payloadFileCount",
  "payloadTreeSha256", "privateHandoffRetained", "productVersion", "publisher",
  "runId", "runRoot", "schemaVersion", "submissionPath", "submissionSha256",
  "unsignedWorkspaceDestroyed", "version"
) "Store candidate state"
if (
  $state.schemaVersion -ne 2 -or
  $state.identityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU" -or
  $state.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
  $state.applicationId -cne "RetailDecisionStudio" -or
  $state.executable -cne "app\Retail Decision Studio by LAI ZEYU.exe" -or
  $state.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
  $state.version -cne "$($state.productVersion).0" -or
  $state.candidateSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.submissionSha256 -notmatch '^[0-9a-f]{64}$' -or
  [int]$state.payloadFileCount -lt 4 -or
  $state.payloadTreeSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.certificateThumbprint -notmatch '^[0-9a-f]{40}$' -or
  $state.unsignedWorkspaceDestroyed -ne $true -or
  $state.privateHandoffRetained -ne $false
) { throw "Store candidate state identity is not exact." }
$runRoot = (Resolve-Path -LiteralPath ([string]$state.runRoot)).Path
$runRootItem = Get-Item -LiteralPath $runRoot -Force
$packageItem = Get-Item -LiteralPath $package -Force
$submissionItem = Get-Item -LiteralPath $submission -Force
if (
  -not $runRootItem.PSIsContainer -or
  ($runRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  ($packageItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  ($submissionItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  -not (Test-RetailLensPathWithin -CandidatePath $package -RootPath $runRoot) -or
  (Split-Path -Leaf $package) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64-qa-signed.appx" -or
  -not (Test-RetailLensPathWithin -CandidatePath $submission -RootPath $runRoot) -or
  (Split-Path -Leaf $submission) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64.appx" -or
  -not (Test-RetailLensPathWithin -CandidatePath $report -RootPath $runRoot) -or
  -not (Test-RetailLensPathWithin -CandidatePath $recordPath -RootPath $runRoot)
) { throw "WACK same-run verifier path boundary failed." }
$expectedKeys = @(
  "appcert", "author", "commitSha", "cryptographicallyAttested", "evidenceKind",
  "finishedAt", "interactiveSessionId", "limitation", "package", "product",
  "report", "repository", "round", "runId", "schemaVersion", "startedAt",
  "transferable", "workflowRef", "workflowRunAttempt", "workflowRunId"
) | Sort-Object
Assert-ExactKeys $record $expectedKeys "WACK private run record"
Assert-ExactKeys $record.package @(
  "applicationId", "executable", "fileName", "identityName", "processorArchitecture",
  "productVersion", "publisher", "sha256", "signerThumbprint", "version"
) "WACK private run record package"
Assert-ExactKeys $record.report @(
  "kitVersion", "latestVersion", "overallResult", "partialRun", "sha256",
  "testCount", "testInventorySha256", "tests"
) "WACK private run record report"
Assert-ExactKeys $record.appcert @(
  "approvedFileVersion", "fileVersion", "sha256", "signerSubject", "signerThumbprint"
) "WACK private run record appcert"
if (
  $record.schemaVersion -ne 2 -or
  $record.evidenceKind -cne "private-same-run-record" -or
  $record.cryptographicallyAttested -ne $false -or
  $record.transferable -ne $false -or
  $record.limitation -notmatch 'not an unforgeable attestation' -or
  $record.repository -cne $ExpectedRepository -or
  $record.commitSha -cne $ExpectedCommitSha -or
  $record.workflowRef -cne $ExpectedWorkflowRef -or
  [string]$record.workflowRunId -cne $ExpectedWorkflowRunId -or
  [string]$record.workflowRunAttempt -cne $ExpectedWorkflowRunAttempt -or
  [int]$record.round -ne $ExpectedRound -or
  [string]$record.runId -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' -or
  [int]$record.interactiveSessionId -lt 1 -or
  $record.product -cne "Retail Decision Studio by LAI ZEYU" -or
  $record.author -cne "LAI ZEYU（来泽宇）"
) { throw "WACK private run record identity/scope policy failed." }

$packageHash = (Get-FileHash -LiteralPath $package -Algorithm SHA256).Hash.ToLowerInvariant()
$reportHash = (Get-FileHash -LiteralPath $report -Algorithm SHA256).Hash.ToLowerInvariant()
if (
  $record.package.fileName -cne (Split-Path -Leaf $package) -or
  $record.package.sha256 -cne $packageHash -or
  $record.package.sha256 -cne [string]$state.candidateSha256 -or
  $record.package.identityName -cne [string]$state.identityName -or
  $record.package.publisher -cne [string]$state.publisher -or
  $record.package.version -cne [string]$state.version -or
  $record.package.productVersion -cne [string]$state.productVersion -or
  $record.package.processorArchitecture -cne "x64" -or
  $record.package.applicationId -cne [string]$state.applicationId -or
  $record.package.executable -cne [string]$state.executable -or
  $record.package.signerThumbprint -cne ([string]$state.certificateThumbprint).ToLowerInvariant() -or
  $record.report.sha256 -cne $reportHash
) { throw "WACK private run record is not bound to the exact state/package/report bytes." }
$equivalence = & "$PSScriptRoot/windows-appx-payload-equivalence.ps1" `
  -SubmissionAppxPath $submission `
  -QaAppxPath $package `
  -ExpectedQaCertificateThumbprint ([string]$state.certificateThumbprint)
if (
  $equivalence.submissionPackageSha256 -cne [string]$state.submissionSha256 -or
  $equivalence.qaPackageSha256 -cne [string]$state.candidateSha256 -or
  [int]$equivalence.payloadFileCount -ne [int]$state.payloadFileCount -or
  $equivalence.payloadTreeSha256 -cne [string]$state.payloadTreeSha256
) { throw "WACK private record no longer shares the unsigned submission payload tree." }
$packageSignature = Get-AuthenticodeSignature -LiteralPath $package
if (
  $packageSignature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $packageSignature.SignerCertificate -or
  $packageSignature.SignerCertificate.Subject -cne [string]$state.publisher -or
  $packageSignature.SignerCertificate.Thumbprint.Replace(" ", "").ToLowerInvariant() -cne [string]$record.package.signerThumbprint
) { throw "WACK private run record package signature changed or is not exact." }

$policy = Read-RetailLensCompleteWackReport -ReportPath $report
$testInventoryJson = $policy.Tests | ConvertTo-Json -Depth 4 -Compress
$testInventoryHash = [Convert]::ToHexString(
  [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($testInventoryJson))
).ToLowerInvariant()
if (
  $record.report.overallResult -cne $policy.OverallResult -or
  $record.report.partialRun -ne $false -or
  $record.report.latestVersion -ne $true -or
  $record.report.kitVersion -cne $policy.KitVersion -or
  [int]$record.report.testCount -ne $policy.TestCount -or
  $record.report.testInventorySha256 -cne $testInventoryHash
) { throw "WACK report semantics do not match the same-run record." }
$recordTestInventoryJson = $record.report.tests | ConvertTo-Json -Depth 4 -Compress
$recordTestInventoryHash = [Convert]::ToHexString(
  [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($recordTestInventoryJson))
).ToLowerInvariant()
if ($recordTestInventoryHash -cne $testInventoryHash) {
  throw "WACK private run record test inventory does not match the exact report tests."
}

try {
  $startedAt = [DateTimeOffset]$record.startedAt
  $finishedAt = [DateTimeOffset]$record.finishedAt
} catch { throw "WACK private run record timestamps are invalid." }
if (
  $finishedAt -le $startedAt -or
  ($finishedAt - $startedAt).TotalHours -gt 2.25 -or
  $finishedAt -gt [DateTimeOffset]::UtcNow.AddMinutes(2) -or
  $finishedAt -lt [DateTimeOffset]::UtcNow.AddMinutes(-15)
) { throw "WACK private run record is stale or has an impossible duration." }
$reportItem = Get-Item -LiteralPath $report
if (
  $reportItem.LastWriteTimeUtc -lt $startedAt.UtcDateTime.AddSeconds(-2) -or
  $reportItem.LastWriteTimeUtc -gt $finishedAt.UtcDateTime.AddSeconds(2)
) { throw "WACK report file time is outside the bound same-run interval." }

$kitPath = [System.IO.Path]::GetFullPath(
  (Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\App Certification Kit\appcert.exe")
)
if (-not (Test-Path -LiteralPath $kitPath -PathType Leaf)) { throw "Current appcert.exe is missing." }
$kitItem = Get-Item -LiteralPath $kitPath -Force
$canonicalFileVersion = $kitItem.VersionInfo.FileVersionRaw.ToString()
$kitSignature = Get-AuthenticodeSignature -LiteralPath $kitPath
if (
  $record.appcert.sha256 -cne (Get-FileHash -LiteralPath $kitPath -Algorithm SHA256).Hash.ToLowerInvariant() -or
  $ExpectedApprovedWackFileVersion -notmatch '^\d+(?:\.\d+){3}$' -or
  [string]$record.appcert.approvedFileVersion -cne $ExpectedApprovedWackFileVersion -or
  [string]$record.appcert.fileVersion -cne $ExpectedApprovedWackFileVersion -or
  $canonicalFileVersion -cne [string]$record.appcert.fileVersion -or
  ($kitItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  $kitSignature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $kitSignature.SignerCertificate -or
  $kitSignature.SignerCertificate.Subject -notmatch '(?i)(?:^|,\s*)O=Microsoft Corporation(?:,|$)' -or
  -not (@($kitSignature.SignerCertificate.EnhancedKeyUsageList) | Where-Object {
    $_.ObjectId.Value -eq "1.3.6.1.5.5.7.3.3"
  }) -or
  $kitSignature.SignerCertificate.Subject -cne [string]$record.appcert.signerSubject -or
  $kitSignature.SignerCertificate.Thumbprint.Replace(" ", "").ToLowerInvariant() -cne [string]$record.appcert.signerThumbprint
) { throw "WACK private run record does not match the current trusted appcert.exe bytes/signature." }

Write-Host "WACK round $ExpectedRound same-run private record passed immediate consistency verification. It is not a cryptographic attestation."

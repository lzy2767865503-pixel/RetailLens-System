param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [ValidateSet(1, 2)] [int]$Round,
  [Parameter(Mandatory = $true)] [string]$ReportPath,
  [Parameter(Mandatory = $true)] [string]$StatusPath,
  [Parameter(Mandatory = $true)] [string]$RunRecordPath,
  [Parameter(Mandatory = $true)] [string]$Repository,
  [Parameter(Mandatory = $true)] [string]$CommitSha,
  [Parameter(Mandatory = $true)] [string]$WorkflowRef,
  [Parameter(Mandatory = $true)] [string]$WorkflowRunId,
  [Parameter(Mandatory = $true)] [string]$WorkflowRunAttempt,
  [Parameter(Mandatory = $true)] [string]$ApprovedWackFileVersion,
  [ValidateRange(30, 900)] [int]$ResetTimeoutSeconds = 300,
  [ValidateRange(300, 7200)] [int]$TestTimeoutSeconds = 3600
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-process.ps1"
. "$PSScriptRoot/windows-wack-policy.ps1"
. "$PSScriptRoot/windows-file-policy.ps1"

if ($Repository -cne "lzy2767865503-pixel/RetailLens-System") {
  throw "WACK is restricted to the canonical repository."
}
if ($CommitSha -notmatch '^[0-9a-f]{40}$') { throw "CommitSha is invalid." }
$expectedWorkflowRef = "$Repository/.github/workflows/windows-store.yml@refs/heads/main"
if ($WorkflowRef -cne $expectedWorkflowRef) {
  throw "WACK must run from the exact protected-main Store workflow definition."
}
if ($WorkflowRunId -notmatch '^\d+$' -or $WorkflowRunAttempt -notmatch '^\d+$') {
  throw "GitHub workflow run identity is invalid."
}

$stateFile = (Resolve-Path -LiteralPath $StatePath).Path
$state = Get-Content -LiteralPath $stateFile -Raw | ConvertFrom-Json
$expectedStateKeys = @(
  "applicationId", "candidatePath", "candidateSha256", "certificateFriendlyName",
  "certificateThumbprint", "executable", "identityName", "payloadFileCount",
  "payloadTreeSha256", "privateHandoffRetained", "productVersion", "publisher",
  "runId", "runRoot", "schemaVersion", "submissionPath", "submissionSha256",
  "unsignedWorkspaceDestroyed", "version"
) | Sort-Object
$actualStateKeys = @($state.PSObject.Properties.Name) | Sort-Object
if (@(Compare-Object $expectedStateKeys $actualStateKeys -CaseSensitive).Count -ne 0) {
  throw "Store state contains missing or unexpected fields."
}
if (
  $state.schemaVersion -ne 2 -or
  $state.identityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU" -or
  $state.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
  $state.applicationId -cne "RetailDecisionStudio" -or
  $state.executable -cne "app\Retail Decision Studio by LAI ZEYU.exe" -or
  $state.version -notmatch '^\d+\.\d+\.\d+\.\d+$' -or
  $state.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
  $state.version -cne "$($state.productVersion).0" -or
  $state.candidateSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.submissionSha256 -notmatch '^[0-9a-f]{64}$' -or
  [int]$state.payloadFileCount -lt 4 -or
  $state.payloadTreeSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.certificateThumbprint -notmatch '^[0-9a-f]{40}$' -or
  $state.unsignedWorkspaceDestroyed -ne $true -or
  $state.privateHandoffRetained -ne $false
) { throw "Store state violates the immutable candidate identity policy." }

$resolvedPackage = (Resolve-Path -LiteralPath ([string]$state.candidatePath)).Path
$resolvedSubmission = (Resolve-Path -LiteralPath ([string]$state.submissionPath)).Path
$resolvedRunRoot = (Resolve-Path -LiteralPath ([string]$state.runRoot)).Path
$resolvedReport = [System.IO.Path]::GetFullPath($ReportPath)
$resolvedStatus = [System.IO.Path]::GetFullPath($StatusPath)
$resolvedRecord = [System.IO.Path]::GetFullPath($RunRecordPath)
$runRootItem = Get-Item -LiteralPath $resolvedRunRoot -Force
$packageItem = Get-Item -LiteralPath $resolvedPackage -Force
$submissionItem = Get-Item -LiteralPath $resolvedSubmission -Force
if (
  -not $runRootItem.PSIsContainer -or
  ($runRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  ($packageItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  ($submissionItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  -not (Test-RetailLensPathWithin -CandidatePath $resolvedPackage -RootPath $resolvedRunRoot) -or
  (Split-Path -Leaf $resolvedPackage) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64-qa-signed.appx" -or
  -not (Test-RetailLensPathWithin -CandidatePath $resolvedSubmission -RootPath $resolvedRunRoot) -or
  (Split-Path -Leaf $resolvedSubmission) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64.appx" -or
  [string]::Equals($resolvedPackage, $resolvedSubmission, [System.StringComparison]::OrdinalIgnoreCase) -or
  @(@($resolvedReport, $resolvedStatus, $resolvedRecord) | Sort-Object -Unique).Count -ne 3
) { throw "WACK run root/package/output boundary policy failed." }
foreach ($outputPath in @($resolvedReport, $resolvedStatus, $resolvedRecord)) {
  if (-not (Test-RetailLensPathWithin -CandidatePath $outputPath -RootPath $resolvedRunRoot)) {
    throw "WACK output escaped the run-owned root: $outputPath"
  }
}
$packageSha256 = (Get-FileHash -LiteralPath $resolvedPackage -Algorithm SHA256).Hash.ToLowerInvariant()
if ($packageSha256 -cne [string]$state.candidateSha256) {
  throw "The exact signed Store candidate changed before WACK round $Round."
}
$equivalence = & "$PSScriptRoot/windows-appx-payload-equivalence.ps1" `
  -SubmissionAppxPath $resolvedSubmission `
  -QaAppxPath $resolvedPackage `
  -ExpectedQaCertificateThumbprint ([string]$state.certificateThumbprint)
if (
  $equivalence.submissionPackageSha256 -cne [string]$state.submissionSha256 -or
  $equivalence.qaPackageSha256 -cne [string]$state.candidateSha256 -or
  [int]$equivalence.payloadFileCount -ne [int]$state.payloadFileCount -or
  $equivalence.payloadTreeSha256 -cne [string]$state.payloadTreeSha256
) { throw "WACK candidate no longer matches the unsigned Partner Center submission payload tree." }
$expectedThumbprint = ([string]$state.certificateThumbprint).Replace(" ", "").ToUpperInvariant()
$packageSignature = Get-AuthenticodeSignature -LiteralPath $resolvedPackage
if (
  $packageSignature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $packageSignature.SignerCertificate -or
  $packageSignature.SignerCertificate.Subject -cne [string]$state.publisher -or
  $packageSignature.SignerCertificate.Thumbprint.Replace(" ", "").ToUpperInvariant() -cne $expectedThumbprint
) { throw "WACK candidate is not signed by the exact run-owned sideload certificate." }

foreach ($path in @($resolvedReport, $resolvedStatus, $resolvedRecord)) {
  New-Item -ItemType Directory -Path (Split-Path -Parent $path) -Force | Out-Null
  if (Test-Path -LiteralPath $path) { throw "WACK round output must not pre-exist: $path" }
}

$kitPath = [System.IO.Path]::GetFullPath(
  (Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\App Certification Kit\appcert.exe")
)
if (-not (Test-Path -LiteralPath $kitPath -PathType Leaf)) {
  throw "Windows App Certification Kit is missing."
}
$kitItem = Get-Item -LiteralPath $kitPath -Force
$canonicalFileVersion = $kitItem.VersionInfo.FileVersionRaw.ToString()
if (
  [string]::IsNullOrWhiteSpace($ApprovedWackFileVersion) -or
  $ApprovedWackFileVersion -notmatch '^\d+(?:\.\d+){3}$' -or
  $canonicalFileVersion -cne $ApprovedWackFileVersion -or
  ($kitItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)
) { throw "Canonical appcert.exe does not match RETAILLENS_APPROVED_WACK_FILE_VERSION." }
$kitSignature = Get-AuthenticodeSignature -LiteralPath $kitPath
if (
  $kitSignature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $kitSignature.SignerCertificate -or
  $kitSignature.SignerCertificate.Subject -notmatch '(?i)(?:^|,\s*)O=Microsoft Corporation(?:,|$)' -or
  -not (@($kitSignature.SignerCertificate.EnhancedKeyUsageList) | Where-Object {
    $_.ObjectId.Value -eq "1.3.6.1.5.5.7.3.3"
  })
) { throw "appcert.exe is not trusted Microsoft-signed code." }

$sessionId = (Get-Process -Id $PID).SessionId
$sessionExplorer = Get-Process explorer -ErrorAction SilentlyContinue |
  Where-Object { $_.SessionId -eq $sessionId } |
  Select-Object -First 1
if ($sessionId -lt 1 -or -not [Environment]::UserInteractive -or -not $sessionExplorer) {
  throw "WACK requires an active interactive Windows desktop session."
}
$principal = [Security.Principal.WindowsPrincipal]::new(
  [Security.Principal.WindowsIdentity]::GetCurrent()
)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
  throw "WACK requires an elevated Administrator process."
}

$existingPackages = @(
  Get-AppxPackage -Name ([string]$state.identityName) -ErrorAction Stop
  Get-AppxPackage -AllUsers -Name ([string]$state.identityName) -ErrorAction Stop
) | Sort-Object PackageFullName -Unique
if ($existingPackages.Count -ne 0) {
  throw "WACK preflight found an existing exact-identity package."
}
if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
  throw "WACK preflight found an existing RetailLens loopback listener."
}

$runId = [Guid]::NewGuid().ToString("D").ToLowerInvariant()
$startedAt = [DateTimeOffset]::UtcNow
$manifestRoot = Join-Path ([string]$state.runRoot) ("wack-manifest-round-$Round")
try {
  New-Item -ItemType Directory -Path $manifestRoot | Out-Null
  $windowsKits = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
  $makeAppx = Get-ChildItem $windowsKits -Recurse -Filter makeappx.exe |
    Where-Object { $_.FullName -like '*\x64\makeappx.exe' } |
    Sort-Object FullName -Descending |
    Select-Object -First 1
  if (-not $makeAppx) { throw "Windows SDK x64 makeappx.exe is missing." }
  Invoke-RetailLensBoundedProcess `
    -FilePath $makeAppx.FullName `
    -ArgumentList @("unpack", "/p", ('"' + $resolvedPackage + '"'), "/d", ('"' + $manifestRoot + '"')) `
    -TimeoutSeconds 180 `
    -Context "WACK round $Round AppX manifest inspection" | Out-Null
  [xml]$manifest = Get-Content -LiteralPath (Join-Path $manifestRoot "AppxManifest.xml") -Raw
  $namespaces = [System.Xml.XmlNamespaceManager]::new($manifest.NameTable)
  $namespaces.AddNamespace("f", "http://schemas.microsoft.com/appx/manifest/foundation/windows10")
  $identity = $manifest.SelectSingleNode("/f:Package/f:Identity", $namespaces)
  $application = $manifest.SelectSingleNode("/f:Package/f:Applications/f:Application", $namespaces)
  if (
    -not $identity -or -not $application -or
    $identity.Name -cne [string]$state.identityName -or
    $identity.Publisher -cne [string]$state.publisher -or
    $identity.Version -cne [string]$state.version -or
    $identity.ProcessorArchitecture -cne "x64" -or
    $application.Id -cne [string]$state.applicationId -or
    ([string]$application.Executable).Replace("/", "\") -cne [string]$state.executable
  ) { throw "WACK package manifest does not match the exact prepared candidate state." }

  Set-Content -LiteralPath $resolvedStatus -Value "WACK_STATUS=STARTED; ROUND=$Round; RUN_ID=$runId; PACKAGE_SHA256=$packageSha256; COMMIT_SHA=$CommitSha"
  Invoke-RetailLensBoundedProcess `
    -FilePath $kitPath -ArgumentList @("reset") `
    -TimeoutSeconds $ResetTimeoutSeconds -Context "WACK round $Round reset" | Out-Null
  $testRun = Invoke-RetailLensBoundedProcess `
    -FilePath $kitPath `
    -ArgumentList @(
      "test", "-appxpackagepath", ('"' + $resolvedPackage + '"'),
      "-reportoutputpath", ('"' + $resolvedReport + '"')
    ) `
    -TimeoutSeconds $TestTimeoutSeconds `
    -AllowedExitCode @(0, 1) `
    -Context "WACK round $Round package test"
  if ($testRun.ExitCode -eq 1) {
    if (-not (Test-Path -LiteralPath $resolvedReport -PathType Leaf)) {
      throw "WACK requested finalization without producing a report."
    }
    Invoke-RetailLensBoundedProcess `
      -FilePath $kitPath `
      -ArgumentList @("finalizereport", "-reportfilepath", ('"' + $resolvedReport + '"')) `
      -TimeoutSeconds $ResetTimeoutSeconds `
      -Context "WACK round $Round report finalization" | Out-Null
  }
  $reportItem = Get-Item -LiteralPath $resolvedReport
  if ($reportItem.LastWriteTimeUtc -lt $startedAt.UtcDateTime.AddSeconds(-2)) {
    throw "WACK report is stale for this run."
  }
  $reportPolicy = Read-RetailLensCompleteWackReport -ReportPath $resolvedReport
  $finishedAt = [DateTimeOffset]::UtcNow
  $finalPackageHash = (Get-FileHash -LiteralPath $resolvedPackage -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($finalPackageHash -cne $packageSha256) { throw "WACK changed the exact signed candidate bytes." }
  $reportSha256 = (Get-FileHash -LiteralPath $resolvedReport -Algorithm SHA256).Hash.ToLowerInvariant()
  $testInventoryJson = $reportPolicy.Tests | ConvertTo-Json -Depth 4 -Compress
  $testInventorySha256 = [Convert]::ToHexString(
    [Security.Cryptography.SHA256]::HashData([Text.Encoding]::UTF8.GetBytes($testInventoryJson))
  ).ToLowerInvariant()
  [ordered]@{
    schemaVersion = 2
    evidenceKind = "private-same-run-record"
    cryptographicallyAttested = $false
    transferable = $false
    limitation = "Local JSON is consistency evidence only, not an unforgeable attestation. Trust depends on the protected main workflow, environment approval, and self-hosted runner integrity."
    repository = $Repository
    commitSha = $CommitSha
    workflowRef = $WorkflowRef
    workflowRunId = $WorkflowRunId
    workflowRunAttempt = $WorkflowRunAttempt
    round = $Round
    product = "Retail Decision Studio by LAI ZEYU"
    author = "LAI ZEYU（来泽宇）"
    package = [ordered]@{
      fileName = Split-Path -Leaf $resolvedPackage
      sha256 = $packageSha256
      identityName = [string]$state.identityName
      publisher = [string]$state.publisher
      version = [string]$state.version
      productVersion = [string]$state.productVersion
      processorArchitecture = "x64"
      applicationId = [string]$state.applicationId
      executable = [string]$state.executable
      signerThumbprint = $expectedThumbprint.ToLowerInvariant()
    }
    report = [ordered]@{
      sha256 = $reportSha256
      overallResult = $reportPolicy.OverallResult
      partialRun = $reportPolicy.PartialRun
      latestVersion = $reportPolicy.LatestVersion
      kitVersion = $reportPolicy.KitVersion
      testCount = $reportPolicy.TestCount
      testInventorySha256 = $testInventorySha256
      tests = @($reportPolicy.Tests)
    }
    appcert = [ordered]@{
      approvedFileVersion = $ApprovedWackFileVersion
      fileVersion = $canonicalFileVersion
      sha256 = (Get-FileHash -LiteralPath $kitPath -Algorithm SHA256).Hash.ToLowerInvariant()
      signerSubject = $kitSignature.SignerCertificate.Subject
      signerThumbprint = $kitSignature.SignerCertificate.Thumbprint.ToLowerInvariant()
    }
    runId = $runId
    interactiveSessionId = $sessionId
    startedAt = $startedAt.ToString("O")
    finishedAt = $finishedAt.ToString("O")
  } | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $resolvedRecord -Encoding utf8
  Set-Content -LiteralPath $resolvedStatus -Value "WACK_STATUS=PASS; ROUND=$Round; RUN_ID=$runId; PACKAGE_SHA256=$packageSha256; REPORT_SHA256=$reportSha256; COMMIT_SHA=$CommitSha; TESTS=$($reportPolicy.TestCount)"
  Write-Host "WACK round $Round produced a private same-run consistency record. It is not a cryptographic attestation."
} catch {
  $safeReason = $_.Exception.Message -replace "[\r\n]+", " "
  Set-Content -LiteralPath $resolvedStatus -Value "WACK_STATUS=FAIL; ROUND=$Round; RUN_ID=$runId; PACKAGE_SHA256=$packageSha256; COMMIT_SHA=$CommitSha; REASON=$safeReason"
  Remove-Item -LiteralPath $resolvedRecord -Force -ErrorAction SilentlyContinue
  throw
} finally {
  if (Test-Path -LiteralPath $manifestRoot) {
    Remove-Item -LiteralPath $manifestRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
}

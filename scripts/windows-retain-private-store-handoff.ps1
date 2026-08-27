param(
  [Parameter(Mandatory = $true)] [string]$PrivateRoot,
  [string]$StatePath = "",
  [string]$CommitSha = "",
  [string]$Round1RecordPath = "",
  [string]$Round2RecordPath = "",
  [string]$ApprovedWackFileVersion = "",
  [string]$ApprovedWackSha256 = "",
  [string]$ApprovedWackSignerSubject = "",
  [string]$ApprovedWackSignerThumbprint = "",
  [switch]$ValidateOnly
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-wack-policy.ps1"

if (-not $IsWindows) { throw "Private Store handoff retention requires Windows." }

function Test-PathInside {
  param([Parameter(Mandatory = $true)][string]$Child, [Parameter(Mandatory = $true)][string]$Parent)
  $exactChild = [System.IO.Path]::GetFullPath($Child).TrimEnd("\")
  $exactParent = [System.IO.Path]::GetFullPath($Parent).TrimEnd("\")
  return $exactChild.Equals($exactParent, [System.StringComparison]::OrdinalIgnoreCase) -or
    $exactChild.StartsWith($exactParent + "\", [System.StringComparison]::OrdinalIgnoreCase)
}

function Assert-ExactSchema {
  param($Value, [string[]]$ExpectedKeys, [string]$Label)
  $actual = @($Value.PSObject.Properties.Name | Sort-Object)
  $expected = @($ExpectedKeys | Sort-Object)
  if (($actual -join "|") -cne ($expected -join "|")) { throw "$Label schema is not exact." }
}

function Get-AclSids {
  param([System.Security.AccessControl.FileSystemSecurity]$Acl)
  return @(
    $Acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]) |
      ForEach-Object { [string]$_.IdentityReference.Value } |
      Sort-Object -Unique
  )
}

function Assert-ExactPrivateAcl {
  param([string]$Path, [string[]]$AllowedSids, [string]$Label, [switch]$RequireProtected)
  $acl = Get-Acl -LiteralPath $Path
  if ($RequireProtected -and -not $acl.AreAccessRulesProtected) { throw "$Label ACL inherits from its parent." }
  $rules = @($acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
  $actualSids = @(Get-AclSids $acl)
  $expectedSids = @($AllowedSids | Sort-Object -Unique)
  if (($actualSids -join "|") -cne ($expectedSids -join "|")) {
    throw "$Label ACL is outside the exact runner/SYSTEM/Administrators allowlist."
  }
  if (@($rules | Where-Object { $_.AccessControlType -ne [System.Security.AccessControl.AccessControlType]::Allow }).Count -ne 0) {
    throw "$Label contains a non-Allow ACL rule."
  }
  foreach ($sid in $expectedSids) {
    $fullControl = @($rules | Where-Object {
      [string]$_.IdentityReference.Value -ceq $sid -and
      (($_.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::FullControl) -eq
        [System.Security.AccessControl.FileSystemRights]::FullControl)
    })
    if ($fullControl.Count -eq 0) { throw "$Label lacks FullControl for an approved identity." }
  }
  $ownerSid = $acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value
  if ($ownerSid -cnotin $expectedSids) { throw "$Label owner is outside the approved allowlist." }
  return $acl
}

function New-ExactPrivateAcl {
  param([string]$OwnerSid, [string[]]$AllowedSids)
  $security = [System.Security.AccessControl.DirectorySecurity]::new()
  $security.SetOwner([System.Security.Principal.SecurityIdentifier]::new($OwnerSid))
  $security.SetAccessRuleProtection($true, $false)
  foreach ($sidText in @($AllowedSids | Sort-Object -Unique)) {
    $rule = [System.Security.AccessControl.FileSystemAccessRule]::new(
      [System.Security.Principal.SecurityIdentifier]::new($sidText),
      [System.Security.AccessControl.FileSystemRights]::FullControl,
      [System.Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit',
      [System.Security.AccessControl.PropagationFlags]::None,
      [System.Security.AccessControl.AccessControlType]::Allow
    )
    [void]$security.AddAccessRule($rule)
  }
  return $security
}

function Remove-ReparseFreePrivateTree([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $items = @(Get-Item -LiteralPath $Path -Force; Get-ChildItem -LiteralPath $Path -Recurse -Force)
  if (@($items | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0) {
    throw "$Label contains a reparse point and cannot be recursively deleted."
  }
  Remove-Item -LiteralPath $Path -Recurse -Force
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$exactPrivateRoot = [System.IO.Path]::GetFullPath($PrivateRoot).TrimEnd("\")
if (-not [System.IO.Path]::IsPathFullyQualified($exactPrivateRoot) -or $exactPrivateRoot.StartsWith("\\")) {
  throw "RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT must be an absolute local path."
}
if ([System.IO.Path]::GetFileName($exactPrivateRoot) -cne "RetailLensStoreHandoff") {
  throw "RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT must end in RetailLensStoreHandoff."
}
if (-not (Test-Path -LiteralPath $exactPrivateRoot -PathType Container)) {
  throw "RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT must be pre-provisioned."
}
$volumeRoot = [System.IO.Path]::GetPathRoot($exactPrivateRoot)
if ($exactPrivateRoot.Equals($volumeRoot.TrimEnd("\"), [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Private Store handoff root may not be a volume root."
}
$drive = [System.IO.DriveInfo]::new($volumeRoot)
if (-not $drive.IsReady -or $drive.DriveType -ne [System.IO.DriveType]::Fixed -or $drive.DriveFormat -cne "NTFS") {
  throw "RETAILLENS_PRIVATE_STORE_HANDOFF_ROOT must be on a ready local fixed NTFS volume."
}
foreach ($forbidden in @($projectRoot, $env:GITHUB_WORKSPACE, $env:RUNNER_TEMP, $env:OneDrive, $env:OneDriveConsumer, $env:OneDriveCommercial)) {
  if ($forbidden -and (
    (Test-PathInside -Child $exactPrivateRoot -Parent $forbidden) -or
    (Test-PathInside -Child $forbidden -Parent $exactPrivateRoot)
  )) { throw "Private Store handoff root overlaps a workspace, temporary, or OneDrive root." }
}
$current = Get-Item -LiteralPath $exactPrivateRoot -Force
while ($current) {
  if ($current.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Private Store handoff root or ancestor is a reparse point."
  }
  if ($current.FullName.TrimEnd("\").Equals($volumeRoot.TrimEnd("\"), [System.StringComparison]::OrdinalIgnoreCase)) { break }
  $current = $current.Parent
}

$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
try { $currentSid = [string]$identity.User.Value } finally { $identity.Dispose() }
$allowedSids = @($currentSid, "S-1-5-18", "S-1-5-32-544") | Sort-Object -Unique
[void](Assert-ExactPrivateAcl -Path $exactPrivateRoot -AllowedSids $allowedSids -Label "Private Store handoff root" -RequireProtected)
if ($ValidateOnly) {
  Write-Host "Validated the pre-provisioned fixed-NTFS exact-ACL Store handoff boundary without disclosing its path."
  return
}

if (
  $env:GITHUB_RUN_ID -notmatch '^\d+$' -or
  $env:GITHUB_RUN_ATTEMPT -notmatch '^\d+$' -or
  $CommitSha -notmatch '^[0-9a-f]{40}$' -or
  $ApprovedWackFileVersion -notmatch '^\d+(?:\.\d+){3}$' -or
  $ApprovedWackSha256 -notmatch '^[0-9a-f]{64}$' -or
  $ApprovedWackSignerThumbprint -notmatch '^[0-9a-f]{40}$' -or
  $ApprovedWackSignerSubject -notmatch '^[^\r\n]{10,500}$'
) { throw "Private Store handoff requires exact workflow, commit, and approved WACK identities." }
foreach ($requiredPath in @($StatePath, $Round1RecordPath, $Round2RecordPath)) {
  if ([string]::IsNullOrWhiteSpace($requiredPath) -or -not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
    throw "Private Store handoff input is missing."
  }
}

$resolvedStatePath = (Resolve-Path -LiteralPath $StatePath).Path
$state = Get-Content -LiteralPath $resolvedStatePath -Raw | ConvertFrom-Json
$stateKeys = @(
  "applicationId", "candidatePath", "candidateSha256", "certificateFriendlyName",
  "certificateThumbprint", "executable", "identityName", "payloadFileCount",
  "payloadTreeSha256", "privateHandoffRetained", "productVersion", "publisher",
  "runId", "runRoot", "schemaVersion", "submissionPath", "submissionSha256",
  "unsignedWorkspaceDestroyed", "version"
)
Assert-ExactSchema $state $stateKeys "Store candidate state"
if (
  $state.schemaVersion -ne 2 -or
  $state.identityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU" -or
  $state.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
  $state.applicationId -cne "RetailDecisionStudio" -or
  $state.executable -cne "app\Retail Decision Studio by LAI ZEYU.exe" -or
  $state.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
  $state.version -cne "$($state.productVersion).0" -or
  $state.submissionSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.candidateSha256 -notmatch '^[0-9a-f]{64}$' -or
  [int]$state.payloadFileCount -lt 4 -or
  $state.payloadTreeSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.certificateThumbprint -notmatch '^[0-9a-f]{40}$' -or
  $state.unsignedWorkspaceDestroyed -ne $true -or
  $state.privateHandoffRetained -ne $false
) { throw "Store state is not eligible for private handoff retention." }

$submissionPath = (Resolve-Path -LiteralPath ([string]$state.submissionPath)).Path
$qaPath = (Resolve-Path -LiteralPath ([string]$state.candidatePath)).Path
$runRoot = (Resolve-Path -LiteralPath ([string]$state.runRoot)).Path
$screenshotSource = Join-Path $runRoot "store-listing-screenshots"
if (
  -not (Test-RetailLensPathWithin -CandidatePath $submissionPath -RootPath $runRoot) -or
  -not (Test-RetailLensPathWithin -CandidatePath $qaPath -RootPath $runRoot) -or
  (Split-Path -Leaf $submissionPath) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64.appx" -or
  (Split-Path -Leaf $qaPath) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64-qa-signed.appx"
) { throw "Store handoff package paths escaped the exact run root." }
$equivalence = & "$PSScriptRoot/windows-appx-payload-equivalence.ps1" `
  -SubmissionAppxPath $submissionPath `
  -QaAppxPath $qaPath `
  -ExpectedQaCertificateThumbprint ([string]$state.certificateThumbprint)
if (
  $equivalence.submissionPackageSha256 -cne [string]$state.submissionSha256 -or
  $equivalence.qaPackageSha256 -cne [string]$state.candidateSha256 -or
  [int]$equivalence.payloadFileCount -ne [int]$state.payloadFileCount -or
  $equivalence.payloadTreeSha256 -cne [string]$state.payloadTreeSha256
) { throw "Store handoff no longer binds one unsigned submission to the twice-tested QA payload tree." }

if (-not (Test-Path -LiteralPath $screenshotSource -PathType Container)) {
  throw "Four exact packaged-app Store screenshots are required before private handoff retention."
}
$screenshotSource = (Resolve-Path -LiteralPath $screenshotSource).Path
$screenshotItems = @(Get-ChildItem -LiteralPath $screenshotSource -Force)
$expectedScreenshotNames = @(
  "01-assessment-demo.png", "02-enterprise-inputs.png", "03-executive-workpaper.png",
  "04-strategy-matrices.png", "store-screenshot-capture.v1.json"
) | Sort-Object
if (
  -not (Test-RetailLensPathWithin -CandidatePath $screenshotSource -RootPath $runRoot) -or
  $screenshotItems.Count -ne 5 -or
  @($screenshotItems | Where-Object { $_.PSIsContainer -or ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) }).Count -ne 0 -or
  (@($screenshotItems.Name | Sort-Object) -join "|") -cne ($expectedScreenshotNames -join "|")
) { throw "Store screenshot handoff source inventory is not exact." }
$screenshotManifestPath = Join-Path $screenshotSource "store-screenshot-capture.v1.json"
$screenshotManifest = Get-Content -LiteralPath $screenshotManifestPath -Raw | ConvertFrom-Json
Assert-ExactSchema $screenshotManifest @(
  "candidateSha256", "captureSource", "dataset", "evidenceKind", "generatedAt", "height",
  "images", "nonce", "privacyGatePassed", "schemaVersion", "screenshotCount",
  "screenshotRound", "secretBearingInputCount", "sensitiveTextPatternCount", "version", "width"
) "Store screenshot capture manifest"
if (
  $screenshotManifest.schemaVersion -ne 1 -or
  $screenshotManifest.evidenceKind -cne "exact-packaged-store-candidate-screenshots" -or
  $screenshotManifest.candidateSha256 -cne [string]$state.candidateSha256 -or
  $screenshotManifest.version -cne [string]$state.productVersion -or
  [int]$screenshotManifest.screenshotRound -ne 2 -or
  $screenshotManifest.captureSource -cne "ELECTRON_WEB_CONTENTS_CAPTURE_PAGE" -or
  $screenshotManifest.dataset -cne "BUILT_IN_DEMO_ONLY" -or
  $screenshotManifest.privacyGatePassed -ne $true -or
  [int]$screenshotManifest.sensitiveTextPatternCount -ne 0 -or
  [int]$screenshotManifest.secretBearingInputCount -ne 0 -or
  [int]$screenshotManifest.width -ne 1366 -or [int]$screenshotManifest.height -ne 768 -or
  [int]$screenshotManifest.screenshotCount -ne 4 -or @($screenshotManifest.images).Count -ne 4
) { throw "Store screenshot capture manifest is not bound to the exact QA candidate and privacy gate." }
$expectedViews = [ordered]@{
  "01-assessment-demo.png" = "assessment-demo"
  "02-enterprise-inputs.png" = "enterprise-inputs"
  "03-executive-workpaper.png" = "executive-workpaper"
  "04-strategy-matrices.png" = "strategy-matrices"
}
$seenScreenshotNames = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
$seenScreenshotViews = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($image in @($screenshotManifest.images)) {
  Assert-ExactSchema $image @("fileName", "height", "sha256", "size", "viewId", "width") "Store screenshot image record"
  $imageName = [string]$image.fileName
  $viewId = [string]$image.viewId
  $imagePath = Join-Path $screenshotSource ([string]$image.fileName)
  if (
    -not $expectedViews.Contains($imageName) -or
    -not $seenScreenshotNames.Add($imageName) -or
    -not $seenScreenshotViews.Add($viewId) -or
    $viewId -cne [string]$expectedViews[$imageName] -or
    [int]$image.width -ne 1366 -or [int]$image.height -ne 768 -or
    [long]$image.size -lt 20000 -or [long]$image.size -gt 15000000 -or
    [string]$image.sha256 -notmatch '^[0-9a-f]{64}$' -or
    -not (Test-Path -LiteralPath $imagePath -PathType Leaf) -or
    (Get-Item -LiteralPath $imagePath).Length -ne [long]$image.size -or
    (Get-FileHash -LiteralPath $imagePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$image.sha256
  ) { throw "Store screenshot bytes changed after exact packaged-app capture verification." }
}
if ($seenScreenshotNames.Count -ne 4 -or $seenScreenshotViews.Count -ne 4) {
  throw "Store retention requires four unique exact screenshot filename/viewId pairs."
}

$round1 = Get-Content -LiteralPath (Resolve-Path -LiteralPath $Round1RecordPath).Path -Raw | ConvertFrom-Json
$round2 = Get-Content -LiteralPath (Resolve-Path -LiteralPath $Round2RecordPath).Path -Raw | ConvertFrom-Json
foreach ($round in @($round1, $round2)) {
  Assert-RetailLensApprovedAppcertIdentity `
    -ActualFileVersion ([string]$round.appcert.fileVersion) `
    -ActualSha256 ([string]$round.appcert.sha256) `
    -ActualSignerSubject ([string]$round.appcert.signerSubject) `
    -ActualSignerThumbprint ([string]$round.appcert.signerThumbprint) `
    -ApprovedFileVersion $ApprovedWackFileVersion `
    -ApprovedSha256 $ApprovedWackSha256 `
    -ApprovedSignerSubject $ApprovedWackSignerSubject `
    -ApprovedSignerThumbprint $ApprovedWackSignerThumbprint
  if (
    $round.schemaVersion -ne 3 -or
    $round.repository -cne "lzy2767865503-pixel/RetailLens-System" -or
    $round.commitSha -cne $CommitSha -or
    [string]$round.workflowRunId -cne [string]$env:GITHUB_RUN_ID -or
    [string]$round.workflowRunAttempt -cne [string]$env:GITHUB_RUN_ATTEMPT -or
    $round.package.sha256 -cne [string]$state.candidateSha256 -or
    $round.appcert.approvedFileVersion -cne $ApprovedWackFileVersion -or
    $round.appcert.approvedSha256 -cne $ApprovedWackSha256 -or
    $round.appcert.approvedSignerSubject -cne $ApprovedWackSignerSubject -or
    $round.appcert.approvedSignerThumbprint -cne $ApprovedWackSignerThumbprint -or
    $round.appcert.fileVersion -cne $ApprovedWackFileVersion -or
    $round.report.sha256 -notmatch '^[0-9a-f]{64}$' -or
    $round.runId -notmatch '^[0-9a-f-]{36}$'
  ) { throw "WACK lineage record is not exact for private Store retention." }
}
if (
  [int]$round1.round -ne 1 -or [int]$round2.round -ne 2 -or
  $round1.runId -ceq $round2.runId -or
  $round1.appcert.sha256 -cne $round2.appcert.sha256 -or
  $round1.appcert.signerThumbprint -cne $round2.appcert.signerThumbprint
) { throw "Private Store retention requires two distinct WACK rounds on one approved appcert.exe." }

$runLeaf = "retaillens-store-$($state.productVersion)-$env:GITHUB_RUN_ID-$env:GITHUB_RUN_ATTEMPT-$($CommitSha.Substring(0, 12))"
$finalRoot = Join-Path $exactPrivateRoot $runLeaf
$incompleteRoot = Join-Path $exactPrivateRoot ($runLeaf + ".incomplete")
$retentionStateTemp = "$resolvedStatePath.retain.tmp"
if ((Test-Path -LiteralPath $finalRoot) -or (Test-Path -LiteralPath $incompleteRoot)) {
  throw "This exact private Store handoff run already exists."
}
$moved = $false
try {
  New-Item -ItemType Directory -Path $incompleteRoot | Out-Null
  Set-Acl -LiteralPath $incompleteRoot -AclObject (New-ExactPrivateAcl -OwnerSid $currentSid -AllowedSids $allowedSids)
  [void](Assert-ExactPrivateAcl -Path $incompleteRoot -AllowedSids $allowedSids -Label "Incomplete Store handoff" -RequireProtected)

  $submissionName = Split-Path -Leaf $submissionPath
  $retainedPackage = Join-Path $incompleteRoot $submissionName
  Copy-Item -LiteralPath $submissionPath -Destination $retainedPackage
  if (
    (Get-FileHash -LiteralPath $retainedPackage -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$state.submissionSha256 -or
    (Get-AuthenticodeSignature -LiteralPath $retainedPackage).Status -ne [System.Management.Automation.SignatureStatus]::NotSigned
  ) { throw "Retained Partner Center package differs or is no longer unsigned." }

  $checksumName = "STORE-SUBMISSION-SHA256.txt"
  [System.IO.File]::WriteAllText(
    (Join-Path $incompleteRoot $checksumName),
    "$($state.submissionSha256)  $submissionName`n",
    [System.Text.UTF8Encoding]::new($false)
  )
  $retainedScreenshots = Join-Path $incompleteRoot "store-listing-screenshots"
  Copy-Item -LiteralPath $screenshotSource -Destination $retainedScreenshots -Recurse
  $retainedScreenshotItems = @(Get-ChildItem -LiteralPath $retainedScreenshots -Force)
  if (
    $retainedScreenshotItems.Count -ne 5 -or
    @($retainedScreenshotItems | Where-Object { $_.PSIsContainer -or ($_.Attributes -band [System.IO.FileAttributes]::ReparsePoint) }).Count -ne 0 -or
    (@($retainedScreenshotItems.Name | Sort-Object) -join "|") -cne ($expectedScreenshotNames -join "|")
  ) { throw "Retained Store screenshot inventory is not exact." }
  foreach ($image in @($screenshotManifest.images)) {
    $copiedScreenshot = Join-Path $retainedScreenshots ([string]$image.fileName)
    if ((Get-FileHash -LiteralPath $copiedScreenshot -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$image.sha256) {
      throw "Retained Store screenshot bytes changed during private handoff copy."
    }
  }
  if (
    (Get-FileHash -LiteralPath (Join-Path $retainedScreenshots "store-screenshot-capture.v1.json") -Algorithm SHA256).Hash.ToLowerInvariant() -cne
      (Get-FileHash -LiteralPath $screenshotManifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
  ) { throw "Retained Store screenshot capture manifest changed during private handoff copy." }
  $lineage = [ordered]@{
    schemaVersion = 2
    product = "Retail Decision Studio by LAI ZEYU"
    author = "LAI ZEYU（来泽宇）"
    publisherDisplayName = "LAI ZEYU"
    partnerCenterProductId = "9NVNLQWQBKHD"
    identityName = [string]$state.identityName
    technicalPublisher = [string]$state.publisher
    sourceCommit = $CommitSha
    productVersion = [string]$state.productVersion
    appxVersion = [string]$state.version
    architecture = "x64"
    submissionPackageFile = $submissionName
    submissionPackageSize = (Get-Item -LiteralPath $retainedPackage).Length
    submissionPackageSha256 = [string]$state.submissionSha256
    submissionSignatureStatus = "UNSIGNED_FOR_PARTNER_CENTER"
    qaPackageSha256 = [string]$state.candidateSha256
    qaCertificateIncluded = $false
    payloadFileCount = [int]$state.payloadFileCount
    payloadTreeSha256 = [string]$state.payloadTreeSha256
    lifecycleRounds = 2
    wackRounds = 2
    approvedWackFileVersion = $ApprovedWackFileVersion
    approvedWackSha256 = $ApprovedWackSha256
    approvedWackSignerSubject = $ApprovedWackSignerSubject
    approvedWackSignerThumbprint = $ApprovedWackSignerThumbprint
    appcertSha256 = $ApprovedWackSha256
    wackRound1RunId = [string]$round1.runId
    wackRound1ReportSha256 = [string]$round1.report.sha256
    wackRound2RunId = [string]$round2.runId
    wackRound2ReportSha256 = [string]$round2.report.sha256
    screenshotCount = 4
    screenshotDimensions = "1366x768"
    screenshotDataset = "BUILT_IN_DEMO_ONLY"
    screenshotCaptureSource = "ELECTRON_WEB_CONTENTS_CAPTURE_PAGE"
    screenshotCaptureManifestSha256 = (Get-FileHash -LiteralPath $screenshotManifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
    screenshotsFromExactQaCandidate = $true
    screenshotPrivacyGatePassed = $true
    submissionStatus = "NOT_SUBMITTED"
    certificationStatus = "NOT_CERTIFIED"
    storeSignsAfterSubmission = $true
    publicGitHubAsset = $false
    handoffVisibility = "LOCAL_FIXED_NTFS_EXACT_ACL"
  }
  [System.IO.File]::WriteAllText(
    (Join-Path $incompleteRoot "store-submission-lineage.json"),
    (($lineage | ConvertTo-Json -Depth 5 -Compress) + "`n"),
    [System.Text.UTF8Encoding]::new($false)
  )
  $items = @(Get-ChildItem -LiteralPath $incompleteRoot -Force)
  $expectedNames = @($submissionName, $checksumName, "store-listing-screenshots", "store-submission-lineage.json") | Sort-Object
  if (
    $items.Count -ne 4 -or
    @($items | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0 -or
    (@($items.Name | Sort-Object) -join "|") -cne ($expectedNames -join "|")
  ) { throw "Private Store handoff inventory is not exact." }

  [System.IO.Directory]::Move($incompleteRoot, $finalRoot)
  $moved = $true
  [void](Assert-ExactPrivateAcl -Path $finalRoot -AllowedSids $allowedSids -Label "Final Store handoff" -RequireProtected)
  foreach ($child in Get-ChildItem -LiteralPath $finalRoot -Recurse -Force) {
    if ($child.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { throw "Final Store handoff contains a reparse point." }
    [void](Assert-ExactPrivateAcl -Path $child.FullName -AllowedSids $allowedSids -Label "Final Store handoff child")
  }

  $state.privateHandoffRetained = $true
  if (Test-Path -LiteralPath $retentionStateTemp) { throw "Store retention state temporary file pre-exists." }
  $state | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $retentionStateTemp -Encoding utf8
  Move-Item -LiteralPath $retentionStateTemp -Destination $resolvedStatePath -Force
} catch {
  if ($moved -and (Test-Path -LiteralPath $finalRoot)) {
    Remove-ReparseFreePrivateTree -Path $finalRoot -Label "Failed final Store handoff"
  }
  if (Test-Path -LiteralPath $incompleteRoot) {
    Remove-ReparseFreePrivateTree -Path $incompleteRoot -Label "Failed incomplete Store handoff"
  }
  if (Test-Path -LiteralPath $retentionStateTemp) {
    Remove-Item -LiteralPath $retentionStateTemp -Force -ErrorAction SilentlyContinue
  }
  throw
}

Write-Host "Atomically retained one unsigned Partner Center handoff under the local fixed-NTFS exact-ACL boundary; no path or binary was uploaded."

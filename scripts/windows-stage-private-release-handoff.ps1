param(
  [Parameter(Mandatory = $true)] [string]$PrivateRoot,
  [Parameter(Mandatory = $true)] [string]$PayloadDirectory,
  [Parameter(Mandatory = $true)] [string]$MetadataDirectory,
  [Parameter(Mandatory = $true)] [string]$NoticesPath,
  [Parameter(Mandatory = $true)] [string]$SourceCommit,
  [Parameter(Mandatory = $true)] [string]$ReleaseTag,
  [Parameter(Mandatory = $true)] [long]$RepositoryId,
  [Parameter(Mandatory = $true)] [string]$ExpectedBuildSid,
  [Parameter(Mandatory = $true)] [string]$SigningSid,
  [Parameter(Mandatory = $true)] [string]$VerifierSid,
  [Parameter(Mandatory = $true)] [string]$PublisherSid,
  [Parameter(Mandatory = $true)] [string]$HandoffBrokerPath,
  [Parameter(Mandatory = $true)] [string]$HandoffBrokerSha256,
  [Parameter(Mandatory = $true)] [string]$HandoffBrokerPolicySha256
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not $IsWindows) { throw "Private Windows release handoff staging requires Windows." }
if (
  $env:GITHUB_RUN_ID -notmatch '^\d+$' -or
  $env:GITHUB_RUN_ATTEMPT -notmatch '^\d+$' -or
  $SourceCommit -notmatch '^[0-9a-f]{40}$' -or
  $ReleaseTag -notmatch '^v\d+\.\d+\.\d+$' -or
  $RepositoryId -ne 1313443623 -or
  $ExpectedBuildSid -notmatch '^S-1-(?:\d+-){1,14}\d+$' -or
  $SigningSid -notmatch '^S-1-(?:\d+-){1,14}\d+$' -or
  $VerifierSid -notmatch '^S-1-(?:\d+-){1,14}\d+$' -or
  $PublisherSid -notmatch '^S-1-(?:\d+-){1,14}\d+$' -or
  $HandoffBrokerSha256 -notmatch '^[0-9a-f]{64}$' -or
  $HandoffBrokerPolicySha256 -notmatch '^[0-9a-f]{64}$'
) { throw "Private Windows release handoff identity is invalid." }

function Test-PathInside([string]$Child, [string]$Parent) {
  $exactChild = [System.IO.Path]::GetFullPath($Child).TrimEnd("\")
  $exactParent = [System.IO.Path]::GetFullPath($Parent).TrimEnd("\")
  return $exactChild.Equals($exactParent, [System.StringComparison]::OrdinalIgnoreCase) -or
    $exactChild.StartsWith($exactParent + "\", [System.StringComparison]::OrdinalIgnoreCase)
}

function Assert-NoReparseTree([string]$Path, [string]$Label) {
  $root = Get-Item -LiteralPath $Path -Force
  if ($root.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { throw "$Label root is a reparse point." }
  if ($root.PSIsContainer -and @(
    Get-ChildItem -LiteralPath $root.FullName -Recurse -Force |
      Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }
  ).Count -ne 0) { throw "$Label contains a reparse point." }
}

function Remove-ReparseFreeTree([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  Assert-NoReparseTree -Path $Path -Label $Label
  Remove-Item -LiteralPath $Path -Recurse -Force
  if (Test-Path -LiteralPath $Path) { throw "$Label remained after recursive cleanup." }
}

function Get-AclSids([System.Security.AccessControl.FileSystemSecurity]$Acl) {
  return @(
    $Acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]) |
      ForEach-Object { [string]$_.IdentityReference.Value } |
      Sort-Object -Unique
  )
}

function Assert-ExactAcl {
  param(
    [string]$Path,
    [string[]]$AllowedSids,
    [string]$OwnerSid,
    [string]$Label,
    [switch]$RequireProtected
  )
  $acl = Get-Acl -LiteralPath $Path
  if ($RequireProtected -and -not $acl.AreAccessRulesProtected) { throw "$Label inherits ACL entries." }
  $rules = @($acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]))
  $expected = @($AllowedSids | Sort-Object -Unique)
  if ((@(Get-AclSids $acl) -join "|") -cne ($expected -join "|")) { throw "$Label ACL identity set is not exact." }
  if (@($rules | Where-Object { $_.AccessControlType -ne [System.Security.AccessControl.AccessControlType]::Allow }).Count -ne 0) {
    throw "$Label contains a non-Allow ACL entry."
  }
  foreach ($sid in $expected) {
    if (@($rules | Where-Object {
      [string]$_.IdentityReference.Value -ceq $sid -and
      (($_.FileSystemRights -band [System.Security.AccessControl.FileSystemRights]::FullControl) -eq
        [System.Security.AccessControl.FileSystemRights]::FullControl)
    }).Count -eq 0) { throw "$Label lacks FullControl for an approved principal." }
  }
  if ($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -cne $OwnerSid) {
    throw "$Label owner is not the exact approved owner."
  }
}

function New-PrivateAcl([string]$OwnerSid, [string[]]$AllowedSids) {
  $security = [System.Security.AccessControl.DirectorySecurity]::new()
  $security.SetOwner([System.Security.Principal.SecurityIdentifier]::new($OwnerSid))
  $security.SetAccessRuleProtection($true, $false)
  foreach ($sidText in @($AllowedSids | Sort-Object -Unique)) {
    [void]$security.AddAccessRule([System.Security.AccessControl.FileSystemAccessRule]::new(
      [System.Security.Principal.SecurityIdentifier]::new($sidText),
      [System.Security.AccessControl.FileSystemRights]::FullControl,
      [System.Security.AccessControl.InheritanceFlags]'ContainerInherit, ObjectInherit',
      [System.Security.AccessControl.PropagationFlags]::None,
      [System.Security.AccessControl.AccessControlType]::Allow
    ))
  }
  return $security
}

function Get-CanonicalInventory([string]$Root, [string]$Prefix, [string]$Role) {
  $exactRoot = (Resolve-Path -LiteralPath $Root).Path
  Assert-NoReparseTree -Path $exactRoot -Label $Role
  $rows = [System.Collections.Generic.List[object]]::new()
  $files = @(Get-ChildItem -LiteralPath $exactRoot -File -Recurse -Force)
  if ($files.Count -lt 1) { throw "$Role input is empty." }
  foreach ($file in $files) {
    $relative = [System.IO.Path]::GetRelativePath($exactRoot, $file.FullName).Replace("\", "/")
    if ($relative -match '(^|/)\.\.(/|$)' -or $relative.StartsWith("/")) { throw "$Role path escaped its root." }
    $rows.Add([pscustomobject]@{
      path = "$Prefix/$relative"
      role = $Role
      size = [long]$file.Length
      sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    })
  }
  return @($rows)
}

function Get-HandoffTreeSha256([string]$Root) {
  $exactRoot = (Resolve-Path -LiteralPath $Root).Path
  Assert-NoReparseTree -Path $exactRoot -Label "Private release handoff tree"
  $rows = @(
    foreach ($file in Get-ChildItem -LiteralPath $exactRoot -File -Recurse -Force | Sort-Object FullName) {
      $relative = [System.IO.Path]::GetRelativePath($exactRoot, $file.FullName).Replace("\", "/")
      "$((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()) $($file.Length) $relative"
    }
  )
  if ($rows.Count -lt 2) { throw "Private release handoff tree is unexpectedly small." }
  $canonical = (($rows -join "`n") + "`n")
  return [Convert]::ToHexString(
    [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($canonical))
  ).ToLowerInvariant()
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$broker = (Resolve-Path -LiteralPath $HandoffBrokerPath).Path
$brokerItem = Get-Item -LiteralPath $broker -Force
$workspacePrefix = [System.IO.Path]::GetFullPath($projectRoot).TrimEnd("\") + "\"
$runnerTempPrefix = [System.IO.Path]::GetFullPath($env:RUNNER_TEMP).TrimEnd("\") + "\"
if (
  $brokerItem.PSIsContainer -or
  ($brokerItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  $broker.StartsWith($workspacePrefix, [System.StringComparison]::OrdinalIgnoreCase) -or
  $broker.StartsWith($runnerTempPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or
  (Get-FileHash -LiteralPath $broker -Algorithm SHA256).Hash.ToLowerInvariant() -cne $HandoffBrokerSha256
) { throw "Pinned out-of-repository SYSTEM handoff broker client is absent, linked, misplaced, or hash-mismatched." }
$package = Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json
$version = [string]$package.version
if ($ReleaseTag -cne "v$version") { throw "Release tag does not match package version." }
if ((git -C $projectRoot rev-parse HEAD).Trim().ToLowerInvariant() -cne $SourceCommit) {
  throw "Private release handoff source commit differs from the checkout."
}

$payloadRoot = (Resolve-Path -LiteralPath $PayloadDirectory).Path
$metadataRoot = (Resolve-Path -LiteralPath $MetadataDirectory).Path
$resolvedNotices = (Resolve-Path -LiteralPath $NoticesPath).Path
$expectedSbom = Join-Path $metadataRoot "retaillens-$version.spdx.json"
if (-not (Test-Path -LiteralPath $expectedSbom -PathType Leaf)) { throw "Version-bound SPDX SBOM is missing." }
$payloadInventory = @(Get-CanonicalInventory -Root $payloadRoot -Prefix "payload" -Role "unsigned-windows-payload")
$metadataInventory = @(
  [pscustomobject]@{
    path = "metadata/THIRD_PARTY_NOTICES.txt"
    role = "third-party-notices"
    size = (Get-Item -LiteralPath $resolvedNotices).Length
    sha256 = (Get-FileHash -LiteralPath $resolvedNotices -Algorithm SHA256).Hash.ToLowerInvariant()
  },
  [pscustomobject]@{
    path = "metadata/retaillens-$version.spdx.json"
    role = "spdx-sbom"
    size = (Get-Item -LiteralPath $expectedSbom).Length
    sha256 = (Get-FileHash -LiteralPath $expectedSbom -Algorithm SHA256).Hash.ToLowerInvariant()
  }
)
$allInventory = @($payloadInventory + $metadataInventory | Sort-Object path)
$canonical = (($payloadInventory | Sort-Object path | ForEach-Object {
  "$($_.sha256) $($_.size) $($_.path)"
}) -join "`n") + "`n"
$payloadTreeSha256 = [Convert]::ToHexString(
  [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($canonical))
).ToLowerInvariant()

$exactPrivateRoot = [System.IO.Path]::GetFullPath($PrivateRoot).TrimEnd("\")
if (
  -not [System.IO.Path]::IsPathFullyQualified($exactPrivateRoot) -or
  $exactPrivateRoot.StartsWith("\\") -or
  [System.IO.Path]::GetFileName($exactPrivateRoot) -cne "RetailLensReleaseHandoff" -or
  -not (Test-Path -LiteralPath $exactPrivateRoot -PathType Container)
) { throw "RETAILLENS_RELEASE_HANDOFF_ROOT is not the pre-provisioned local RetailLensReleaseHandoff directory." }
$volumeRoot = [System.IO.Path]::GetPathRoot($exactPrivateRoot)
$drive = [System.IO.DriveInfo]::new($volumeRoot)
if (-not $drive.IsReady -or $drive.DriveType -ne [System.IO.DriveType]::Fixed -or $drive.DriveFormat -cne "NTFS") {
  throw "RETAILLENS_RELEASE_HANDOFF_ROOT must be on a local fixed NTFS volume."
}
foreach ($forbidden in @($projectRoot, $env:GITHUB_WORKSPACE, $env:RUNNER_TEMP, $env:OneDrive, $env:OneDriveConsumer, $env:OneDriveCommercial)) {
  if ($forbidden -and (
    (Test-PathInside -Child $exactPrivateRoot -Parent $forbidden) -or
    (Test-PathInside -Child $forbidden -Parent $exactPrivateRoot)
  )) { throw "Private release handoff root overlaps a workspace, temporary, or OneDrive root." }
}
$ancestor = Get-Item -LiteralPath $exactPrivateRoot -Force
while ($ancestor) {
  if ($ancestor.Attributes -band [System.IO.FileAttributes]::ReparsePoint) { throw "Private release handoff ancestor is a reparse point." }
  if ($ancestor.FullName.TrimEnd("\").Equals($volumeRoot.TrimEnd("\"), [System.StringComparison]::OrdinalIgnoreCase)) { break }
  $ancestor = $ancestor.Parent
}

$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
try {
  $buildSid = [string]$identity.User.Value
  $buildGroups = @($identity.Groups | ForEach-Object { [string]$_.Value })
} finally { $identity.Dispose() }
if ($buildSid -in @("S-1-5-18", "S-1-5-32-544") -or "S-1-5-32-544" -in $buildGroups) {
  throw "The build runner account must not be SYSTEM or a member of local Administrators."
}
if ($buildSid -cne $ExpectedBuildSid) {
  throw "The build runner account is not the exact protected build SID."
}
if (@(@($buildSid, $SigningSid, $VerifierSid, $PublisherSid) | Sort-Object -Unique).Count -ne 4) {
  throw "Build, signing, signed-verifier, and publisher runner accounts must have four distinct SIDs."
}
$rootSids = @($buildSid, "S-1-5-18", "S-1-5-32-544") | Sort-Object -Unique
$inputSids = @($buildSid, "S-1-5-18", "S-1-5-32-544") | Sort-Object -Unique
Assert-ExactAcl `
  -Path $exactPrivateRoot `
  -AllowedSids $rootSids `
  -OwnerSid "S-1-5-18" `
  -Label "Private release handoff root" `
  -RequireProtected
if (@(Get-ChildItem -LiteralPath $exactPrivateRoot -Force).Count -ne 0) {
  throw "Private release handoff root must be empty before the serialized build stage starts."
}

$leaf = "retaillens-release-unsigned-$env:GITHUB_RUN_ID-$env:GITHUB_RUN_ATTEMPT-$($SourceCommit.Substring(0, 12)).ready"
$finalRoot = Join-Path $exactPrivateRoot $leaf
$incompleteRoot = Join-Path $exactPrivateRoot ($leaf + ".incomplete")
if ((Test-Path -LiteralPath $finalRoot) -or (Test-Path -LiteralPath $incompleteRoot)) {
  throw "Exact unsigned release handoff already exists."
}
$moved = $false
try {
  New-Item -ItemType Directory -Path $incompleteRoot | Out-Null
  Set-Acl -LiteralPath $incompleteRoot -AclObject (New-PrivateAcl -OwnerSid $buildSid -AllowedSids $inputSids)
  New-Item -ItemType Directory -Path (Join-Path $incompleteRoot "payload") | Out-Null
  New-Item -ItemType Directory -Path (Join-Path $incompleteRoot "metadata") | Out-Null
  foreach ($entry in $payloadInventory) {
    $relative = ([string]$entry.path).Substring("payload/".Length)
    $sourceFile = Join-Path $payloadRoot $relative.Replace("/", "\")
    $destinationFile = Join-Path $incompleteRoot ([string]$entry.path).Replace("/", "\")
    $destinationParent = Split-Path $destinationFile -Parent
    if (-not (Test-Path -LiteralPath $destinationParent -PathType Container)) {
      New-Item -ItemType Directory -Path $destinationParent -Force | Out-Null
    }
    Copy-Item -LiteralPath $sourceFile -Destination $destinationFile
  }
  Copy-Item -LiteralPath $resolvedNotices -Destination (Join-Path $incompleteRoot "metadata/THIRD_PARTY_NOTICES.txt")
  Copy-Item -LiteralPath $expectedSbom -Destination (Join-Path $incompleteRoot "metadata/retaillens-$version.spdx.json")
  Assert-NoReparseTree -Path $incompleteRoot -Label "Unsigned private release handoff"

  foreach ($entry in $allInventory) {
    $copiedPath = Join-Path $incompleteRoot ([string]$entry.path).Replace("/", "\")
    if (
      -not (Test-Path -LiteralPath $copiedPath -PathType Leaf) -or
      (Get-Item -LiteralPath $copiedPath).Length -ne [long]$entry.size -or
      (Get-FileHash -LiteralPath $copiedPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$entry.sha256
    ) { throw "Private release handoff copy differs: $($entry.path)" }
  }
  $record = [ordered]@{
    schemaVersion = 2
    handoffKind = "private-unsigned-windows-release"
    repository = "lzy2767865503-pixel/RetailLens-System"
    repositoryId = $RepositoryId
    sourceCommit = $SourceCommit
    releaseTag = $ReleaseTag
    product = "Retail Decision Studio by LAI ZEYU"
    author = "LAI ZEYU（来泽宇）"
    version = $version
    architecture = "x64"
    workflowRunId = [string]$env:GITHUB_RUN_ID
    workflowRunAttempt = [int]$env:GITHUB_RUN_ATTEMPT
    machineName = [string]$env:COMPUTERNAME
    buildSid = $buildSid
    signingSid = $SigningSid
    verifierSid = $VerifierSid
    publisherSid = $PublisherSid
    unsignedPayloadTreeSha256 = $payloadTreeSha256
    fileCount = $allInventory.Count
    files = @($allInventory)
    githubArtifactTransfer = $false
  }
  [System.IO.File]::WriteAllText(
    (Join-Path $incompleteRoot "unsigned-handoff.v2.json"),
    (($record | ConvertTo-Json -Depth 6 -Compress) + "`n"),
    [System.Text.UTF8Encoding]::new($false)
  )
  Assert-ExactAcl `
    -Path $incompleteRoot `
    -AllowedSids $inputSids `
    -OwnerSid $buildSid `
    -Label "Unsigned release handoff" `
    -RequireProtected
  [System.IO.Directory]::Move($incompleteRoot, $finalRoot)
  $moved = $true
  Assert-ExactAcl `
    -Path $finalRoot `
    -AllowedSids $inputSids `
    -OwnerSid $buildSid `
    -Label "Final unsigned release handoff" `
    -RequireProtected
  $handoffTreeSha256 = Get-HandoffTreeSha256 -Root $finalRoot
  $workspaceWindowsRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "release/windows"))
  $workspaceMetadataRoot = [System.IO.Path]::GetFullPath((Join-Path $projectRoot "release/metadata"))
  if (
    -not (Test-PathInside -Child $payloadRoot -Parent $workspaceWindowsRoot) -or
    -not $metadataRoot.Equals($workspaceMetadataRoot, [System.StringComparison]::OrdinalIgnoreCase)
  ) { throw "Unsigned workspace cleanup roots are not the exact repository release roots." }
  Remove-ReparseFreeTree -Path $workspaceWindowsRoot -Label "Unsigned Windows workspace tree"
  Remove-ReparseFreeTree -Path $workspaceMetadataRoot -Label "Unsigned metadata workspace tree"
  Write-Host "Unsigned Windows bytes were removed from the workspace and were never uploaded as a GitHub artifact."
  & $broker `
    transition-retaillens-release-handoff `
    --private-root $exactPrivateRoot `
    --handoff-id $leaf `
    --from-sid $buildSid `
    --to-sid $SigningSid `
    --target-access full-control `
    --expected-tree-sha256 $handoffTreeSha256 `
    --source-commit $SourceCommit `
    --workflow-run-id $env:GITHUB_RUN_ID `
    --workflow-run-attempt $env:GITHUB_RUN_ATTEMPT `
    --caller-client-sha256 $HandoffBrokerSha256 `
    --policy-sha256 $HandoffBrokerPolicySha256 `
    --owner-sid S-1-5-18 `
    --require-root-single-child `
    --quarantine-before-grant `
    --require-zero-source-open-handles `
    --reverify-tree-after-revoke `
    --remove-source-access |
    Out-Null
  if ($LASTEXITCODE -ne 0) { throw "Pinned SYSTEM handoff broker rejected the build-to-signer transfer." }
} catch {
  if ($moved -and (Test-Path -LiteralPath $finalRoot)) { Remove-Item -LiteralPath $finalRoot -Recurse -Force -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $incompleteRoot) { Remove-Item -LiteralPath $incompleteRoot -Recurse -Force -ErrorAction SilentlyContinue }
  throw
}

Write-Output ([pscustomobject]@{
  handoffId = $leaf
  unsignedPayloadTreeSha256 = $payloadTreeSha256
  handoffTreeSha256 = $handoffTreeSha256
  fileCount = $allInventory.Count
})

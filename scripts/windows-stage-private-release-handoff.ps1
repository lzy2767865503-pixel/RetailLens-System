param(
  [Parameter(Mandatory = $true)] [string]$PrivateRoot,
  [Parameter(Mandatory = $true)] [string]$PayloadDirectory,
  [Parameter(Mandatory = $true)] [string]$MetadataDirectory,
  [Parameter(Mandatory = $true)] [string]$NoticesPath,
  [Parameter(Mandatory = $true)] [string]$SourceCommit,
  [Parameter(Mandatory = $true)] [string]$ReleaseTag,
  [Parameter(Mandatory = $true)] [long]$RepositoryId,
  [Parameter(Mandatory = $true)] [string]$SigningSid,
  [Parameter(Mandatory = $true)] [string]$PublisherSid
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
  $SigningSid -notmatch '^S-1-(?:\d+-){1,14}\d+$' -or
  $PublisherSid -notmatch '^S-1-(?:\d+-){1,14}\d+$'
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

function Get-AclSids([System.Security.AccessControl.FileSystemSecurity]$Acl) {
  return @(
    $Acl.GetAccessRules($true, $true, [System.Security.Principal.SecurityIdentifier]) |
      ForEach-Object { [string]$_.IdentityReference.Value } |
      Sort-Object -Unique
  )
}

function Assert-ExactAcl {
  param([string]$Path, [string[]]$AllowedSids, [string]$Label, [switch]$RequireProtected)
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
  if ($acl.GetOwner([System.Security.Principal.SecurityIdentifier]).Value -cnotin $expected) {
    throw "$Label owner is outside the exact principal set."
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

$projectRoot = Split-Path $PSScriptRoot -Parent
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
try { $buildSid = [string]$identity.User.Value } finally { $identity.Dispose() }
if ($buildSid -ceq $SigningSid -or $buildSid -ceq $PublisherSid -or $SigningSid -ceq $PublisherSid) {
  throw "Build, signing, and publisher runner accounts must have three distinct SIDs."
}
$rootSids = @($buildSid, $SigningSid, $PublisherSid, "S-1-5-18", "S-1-5-32-544") | Sort-Object -Unique
$inputSids = @($buildSid, $SigningSid, "S-1-5-18", "S-1-5-32-544") | Sort-Object -Unique
Assert-ExactAcl -Path $exactPrivateRoot -AllowedSids $rootSids -Label "Private release handoff root" -RequireProtected

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
    schemaVersion = 1
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
    publisherSid = $PublisherSid
    unsignedPayloadTreeSha256 = $payloadTreeSha256
    fileCount = $allInventory.Count
    files = @($allInventory)
    githubArtifactTransfer = $false
  }
  [System.IO.File]::WriteAllText(
    (Join-Path $incompleteRoot "unsigned-handoff.v1.json"),
    (($record | ConvertTo-Json -Depth 6 -Compress) + "`n"),
    [System.Text.UTF8Encoding]::new($false)
  )
  Assert-ExactAcl -Path $incompleteRoot -AllowedSids $inputSids -Label "Unsigned release handoff" -RequireProtected
  [System.IO.Directory]::Move($incompleteRoot, $finalRoot)
  $moved = $true
  Assert-ExactAcl -Path $finalRoot -AllowedSids $inputSids -Label "Final unsigned release handoff" -RequireProtected
} catch {
  if ($moved -and (Test-Path -LiteralPath $finalRoot)) { Remove-Item -LiteralPath $finalRoot -Recurse -Force -ErrorAction SilentlyContinue }
  if (Test-Path -LiteralPath $incompleteRoot) { Remove-Item -LiteralPath $incompleteRoot -Recurse -Force -ErrorAction SilentlyContinue }
  throw
}

Write-Output ([pscustomobject]@{
  handoffId = $leaf
  unsignedPayloadTreeSha256 = $payloadTreeSha256
  fileCount = $allInventory.Count
})

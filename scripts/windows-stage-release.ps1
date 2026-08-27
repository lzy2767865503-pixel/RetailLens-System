param(
  [Parameter(Mandatory = $true)]
  [string]$ArtifactDirectory,

  [Parameter(Mandatory = $true)]
  [string]$MetadataDirectory,

  [Parameter(Mandatory = $true)]
  [string]$NoticesPath,

  [Parameter(Mandatory = $true)]
  [string]$StagingDirectory,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedSignerThumbprint,

  [switch]$TestOnlyAllowUntrustedSigner
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"

$artifactRoot = (Resolve-Path -LiteralPath $ArtifactDirectory).Path
$metadataRoot = (Resolve-Path -LiteralPath $MetadataDirectory).Path
$resolvedNotices = (Resolve-Path -LiteralPath $NoticesPath).Path
$stagingRoot = [System.IO.Path]::GetFullPath($StagingDirectory)
if ($TestOnlyAllowUntrustedSigner) {
  $authorizedFixtureRoot = [System.IO.Path]::GetFullPath(
    [string]$env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT
  )
  $systemTempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  if (
    [string]::IsNullOrWhiteSpace($env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT) -or
    (Split-Path $authorizedFixtureRoot -Leaf) -notmatch '^retaillens-staging-policy-[0-9a-f]{32}$' -or
    -not (Test-RetailLensPathWithin -CandidatePath $authorizedFixtureRoot -RootPath $systemTempRoot) -or
    -not (Test-RetailLensPathWithin -CandidatePath $artifactRoot -RootPath $authorizedFixtureRoot) -or
    -not (Test-RetailLensPathWithin -CandidatePath $metadataRoot -RootPath $authorizedFixtureRoot) -or
    -not (Test-RetailLensPathWithin -CandidatePath $stagingRoot -RootPath $authorizedFixtureRoot)
  ) {
    throw "The untrusted signer allowance is restricted to the isolated staging policy fixture."
  }
}
if (Test-Path -LiteralPath $stagingRoot) {
  throw "Release staging must not pre-exist: $stagingRoot"
}

$package = Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) "package.json") -Raw | ConvertFrom-Json
$version = [string]$package.version
$archiveName = "RetailDecisionStudioByLAIZEYU-$version-x64-portable-directory.zip"
$archiveFiles = @(Get-ChildItem -LiteralPath $artifactRoot -File -Filter $archiveName)
$hashFiles = @(Get-ChildItem -LiteralPath $artifactRoot -File -Filter "SHA256SUMS.txt")
$peInventoryFiles = @(Get-ChildItem -LiteralPath $artifactRoot -File -Filter "PE-SIGNING-INVENTORY.json")
$sbomFiles = @(Get-ChildItem -LiteralPath $metadataRoot -File -Filter "retaillens-$version.spdx.json")
if ($archiveFiles.Count -ne 1) { throw "Staging requires exactly one version-bound portable-directory ZIP." }
if ($hashFiles.Count -ne 1) { throw "Staging requires exactly one SHA256SUMS.txt." }
if ($peInventoryFiles.Count -ne 1) { throw "Staging requires exactly one PE-SIGNING-INVENTORY.json." }
if ($sbomFiles.Count -ne 1) { throw "Staging requires exactly one version-bound SPDX SBOM." }
if ((Get-RetailLensFileMagicKind -LiteralPath $archiveFiles[0].FullName) -ne "ZIP") {
  throw "Portable-directory candidate is not a ZIP archive."
}

New-Item -ItemType Directory -Path $stagingRoot | Out-Null
$sources = @(
  @{ File = $archiveFiles[0]; Role = "portable-directory-zip" },
  @{ File = $hashFiles[0]; Role = "binary-sha256" },
  @{ File = $peInventoryFiles[0]; Role = "pe-signing-inventory" },
  @{ File = Get-Item -LiteralPath $resolvedNotices; Role = "third-party-notices" },
  @{ File = $sbomFiles[0]; Role = "spdx-sbom" }
)

foreach ($source in $sources) {
  $file = $source.File
  if ($file.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Release source must not be a reparse point: $($file.FullName)"
  }
  Copy-Item -LiteralPath $file.FullName -Destination (Join-Path $stagingRoot $file.Name)
}

$inventoryFiles = @(
  foreach ($source in $sources) {
    $staged = Get-Item -LiteralPath (Join-Path $stagingRoot $source.File.Name)
    [ordered]@{
      name = $staged.Name
      role = $source.Role
      size = $staged.Length
      sha256 = (Get-FileHash -LiteralPath $staged.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
  }
) | Sort-Object { $_.name }

[ordered]@{
  schemaVersion = 2
  product = "Retail Decision Studio by LAI ZEYU"
  author = "LAI ZEYU（来泽宇）"
  version = $version
  files = @($inventoryFiles)
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $stagingRoot "STAGING-INVENTORY.json") -Encoding utf8

$verifyParameters = @{
  StagingDirectory = $stagingRoot
  ExpectedSignerThumbprint = $ExpectedSignerThumbprint
}
if ($TestOnlyAllowUntrustedSigner) {
  $verifyParameters.TestOnlyAllowUntrustedSigner = $true
}
& "$PSScriptRoot/windows-verify-staging.ps1" @verifyParameters
Write-Host "Created strict signed release staging at $stagingRoot."

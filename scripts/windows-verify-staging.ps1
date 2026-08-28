param(
  [Parameter(Mandatory = $true)]
  [string]$StagingDirectory,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedSignerThumbprint,

  [switch]$TestOnlyAllowUntrustedSigner
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-signer-policy.ps1"

$stagingRoot = (Resolve-Path -LiteralPath $StagingDirectory).Path
if ($TestOnlyAllowUntrustedSigner) {
  $authorizedFixtureRoot = [System.IO.Path]::GetFullPath(
    [string]$env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT
  )
  $systemTempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  if (
    [string]::IsNullOrWhiteSpace($env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT) -or
    (Split-Path $authorizedFixtureRoot -Leaf) -notmatch '^retaillens-staging-policy-[0-9a-f]{32}$' -or
    -not (Test-RetailLensPathWithin -CandidatePath $authorizedFixtureRoot -RootPath $systemTempRoot) -or
    -not (Test-RetailLensPathWithin -CandidatePath $stagingRoot -RootPath $authorizedFixtureRoot)
  ) {
    throw "The untrusted signer allowance is restricted to the isolated staging policy fixture."
  }
}
$expectedThumbprint = $ExpectedSignerThumbprint.Replace(" ", "").ToLowerInvariant()
if ($expectedThumbprint -notmatch '^[0-9a-f]{40}$') {
  throw "ExpectedSignerThumbprint is invalid."
}
$stagingItem = Get-Item -LiteralPath $stagingRoot -Force
if (-not $stagingItem.PSIsContainer -or ($stagingItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
  throw "Signed staging must be a regular directory."
}
if (@(Get-ChildItem -LiteralPath $stagingRoot -Directory -Force).Count -ne 0) {
  throw "Signed staging must be flat and contain no directories."
}

$projectRoot = Split-Path $PSScriptRoot -Parent
$package = Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json
$version = [string]$package.version
$archiveName = "RetailDecisionStudioByLAIZEYU-$version-x64-portable-directory.zip"
$sbomName = "retaillens-$version.spdx.json"
$expectedRoles = [ordered]@{
  $archiveName = "portable-directory-zip"
  "SHA256SUMS.txt" = "binary-sha256"
  "PE-SIGNING-INVENTORY.json" = "pe-signing-inventory"
  "THIRD_PARTY_NOTICES.txt" = "third-party-notices"
  $sbomName = "spdx-sbom"
}
$expectedNames = @($expectedRoles.Keys) + "STAGING-INVENTORY.json"
$actualFiles = @(Get-ChildItem -LiteralPath $stagingRoot -File -Force)
$actualNames = @($actualFiles.Name)
$differences = @(Compare-Object -ReferenceObject ($expectedNames | Sort-Object) -DifferenceObject ($actualNames | Sort-Object) -CaseSensitive)
if ($actualFiles.Count -ne $expectedNames.Count -or $differences.Count -ne 0) {
  throw "Signed staging contains missing or unexpected files."
}

foreach ($file in $actualFiles) {
  if ($file.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Signed staging file must not be a reparse point: $($file.Name)"
  }
  $kind = Get-RetailLensFileMagicKind -LiteralPath $file.FullName
  if ($file.Name -ceq $archiveName) {
    if ($kind -ne "ZIP") { throw "Portable-directory release has invalid ZIP magic: $($file.Name)" }
  } elseif ($kind -ne "OTHER") {
    throw "Non-executable staging file has forbidden binary/archive magic: $($file.Name) ($kind)"
  }
}

$inventoryPath = Join-Path $stagingRoot "STAGING-INVENTORY.json"
$inventory = Get-Content -LiteralPath $inventoryPath -Raw | ConvertFrom-Json
$inventoryKeys = @($inventory.PSObject.Properties.Name) | Sort-Object
$expectedInventoryKeys = @("author", "files", "product", "schemaVersion", "version") | Sort-Object
if (@(Compare-Object $expectedInventoryKeys $inventoryKeys -CaseSensitive).Count -ne 0) {
  throw "Staging inventory contains missing or unexpected fields."
}
if (
  $inventory.schemaVersion -ne 2 -or
  $inventory.product -cne "Retail Decision Studio by LAI ZEYU" -or
  $inventory.author -cne "LAI ZEYU（来泽宇）" -or
  $inventory.version -cne $version
) {
  throw "Staging inventory identity is invalid."
}

$inventoryEntries = @($inventory.files)
if ($inventoryEntries.Count -ne $expectedRoles.Count) {
  throw "Staging inventory file count is invalid."
}
$seen = @{}
foreach ($entry in $inventoryEntries) {
  $entryKeys = @($entry.PSObject.Properties.Name) | Sort-Object
  if (@(Compare-Object @("name", "role", "sha256", "size") $entryKeys -CaseSensitive).Count -ne 0) {
    throw "Staging inventory entry contains missing or unexpected fields."
  }
  $name = [string]$entry.name
  if (-not $expectedRoles.Contains($name) -or $seen.ContainsKey($name)) {
    throw "Staging inventory references an unexpected or duplicate file: $name"
  }
  if ([string]$entry.role -cne [string]$expectedRoles[$name]) {
    throw "Staging role mismatch for $name."
  }
  $file = Get-Item -LiteralPath (Join-Path $stagingRoot $name)
  $actualHash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
  if ([string]$entry.sha256 -cne $actualHash -or [long]$entry.size -ne $file.Length) {
    throw "Staging inventory hash/size mismatch for $name."
  }
  $seen[$name] = $true
}

$peInventory = Get-Content -LiteralPath (Join-Path $stagingRoot "PE-SIGNING-INVENTORY.json") -Raw | ConvertFrom-Json
$peInventoryKeys = @($peInventory.PSObject.Properties.Name) | Sort-Object
$expectedPeInventoryKeys = @(
  "author", "files", "peCount", "product", "schemaVersion",
  "signerSubject", "signerThumbprint", "timestampUrl"
) | Sort-Object
if (@(Compare-Object $expectedPeInventoryKeys $peInventoryKeys -CaseSensitive).Count -ne 0) {
  throw "PE signing inventory contains missing or unexpected fields."
}
if (
  $peInventory.schemaVersion -ne 2 -or
  $peInventory.product -cne "Retail Decision Studio by LAI ZEYU" -or
  $peInventory.author -cne "LAI ZEYU（来泽宇）" -or
  $peInventory.timestampUrl -cne "http://ts.ssl.com" -or
  [string]::IsNullOrWhiteSpace([string]$peInventory.signerSubject) -or
  [string]$peInventory.signerThumbprint -cne $expectedThumbprint -or
  [int]$peInventory.peCount -le 0 -or
  @($peInventory.files).Count -ne [int]$peInventory.peCount
) {
  throw "PE signing inventory identity/count/timestamp policy is invalid."
}
$subjectCommonName = [regex]::Match(
  [string]$peInventory.signerSubject,
  '(?:^|[,;+]\s*)CN=([^,;+]+)',
  [System.Text.RegularExpressions.RegexOptions]::CultureInvariant
).Groups[1].Value.Trim('"')
Assert-RetailLensAuthorOwnedSignerIdentity `
  -SimpleName $subjectCommonName `
  -Subject ([string]$peInventory.signerSubject) `
  -Context "PE signing inventory"
$seenPePaths = @{}
foreach ($entry in @($peInventory.files)) {
  $peEntryKeys = @($entry.PSObject.Properties.Name) | Sort-Object
  if (
    @(Compare-Object @("path", "sha256", "signerThumbprint", "size") $peEntryKeys -CaseSensitive).Count -ne 0 -or
    [string]$entry.path -notmatch '^[^\\/:*?"<>|]+(?:/[^\\/:*?"<>|]+)*$' -or
    $seenPePaths.ContainsKey([string]$entry.path) -or
    [long]$entry.size -le 0 -or
    [string]$entry.sha256 -notmatch '^[0-9a-f]{64}$' -or
    [string]$entry.signerThumbprint -cne $expectedThumbprint
  ) {
    throw "PE signing inventory contains an invalid file entry."
  }
  $seenPePaths[[string]$entry.path] = $true
}

# The inventory is not accepted as self-asserted metadata. Expand the exact ZIP
# and bind every inventory path, size, hash, and (on Windows) Authenticode
# thumbprint to the real PE bytes that will be published.
$archivePath = Join-Path $stagingRoot $archiveName
$temporaryBase = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
  [System.IO.Path]::GetTempPath()
} else { $env:RUNNER_TEMP }
$inspectionRoot = Join-Path $temporaryBase ("retaillens-inventory-" + [Guid]::NewGuid().ToString("N"))
try {
  New-Item -ItemType Directory -Path $inspectionRoot | Out-Null
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
  try {
    $seenArchiveEntries = @{}
    foreach ($entry in $archive.Entries) {
      $normalizedName = $entry.FullName.Replace("\", "/")
      if ([string]::IsNullOrWhiteSpace($normalizedName) -or [System.IO.Path]::IsPathRooted($normalizedName)) {
        throw "Portable ZIP contains an empty or rooted entry."
      }
      $duplicateKey = $normalizedName.TrimEnd("/").ToLowerInvariant()
      if ($seenArchiveEntries.ContainsKey($duplicateKey)) {
        throw "Portable ZIP contains a duplicate case-insensitive entry: $normalizedName"
      }
      $seenArchiveEntries[$duplicateKey] = $true
      if ((($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) {
        throw "Portable ZIP contains a symbolic-link entry: $normalizedName"
      }
      if ($normalizedName.Split("/")[0] -cne $archiveName.Substring(0, $archiveName.Length - 4)) {
        throw "Portable ZIP entry escaped the exact product root: $normalizedName"
      }
      $target = [System.IO.Path]::GetFullPath((Join-Path $inspectionRoot $normalizedName))
      if (-not (Test-RetailLensPathWithin -CandidatePath $target -RootPath $inspectionRoot)) {
        throw "Portable ZIP contains path traversal: $normalizedName"
      }
    }
  } finally {
    $archive.Dispose()
  }
  [System.IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $inspectionRoot)
  $expandedRoot = Join-Path $inspectionRoot $archiveName.Substring(0, $archiveName.Length - 4)
  $actualPeFiles = @(Get-RetailLensPortableExecutable -Root $expandedRoot)
  $actualPaths = @(
    $actualPeFiles | ForEach-Object {
      [System.IO.Path]::GetRelativePath($expandedRoot, $_.FullName).Replace("\", "/")
    }
  )
  $inventoryPaths = @($peInventory.files | ForEach-Object { [string]$_.path })
  if (
    $actualPeFiles.Count -ne [int]$peInventory.peCount -or
    @(Compare-Object ($inventoryPaths | Sort-Object) ($actualPaths | Sort-Object) -CaseSensitive).Count -ne 0
  ) {
    throw "PE signing inventory does not match the exact published ZIP PE path set."
  }
  foreach ($actualPe in $actualPeFiles) {
    $relativePath = [System.IO.Path]::GetRelativePath($expandedRoot, $actualPe.FullName).Replace("\", "/")
    $inventoryEntry = @($peInventory.files | Where-Object { [string]$_.path -ceq $relativePath })
    if ($inventoryEntry.Count -ne 1) {
      throw "PE signing inventory lacks one exact entry for $relativePath."
    }
    $actualHash = (Get-FileHash -LiteralPath $actualPe.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    if (
      [long]$inventoryEntry[0].size -ne $actualPe.Length -or
      [string]$inventoryEntry[0].sha256 -cne $actualHash
    ) {
      throw "PE signing inventory hash/size does not match published bytes: $relativePath"
    }
    if ($IsWindows) {
      $signature = Get-AuthenticodeSignature -LiteralPath $actualPe.FullName
      $acceptedFixtureTrustFailure =
        $TestOnlyAllowUntrustedSigner -and
        $signature.Status -in @(
          [System.Management.Automation.SignatureStatus]::NotTrusted,
          [System.Management.Automation.SignatureStatus]::UnknownError
        )
      if (
        ($signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -and
          -not $acceptedFixtureTrustFailure) -or
        -not $signature.SignerCertificate -or
        $signature.SignerCertificate.Thumbprint.Replace(" ", "").ToLowerInvariant() -cne $expectedThumbprint
      ) {
        throw "Published PE does not carry the one expected signer thumbprint: $relativePath"
      }
    }
  }
} finally {
  if (Test-Path -LiteralPath $inspectionRoot) {
    Remove-Item -LiteralPath $inspectionRoot -Recurse -Force
  }
}

$hashManifest = @(Get-Content -LiteralPath (Join-Path $stagingRoot "SHA256SUMS.txt"))
if ($hashManifest.Count -ne 1) { throw "SHA256SUMS.txt must contain exactly one line." }
$hashedNames = @{}
foreach ($line in $hashManifest) {
  if ($line -notmatch '^([0-9a-f]{64})  (RetailDecisionStudioByLAIZEYU-.+-x64-portable-directory\.zip)$') {
    throw "Invalid SHA256SUMS entry: $line"
  }
  $hash = $Matches[1]
  $name = $Matches[2]
  if ($name -cne $archiveName -or $hashedNames.ContainsKey($name)) {
    throw "SHA256SUMS references an unexpected or duplicate executable: $name"
  }
  $actualHash = (Get-FileHash -LiteralPath (Join-Path $stagingRoot $name) -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($hash -cne $actualHash) { throw "SHA256SUMS mismatch for $name." }
  $hashedNames[$name] = $true
}

Write-Host "Strict signed staging inventory passed for Retail Decision Studio by LAI ZEYU $version."

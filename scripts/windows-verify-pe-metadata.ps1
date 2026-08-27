param(
  [Parameter(Mandatory = $true)]
  [string[]]$ExecutablePath
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$policyPath = Join-Path $PSScriptRoot "windows-release-policy.json"
if (-not (Test-Path -LiteralPath $policyPath -PathType Leaf)) {
  throw "Built-in Windows release policy is missing."
}

$policy = Get-Content -LiteralPath $policyPath -Raw | ConvertFrom-Json
$expectedCompanyName = "LAI ZEYU（来泽宇）"
$expectedLegalCopyright = "Copyright © 2026 LAI ZEYU（来泽宇）"
$expectedProductName = "Retail Decision Studio by LAI ZEYU"
if (
  $policy.expectedPeMetadata.companyName -cne $expectedCompanyName -or
  $policy.expectedPeMetadata.legalCopyright -cne $expectedLegalCopyright -or
  $policy.expectedPeMetadata.productName -cne $expectedProductName
) {
  throw "Built-in Windows PE metadata policy does not match the immutable LAI ZEYU release identity."
}

foreach ($path in $ExecutablePath) {
  $resolvedExecutable = (Resolve-Path -LiteralPath $path).Path
  $versionInfo = (Get-Item -LiteralPath $resolvedExecutable).VersionInfo
  $executableName = Split-Path -Leaf $resolvedExecutable

  if ($versionInfo.CompanyName -cne $expectedCompanyName) {
    throw "CompanyName mismatch for ${executableName}: $($versionInfo.CompanyName)"
  }
  if ($versionInfo.LegalCopyright -cne $expectedLegalCopyright) {
    throw "LegalCopyright mismatch for ${executableName}: $($versionInfo.LegalCopyright)"
  }
  if ($versionInfo.ProductName -cne $expectedProductName) {
    throw "ProductName mismatch for ${executableName}: $($versionInfo.ProductName)"
  }
}

Write-Host "Verified LAI ZEYU PE metadata on $($ExecutablePath.Count) executable(s)."

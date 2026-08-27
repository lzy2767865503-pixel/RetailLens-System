$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-signer-policy.ps1"

$allowedIdentities = @(
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, C=MY" },
  @{ SimpleName = "来泽宇"; Subject = "CN=来泽宇, O=来泽宇" }
)
foreach ($identity in $allowedIdentities) {
  Assert-RetailLensAuthorOwnedSignerIdentity `
    -SimpleName $identity.SimpleName `
    -Subject $identity.Subject `
    -Context "positive policy test"
}

$forbiddenIdentities = @(
  @{ SimpleName = "SignPath Foundation"; Subject = "CN=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, O=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU + O=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, OU=Microsoft Corporation" },
  @{ SimpleName = "LAI ZEYU（来泽宇）"; Subject = "CN=LAI ZEYU（来泽宇）" },
  @{ SimpleName = "lai zeyu"; Subject = "CN=lai zeyu" },
  @{ SimpleName = "LAI ZEYU "; Subject = "CN=LAI ZEYU " },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU " },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, O=LAI ZEYU " }
)
foreach ($identity in $forbiddenIdentities) {
  $blocked = $false
  try {
    Assert-RetailLensAuthorOwnedSignerIdentity `
      -SimpleName $identity.SimpleName `
      -Subject $identity.Subject `
      -Context "negative policy test"
  } catch {
    $blocked = $true
  }
  if (-not $blocked) {
    throw "Forbidden signer identity passed the immutable author-owned policy: $($identity.Subject)"
  }
}

Write-Host "Immutable Windows signer policy positive and negative tests passed for LAI ZEYU（来泽宇）."

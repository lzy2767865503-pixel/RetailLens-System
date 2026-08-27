$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$workflowPath = Join-Path (Split-Path -Parent $PSScriptRoot) ".github/workflows/windows-github-release.yml"
$workflow = Get-Content -LiteralPath $workflowPath -Raw
$functionMatches = [regex]::Matches(
  $workflow,
  '(?ms)^          function Assert-RetailLensNoCheckoutSignerIdentity \{.*?^          \}(?=\r?\n          )',
  [Text.RegularExpressions.RegexOptions]::CultureInvariant
)
if ($functionMatches.Count -ne 4) {
  throw "Expected four independent no-checkout signer policy functions; found $($functionMatches.Count)."
}

$functions = @(
  foreach ($functionMatch in $functionMatches) {
    [regex]::Replace(
      $functionMatch.Value,
      '(?m)^          ',
      '',
      [Text.RegularExpressions.RegexOptions]::CultureInvariant
    )
  }
)
for ($index = 1; $index -lt $functions.Count; $index++) {
  if (-not [string]::Equals($functions[0], $functions[$index], [StringComparison]::Ordinal)) {
    throw "No-checkout signer policy copy $($index + 1) diverges from the signer boundary policy."
  }
}

Invoke-Expression $functions[0]

$positiveCases = @(
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, O=LAI ZEYU, C=MY" },
  @{ SimpleName = "来泽宇"; Subject = "CN=来泽宇, OU=来泽宇" }
)
foreach ($identity in $positiveCases) {
  Assert-RetailLensNoCheckoutSignerIdentity `
    -SimpleName $identity.SimpleName `
    -Subject $identity.Subject `
    -Context "positive embedded-policy test"
}
Assert-RetailLensNoCheckoutSignerIdentity `
  -Subject "CN=LAI ZEYU, O=LAI ZEYU" `
  -Context "positive Subject-only embedded-policy test" `
  -SubjectOnly

$negativeCases = @(
  @{ SimpleName = "lai zeyu"; Subject = "CN=LAI ZEYU" },
  @{ SimpleName = "Lai Zeyu"; Subject = "CN=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=lai zeyu" },
  @{ SimpleName = "LAI ZEYU"; Subject = "cn=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, o=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, ou=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, O=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, o=SignPath Foundation" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU, CN=LAI ZEYU" },
  @{ SimpleName = "LAI ZEYU"; Subject = "CN=LAI ZEYU " }
)
foreach ($identity in $negativeCases) {
  $blocked = $false
  try {
    Assert-RetailLensNoCheckoutSignerIdentity `
      -SimpleName $identity.SimpleName `
      -Subject $identity.Subject `
      -Context "negative embedded-policy test"
  } catch {
    $blocked = $true
  }
  if (-not $blocked) {
    throw "Embedded no-checkout signer policy accepted a forbidden identity: $($identity.Subject)"
  }
}

Write-Host "Four independent embedded no-checkout signer policies passed exact Ordinal CN/O/OU tests."

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = Split-Path $PSScriptRoot -Parent
$version = (Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json).version
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("retaillens-staging-policy-" + [Guid]::NewGuid().ToString("N"))
$artifacts = Join-Path $testRoot "artifacts"
$metadata = Join-Path $testRoot "metadata"
$staging = Join-Path $testRoot "staging"
$fixtureThumbprint = "0123456789abcdef0123456789abcdef01234567"
$fixtureCertificate = $null
$fixtureFriendlyName = "RetailLens staging policy " + [Guid]::NewGuid().ToString("N")
$previousTestSignerRoot = $env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT
try {
  $env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT = $testRoot
  New-Item -ItemType Directory -Path $artifacts, $metadata | Out-Null
  $releaseName = "RetailDecisionStudioByLAIZEYU-$version-x64-portable-directory"
  $fixtureRoot = Join-Path $testRoot $releaseName
  New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
  $fixtureExe = Join-Path $fixtureRoot "Retail Decision Studio by LAI ZEYU.exe"
  if ($IsWindows) {
    Write-Host "Staging fixture: compiling a real PE."
    $fixtureLibrary = Join-Path $testRoot "staging-policy-fixture.dll"
    Add-Type `
      -TypeDefinition 'public static class RetailLensStagingPeFixture { public static int Marker() { return 1; } }' `
      -Language CSharp `
      -OutputAssembly $fixtureLibrary `
      -OutputType Library
    Move-Item -LiteralPath $fixtureLibrary -Destination $fixtureExe
    Write-Host "Staging fixture: creating the temporary code-signing certificate."
    $fixtureCertificate = New-SelfSignedCertificate `
      -Type CodeSigningCert `
      -Subject "CN=LAI ZEYU" `
      -FriendlyName $fixtureFriendlyName `
      -CertStoreLocation "Cert:\CurrentUser\My" `
      -KeyAlgorithm RSA -KeyLength 2048 -HashAlgorithm SHA256 `
      -KeyExportPolicy NonExportable -NotAfter (Get-Date).AddHours(2)
    $fixtureThumbprint = $fixtureCertificate.Thumbprint.ToLowerInvariant()
    Write-Host "Staging fixture: applying the Authenticode signature."
    $signedFixture = Set-AuthenticodeSignature `
      -LiteralPath $fixtureExe -Certificate $fixtureCertificate -HashAlgorithm SHA256
    Write-Host "Staging fixture: validating the cryptographic signature result."
    if (
      $signedFixture.Status -notin @(
        [System.Management.Automation.SignatureStatus]::Valid,
        [System.Management.Automation.SignatureStatus]::NotTrusted,
        [System.Management.Automation.SignatureStatus]::UnknownError
      ) -or
      -not $signedFixture.SignerCertificate -or
      $signedFixture.SignerCertificate.Thumbprint.ToLowerInvariant() -cne $fixtureThumbprint
    ) { throw "Could not create the real-PE staging policy fixture signature." }
  } else {
    $crossBuiltFixture = Join-Path $projectRoot "release/windows/win-unpacked/Retail Decision Studio by LAI ZEYU.exe"
    if (-not (Test-Path -LiteralPath $crossBuiltFixture -PathType Leaf)) {
      throw "A real cross-built Windows PE fixture is required on non-Windows hosts. Run pnpm package:windows first."
    }
    Copy-Item -LiteralPath $crossBuiltFixture -Destination $fixtureExe
  }
  $archive = Join-Path $artifacts "$releaseName.zip"
  Write-Host "Staging fixture: freezing the signed archive and inventory."
  Compress-Archive -LiteralPath $fixtureRoot -DestinationPath $archive
  "$((Get-FileHash -LiteralPath $archive -Algorithm SHA256).Hash.ToLowerInvariant())  $(Split-Path -Leaf $archive)" |
    Set-Content -LiteralPath (Join-Path $artifacts "SHA256SUMS.txt")
  [ordered]@{
    schemaVersion = 2
    product = "Retail Decision Studio by LAI ZEYU"
    author = "LAI ZEYU（来泽宇）"
    signerSubject = "CN=LAI ZEYU"
    signerThumbprint = $fixtureThumbprint
    timestampUrl = "http://ts.ssl.com"
    peCount = 1
    files = @(
      [ordered]@{
        path = "Retail Decision Studio by LAI ZEYU.exe"
        size = (Get-Item -LiteralPath $fixtureExe).Length
        sha256 = (Get-FileHash -LiteralPath $fixtureExe -Algorithm SHA256).Hash.ToLowerInvariant()
        signerThumbprint = $fixtureThumbprint
      }
    )
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $artifacts "PE-SIGNING-INVENTORY.json") -Encoding utf8
  Set-Content -LiteralPath (Join-Path $metadata "retaillens-$version.spdx.json") -Value '{"spdxVersion":"SPDX-2.3"}'

  Write-Host "Staging fixture: staging and verifying the frozen archive."
  & "$PSScriptRoot/windows-stage-release.ps1" `
    -ArtifactDirectory $artifacts `
    -MetadataDirectory $metadata `
    -NoticesPath (Join-Path $projectRoot "THIRD_PARTY_NOTICES.txt") `
    -StagingDirectory $staging `
    -ExpectedSignerThumbprint $fixtureThumbprint `
    -TestOnlyAllowUntrustedSigner

  & "$PSScriptRoot/windows-verify-staging.ps1" `
    -StagingDirectory $staging `
    -ExpectedSignerThumbprint $fixtureThumbprint `
    -TestOnlyAllowUntrustedSigner

  Add-Content -LiteralPath (Join-Path $staging "THIRD_PARTY_NOTICES.txt") -Value "tampered"
  $blocked = $false
  try {
    & "$PSScriptRoot/windows-verify-staging.ps1" `
      -StagingDirectory $staging `
      -ExpectedSignerThumbprint $fixtureThumbprint `
      -TestOnlyAllowUntrustedSigner
  } catch { $blocked = $true }
  if (-not $blocked) { throw "Tampered staged evidence was not blocked." }

  Write-Host "RetailLens strict signed-staging policy tests passed."
} finally {
  if ($null -eq $previousTestSignerRoot) {
    Remove-Item Env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT -ErrorAction SilentlyContinue
  } else {
    $env:RETAILLENS_TEST_ONLY_UNTRUSTED_SIGNER_ROOT = $previousTestSignerRoot
  }
  Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
  if ($IsWindows -and $fixtureCertificate) {
    Get-ChildItem "Cert:\CurrentUser\TrustedPeople" -ErrorAction SilentlyContinue |
      Where-Object { $_.Thumbprint -ceq $fixtureCertificate.Thumbprint } |
      ForEach-Object { Remove-Item -LiteralPath $_.PSPath -Force -ErrorAction SilentlyContinue }
    Get-ChildItem "Cert:\CurrentUser\Root" -ErrorAction SilentlyContinue |
      Where-Object { $_.Thumbprint -ceq $fixtureCertificate.Thumbprint } |
      ForEach-Object { Remove-Item -LiteralPath $_.PSPath -Force -ErrorAction SilentlyContinue }
    Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($fixtureCertificate.Thumbprint)" -DeleteKey -Force -ErrorAction SilentlyContinue
  }
}

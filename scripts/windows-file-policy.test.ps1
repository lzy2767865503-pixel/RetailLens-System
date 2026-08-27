$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"

$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("retaillens-file-policy-" + [Guid]::NewGuid().ToString("N"))
try {
  New-Item -ItemType Directory -Path $testRoot | Out-Null
  Set-Content -LiteralPath (Join-Path $testRoot "status.txt") -Value "PASS"
  Set-Content -LiteralPath (Join-Path $testRoot "report.xml") -Value "<report><result>PASS</result></report>"
  Set-Content -LiteralPath (Join-Path $testRoot "inventory.json") -Value '{"schemaVersion":1}'
  Assert-RetailLensEvidenceDirectory -Directory $testRoot

  $compiledFixture = Join-Path $testRoot "compiled-fixture.exe"
  if ($IsWindows) {
    $compiledLibrary = Join-Path $testRoot "compiled-fixture.dll"
    Add-Type `
      -TypeDefinition 'public static class RetailLensPeFixture { public static int Marker() { return 1; } }' `
      -Language CSharp `
      -OutputAssembly $compiledLibrary `
      -OutputType Library
    Move-Item -LiteralPath $compiledLibrary -Destination $compiledFixture
  } else {
    $crossBuiltFixture = Join-Path (Split-Path $PSScriptRoot -Parent) "release/windows/win-unpacked/Retail Decision Studio by LAI ZEYU.exe"
    if (-not (Test-Path -LiteralPath $crossBuiltFixture -PathType Leaf)) {
      throw "A real cross-built Windows PE fixture is required on non-Windows hosts. Run pnpm package:windows first."
    }
    Copy-Item -LiteralPath $crossBuiltFixture -Destination $compiledFixture
  }
  if (-not (Test-Path -LiteralPath $compiledFixture -PathType Leaf)) {
    throw "Could not compile the real Windows PE fixture."
  }
  $mzDisguised = Join-Path $testRoot "innocent.txt"
  Copy-Item -LiteralPath $compiledFixture -Destination $mzDisguised
  Remove-Item -LiteralPath $compiledFixture -Force
  if ((Get-RetailLensFileMagicKind -LiteralPath $mzDisguised) -ne "MZ_PE") {
    throw "Real PE magic regression test failed."
  }
  $blocked = $false
  try { Assert-RetailLensEvidenceDirectory -Directory $testRoot } catch { $blocked = $true }
  if (-not $blocked) { throw "Disguised MZ evidence was not blocked." }
  Remove-Item -LiteralPath $mzDisguised -Force

  $truncatedMz = Join-Path $testRoot "truncated-mz.txt"
  [System.IO.File]::WriteAllBytes($truncatedMz, [byte[]](0x4D, 0x5A, 0x00, 0x00))
  if ((Get-RetailLensFileMagicKind -LiteralPath $truncatedMz) -ne "MZ_INVALID") {
    throw "Truncated MZ data was incorrectly accepted as a PE."
  }
  $blocked = $false
  try { Assert-RetailLensEvidenceDirectory -Directory $testRoot } catch { $blocked = $true }
  if (-not $blocked) { throw "Invalid MZ evidence was not blocked." }
  Remove-Item -LiteralPath $truncatedMz -Force

  $archiveDisguised = Join-Path $testRoot "archive.json"
  [System.IO.File]::WriteAllBytes($archiveDisguised, [byte[]](0x50, 0x4B, 0x03, 0x04, 0x00))
  $blocked = $false
  try { Assert-RetailLensEvidenceDirectory -Directory $testRoot } catch { $blocked = $true }
  if (-not $blocked) { throw "Disguised archive evidence was not blocked." }
  Remove-Item -LiteralPath $archiveDisguised -Force

  $boundaryRoot = Join-Path $testRoot "app"
  $inside = Join-Path $boundaryRoot "runtime.exe"
  $sibling = $boundaryRoot + "-attacker/runtime.exe"
  if (-not (Test-RetailLensPathWithin -CandidatePath $inside -RootPath $boundaryRoot)) {
    throw "Canonical inside-path regression test failed."
  }
  if (Test-RetailLensPathWithin -CandidatePath $sibling -RootPath $boundaryRoot) {
    throw "Sibling-prefix path escaped the canonical boundary."
  }

  Write-Host "RetailLens file-magic, evidence, and canonical-path policy tests passed."
} finally {
  Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
}

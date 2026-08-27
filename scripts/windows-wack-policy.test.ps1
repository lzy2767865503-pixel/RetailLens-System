$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-wack-policy.ps1"

$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("retaillens-wack-policy-" + [Guid]::NewGuid().ToString("N"))
try {
  New-Item -ItemType Directory -Path $testRoot | Out-Null
  $padding = "x" * 700
  $cases = @(
    @{ Name = "valid-complete"; Pass = $true; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='Static'><RESULT>PASS</RESULT></TEST><TEST INDEX='2' NAME='Optional'><RESULT>NOT_APPLICABLE</RESULT></TEST></REQUIREMENT><REQUIREMENT><TEST INDEX='3' NAME='Runtime'><RESULT>PASSED</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "overall-fail"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='FAIL' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "partial"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='TRUE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "missing-partial-marker"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "stale-kit"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='FALSE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "duplicate-test"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST><TEST INDEX='1' NAME='B'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "duplicate-name"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST><TEST INDEX='2' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "test-outside-requirement"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><TEST INDEX='2' NAME='B'><RESULT>PASS</RESULT></TEST><!--$padding--></REPORT>" },
    @{ Name = "missing-result"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "multiple-results"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>PASS</RESULT><RESULT>PASS</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "failed-test"; Pass = $false; Xml = "<REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>FAIL</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" },
    @{ Name = "dtd"; Pass = $false; Xml = "<!DOCTYPE REPORT [<!ENTITY xxe SYSTEM 'file:///Windows/System32/drivers/etc/hosts'>]><REPORT OVERALL_RESULT='PASS' PARTIAL_RUN='FALSE' LATEST_VERSION='TRUE' VERSION='10.0.26100.1'><REQUIREMENTS><REQUIREMENT><TEST INDEX='1' NAME='A'><RESULT>&xxe;</RESULT></TEST></REQUIREMENT></REQUIREMENTS><!--$padding--></REPORT>" }
  )
  foreach ($case in $cases) {
    $path = Join-Path $testRoot ("$($case.Name).xml")
    Set-Content -LiteralPath $path -Value $case.Xml -Encoding utf8
    $passed = $true
    try { $null = Read-RetailLensCompleteWackReport -ReportPath $path } catch { $passed = $false }
    if ($passed -ne $case.Pass) {
      throw "WACK parser case $($case.Name) expected pass=$($case.Pass), observed pass=$passed."
    }
  }
  $approvedIdentity = @{
    ActualFileVersion = "10.0.26100.1"
    ActualSha256 = "a" * 64
    ActualSignerSubject = "CN=Microsoft Windows, O=Microsoft Corporation, L=Redmond, S=Washington, C=US"
    ActualSignerThumbprint = "b" * 40
    ApprovedFileVersion = "10.0.26100.1"
    ApprovedSha256 = "a" * 64
    ApprovedSignerSubject = "CN=Microsoft Windows, O=Microsoft Corporation, L=Redmond, S=Washington, C=US"
    ApprovedSignerThumbprint = "b" * 40
  }
  Assert-RetailLensApprovedAppcertIdentity @approvedIdentity
  foreach ($mutation in @(
    @{ Name = "file-version"; Key = "ActualFileVersion"; Value = "10.0.26100.2" },
    @{ Name = "sha256"; Key = "ActualSha256"; Value = ("c" * 64) },
    @{ Name = "signer-subject"; Key = "ActualSignerSubject"; Value = "CN=Other, O=Microsoft Corporation" },
    @{ Name = "signer-thumbprint"; Key = "ActualSignerThumbprint"; Value = ("d" * 40) },
    @{ Name = "approved-file-version"; Key = "ApprovedFileVersion"; Value = "10.0.26100.2" },
    @{ Name = "approved-sha256"; Key = "ApprovedSha256"; Value = ("c" * 64) },
    @{ Name = "approved-signer-subject"; Key = "ApprovedSignerSubject"; Value = "CN=Other, O=Microsoft Corporation" },
    @{ Name = "approved-signer-thumbprint"; Key = "ApprovedSignerThumbprint"; Value = ("d" * 40) },
    @{ Name = "approved-hash-format"; Key = "ApprovedSha256"; Value = ("A" * 64) }
  )) {
    $fixture = @{} + $approvedIdentity
    $fixture[$mutation.Key] = $mutation.Value
    $rejected = $false
    try { Assert-RetailLensApprovedAppcertIdentity @fixture } catch { $rejected = $true }
    if (-not $rejected) { throw "Approved appcert negative fixture $($mutation.Name) was accepted." }
  }
  Write-Host "WACK complete-report policy fixtures passed. No fake AppX or cryptographic-attestation claim is used."
} finally {
  if (Test-Path -LiteralPath $testRoot) {
    $cleanupItems = @(Get-Item -LiteralPath $testRoot -Force; Get-ChildItem -LiteralPath $testRoot -Recurse -Force)
    if (@($cleanupItems | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0) {
      throw "WACK policy fixture root contains a reparse point and cannot be recursively deleted."
    }
    Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
}

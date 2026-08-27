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
  Write-Host "WACK complete-report policy fixtures passed. No fake AppX or cryptographic-attestation claim is used."
} finally {
  Remove-Item -LiteralPath $testRoot -Recurse -Force -ErrorAction SilentlyContinue
}

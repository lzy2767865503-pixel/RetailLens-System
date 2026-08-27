$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Read-RetailLensCompleteWackReport {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$ReportPath
  )

  $resolvedReport = (Resolve-Path -LiteralPath $ReportPath).Path
  $reportItem = Get-Item -LiteralPath $resolvedReport
  if ($reportItem.Length -lt 512) {
    throw "WACK report is too small to prove a complete run."
  }

  $settings = [System.Xml.XmlReaderSettings]::new()
  $settings.DtdProcessing = [System.Xml.DtdProcessing]::Prohibit
  $settings.XmlResolver = $null
  $settings.MaxCharactersInDocument = 50MB
  $reader = [System.Xml.XmlReader]::Create($resolvedReport, $settings)
  try {
    $report = [System.Xml.XmlDocument]::new()
    $report.XmlResolver = $null
    $report.Load($reader)
  } finally {
    $reader.Dispose()
  }

  $root = $report.DocumentElement
  if (-not $root -or $root.LocalName -cne "REPORT") {
    throw "WACK XML must contain one official REPORT document root."
  }
  $overall = $root.GetAttribute("OVERALL_RESULT").Trim().ToUpperInvariant()
  if ($overall -notin @("PASS", "PASSED")) {
    throw "WACK REPORT root does not declare an overall PASS."
  }
  $partialRun = $root.GetAttribute("PARTIAL_RUN").Trim().ToUpperInvariant()
  if ($partialRun -notin @("FALSE", "0")) {
    throw "WACK REPORT root does not prove a complete non-partial run."
  }
  $latestVersion = $root.GetAttribute("LATEST_VERSION").Trim().ToUpperInvariant()
  if ($latestVersion -notin @("TRUE", "1")) {
    throw "WACK REPORT root does not prove the latest installed kit was used."
  }
  $kitVersion = $root.GetAttribute("VERSION").Trim()
  if ($kitVersion -notmatch '^\d+(?:\.\d+){2,3}$') {
    throw "WACK REPORT root contains no valid kit version."
  }

  $requirementsRoots = @($root.SelectNodes("./*[local-name()='REQUIREMENTS']"))
  $requirements = @($root.SelectNodes("./*[local-name()='REQUIREMENTS']/*[local-name()='REQUIREMENT']"))
  $tests = @($report.SelectNodes("//*[local-name()='TEST']"))
  if ($requirementsRoots.Count -ne 1 -or $requirements.Count -lt 1 -or $tests.Count -lt 1) {
    throw "WACK report is missing its complete requirements/test tree."
  }

  $ownedTests = [System.Collections.Generic.List[System.Xml.XmlNode]]::new()
  foreach ($requirement in $requirements) {
    $requirementTests = @($requirement.SelectNodes(".//*[local-name()='TEST']"))
    if ($requirementTests.Count -lt 1) {
      throw "Every WACK REQUIREMENT must contain at least one TEST."
    }
    foreach ($test in $requirementTests) { $ownedTests.Add($test) }
  }
  if ($ownedTests.Count -ne $tests.Count) {
    throw "Every WACK TEST must belong to exactly one REQUIREMENT."
  }

  $seenIndexes = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
  $seenNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
  $results = @()
  foreach ($test in $tests) {
    $index = $test.GetAttribute("INDEX").Trim()
    $name = $test.GetAttribute("NAME").Trim()
    if (
      $index -notmatch '^\d+$' -or
      [string]::IsNullOrWhiteSpace($name) -or
      -not $seenIndexes.Add($index) -or
      -not $seenNames.Add($name)
    ) {
      throw "WACK report contains a missing or duplicate test identity."
    }
    $directResults = @($test.SelectNodes("./*[local-name()='RESULT']"))
    if ($directResults.Count -ne 1) {
      throw "Each WACK TEST must contain exactly one direct RESULT: $index|$name"
    }
    $normalized = (($directResults[0].InnerText.Trim().ToUpperInvariant() -replace '[_\-/]+', ' ') -replace '\s+', ' ')
    if ($normalized -notin @("PASS", "PASSED", "N A", "NA", "NOT APPLICABLE")) {
      throw "WACK test $index|$name has a non-whitelisted result: $normalized"
    }
    $results += [ordered]@{ index = $index; name = $name; result = $normalized }
  }

  return [pscustomobject]@{
    OverallResult = $overall
    PartialRun = $false
    LatestVersion = $true
    KitVersion = $kitVersion
    TestCount = $results.Count
    Tests = @($results)
  }
}

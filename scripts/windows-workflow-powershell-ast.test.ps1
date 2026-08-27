$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$workflowRoot = Join-Path (Split-Path $PSScriptRoot -Parent) ".github/workflows"
$workflowFiles = @(Get-ChildItem -LiteralPath $workflowRoot -Filter "windows-*.yml" -File)
if ($workflowFiles.Count -ne 3) {
  throw "Expected exactly three Windows workflows for embedded PowerShell validation."
}

$allErrors = [Collections.Generic.List[object]]::new()
$parsedBlocks = 0
foreach ($workflowFile in $workflowFiles) {
  $lines = @(Get-Content -LiteralPath $workflowFile.FullName)
  for ($index = 0; $index -lt $lines.Count; $index++) {
    if ($lines[$index] -notmatch "^([ ]*)run:[ ]*\|") { continue }

    $runIndent = $Matches[1].Length
    $bodyIndent = $runIndent + 2
    $body = [Collections.Generic.List[string]]::new()
    $nextIndex = $index + 1
    while ($nextIndex -lt $lines.Count) {
      $line = $lines[$nextIndex]
      if ([string]::IsNullOrWhiteSpace($line)) {
        $body.Add("")
        $nextIndex++
        continue
      }
      $leadingSpaces = ([regex]::Match($line, "^[ ]*")).Value.Length
      if ($leadingSpaces -le $runIndent) { break }
      if ($line.Length -lt $bodyIndent) {
        $body.Add("")
      } else {
        $body.Add($line.Substring($bodyIndent))
      }
      $nextIndex++
    }

    # GitHub expressions are substituted before pwsh receives the script. Replace
    # them with a parser-safe token so this test checks the resulting PS grammar.
    $scriptText = ($body -join [Environment]::NewLine) -replace '\$\{\{.*?\}\}', "GH_EXPR"
    $tokens = $null
    $parseErrors = $null
    [Management.Automation.Language.Parser]::ParseInput(
      $scriptText,
      [ref]$tokens,
      [ref]$parseErrors
    ) | Out-Null
    foreach ($parseError in @($parseErrors)) {
      $allErrors.Add([pscustomobject]@{
        File = $workflowFile.Name
        WorkflowLine = $index + 1 + $parseError.Extent.StartLineNumber
        Message = $parseError.Message
        Text = $parseError.Extent.Text
      })
    }
    $parsedBlocks++
    $index = $nextIndex - 1
  }
}

if ($parsedBlocks -lt 1) { throw "No embedded Windows workflow PowerShell blocks were found." }
if ($allErrors.Count -gt 0) {
  throw ($allErrors | Format-Table -AutoSize | Out-String)
}

Write-Host "Embedded PowerShell AST parse passed for $parsedBlocks blocks in $($workflowFiles.Count) Windows workflows."

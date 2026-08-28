param(
  [Parameter(Mandatory = $true)] [string]$SubmissionAppxPath,
  [Parameter(Mandatory = $true)] [string]$QaAppxPath,
  [Parameter(Mandatory = $true)] [string]$ExpectedQaCertificateThumbprint
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.IO.Compression

function Get-RetailLensAppxInventory {
  param([Parameter(Mandatory = $true)] [string]$LiteralPath)

  $resolved = (Resolve-Path -LiteralPath $LiteralPath).Path
  $item = Get-Item -LiteralPath $resolved -Force
  if ($item.PSIsContainer -or ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
    throw "AppX inventory input must be one regular file."
  }

  $stream = [System.IO.File]::Open(
    $resolved,
    [System.IO.FileMode]::Open,
    [System.IO.FileAccess]::Read,
    [System.IO.FileShare]::Read
  )
  try {
    $archive = [System.IO.Compression.ZipArchive]::new(
      $stream,
      [System.IO.Compression.ZipArchiveMode]::Read,
      $false
    )
    try {
      $rows = [System.Collections.Generic.List[object]]::new()
      $seen = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::Ordinal)
      $signatureCount = 0
      $totalUncompressed = [long]0
      foreach ($entry in $archive.Entries) {
        $name = [string]$entry.FullName
        if (
          [string]::IsNullOrWhiteSpace($name) -or
          $name.Contains("\") -or
          $name.StartsWith("/", [System.StringComparison]::Ordinal) -or
          $name.EndsWith("/", [System.StringComparison]::Ordinal) -or
          $name -match '(^|/)\.\.(/|$)' -or
          -not $seen.Add($name)
        ) { throw "AppX contains an invalid, directory, traversal, or duplicate ZIP entry." }
        if ($name -ceq "AppxSignature.p7x") {
          $signatureCount += 1
          continue
        }
        if ($entry.Length -lt 0 -or $entry.Length -gt 2GB) {
          throw "AppX payload entry exceeds the strict per-file budget: $name"
        }
        $totalUncompressed += [long]$entry.Length
        if ($totalUncompressed -gt 8GB) { throw "AppX payload exceeds the strict total uncompressed budget." }

        $entryStream = $entry.Open()
        try {
          $hasher = [System.Security.Cryptography.SHA256]::Create()
          try {
            $hash = [Convert]::ToHexString($hasher.ComputeHash($entryStream)).ToLowerInvariant()
          } finally { $hasher.Dispose() }
        } finally { $entryStream.Dispose() }
        $rows.Add([pscustomobject]@{
          path = $name
          size = [long]$entry.Length
          sha256 = $hash
        })
      }
      foreach ($required in @("AppxManifest.xml", "AppxBlockMap.xml", "[Content_Types].xml")) {
        if (@($rows | Where-Object { $_.path -ceq $required }).Count -ne 1) {
          throw "AppX must contain exactly one $required payload entry."
        }
      }
      if ($rows.Count -lt 4) { throw "AppX payload inventory is unexpectedly small." }

      $keys = [string[]]@($rows | ForEach-Object path)
      [Array]::Sort($keys, [System.StringComparer]::Ordinal)
      $byPath = [System.Collections.Generic.Dictionary[string, object]]::new([System.StringComparer]::Ordinal)
      foreach ($row in $rows) { $byPath.Add([string]$row.path, $row) }
      $canonical = (($keys | ForEach-Object {
        $row = $byPath[$_]
        "$($row.sha256) $($row.size) $($row.path)"
      }) -join "`n") + "`n"
      $treeHash = [Convert]::ToHexString(
        [System.Security.Cryptography.SHA256]::HashData([System.Text.Encoding]::UTF8.GetBytes($canonical))
      ).ToLowerInvariant()
      return [pscustomobject]@{
        rows = @($rows)
        signatureCount = $signatureCount
        payloadFileCount = $rows.Count
        payloadTreeSha256 = $treeHash
      }
    } finally { $archive.Dispose() }
  } finally { $stream.Dispose() }
}

$submissionPath = (Resolve-Path -LiteralPath $SubmissionAppxPath).Path
$qaPath = (Resolve-Path -LiteralPath $QaAppxPath).Path
if ([string]::Equals($submissionPath, $qaPath, [System.StringComparison]::OrdinalIgnoreCase)) {
  throw "Unsigned submission and temporary QA AppX must be separate files."
}
$expectedThumbprint = $ExpectedQaCertificateThumbprint.Replace(" ", "").ToUpperInvariant()
if ($expectedThumbprint -notmatch '^[0-9A-F]{40}$') { throw "Expected QA certificate thumbprint is invalid." }

$submission = Get-RetailLensAppxInventory -LiteralPath $submissionPath
$qa = Get-RetailLensAppxInventory -LiteralPath $qaPath
if ($submission.signatureCount -ne 0) {
  throw "Partner Center submission AppX must contain no AppxSignature.p7x entry."
}
if ($qa.signatureCount -ne 1) {
  throw "Temporary QA AppX must contain exactly one AppxSignature.p7x entry."
}
if (
  $submission.payloadFileCount -ne $qa.payloadFileCount -or
  $submission.payloadTreeSha256 -cne $qa.payloadTreeSha256
) { throw "Unsigned submission and signed QA AppX payload trees differ." }

$qaByPath = [System.Collections.Generic.Dictionary[string, object]]::new([System.StringComparer]::Ordinal)
foreach ($row in $qa.rows) { $qaByPath.Add([string]$row.path, $row) }
foreach ($row in $submission.rows) {
  if (-not $qaByPath.ContainsKey([string]$row.path)) {
    throw "Temporary QA AppX is missing a submission payload entry: $($row.path)"
  }
  $qaRow = $qaByPath[[string]$row.path]
  if ([long]$qaRow.size -ne [long]$row.size -or [string]$qaRow.sha256 -cne [string]$row.sha256) {
    throw "Submission/QA payload bytes differ: $($row.path)"
  }
}

$submissionSignature = Get-AuthenticodeSignature -LiteralPath $submissionPath
if (
  $submissionSignature.Status -ne [System.Management.Automation.SignatureStatus]::NotSigned -or
  $submissionSignature.SignerCertificate
) { throw "Partner Center submission AppX is not provably unsigned." }
$qaSignature = Get-AuthenticodeSignature -LiteralPath $qaPath
if (
  $qaSignature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $qaSignature.SignerCertificate -or
  $qaSignature.SignerCertificate.Thumbprint.Replace(" ", "").ToUpperInvariant() -cne $expectedThumbprint
) { throw "Temporary QA AppX does not have the exact valid run-owned signature." }

return [pscustomobject]@{
  submissionPackageSha256 = (Get-FileHash -LiteralPath $submissionPath -Algorithm SHA256).Hash.ToLowerInvariant()
  submissionPackageSize = (Get-Item -LiteralPath $submissionPath).Length
  qaPackageSha256 = (Get-FileHash -LiteralPath $qaPath -Algorithm SHA256).Hash.ToLowerInvariant()
  qaPackageSize = (Get-Item -LiteralPath $qaPath).Length
  payloadFileCount = $submission.payloadFileCount
  payloadTreeSha256 = $submission.payloadTreeSha256
}

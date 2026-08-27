param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [string]$ProofDirectory,
  [Parameter(Mandatory = $true)] [string]$ExpectedNonce,
  [Parameter(Mandatory = $true)] [ValidateSet(2)] [int]$Round
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"

if (-not $IsWindows) { throw "Store screenshot collection requires Windows." }
if ($ExpectedNonce -notmatch '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$') {
  throw "Store screenshot nonce is not an exact lowercase UUIDv4."
}

function Assert-ExactKeys($Value, [string[]]$ExpectedKeys, [string]$Label) {
  $actual = @($Value.PSObject.Properties.Name | Sort-Object)
  $expected = @($ExpectedKeys | Sort-Object)
  if (($actual -join "|") -cne ($expected -join "|")) { throw "$Label schema is not exact." }
}

function Remove-ReparseFreeScreenshotTree([string]$Path, [string]$Label) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $items = @(Get-Item -LiteralPath $Path -Force; Get-ChildItem -LiteralPath $Path -Recurse -Force)
  if (@($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count -ne 0) {
    throw "$Label contains a reparse point and cannot be recursively deleted."
  }
  Remove-Item -LiteralPath $Path -Recurse -Force
}

function Get-PngDimensionsAndPolicy([string]$LiteralPath) {
  $bytes = [System.IO.File]::ReadAllBytes($LiteralPath)
  if ($bytes.Length -lt 57 -or $bytes.Length -gt 15000000) { throw "Store screenshot PNG size is outside the strict budget." }
  $signature = [byte[]](137, 80, 78, 71, 13, 10, 26, 10)
  foreach ($index in 0..7) {
    if ($bytes[$index] -ne $signature[$index]) { throw "Store screenshot is not a canonical PNG file." }
  }
  if ([Text.Encoding]::ASCII.GetString($bytes, 12, 4) -cne "IHDR") { throw "Store screenshot PNG does not begin with IHDR." }
  $width = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 16))
  $height = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 20))
  if ($width -ne 1366 -or $height -ne 768) { throw "Store screenshot is not exactly 1366 x 768 pixels." }

  $offset = 8
  $chunkCount = 0
  $sawIend = $false
  while ($offset -lt $bytes.Length) {
    if ($offset + 12 -gt $bytes.Length) { throw "Store screenshot PNG chunk header is truncated." }
    $chunkLength = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, $offset))
    if ($chunkLength -lt 0 -or $chunkLength -gt 15000000 -or $offset + 12 + $chunkLength -gt $bytes.Length) {
      throw "Store screenshot PNG chunk length is invalid."
    }
    $chunkType = [Text.Encoding]::ASCII.GetString($bytes, $offset + 4, 4)
    if ($chunkType -notmatch '^[A-Za-z]{4}$') { throw "Store screenshot PNG chunk type is invalid." }
    if ($chunkType -cin @("tEXt", "zTXt", "iTXt", "eXIf")) {
      throw "Store screenshot PNG contains text or EXIF metadata that could carry sensitive data."
    }
    $chunkCount += 1
    if ($chunkCount -gt 10000) { throw "Store screenshot PNG contains too many chunks." }
    $offset += 12 + $chunkLength
    if ($chunkType -ceq "IEND") {
      if ($chunkLength -ne 0 -or $offset -ne $bytes.Length) { throw "Store screenshot PNG has an invalid IEND or trailing bytes." }
      $sawIend = $true
      break
    }
  }
  if (-not $sawIend) { throw "Store screenshot PNG is missing IEND." }
  return [pscustomobject]@{ width = $width; height = $height; size = $bytes.Length }
}

$state = Get-Content -LiteralPath (Resolve-Path -LiteralPath $StatePath).Path -Raw | ConvertFrom-Json
if (
  $state.schemaVersion -ne 2 -or
  $state.identityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU" -or
  $state.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
  $state.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
  $state.candidateSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.payloadTreeSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.unsignedWorkspaceDestroyed -ne $true -or
  $state.privateHandoffRetained -ne $false
) { throw "Store screenshot state is not exact." }
$runRoot = (Resolve-Path -LiteralPath ([string]$state.runRoot)).Path
$proofRoot = (Resolve-Path -LiteralPath $ProofDirectory).Path
$source = Join-Path $proofRoot "store-listing-screenshots"
if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw "Packaged candidate did not produce Store screenshots." }
$source = (Resolve-Path -LiteralPath $source).Path
$sourceItem = Get-Item -LiteralPath $source -Force
if (
  ($sourceItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
  -not (Test-RetailLensPathWithin -CandidatePath $source -RootPath $proofRoot)
) { throw "Packaged Store screenshot source escaped the UI proof root." }

$manifestPath = Join-Path $source "store-screenshot-capture.v1.json"
$manifest = Get-Content -LiteralPath (Resolve-Path -LiteralPath $manifestPath).Path -Raw | ConvertFrom-Json
Assert-ExactKeys $manifest @(
  "candidateSha256", "captureSource", "dataset", "evidenceKind", "generatedAt", "height",
  "images", "nonce", "privacyGatePassed", "schemaVersion", "screenshotCount",
  "screenshotRound", "secretBearingInputCount", "sensitiveTextPatternCount", "version", "width"
) "Packaged screenshot manifest"
if (
  $manifest.schemaVersion -ne 1 -or
  $manifest.evidenceKind -cne "exact-packaged-store-candidate-screenshots" -or
  $manifest.candidateSha256 -cne [string]$state.candidateSha256 -or
  $manifest.version -cne [string]$state.productVersion -or
  $manifest.nonce -cne $ExpectedNonce -or
  [int]$manifest.screenshotRound -ne $Round -or
  $manifest.captureSource -cne "ELECTRON_WEB_CONTENTS_CAPTURE_PAGE" -or
  $manifest.dataset -cne "BUILT_IN_DEMO_ONLY" -or
  $manifest.privacyGatePassed -ne $true -or
  [int]$manifest.sensitiveTextPatternCount -ne 0 -or
  [int]$manifest.secretBearingInputCount -ne 0 -or
  [int]$manifest.width -ne 1366 -or [int]$manifest.height -ne 768 -or
  [int]$manifest.screenshotCount -ne 4 -or @($manifest.images).Count -ne 4
) { throw "Packaged screenshot manifest is not bound to the exact candidate/privacy policy." }
try { $generatedAt = [DateTimeOffset]$manifest.generatedAt } catch { throw "Store screenshot generation timestamp is invalid." }
if ($generatedAt -lt [DateTimeOffset]::UtcNow.AddMinutes(-10) -or $generatedAt -gt [DateTimeOffset]::UtcNow.AddMinutes(2)) {
  throw "Store screenshots are not fresh for this lifecycle run."
}

$expectedViews = [ordered]@{
  "01-assessment-demo.png" = "assessment-demo"
  "02-enterprise-inputs.png" = "enterprise-inputs"
  "03-executive-workpaper.png" = "executive-workpaper"
  "04-strategy-matrices.png" = "strategy-matrices"
}
$seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
foreach ($image in @($manifest.images)) {
  Assert-ExactKeys $image @("fileName", "height", "sha256", "size", "viewId", "width") "Store screenshot image record"
  $name = [string]$image.fileName
  if (
    -not $expectedViews.Contains($name) -or
    -not $seen.Add($name) -or
    [string]$image.viewId -cne [string]$expectedViews[$name] -or
    [int]$image.width -ne 1366 -or [int]$image.height -ne 768 -or
    [long]$image.size -lt 20000 -or [long]$image.size -gt 15000000 -or
    [string]$image.sha256 -notmatch '^[0-9a-f]{64}$'
  ) { throw "Store screenshot image record is not exact." }
  $pngPath = Join-Path $source $name
  $pngItem = Get-Item -LiteralPath $pngPath -Force
  if ($pngItem.PSIsContainer -or ($pngItem.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw "Store screenshot must be one regular PNG file."
  }
  $pngPolicy = Get-PngDimensionsAndPolicy -LiteralPath $pngPath
  if (
    [long]$pngPolicy.size -ne [long]$image.size -or
    (Get-FileHash -LiteralPath $pngPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$image.sha256
  ) { throw "Store screenshot bytes differ from the packaged-app capture manifest." }
}

$sourceItems = @(Get-ChildItem -LiteralPath $source -Force)
$expectedNames = @(@($expectedViews.Keys) + "store-screenshot-capture.v1.json" | Sort-Object)
if (
  $sourceItems.Count -ne 5 -or
  @($sourceItems | Where-Object { $_.PSIsContainer -or ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) }).Count -ne 0 -or
  (@($sourceItems.Name | Sort-Object) -join "|") -cne ($expectedNames -join "|")
) { throw "Store screenshot source contains an unexpected file or directory." }

$destination = Join-Path $runRoot "store-listing-screenshots"
$incomplete = "$destination.incomplete"
if ((Test-Path -LiteralPath $destination) -or (Test-Path -LiteralPath $incomplete)) {
  throw "Run-owned Store screenshot destination already exists."
}
$moved = $false
try {
  New-Item -ItemType Directory -Path $incomplete | Out-Null
  foreach ($item in $sourceItems) { Copy-Item -LiteralPath $item.FullName -Destination $incomplete }
  foreach ($image in @($manifest.images)) {
    $copied = Join-Path $incomplete ([string]$image.fileName)
    if ((Get-FileHash -LiteralPath $copied -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$image.sha256) {
      throw "Store screenshot copy changed before atomic retention."
    }
  }
  [IO.Directory]::Move($incomplete, $destination)
  $moved = $true
} catch {
  if ($moved -and (Test-Path -LiteralPath $destination)) { Remove-ReparseFreeScreenshotTree -Path $destination -Label "Failed screenshot destination" }
  if (Test-Path -LiteralPath $incomplete) { Remove-ReparseFreeScreenshotTree -Path $incomplete -Label "Failed screenshot staging" }
  throw
}

Write-Output ([pscustomobject]@{
  directory = $destination
  manifestSha256 = (Get-FileHash -LiteralPath (Join-Path $destination "store-screenshot-capture.v1.json") -Algorithm SHA256).Hash.ToLowerInvariant()
  screenshotCount = 4
})

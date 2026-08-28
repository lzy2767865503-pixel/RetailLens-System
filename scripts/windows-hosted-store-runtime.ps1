param(
  [Parameter(Mandatory = $true)] [string]$ExecutablePath,
  [Parameter(Mandatory = $true)] [string]$ExpectedExecutableSha256,
  [Parameter(Mandatory = $true)] [string]$CandidateAppxSha256,
  [Parameter(Mandatory = $true)] [string]$EvidenceDirectory,
  [Parameter(Mandatory = $true)] [ValidateRange(1, 2)] [int]$Round
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if (-not $IsWindows) { throw 'Packaged Store runtime verification must run on Windows.' }
foreach ($digest in @($ExpectedExecutableSha256, $CandidateAppxSha256)) {
  if ($digest -cnotmatch '^[a-f0-9]{64}$') { throw 'Runtime verification requires lowercase SHA-256 inputs.' }
}

. (Join-Path $PSScriptRoot 'windows-process.ps1')

$executable = (Resolve-Path -LiteralPath $ExecutablePath).Path
$executableItem = Get-Item -LiteralPath $executable -Force
if (
  $executableItem.PSIsContainer -or
  ($executableItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
  (Split-Path -Leaf $executable) -cne 'Retail Decision Studio by LAI ZEYU.exe'
) {
  throw 'Runtime candidate must be the exact regular packaged product executable.'
}
$executableHashBefore = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant()
if ($executableHashBefore -cne $ExpectedExecutableSha256) {
  throw 'Runtime executable does not match the frozen package executable SHA-256.'
}
& "$PSScriptRoot/windows-verify-pe-metadata.ps1" -ExecutablePath @($executable)

if (Test-Path -LiteralPath $EvidenceDirectory) {
  throw "Runtime evidence directory already exists: $EvidenceDirectory"
}
New-Item -ItemType Directory -Path $EvidenceDirectory | Out-Null
$evidenceRoot = (Resolve-Path -LiteralPath $EvidenceDirectory).Path
$proofDirectory = [IO.Path]::GetFullPath((Join-Path $env:TEMP 'retaillens-store-ui-proof'))
$userDataDirectory = [IO.Path]::GetFullPath((Join-Path $env:APPDATA 'retaillens-system'))
$sourceCommit = (& git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceCommit -cnotmatch '^[a-f0-9]{40}$') {
  throw 'Runtime source commit could not be resolved.'
}

function Get-RetailLensExactProductProcess {
  @(
    Get-CimInstance Win32_Process -ErrorAction Stop |
      Where-Object {
        $_.ExecutablePath -and
        [string]::Equals(
          [IO.Path]::GetFullPath($_.ExecutablePath),
          $executable,
          [StringComparison]::OrdinalIgnoreCase
        )
      }
  )
}

function Assert-RetailLensExactJsonKeys {
  param(
    [Parameter(Mandatory = $true)] [object]$Value,
    [Parameter(Mandatory = $true)] [string[]]$ExpectedKeys,
    [Parameter(Mandatory = $true)] [string]$Label
  )
  if ($Value -is [Array]) { throw "$Label is not one JSON object." }
  $actual = @($Value.PSObject.Properties.Name | Sort-Object)
  $expected = @($ExpectedKeys | Sort-Object)
  if (($actual -join '|') -cne ($expected -join '|')) {
    throw "$Label contains missing or unexpected fields."
  }
}

function Remove-RetailLensRuntimeTree {
  param(
    [Parameter(Mandatory = $true)] [string]$Path,
    [Parameter(Mandatory = $true)] [string]$Label
  )
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $items = @((Get-Item -LiteralPath $Path -Force)) +
    @(Get-ChildItem -LiteralPath $Path -Recurse -Force)
  if (@($items | Where-Object {
    ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
  }).Count -ne 0) {
    throw "$Label contains a reparse point and cannot be recursively deleted."
  }
  Remove-Item -LiteralPath $Path -Recurse -Force
  if (Test-Path -LiteralPath $Path) { throw "$Label remained after cleanup." }
}

function Get-RetailLensScreenshotPolicy {
  param([Parameter(Mandatory = $true)] [string]$LiteralPath)
  $bytes = [IO.File]::ReadAllBytes($LiteralPath)
  if ($bytes.Length -lt 57 -or $bytes.Length -gt 15000000) {
    throw 'Store screenshot PNG size is outside the strict budget.'
  }
  $signature = [byte[]](137, 80, 78, 71, 13, 10, 26, 10)
  foreach ($index in 0..7) {
    if ($bytes[$index] -ne $signature[$index]) { throw 'Store screenshot is not a canonical PNG file.' }
  }
  if ([Text.Encoding]::ASCII.GetString($bytes, 12, 4) -cne 'IHDR') {
    throw 'Store screenshot PNG does not begin with IHDR.'
  }
  $width = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 16))
  $height = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 20))
  if ($width -ne 1366 -or $height -ne 768) {
    throw 'Store screenshot is not exactly 1366 x 768 pixels.'
  }

  $offset = 8
  $chunkCount = 0
  $sawIend = $false
  while ($offset -lt $bytes.Length) {
    if ($offset + 12 -gt $bytes.Length) { throw 'Store screenshot PNG chunk header is truncated.' }
    $chunkLength = [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, $offset))
    if ($chunkLength -lt 0 -or $chunkLength -gt 15000000 -or $offset + 12 + $chunkLength -gt $bytes.Length) {
      throw 'Store screenshot PNG chunk length is invalid.'
    }
    $chunkType = [Text.Encoding]::ASCII.GetString($bytes, $offset + 4, 4)
    if ($chunkType -notmatch '^[A-Za-z]{4}$') { throw 'Store screenshot PNG chunk type is invalid.' }
    if ($chunkType -cin @('tEXt', 'zTXt', 'iTXt', 'eXIf')) {
      throw 'Store screenshot PNG contains text or EXIF metadata that could carry sensitive data.'
    }
    $chunkCount += 1
    if ($chunkCount -gt 10000) { throw 'Store screenshot PNG contains too many chunks.' }
    $offset += 12 + $chunkLength
    if ($chunkType -ceq 'IEND') {
      if ($chunkLength -ne 0 -or $offset -ne $bytes.Length) {
        throw 'Store screenshot PNG has an invalid IEND or trailing bytes.'
      }
      $sawIend = $true
      break
    }
  }
  if (-not $sawIend) { throw 'Store screenshot PNG is missing IEND.' }
  return [pscustomobject]@{ width = $width; height = $height; size = $bytes.Length }
}

$preflightPassed = $false
$launchedProcess = $null
$primaryError = $null
$cleanupErrors = [Collections.Generic.List[string]]::new()
try {
  foreach ($path in @($proofDirectory, $userDataDirectory)) {
    if (Test-Path -LiteralPath $path) {
      throw "Runtime round $Round preflight found pre-existing product state: $path"
    }
  }
  if (@(Get-RetailLensExactProductProcess).Count -ne 0) {
    throw "Runtime round $Round preflight found an existing exact product process."
  }
  if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Runtime round $Round preflight found an existing RetailLens loopback listener."
  }
  $preflightPassed = $true

  New-Item -ItemType Directory -Path $proofDirectory | Out-Null
  $nonce = [Guid]::NewGuid().ToString('D').ToLowerInvariant()
  $probeCreatedAt = [DateTimeOffset]::UtcNow
  [ordered]@{
    schemaVersion = 2
    candidateSha256 = $CandidateAppxSha256
    captureStoreScreenshots = ($Round -eq 2)
    nonce = $nonce
    screenshotRound = if ($Round -eq 2) { 2 } else { 0 }
    version = '1.1.0'
  } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $proofDirectory 'probe.json') -Encoding utf8

  $launchedProcess = Start-Process -FilePath $executable -PassThru
  $readyPath = Join-Path $proofDirectory 'ui_ready.json'
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds(120)
  $ready = $null
  $health = $null
  $listener = $null
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    $launchedProcess.Refresh()
    if ($launchedProcess.HasExited) {
      throw "Runtime round $Round product exited before the DOM/listener contract completed."
    }
    if (Test-Path -LiteralPath $readyPath -PathType Leaf) {
      try { $ready = Get-Content -LiteralPath $readyPath -Raw | ConvertFrom-Json -ErrorAction Stop } catch { $ready = $null }
    }
    try {
      $response = Invoke-WebRequest http://127.0.0.1:47824/api/health -UseBasicParsing -TimeoutSec 2
      if ($response.StatusCode -eq 200) {
        $health = $response.Content | ConvertFrom-Json -ErrorAction Stop
      }
    } catch { $health = $null }
    $listeners = @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -eq 1) { $listener = $listeners[0] } else { $listener = $null }
    if ($ready -and $health -and $listener) { break }
    Start-Sleep -Milliseconds 400
  }
  if (-not $ready -or -not $health -or -not $listener) {
    throw "Runtime round $Round readiness timed out after 120 seconds."
  }

  $listenerPid = [long]$listener.OwningProcess
  $listenerProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $listenerPid" -ErrorAction Stop
  if (
    -not $listenerProcess -or
    -not $listenerProcess.ExecutablePath -or
    -not [string]::Equals(
      [IO.Path]::GetFullPath($listenerProcess.ExecutablePath),
      $executable,
      [StringComparison]::OrdinalIgnoreCase
    )
  ) {
    throw "Runtime round $Round loopback listener is not the exact packaged executable."
  }

  Assert-RetailLensExactJsonKeys -Value $ready -ExpectedKeys @(
    'author', 'candidateSha256', 'captureStoreScreenshots', 'dom', 'nonce', 'processId',
    'product', 'readyAt', 'schemaVersion', 'screenshotRound', 'version'
  ) -Label "Runtime round $Round readiness evidence"
  Assert-RetailLensExactJsonKeys -Value $ready.dom -ExpectedKeys @(
    'authorVisible', 'privacyEntryVisible', 'productNameVisible', 'rootContentLength', 'titleMatches'
  ) -Label "Runtime round $Round DOM evidence"
  if (
    $health.status -cne 'ok' -or
    $health.service -cne 'RetailLens API' -or
    [long]$health.processId -ne $listenerPid -or
    'zh' -notin @($health.languages) -or
    'en' -notin @($health.languages) -or
    [int]$ready.schemaVersion -ne 2 -or
    $ready.product -cne 'Retail Decision Studio by LAI ZEYU' -or
    $ready.author -cne 'LAI ZEYU（来泽宇）' -or
    $ready.version -cne '1.1.0' -or
    $ready.candidateSha256 -cne $CandidateAppxSha256 -or
    $ready.captureStoreScreenshots -ne ($Round -eq 2) -or
    $ready.nonce -cne $nonce -or
    [int]$ready.screenshotRound -ne $(if ($Round -eq 2) { 2 } else { 0 }) -or
    [long]$ready.processId -ne $listenerPid -or
    $ready.dom.titleMatches -ne $true -or
    $ready.dom.productNameVisible -ne $true -or
    $ready.dom.authorVisible -ne $true -or
    $ready.dom.privacyEntryVisible -ne $true -or
    [int]$ready.dom.rootContentLength -lt 100
  ) {
    throw "Runtime round $Round failed the exact candidate/PID/DOM/author/health contract."
  }
  try { $readyAt = [DateTimeOffset]$ready.readyAt } catch { throw 'Runtime readiness timestamp is invalid.' }
  if ($readyAt -lt $probeCreatedAt.AddSeconds(-1) -or $readyAt -gt [DateTimeOffset]::UtcNow.AddSeconds(5)) {
    throw "Runtime round $Round readiness evidence is stale."
  }

  $screenshotCount = 0
  $screenshotManifestSha256 = $null
  $screenshotSource = Join-Path $proofDirectory 'store-listing-screenshots'
  if ($Round -eq 2) {
    if (-not (Test-Path -LiteralPath $screenshotSource -PathType Container)) {
      throw 'Runtime round 2 did not produce Store screenshots.'
    }
    $screenshotSourceItem = Get-Item -LiteralPath $screenshotSource -Force
    if (($screenshotSourceItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw 'Runtime screenshot source is a reparse point.'
    }
    $manifestPath = Join-Path $screenshotSource 'store-screenshot-capture.v1.json'
    $screenshotManifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
    Assert-RetailLensExactJsonKeys -Value $screenshotManifest -ExpectedKeys @(
      'candidateSha256', 'captureSource', 'dataset', 'evidenceKind', 'generatedAt', 'height',
      'images', 'nonce', 'privacyGatePassed', 'schemaVersion', 'screenshotCount',
      'screenshotRound', 'secretBearingInputCount', 'sensitiveTextPatternCount', 'version', 'width'
    ) -Label 'Runtime screenshot manifest'
    if (
      $screenshotManifest.schemaVersion -ne 1 -or
      $screenshotManifest.evidenceKind -cne 'exact-packaged-store-candidate-screenshots' -or
      $screenshotManifest.candidateSha256 -cne $CandidateAppxSha256 -or
      $screenshotManifest.version -cne '1.1.0' -or
      $screenshotManifest.nonce -cne $nonce -or
      [int]$screenshotManifest.screenshotRound -ne 2 -or
      $screenshotManifest.captureSource -cne 'ELECTRON_WEB_CONTENTS_CAPTURE_PAGE' -or
      $screenshotManifest.dataset -cne 'BUILT_IN_DEMO_ONLY' -or
      $screenshotManifest.privacyGatePassed -ne $true -or
      [int]$screenshotManifest.sensitiveTextPatternCount -ne 0 -or
      [int]$screenshotManifest.secretBearingInputCount -ne 0 -or
      [int]$screenshotManifest.width -ne 1366 -or
      [int]$screenshotManifest.height -ne 768 -or
      [int]$screenshotManifest.screenshotCount -ne 4 -or
      @($screenshotManifest.images).Count -ne 4
    ) {
      throw 'Runtime screenshot manifest is not bound to the exact AppX candidate and privacy policy.'
    }
    try { $screenshotsGeneratedAt = [DateTimeOffset]$screenshotManifest.generatedAt } catch {
      throw 'Runtime screenshot generation timestamp is invalid.'
    }
    if (
      $screenshotsGeneratedAt -lt $probeCreatedAt.AddSeconds(-1) -or
      $screenshotsGeneratedAt -gt [DateTimeOffset]::UtcNow.AddSeconds(5)
    ) {
      throw 'Runtime screenshots are stale or not bound to this exact runtime pass.'
    }

    $expectedViews = [ordered]@{
      '01-assessment-demo.png' = 'assessment-demo'
      '02-enterprise-inputs.png' = 'enterprise-inputs'
      '03-executive-workpaper.png' = 'executive-workpaper'
      '04-strategy-matrices.png' = 'strategy-matrices'
    }
    $seen = [Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    foreach ($image in @($screenshotManifest.images)) {
      Assert-RetailLensExactJsonKeys -Value $image -ExpectedKeys @(
        'fileName', 'height', 'sha256', 'size', 'viewId', 'width'
      ) -Label 'Runtime screenshot image record'
      $name = [string]$image.fileName
      if (
        -not $expectedViews.Contains($name) -or
        -not $seen.Add($name) -or
        [string]$image.viewId -cne [string]$expectedViews[$name] -or
        [int]$image.width -ne 1366 -or
        [int]$image.height -ne 768 -or
        [long]$image.size -lt 20000 -or
        [long]$image.size -gt 15000000 -or
        [string]$image.sha256 -cnotmatch '^[a-f0-9]{64}$'
      ) {
        throw 'Runtime screenshot image record is not exact.'
      }
      $pngPath = Join-Path $screenshotSource $name
      $pngPolicy = Get-RetailLensScreenshotPolicy -LiteralPath $pngPath
      if (
        [long]$pngPolicy.size -ne [long]$image.size -or
        (Get-FileHash -LiteralPath $pngPath -Algorithm SHA256).Hash.ToLowerInvariant() -cne [string]$image.sha256
      ) {
        throw 'Runtime screenshot bytes differ from the packaged-app capture manifest.'
      }
    }
    $sourceItems = @(Get-ChildItem -LiteralPath $screenshotSource -Force)
    $expectedNames = @(@($expectedViews.Keys) + 'store-screenshot-capture.v1.json' | Sort-Object)
    if (
      $sourceItems.Count -ne 5 -or
      @($sourceItems | Where-Object {
        $_.PSIsContainer -or ($_.Attributes -band [IO.FileAttributes]::ReparsePoint)
      }).Count -ne 0 -or
      (@($sourceItems.Name | Sort-Object) -join '|') -cne ($expectedNames -join '|')
    ) {
      throw 'Runtime screenshot source contains an unexpected file or directory.'
    }
    $screenshotDestination = Join-Path $evidenceRoot 'screenshots'
    New-Item -ItemType Directory -Path $screenshotDestination | Out-Null
    foreach ($sourceItem in $sourceItems) {
      Copy-Item -LiteralPath $sourceItem.FullName -Destination $screenshotDestination
    }
    $screenshotCount = 4
    $screenshotManifestSha256 = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
  } elseif (Test-Path -LiteralPath $screenshotSource) {
    throw 'Runtime round 1 unexpectedly produced Store screenshots.'
  }

  $executableHashAfter = (Get-FileHash -LiteralPath $executable -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($executableHashAfter -cne $ExpectedExecutableSha256) {
    throw "Runtime round $Round changed the exact executable bytes."
  }
  $readyHash = (Get-FileHash -LiteralPath $readyPath -Algorithm SHA256).Hash.ToLowerInvariant()
  [ordered]@{
    schemaVersion = 1
    round = $Round
    product = 'Retail Decision Studio by LAI ZEYU'
    author = 'LAI ZEYU（来泽宇）'
    sourceCommit = $sourceCommit
    appxSha256 = $CandidateAppxSha256
    executable = 'Retail Decision Studio by LAI ZEYU.exe'
    executableSha256 = $ExpectedExecutableSha256
    readyEvidenceSha256 = $readyHash
    screenshotCount = $screenshotCount
    screenshotManifestSha256 = $screenshotManifestSha256
    completedAtUtc = [DateTime]::UtcNow.ToString('o')
  } | ConvertTo-Json -Depth 4 | Set-Content `
    -LiteralPath (Join-Path $evidenceRoot 'runtime-inspection.json') -Encoding utf8
  Write-Host "Packaged runtime round $Round passed on AppX $CandidateAppxSha256 and executable $ExpectedExecutableSha256."
} catch {
  $primaryError = $_
} finally {
  function Invoke-RetailLensRuntimeCleanup {
    param([string]$Name, [scriptblock]$Action)
    try { & $Action } catch { $cleanupErrors.Add("${Name}: $($_.Exception.Message)") }
  }
  Invoke-RetailLensRuntimeCleanup -Name 'product process tree' -Action {
    if ($launchedProcess) {
      $launchedProcess.Refresh()
      if (-not $launchedProcess.HasExited) {
        Invoke-RetailLensBoundedProcess `
          -FilePath 'taskkill.exe' `
          -ArgumentList @('/PID', [string]$launchedProcess.Id, '/T', '/F') `
          -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
          -Context "Runtime round $Round process-tree shutdown" | Out-Null
      }
      $launchedProcess.Dispose()
    }
    if ($preflightPassed) {
      foreach ($process in @(Get-RetailLensExactProductProcess)) {
        Invoke-RetailLensBoundedProcess `
          -FilePath 'taskkill.exe' `
          -ArgumentList @('/PID', [string]$process.ProcessId, '/T', '/F') `
          -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
          -Context "Runtime round $Round residual process shutdown" | Out-Null
      }
    }
  }
  Invoke-RetailLensRuntimeCleanup -Name 'proof directory' -Action {
    if ($preflightPassed) {
      Remove-RetailLensRuntimeTree -Path $proofDirectory -Label "Runtime round $Round proof directory"
    }
  }
  Invoke-RetailLensRuntimeCleanup -Name 'user data directory' -Action {
    if ($preflightPassed) {
      Remove-RetailLensRuntimeTree -Path $userDataDirectory -Label "Runtime round $Round user data directory"
    }
  }
  Invoke-RetailLensRuntimeCleanup -Name 'final state recheck' -Action {
    if (
      $preflightPassed -and (
        (Test-Path -LiteralPath $proofDirectory) -or
        (Test-Path -LiteralPath $userDataDirectory) -or
        @(Get-RetailLensExactProductProcess).Count -ne 0 -or
        @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0
      )
    ) {
      throw "Runtime round $Round cleanup left product state."
    }
  }
}

if ($primaryError) {
  if ($cleanupErrors.Count -ne 0) {
    throw "Runtime round $Round failed: $($primaryError.Exception.Message); cleanup also failed: $($cleanupErrors -join ' | ')"
  }
  throw $primaryError
}
if ($cleanupErrors.Count -ne 0) {
  throw "Runtime round $Round cleanup failed: $($cleanupErrors -join ' | ')"
}

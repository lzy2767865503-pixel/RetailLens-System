param(
  [Parameter(Mandatory = $true)]
  [string]$ArtifactDirectory,

  [switch]$RequireAuthenticode,

  [string]$ExpectedSignerSubject = $env:RETAILLENS_WINDOWS_SIGNER_SUBJECT,

  [string]$ExpectedSignerThumbprint = $env:RETAILLENS_WINDOWS_SIGNER_THUMBPRINT
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"

function Get-RetailLensProductProcess([string]$ExactExecutablePath) {
  @(
    Get-CimInstance Win32_Process -ErrorAction Stop |
      Where-Object {
        $_.ExecutablePath -and
        [string]::Equals(
          [System.IO.Path]::GetFullPath($_.ExecutablePath),
          [System.IO.Path]::GetFullPath($ExactExecutablePath),
          [System.StringComparison]::OrdinalIgnoreCase
        )
      }
  )
}

function Expand-RetailLensPortableArchive(
  [string]$ArchivePath,
  [string]$Destination,
  [string]$ExpectedTopLevel
) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
  try {
    $seen = @{}
    foreach ($entry in $archive.Entries) {
      $normalizedName = $entry.FullName.Replace("\", "/")
      $entryPath = $normalizedName.Replace("/", [string][System.IO.Path]::DirectorySeparatorChar)
      if (
        [string]::IsNullOrWhiteSpace($entryPath) -or
        [System.IO.Path]::IsPathRooted($entryPath)
      ) { throw "Portable ZIP contains an invalid rooted/empty entry." }
      $target = [System.IO.Path]::GetFullPath((Join-Path $Destination $entryPath))
      if (-not (Test-RetailLensPathWithin -CandidatePath $target -RootPath $Destination)) {
        throw "Portable ZIP contains a path-traversal entry: $($entry.FullName)"
      }
      $duplicateKey = $normalizedName.TrimEnd("/").ToLowerInvariant()
      if ($seen.ContainsKey($duplicateKey)) {
        throw "Portable ZIP contains a duplicate case-insensitive entry."
      }
      $seen[$duplicateKey] = $true
      if ((($entry.ExternalAttributes -shr 16) -band 0xF000) -eq 0xA000) {
        throw "Portable ZIP contains a symbolic-link entry."
      }
      if ($normalizedName.Split("/")[0] -cne $ExpectedTopLevel) {
        throw "Portable ZIP escaped its exact top-level product directory."
      }
    }
  } finally {
    $archive.Dispose()
  }
  [System.IO.Compression.ZipFile]::ExtractToDirectory($ArchivePath, $Destination)
}

function Assert-TreeByteEquality([string]$SourceRoot, [string]$InstalledRoot) {
  $sourceFiles = @(Get-ChildItem -LiteralPath $SourceRoot -Recurse -File -Force)
  $installedFiles = @(Get-ChildItem -LiteralPath $InstalledRoot -Recurse -File -Force)
  if ($sourceFiles.Count -ne $installedFiles.Count) {
    throw "Portable install changed the file count."
  }
  foreach ($source in $sourceFiles) {
    $relative = [System.IO.Path]::GetRelativePath($SourceRoot, $source.FullName)
    $installed = Join-Path $InstalledRoot $relative
    if (-not (Test-Path -LiteralPath $installed -PathType Leaf)) {
      throw "Portable install omitted $relative."
    }
    if (
      $source.Length -ne (Get-Item -LiteralPath $installed).Length -or
      (Get-FileHash -LiteralPath $source.FullName -Algorithm SHA256).Hash -cne
        (Get-FileHash -LiteralPath $installed -Algorithm SHA256).Hash
    ) {
      throw "Portable install changed signed bytes: $relative"
    }
  }
}

function Assert-ExactJsonObjectKeys {
  param(
    [Parameter(Mandatory = $true)] [object]$Value,
    [Parameter(Mandatory = $true)] [string[]]$ExpectedKeys,
    [Parameter(Mandatory = $true)] [string]$Context
  )
  if ($Value -is [System.Array]) { throw "$Context is not one JSON object." }
  $actualKeys = @($Value.PSObject.Properties | ForEach-Object { [string]$_.Name })
  if ($actualKeys.Count -ne $ExpectedKeys.Count) {
    throw "$Context contains missing or unexpected fields."
  }
  foreach ($expectedKey in $ExpectedKeys) {
    if (@($actualKeys | Where-Object { $_ -ceq $expectedKey }).Count -ne 1) {
      throw "$Context contains missing or unexpected fields."
    }
  }
}

function Remove-RetailLensReparseFreeTree([string]$Path, [string]$Context) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $items = @(Get-Item -LiteralPath $Path -Force; Get-ChildItem -LiteralPath $Path -Recurse -Force)
  if (@($items | Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0) {
    throw "$Context contains a reparse point and cannot be recursively deleted."
  }
  Remove-Item -LiteralPath $Path -Recurse -Force
  if (Test-Path -LiteralPath $Path) { throw "$Context remained after recursive cleanup." }
}

$resolvedArtifacts = (Resolve-Path -LiteralPath $ArtifactDirectory).Path
$version = [string](Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) "package.json") -Raw | ConvertFrom-Json).version
$releaseName = "RetailDecisionStudioByLAIZEYU-$version-x64-portable-directory"
$archiveName = "$releaseName.zip"
$archives = @(Get-ChildItem -LiteralPath $resolvedArtifacts -Recurse -File -Filter $archiveName)
$hashManifests = @(Get-ChildItem -LiteralPath $resolvedArtifacts -Recurse -File -Filter "SHA256SUMS.txt")
if ($archives.Count -ne 1) { throw "Expected exactly one portable-directory ZIP, found $($archives.Count)." }
if ($hashManifests.Count -ne 1) { throw "Expected exactly one SHA256SUMS.txt, found $($hashManifests.Count)." }
$archive = $archives[0]
if ((Get-RetailLensFileMagicKind -LiteralPath $archive.FullName) -ne "ZIP") {
  throw "The frozen Windows candidate is not a ZIP archive."
}
$hashLines = @(Get-Content -LiteralPath $hashManifests[0].FullName)
if (
  $hashLines.Count -ne 1 -or
  $hashLines[0] -notmatch '^([0-9a-f]{64})  (RetailDecisionStudioByLAIZEYU-.+-x64-portable-directory\.zip)$' -or
  $Matches[2] -cne $archiveName
) { throw "SHA256SUMS.txt does not bind one exact portable-directory ZIP." }
$candidateHash = (Get-FileHash -LiteralPath $archive.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
if ($candidateHash -cne $Matches[1]) { throw "Portable-directory ZIP SHA-256 mismatch." }

if ($RequireAuthenticode) {
  if ([string]::IsNullOrWhiteSpace($ExpectedSignerSubject)) {
    throw "ExpectedSignerSubject is required for trusted release lifecycle testing."
  }
  if ([string]::IsNullOrWhiteSpace($ExpectedSignerThumbprint)) {
    throw "ExpectedSignerThumbprint is required for trusted release lifecycle testing."
  }
  & "$PSScriptRoot/windows-verify-authenticode.ps1" `
    -ArtifactDirectory $resolvedArtifacts `
    -ExpectedSignerSubject $ExpectedSignerSubject `
    -ExpectedSignerThumbprint $ExpectedSignerThumbprint `
    -InspectEmbeddedPayload
}

$installDirectory = [System.IO.Path]::GetFullPath(
  (Join-Path $env:LOCALAPPDATA "Programs\Retail Decision Studio by LAI ZEYU")
)
$installedExecutable = Join-Path $installDirectory "Retail Decision Studio by LAI ZEYU.exe"
$userDataDirectory = [System.IO.Path]::GetFullPath((Join-Path $env:APPDATA "retaillens-system"))
$proofDirectory = [System.IO.Path]::GetFullPath((Join-Path $env:TEMP "retaillens-store-ui-proof"))
$temporaryBase = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
  [System.IO.Path]::GetTempPath()
} else { $env:RUNNER_TEMP }
$extractionRoot = Join-Path $temporaryBase ("retaillens-round2-" + [Guid]::NewGuid().ToString("N"))
$preflightPassed = $false
$installStarted = $false
$proofOwned = $false
$launchedProcess = $null
$primaryError = $null
$cleanupErrors = [System.Collections.Generic.List[string]]::new()

try {
  foreach ($path in @($installDirectory, $userDataDirectory, $proofDirectory)) {
    if (Test-Path -LiteralPath $path) {
      throw "Round 2 preflight found pre-existing product state and refuses to overwrite/delete it: $path"
    }
  }
  if (@(Get-RetailLensProductProcess -ExactExecutablePath $installedExecutable).Count -ne 0) {
    throw "Round 2 preflight found an existing exact product process."
  }
  if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Round 2 preflight found an existing loopback listener on port 47824."
  }
  $preflightPassed = $true

  New-Item -ItemType Directory -Path $extractionRoot | Out-Null
  Expand-RetailLensPortableArchive `
    -ArchivePath $archive.FullName `
    -Destination $extractionRoot `
    -ExpectedTopLevel $releaseName
  $sourceRoot = Join-Path $extractionRoot $releaseName
  if (-not (Test-Path -LiteralPath (Join-Path $sourceRoot "Retail Decision Studio by LAI ZEYU.exe") -PathType Leaf)) {
    throw "Portable ZIP lacks the exact product executable."
  }

  $installStarted = $true
  Invoke-RetailLensBoundedProcess `
    -FilePath "robocopy.exe" `
    -ArgumentList @(
      ('"' + $sourceRoot + '"'), ('"' + $installDirectory + '"'),
      "/E", "/COPY:DAT", "/DCOPY:DAT", "/R:1", "/W:1",
      "/NFL", "/NDL", "/NJH", "/NJS", "/NP"
    ) `
    -TimeoutSeconds 180 `
    -AllowedExitCode @(0, 1, 2, 3, 4, 5, 6, 7) `
    -Context "Portable-directory installation" | Out-Null
  Assert-TreeByteEquality -SourceRoot $sourceRoot -InstalledRoot $installDirectory
  & "$PSScriptRoot/windows-verify-pe-metadata.ps1" -ExecutablePath @($installedExecutable)
  if ($RequireAuthenticode) {
    & "$PSScriptRoot/windows-verify-authenticode.ps1" `
      -ArtifactDirectory $resolvedArtifacts `
      -ExpectedSignerSubject $ExpectedSignerSubject `
      -ExpectedSignerThumbprint $ExpectedSignerThumbprint `
      -AdditionalRoot @($installDirectory) `
      -InspectEmbeddedPayload
  }

  New-Item -ItemType Directory -Path $proofDirectory | Out-Null
  $proofOwned = $true
  $nonce = [Guid]::NewGuid().ToString("D").ToLowerInvariant()
  $probeCreatedAt = [DateTimeOffset]::UtcNow
  $portableReadinessSchemaVersion = 2
  $portableCaptureStoreScreenshots = $false
  $portableScreenshotRound = 0
  $portableProbe = [ordered]@{
    schemaVersion = $portableReadinessSchemaVersion
    candidateSha256 = $candidateHash
    captureStoreScreenshots = $portableCaptureStoreScreenshots
    nonce = $nonce
    screenshotRound = $portableScreenshotRound
    version = $version
  }
  $portableProbe | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $proofDirectory "probe.json") -Encoding utf8

  $launchedProcess = Start-Process -FilePath $installedExecutable -PassThru
  $readyPath = Join-Path $proofDirectory "ui_ready.json"
  $deadline = [DateTimeOffset]::UtcNow.AddSeconds(60)
  $ready = $null
  $health = $null
  $listener = $null
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    if ($launchedProcess.HasExited) {
      throw "Installed portable app exited before the DOM/listener readiness contract completed."
    }
    if (Test-Path -LiteralPath $readyPath -PathType Leaf) {
      try { $ready = Get-Content -LiteralPath $readyPath -Raw | ConvertFrom-Json -ErrorAction Stop } catch { $ready = $null }
    }
    try {
      $healthResponse = Invoke-WebRequest http://127.0.0.1:47824/api/health -UseBasicParsing -TimeoutSec 2
      if ($healthResponse.StatusCode -eq 200) {
        $health = $healthResponse.Content | ConvertFrom-Json -ErrorAction Stop
      }
    } catch { $health = $null }
    $listeners = @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -eq 1) { $listener = $listeners[0] } else { $listener = $null }
    if ($ready -and $health -and $listener) { break }
    Start-Sleep -Milliseconds 400
  }
  if (-not $ready -or -not $health -or -not $listener) {
    $readyObserved = $null -ne $ready
    $healthObserved = $null -ne $health
    $listenerObserved = $null -ne $listener
    throw "Installed portable app readiness timed out after 60 seconds (ready=$readyObserved; health=$healthObserved; listener=$listenerObserved)."
  }
  $portableReadyExpectedKeys = @(
    "author", "candidateSha256", "captureStoreScreenshots", "dom", "nonce",
    "processId", "product", "readyAt", "schemaVersion", "screenshotRound", "version"
  )
  $portableDomExpectedKeys = @(
    "authorVisible", "privacyEntryVisible", "productNameVisible", "rootContentLength", "titleMatches"
  )
  Assert-ExactJsonObjectKeys -Value $ready -ExpectedKeys $portableReadyExpectedKeys -Context "Installed portable app readiness evidence"
  Assert-ExactJsonObjectKeys -Value $ready.dom -ExpectedKeys $portableDomExpectedKeys -Context "Installed portable app DOM evidence"
  $listenerPid = [long]$listener.OwningProcess
  $listenerProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $listenerPid" -ErrorAction Stop
  if (
    -not $listenerProcess -or
    -not $listenerProcess.ExecutablePath -or
    -not [string]::Equals(
      [System.IO.Path]::GetFullPath($listenerProcess.ExecutablePath),
      [System.IO.Path]::GetFullPath($installedExecutable),
      [System.StringComparison]::OrdinalIgnoreCase
    )
  ) { throw "Listener PID is not bound to the one exact installed product executable." }
  if (
    $health.status -cne "ok" -or
    $health.service -cne "RetailLens API" -or
    [long]$health.processId -ne $listenerPid -or
    -not ($ready.schemaVersion -is [int] -or $ready.schemaVersion -is [long]) -or
    [long]$ready.schemaVersion -ne $portableReadinessSchemaVersion -or
    $ready.product -cne "Retail Decision Studio by LAI ZEYU" -or
    $ready.author -cne "LAI ZEYU（来泽宇）" -or
    $ready.version -cne $version -or
    $ready.candidateSha256 -cne $candidateHash -or
    -not ($ready.captureStoreScreenshots -is [bool]) -or
    $ready.captureStoreScreenshots -ne $portableCaptureStoreScreenshots -or
    $ready.nonce -cne $nonce -or
    -not ($ready.screenshotRound -is [int] -or $ready.screenshotRound -is [long]) -or
    [long]$ready.screenshotRound -ne $portableScreenshotRound -or
    [long]$ready.processId -ne $listenerPid -or
    $ready.dom.titleMatches -ne $true -or
    $ready.dom.productNameVisible -ne $true -or
    $ready.dom.authorVisible -ne $true -or
    $ready.dom.privacyEntryVisible -ne $true -or
    [int]$ready.dom.rootContentLength -lt 100
  ) { throw "Installed portable app failed the candidate/PID/DOM/author/health readiness contract." }
  try {
    $readyAt = [DateTimeOffset]$ready.readyAt
  } catch {
    throw "Installed portable app readiness evidence is stale or malformed."
  }
  if (
    $readyAt -lt $probeCreatedAt.AddSeconds(-1) -or
    $readyAt -gt [DateTimeOffset]::UtcNow.AddSeconds(5)
  ) { throw "Installed portable app readiness evidence is stale or malformed." }

  Invoke-RetailLensBoundedProcess `
    -FilePath "taskkill.exe" `
    -ArgumentList @("/PID", [string]$listenerPid, "/T", "/F") `
    -TimeoutSeconds 30 `
    -AllowedExitCode @(0, 128) `
    -Context "Portable readiness process shutdown" | Out-Null
  $launchedProcess.Dispose()
  $launchedProcess = $null
  Remove-RetailLensReparseFreeTree -Path $proofDirectory -Context "Portable readiness proof directory"
  $proofOwned = $false
  if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Portable readiness listener remained after bounded process-tree shutdown."
  }

  Invoke-RetailLensBoundedProcess `
    -FilePath $installedExecutable `
    -ArgumentList @("--smoke-test") `
    -TimeoutSeconds 120 `
    -Context "Installed portable DOM and health smoke test" | Out-Null

  Invoke-RetailLensBoundedProcess `
    -FilePath ((Get-Process -Id $PID).Path) `
    -ArgumentList @(
      "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
      ('"' + (Join-Path $PSScriptRoot "windows-remove-portable-install.ps1") + '"'),
      "-InstallDirectory", ('"' + $installDirectory + '"'),
      "-UserDataDirectory", ('"' + $userDataDirectory + '"')
    ) `
    -TimeoutSeconds 120 `
    -Context "Portable-directory uninstall" | Out-Null
  $installStarted = $false

  if (
    (Test-Path -LiteralPath $installDirectory) -or
    (Test-Path -LiteralPath $userDataDirectory) -or
    (Test-Path -LiteralPath $proofDirectory) -or
    @(Get-RetailLensProductProcess -ExactExecutablePath $installedExecutable).Count -ne 0 -or
    @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0
  ) { throw "Portable uninstall left product-owned directory/process/listener state." }
} catch {
  $primaryError = $_
} finally {
  function Invoke-Round2CleanupAction([string]$Name, [scriptblock]$Action) {
    try { & $Action } catch { $cleanupErrors.Add("${Name}: $($_.Exception.Message)") }
  }
  Invoke-Round2CleanupAction "launched process" {
    if ($launchedProcess) {
      if (-not $launchedProcess.HasExited) {
        Invoke-RetailLensBoundedProcess `
          -FilePath "taskkill.exe" `
          -ArgumentList @("/PID", [string]$launchedProcess.Id, "/T", "/F") `
          -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
          -Context "Round 2 failure cleanup process shutdown" | Out-Null
      }
      $launchedProcess.Dispose()
    }
  }
  Invoke-Round2CleanupAction "proof directory" {
    if ($preflightPassed -and $proofOwned -and (Test-Path -LiteralPath $proofDirectory)) {
      Remove-RetailLensReparseFreeTree -Path $proofDirectory -Context "Round 2 proof directory"
    }
  }
  Invoke-Round2CleanupAction "product processes" {
    if ($preflightPassed -and $installStarted) {
      Get-RetailLensProductProcess -ExactExecutablePath $installedExecutable | ForEach-Object {
        Invoke-RetailLensBoundedProcess `
          -FilePath "taskkill.exe" `
          -ArgumentList @("/PID", [string]$_.ProcessId, "/T", "/F") `
          -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
          -Context "Round 2 failure cleanup product process" | Out-Null
      }
    }
  }
  Invoke-Round2CleanupAction "portable uninstall" {
    if ($preflightPassed -and $installStarted) {
      Invoke-RetailLensBoundedProcess `
        -FilePath ((Get-Process -Id $PID).Path) `
        -ArgumentList @(
          "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
          ('"' + (Join-Path $PSScriptRoot "windows-remove-portable-install.ps1") + '"'),
          "-InstallDirectory", ('"' + $installDirectory + '"'),
          "-UserDataDirectory", ('"' + $userDataDirectory + '"')
        ) `
        -TimeoutSeconds 120 -Context "Round 2 failure cleanup uninstall" | Out-Null
    }
  }
  Invoke-Round2CleanupAction "extraction root" {
    if (Test-Path -LiteralPath $extractionRoot) {
      Remove-RetailLensReparseFreeTree -Path $extractionRoot -Context "Round 2 extraction root"
    }
  }
  Invoke-Round2CleanupAction "final portable residue recheck" {
    if (
      (Test-Path -LiteralPath $installDirectory) -or
      (Test-Path -LiteralPath $userDataDirectory) -or
      (Test-Path -LiteralPath $proofDirectory) -or
      @(Get-RetailLensProductProcess -ExactExecutablePath $installedExecutable).Count -ne 0 -or
      @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0 -or
      (Test-Path -LiteralPath $extractionRoot)
    ) { throw "Portable cleanup left directory/process/listener/extraction state." }
  }
}

if ($primaryError) {
  if ($cleanupErrors.Count -ne 0) {
    throw "Portable lifecycle failed: $($primaryError.Exception.Message); cleanup encountered $($cleanupErrors.Count) independent failure(s): $($cleanupErrors -join ' | ')"
  }
  throw $primaryError
}
if ($cleanupErrors.Count -ne 0) {
  throw "Portable cleanup encountered $($cleanupErrors.Count) independent failure(s): $($cleanupErrors -join ' | ')"
}

Write-Host "Retail Decision Studio by LAI ZEYU portable-directory install/run/uninstall gate passed."

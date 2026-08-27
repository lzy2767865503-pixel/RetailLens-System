param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [ValidateSet(1, 2)] [int]$Round
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"

$state = Get-Content -LiteralPath (Resolve-Path -LiteralPath $StatePath).Path -Raw | ConvertFrom-Json
if (
  $state.schemaVersion -ne 1 -or
  $state.identityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU" -or
  $state.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
  $state.applicationId -cne "RetailDecisionStudio" -or
  $state.executable -cne "app\Retail Decision Studio by LAI ZEYU.exe" -or
  $state.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
  $state.version -cne "$($state.productVersion).0" -or
  $state.candidateSha256 -notmatch '^[0-9a-f]{64}$' -or
  $state.certificateThumbprint -notmatch '^[0-9a-f]{40}$' -or
  $state.unsignedSourceDestroyed -ne $true
) { throw "Store lifecycle state violates the immutable production identity policy." }
$candidate = (Resolve-Path -LiteralPath ([string]$state.candidatePath)).Path
$runRoot = (Resolve-Path -LiteralPath ([string]$state.runRoot)).Path
$runRootItem = Get-Item -LiteralPath $runRoot -Force
$candidateItem = Get-Item -LiteralPath $candidate -Force
if (
  -not $runRootItem.PSIsContainer -or
  ($runRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  ($candidateItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  -not (Test-RetailLensPathWithin -CandidatePath $candidate -RootPath $runRoot) -or
  (Split-Path -Leaf $candidate) -cne "RetailDecisionStudioByLAIZEYU-$($state.productVersion)-x64.appx"
) { throw "Store lifecycle candidate path escaped the exact run-owned package policy." }
$candidateHash = (Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant()
if ($candidateHash -cne [string]$state.candidateSha256) {
  throw "Store lifecycle round $Round candidate hash changed before installation."
}
$signature = Get-AuthenticodeSignature -LiteralPath $candidate
if (
  $signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $signature.SignerCertificate -or
  $signature.SignerCertificate.Subject -cne [string]$state.publisher -or
  $signature.SignerCertificate.Thumbprint.ToLowerInvariant() -cne [string]$state.certificateThumbprint
) { throw "Store lifecycle candidate is not signed by the exact run-owned certificate." }

$identityName = [string]$state.identityName
$executableName = Split-Path -Leaf ([string]$state.executable)
$proofDirectory = Join-Path $env:TEMP "retaillens-store-ui-proof"
$packageDataPrefix = $identityName + "_"
$primaryError = $null
$cleanupError = $null

try {
  $preExistingPackages = @(
    Get-AppxPackage -Name $identityName -ErrorAction Stop
    Get-AppxPackage -AllUsers -Name $identityName -ErrorAction Stop
  ) | Sort-Object PackageFullName -Unique
  if ($preExistingPackages.Count -ne 0) { throw "Lifecycle round $Round preflight found an existing exact package." }
  if (@(
    Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "Packages") -Directory -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name.StartsWith($packageDataPrefix, [System.StringComparison]::OrdinalIgnoreCase) }
  ).Count -ne 0) { throw "Lifecycle round $Round preflight found existing package data." }
  if (@(
    Get-CimInstance Win32_Process -ErrorAction Stop |
      Where-Object {
        $_.Name -ieq $executableName -or
        ($_.ExecutablePath -and $_.ExecutablePath -match ('\\WindowsApps\\' + [regex]::Escape($identityName) + '_'))
      }
  ).Count -ne 0) { throw "Lifecycle round $Round preflight found a product/package process." }
  if (Test-Path -LiteralPath $proofDirectory) { throw "Lifecycle round $Round preflight found UI proof state." }
  if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Lifecycle round $Round preflight found a loopback listener."
  }

  Invoke-RetailLensBoundedProcess `
    -FilePath ((Get-Process -Id $PID).Path) `
    -ArgumentList @(
      "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
      ('"' + (Resolve-Path "$PSScriptRoot/windows-appx-operation.ps1").Path + '"'),
      "-Operation", "Add", "-PackagePath", ('"' + $candidate + '"')
    ) `
    -TimeoutSeconds 180 -Context "Store lifecycle round $Round install" | Out-Null

  $installedPackages = @(Get-AppxPackage -Name $identityName -ErrorAction Stop)
  if ($installedPackages.Count -ne 1) { throw "Lifecycle round $Round expected exactly one installed package." }
  $installed = $installedPackages[0]
  if (
    $installed.Publisher -cne [string]$state.publisher -or
    $installed.Version.ToString() -cne [string]$state.version
  ) { throw "Installed package publisher/version does not match the exact candidate." }
  $expectedInstalledExecutable = [System.IO.Path]::GetFullPath(
    (Join-Path $installed.InstallLocation ([string]$state.executable))
  )
  if (
    -not (Test-RetailLensPathWithin -CandidatePath $expectedInstalledExecutable -RootPath $installed.InstallLocation) -or
    -not (Test-Path -LiteralPath $expectedInstalledExecutable -PathType Leaf)
  ) { throw "Installed literal manifest executable is missing or escaped package root." }
  & "$PSScriptRoot/windows-verify-pe-metadata.ps1" -ExecutablePath @($expectedInstalledExecutable)

  New-Item -ItemType Directory -Path $proofDirectory | Out-Null
  $nonce = [Guid]::NewGuid().ToString("D").ToLowerInvariant()
  $probeCreatedAt = [DateTimeOffset]::UtcNow
  [ordered]@{
    schemaVersion = 1
    candidateSha256 = $candidateHash
    nonce = $nonce
    version = [string]$state.productVersion
  } | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $proofDirectory "probe.json") -Encoding utf8
  $readyPath = Join-Path $proofDirectory "ui_ready.json"
  $aumid = "$($installed.PackageFamilyName)!$($state.applicationId)"
  Invoke-RetailLensBoundedProcess `
    -FilePath ((Get-Process -Id $PID).Path) `
    -ArgumentList @(
      "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
      ('"' + (Resolve-Path "$PSScriptRoot/windows-appx-operation.ps1").Path + '"'),
      "-Operation", "Launch", "-Aumid", $aumid
    ) `
    -TimeoutSeconds 30 -Context "Store lifecycle round $Round AUMID launch" | Out-Null

  $deadline = [DateTimeOffset]::UtcNow.AddSeconds(45)
  $ready = $null
  $health = $null
  $listener = $null
  $installedProcesses = @()
  while ([DateTimeOffset]::UtcNow -lt $deadline) {
    $installedProcesses = @(
      Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object {
          $_.ExecutablePath -and
          (Test-RetailLensPathWithin -CandidatePath $_.ExecutablePath -RootPath $installed.InstallLocation)
        }
    )
    if (Test-Path -LiteralPath $readyPath -PathType Leaf) {
      try { $ready = Get-Content -LiteralPath $readyPath -Raw | ConvertFrom-Json -ErrorAction Stop } catch { $ready = $null }
    }
    try {
      $healthResponse = Invoke-WebRequest http://127.0.0.1:47824/api/health -UseBasicParsing -TimeoutSec 2
      if ($healthResponse.StatusCode -eq 200) { $health = $healthResponse.Content | ConvertFrom-Json -ErrorAction Stop }
    } catch { $health = $null }
    $listeners = @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue)
    if ($listeners.Count -eq 1) { $listener = $listeners[0] } else { $listener = $null }
    if ($ready -and $health -and $listener -and $installedProcesses.Count -gt 0) { break }
    Start-Sleep -Milliseconds 500
  }
  if (-not $ready -or -not $health -or -not $listener -or $installedProcesses.Count -eq 0) {
    throw "Store lifecycle round $Round readiness timed out."
  }
  $listenerPid = [long]$listener.OwningProcess
  $listenerProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $listenerPid" -ErrorAction Stop
  if (
    -not $listenerProcess -or -not $listenerProcess.ExecutablePath -or
    -not [string]::Equals(
      [System.IO.Path]::GetFullPath($listenerProcess.ExecutablePath),
      $expectedInstalledExecutable,
      [System.StringComparison]::OrdinalIgnoreCase
    )
  ) { throw "Store lifecycle round $Round listener PID is not the literal installed executable." }
  $expectedEvidenceKeys = @(
    "author", "candidateSha256", "dom", "nonce", "processId",
    "product", "readyAt", "schemaVersion", "version"
  ) | Sort-Object
  if (@(Compare-Object $expectedEvidenceKeys @($ready.PSObject.Properties.Name | Sort-Object) -CaseSensitive).Count -ne 0) {
    throw "Store lifecycle round $Round readiness evidence schema is not exact."
  }
  $expectedDomKeys = @(
    "authorVisible", "privacyEntryVisible", "productNameVisible", "rootContentLength", "titleMatches"
  ) | Sort-Object
  if (@(Compare-Object $expectedDomKeys @($ready.dom.PSObject.Properties.Name | Sort-Object) -CaseSensitive).Count -ne 0) {
    throw "Store lifecycle round $Round DOM evidence schema is not exact."
  }
  if (
    $health.status -cne "ok" -or
    $health.service -cne "RetailLens API" -or
    [long]$health.processId -ne $listenerPid -or
    "zh" -notin @($health.languages) -or "en" -notin @($health.languages) -or
    $ready.schemaVersion -ne 1 -or
    $ready.product -cne "Retail Decision Studio by LAI ZEYU" -or
    $ready.author -cne "LAI ZEYU（来泽宇）" -or
    $ready.version -cne [string]$state.productVersion -or
    $ready.candidateSha256 -cne $candidateHash -or
    $ready.nonce -cne $nonce -or
    [long]$ready.processId -ne $listenerPid -or
    $ready.processId -notin @($installedProcesses.ProcessId) -or
    $ready.dom.titleMatches -ne $true -or
    $ready.dom.productNameVisible -ne $true -or
    $ready.dom.authorVisible -ne $true -or
    $ready.dom.privacyEntryVisible -ne $true -or
    [int]$ready.dom.rootContentLength -lt 100
  ) { throw "Store lifecycle round $Round candidate/PID/DOM/author/health contract failed." }
  try { $readyAt = [DateTimeOffset]$ready.readyAt } catch { throw "Store lifecycle readiness timestamp is invalid." }
  if ($readyAt -lt $probeCreatedAt.AddSeconds(-1) -or $readyAt -gt [DateTimeOffset]::UtcNow.AddSeconds(5)) {
    throw "Store lifecycle round $Round readiness evidence is stale."
  }
  if ((Get-FileHash -LiteralPath $candidate -Algorithm SHA256).Hash.ToLowerInvariant() -cne $candidateHash) {
    throw "Store lifecycle round $Round changed the exact signed candidate."
  }
} catch {
  $primaryError = $_
} finally {
  try {
    & "$PSScriptRoot/windows-store-cleanup.ps1" `
      -StatePath $StatePath `
      -IdentityName $identityName `
      -RuntimeOnly
  } catch { $cleanupError = $_ }
}

if ($primaryError) {
  if ($cleanupError) {
    throw "Store lifecycle round $Round failed: $($primaryError.Exception.Message); cleanup also failed: $($cleanupError.Exception.Message)"
  }
  throw $primaryError
}
if ($cleanupError) { throw $cleanupError }
Write-Host "Store lifecycle round $Round passed on exact candidate $candidateHash, including independent cleanup rechecks."

param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [string]$IdentityName,
  [switch]$RuntimeOnly
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"

if ($IdentityName -cne "LAIZEYU.RetailDecisionStudiobyLAIZEYU") {
  throw "Store cleanup identity must equal the immutable production Identity.Name."
}
if ([string]::IsNullOrWhiteSpace($StatePath)) { throw "Store cleanup StatePath is empty." }
$StatePath = [System.IO.Path]::GetFullPath($StatePath)
$temporaryRoot = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
  [System.IO.Path]::GetTempPath()
} else { [System.IO.Path]::GetFullPath($env:RUNNER_TEMP) }
if (-not (Test-RetailLensPathWithin -CandidatePath $StatePath -RootPath $temporaryRoot)) {
  throw "Store cleanup StatePath must remain under the runner temporary root."
}
$projectRoot = Split-Path $PSScriptRoot -Parent
$workspaceCandidateRoot = Join-Path $projectRoot "release/windows"

$errors = [System.Collections.Generic.List[string]]::new()
function Invoke-CleanupAction {
  param([Parameter(Mandatory = $true)][string]$Name, [Parameter(Mandatory = $true)][scriptblock]$Action)
  try { & $Action } catch { $errors.Add("${Name}: $($_.Exception.Message)") }
}

$state = $null
if (Test-Path -LiteralPath $StatePath -PathType Leaf) {
  Invoke-CleanupAction -Name "read state" -Action {
    $candidateState = Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json -ErrorAction Stop
    $expectedStateKeys = @(
      "applicationId", "candidatePath", "candidateSha256", "certificateFriendlyName",
      "certificateThumbprint", "executable", "identityName", "productVersion", "publisher",
      "runId", "runRoot", "schemaVersion", "unsignedSourceDestroyed", "version"
    ) | Sort-Object
    if (
      @(Compare-Object $expectedStateKeys @($candidateState.PSObject.Properties.Name | Sort-Object) -CaseSensitive).Count -ne 0 -or
      $candidateState.schemaVersion -ne 1 -or
      $candidateState.identityName -cne $IdentityName -or
      $candidateState.publisher -cne "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8" -or
      $candidateState.applicationId -cne "RetailDecisionStudio" -or
      $candidateState.executable -cne "app\Retail Decision Studio by LAI ZEYU.exe" -or
      $candidateState.productVersion -notmatch '^\d+\.\d+\.\d+$' -or
      $candidateState.version -cne "$($candidateState.productVersion).0" -or
      $candidateState.runId -notmatch '^[0-9a-f]{32}$' -or
      $candidateState.certificateFriendlyName -cne "RetailLens CI sideload $($candidateState.runId)" -or
      ([string]$candidateState.certificateThumbprint -and [string]$candidateState.certificateThumbprint -notmatch '^[0-9a-f]{40}$') -or
      ([string]$candidateState.candidateSha256 -and [string]$candidateState.candidateSha256 -notmatch '^[0-9a-f]{64}$')
    ) { throw "Store cleanup state identity/schema is invalid." }
    $candidateRunRoot = [System.IO.Path]::GetFullPath([string]$candidateState.runRoot)
    $candidatePath = [System.IO.Path]::GetFullPath([string]$candidateState.candidatePath)
    $expectedCandidatePath = Join-Path $candidateRunRoot "RetailDecisionStudioByLAIZEYU-$($candidateState.productVersion)-x64.appx"
    if (
      -not (Test-RetailLensPathWithin -CandidatePath $candidateRunRoot -RootPath $temporaryRoot) -or
      (Split-Path -Leaf $candidateRunRoot) -cne "retaillens-store-$($candidateState.runId)" -or
      $candidatePath -cne [System.IO.Path]::GetFullPath($expectedCandidatePath)
    ) { throw "Store cleanup state path boundary is invalid." }
    $candidateState.runRoot = $candidateRunRoot
    $candidateState.candidatePath = $candidatePath
    $script:state = $candidateState
  }
}
$proofPath = Join-Path $env:TEMP "retaillens-store-ui-proof"

Invoke-CleanupAction -Name "terminate product processes" -Action {
  if (-not $state) { return }
  $productProcesses = @(
    Get-CimInstance Win32_Process -ErrorAction Stop |
      Where-Object {
        $_.ExecutablePath -and
        $_.ExecutablePath -match ('\\WindowsApps\\' + [regex]::Escape($IdentityName) + '_')
      }
  )
  foreach ($process in $productProcesses) {
    Invoke-RetailLensBoundedProcess `
      -FilePath "taskkill.exe" `
      -ArgumentList @("/PID", [string]$process.ProcessId, "/T", "/F") `
      -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
      -Context "Store cleanup process $($process.ProcessId)" | Out-Null
  }
}

Invoke-CleanupAction -Name "remove exact packages" -Action {
  if (-not $state) { return }
  $packages = @(
    Get-AppxPackage -Name $IdentityName -ErrorAction SilentlyContinue
    Get-AppxPackage -AllUsers -Name $IdentityName -ErrorAction SilentlyContinue
  ) | Sort-Object PackageFullName -Unique
  foreach ($package in $packages) {
    $arguments = @(
      "-NoLogo", "-NoProfile", "-NonInteractive", "-File",
      ('"' + (Resolve-Path "$PSScriptRoot/windows-appx-operation.ps1").Path + '"'),
      "-Operation", "Remove", "-PackageFullName", $package.PackageFullName,
      "-AllUsers"
    )
    Invoke-RetailLensBoundedProcess `
      -FilePath ((Get-Process -Id $PID).Path) `
      -ArgumentList $arguments `
      -TimeoutSeconds 180 -Context "Store cleanup package $($package.PackageFullName)" | Out-Null
  }
}

Invoke-CleanupAction -Name "remove package data" -Action {
  if (-not $state) { return }
  $packagesRoot = Join-Path $env:LOCALAPPDATA "Packages"
  $prefix = $IdentityName + "_"
  Get-ChildItem -LiteralPath $packagesRoot -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) } |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName -Recurse -Force }
}
Invoke-CleanupAction -Name "remove UI proof" -Action {
  if (-not $state) { return }
  if (Test-Path -LiteralPath $proofPath) { Remove-Item -LiteralPath $proofPath -Recurse -Force }
}

Invoke-CleanupAction -Name "remove owned listener" -Action {
  if (-not $state) { return }
  $listeners = @(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue)
  foreach ($listener in $listeners) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
    if (
      $process -and $process.ExecutablePath -and
      $process.ExecutablePath -match ('\\WindowsApps\\' + [regex]::Escape($IdentityName) + '_')
    ) {
      Invoke-RetailLensBoundedProcess `
        -FilePath "taskkill.exe" `
        -ArgumentList @("/PID", [string]$listener.OwningProcess, "/T", "/F") `
        -TimeoutSeconds 30 -AllowedExitCode @(0, 128) `
        -Context "Store cleanup listener $($listener.OwningProcess)" | Out-Null
    }
  }
}

if (-not $RuntimeOnly) {
  Invoke-CleanupAction -Name "remove sideload certificates and private keys" -Action {
    $thumbprint = if ($state) { ([string]$state.certificateThumbprint).Replace(" ", "").ToUpperInvariant() } else { "" }
    $friendlyName = if ($state) { [string]$state.certificateFriendlyName } else { "" }
    $myCertificates = @(
      Get-ChildItem "Cert:\CurrentUser\My" -ErrorAction SilentlyContinue |
        Where-Object {
          ($thumbprint -and $_.Thumbprint -ceq $thumbprint) -or
          ($friendlyName -and $_.FriendlyName -ceq $friendlyName)
        }
    )
    foreach ($certificate in $myCertificates) {
      Remove-Item -LiteralPath "Cert:\CurrentUser\My\$($certificate.Thumbprint)" -DeleteKey -Force
    }
    Get-ChildItem "Cert:\CurrentUser\TrustedPeople" -ErrorAction SilentlyContinue |
      Where-Object {
        ($thumbprint -and $_.Thumbprint -ceq $thumbprint) -or
        ($friendlyName -and $_.FriendlyName -ceq $friendlyName)
      } |
      ForEach-Object { Remove-Item -LiteralPath $_.PSPath -Force }
  }
  Invoke-CleanupAction -Name "remove run root" -Action {
    if ($state -and $state.runRoot -and (Test-Path -LiteralPath ([string]$state.runRoot))) {
      $runRootItem = Get-Item -LiteralPath ([string]$state.runRoot) -Force
      if (
        -not $runRootItem.PSIsContainer -or
        ($runRootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
        @(Get-ChildItem -LiteralPath $runRootItem.FullName -Recurse -Force |
          Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0
      ) { throw "Store run root is not a regular reparse-point-free directory." }
      Remove-Item -LiteralPath ([string]$state.runRoot) -Recurse -Force
    }
  }
  Invoke-CleanupAction -Name "remove workspace Store candidates" -Action {
    if (Test-Path -LiteralPath $workspaceCandidateRoot) {
      $workspaceItem = Get-Item -LiteralPath $workspaceCandidateRoot -Force
      if (-not $workspaceItem.PSIsContainer -or ($workspaceItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
        throw "Workspace Store candidate root is not a regular directory."
      }
      if (@(Get-ChildItem -LiteralPath $workspaceItem.FullName -Recurse -Force |
        Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0) {
        throw "Workspace Store candidate root contains a reparse point."
      }
      Remove-Item -LiteralPath $workspaceCandidateRoot -Recurse -Force
    }
  }
  Invoke-CleanupAction -Name "remove state file" -Action {
    if ($state -and (Test-Path -LiteralPath $StatePath)) { Remove-Item -LiteralPath $StatePath -Force }
    $temporaryStatePath = "$StatePath.tmp"
    if (Test-Path -LiteralPath $temporaryStatePath) { Remove-Item -LiteralPath $temporaryStatePath -Force }
  }
}

Invoke-CleanupAction -Name "final exact package recheck" -Action {
  if (-not $state) { return }
  if (@(
    Get-AppxPackage -Name $IdentityName -ErrorAction SilentlyContinue
    Get-AppxPackage -AllUsers -Name $IdentityName -ErrorAction SilentlyContinue
  ).Count -ne 0) { throw "Exact-identity package remains." }
}
Invoke-CleanupAction -Name "final package-data recheck" -Action {
  if (-not $state) { return }
  $prefix = $IdentityName + "_"
  if (@(
    Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "Packages") -Directory -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Name.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) }
  ).Count -ne 0) { throw "Exact-identity package data remains." }
}
Invoke-CleanupAction -Name "final process/listener recheck" -Action {
  if (-not $state) { return }
  if (@(
    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
      Where-Object {
        $_.ExecutablePath -and
        $_.ExecutablePath -match ('\\WindowsApps\\' + [regex]::Escape($IdentityName) + '_')
      }
  ).Count -ne 0) { throw "Product/package process remains." }
  if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
    throw "Loopback listener remains."
  }
  if (Test-Path -LiteralPath $proofPath) { throw "UI proof state remains." }
}
if (-not $RuntimeOnly) {
  Invoke-CleanupAction -Name "final certificate/key/path recheck" -Action {
    $thumbprint = if ($state) { ([string]$state.certificateThumbprint).Replace(" ", "").ToUpperInvariant() } else { "" }
    $friendlyName = if ($state) { [string]$state.certificateFriendlyName } else { "" }
    if (@(
      Get-ChildItem "Cert:\CurrentUser\My", "Cert:\CurrentUser\TrustedPeople" -ErrorAction SilentlyContinue |
        Where-Object {
          ($thumbprint -and $_.Thumbprint -ceq $thumbprint) -or
          ($friendlyName -and $_.FriendlyName -ceq $friendlyName)
        }
    ).Count -ne 0) { throw "Sideload certificate representation remains." }
    if ($state -and $state.runRoot -and (Test-Path -LiteralPath ([string]$state.runRoot))) { throw "Run root remains." }
    if (Test-Path -LiteralPath $workspaceCandidateRoot) { throw "Workspace Store candidate remains." }
    if (Test-Path -LiteralPath $StatePath) { throw "Store state file remains." }
    if (Test-Path -LiteralPath "$StatePath.tmp") { throw "Temporary Store state file remains." }
  }
}

if ($errors.Count -ne 0) {
  throw "Store cleanup encountered $($errors.Count) independent failure(s): $($errors -join ' | ')"
}
Write-Host $(if ($RuntimeOnly) { "Store runtime cleanup and exact rechecks passed." } else { "Full Store package/process/listener/certificate/private-key/candidate cleanup passed." })

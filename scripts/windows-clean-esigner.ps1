$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-process.ps1"

$errors = [System.Collections.Generic.List[string]]::new()
function Invoke-CleanupAction {
  param([Parameter(Mandatory = $true)][string]$Name, [Parameter(Mandatory = $true)][scriptblock]$Action)
  try { & $Action } catch { $errors.Add("${Name}: $($_.Exception.Message)") }
}

$temporaryRoot = [System.IO.Path]::GetFullPath($(if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
  [System.IO.Path]::GetTempPath()
} else { $env:RUNNER_TEMP }))
if ($env:GITHUB_RUN_ID -notmatch '^\d+$' -or $env:GITHUB_RUN_ATTEMPT -notmatch '^\d+$') {
  throw "GitHub run identity is required for exact eSigner cleanup paths."
}
$ckaSuffix = "$env:GITHUB_RUN_ID-$env:GITHUB_RUN_ATTEMPT"
$ckaHome = [System.IO.Path]::GetFullPath((Join-Path $temporaryRoot "retaillens-esigner-cka-$ckaSuffix"))
$ckaTool = [System.IO.Path]::GetFullPath((Join-Path $ckaHome "eSignerCKATool.exe"))
$masterKey = [System.IO.Path]::GetFullPath((Join-Path $ckaHome "master.key"))
$download = [System.IO.Path]::GetFullPath((Join-Path $temporaryRoot "SSL.COM-eSigner-CKA_1.0.6-$ckaSuffix.zip"))
$expanded = [System.IO.Path]::GetFullPath((Join-Path $temporaryRoot "retaillens-esigner-download-$ckaSuffix"))
$ckaAppData = [System.IO.Path]::GetFullPath((Join-Path $env:APPDATA "eSignerCKA"))
$preexistingStatePath = [System.IO.Path]::GetFullPath((Join-Path $temporaryRoot "retaillens-esigner-preexisting-certificates-$ckaSuffix.json"))
$expectedEnvironmentPaths = [ordered]@{
  RETAILLENS_ESIGNER_CKA_HOME = $ckaHome
  RETAILLENS_ESIGNER_CKA_TOOL = $ckaTool
  RETAILLENS_ESIGNER_MASTER_KEY = $masterKey
  RETAILLENS_ESIGNER_DOWNLOAD = $download
  RETAILLENS_ESIGNER_EXPANDED = $expanded
  RETAILLENS_ESIGNER_APPDATA_STATE = $ckaAppData
  RETAILLENS_ESIGNER_PREEXISTING_CERT_STATE = $preexistingStatePath
}
foreach ($entry in $expectedEnvironmentPaths.GetEnumerator()) {
  $configured = [string][Environment]::GetEnvironmentVariable([string]$entry.Key)
  if ($configured -and [System.IO.Path]::GetFullPath($configured) -cne [string]$entry.Value) {
    $errors.Add("unsafe cleanup path override $($entry.Key) was ignored")
  }
}
$preexistingState = $null
if (Test-Path -LiteralPath $preexistingStatePath -PathType Leaf) {
  Invoke-CleanupAction -Name "read pre-existing certificate state" -Action {
    $candidateState = Get-Content -LiteralPath $preexistingStatePath -Raw | ConvertFrom-Json -ErrorAction Stop
    $expectedKeys = @(
      "commitSha", "repository", "schemaVersion", "signerSubject", "thumbprints",
      "workflowRunAttempt", "workflowRunId"
    ) | Sort-Object
    if (
      @(Compare-Object $expectedKeys @($candidateState.PSObject.Properties.Name | Sort-Object) -CaseSensitive).Count -ne 0 -or
      $candidateState.schemaVersion -ne 2 -or
      [string]$candidateState.repository -cne "lzy2767865503-pixel/RetailLens-System" -or
      [string]$candidateState.repository -cne [string]$env:GITHUB_REPOSITORY -or
      [string]$candidateState.commitSha -notmatch '^[0-9a-f]{40}$' -or
      [string]$candidateState.commitSha -cne ([string]$env:GITHUB_SHA).ToLowerInvariant() -or
      [string]$candidateState.workflowRunId -cne [string]$env:GITHUB_RUN_ID -or
      [string]$candidateState.workflowRunAttempt -cne [string]$env:GITHUB_RUN_ATTEMPT -or
      [string]$candidateState.signerSubject -cne [string]$env:RETAILLENS_WINDOWS_SIGNER_SUBJECT -or
      @($candidateState.thumbprints | Where-Object { [string]$_ -notmatch '^[0-9A-F]{40}$' }).Count -ne 0
    ) { throw "Pre-existing certificate state is invalid." }
    $script:preexistingState = $candidateState
  }
}
$knownThumbprints = @(
  if ($preexistingState) {
    $preexistingState.thumbprints | ForEach-Object { ([string]$_).Replace(" ", "").ToUpperInvariant() }
  }
)
function Test-RunOwnedCertificate($Certificate) {
  $certificateThumbprint = $Certificate.Thumbprint.Replace(" ", "").ToUpperInvariant()
  $selectedThumbprint = ([string]$env:RETAILLENS_ESIGNER_CERT_THUMBPRINT).Replace(" ", "").ToUpperInvariant()
  if ($certificateThumbprint -in $knownThumbprints) { return $false }
  if ($selectedThumbprint -and $certificateThumbprint -ceq $selectedThumbprint) { return $true }
  return ($preexistingState -and $certificateThumbprint -notin $knownThumbprints)
}

Invoke-CleanupAction -Name "CKA unload" -Action {
  if (-not $preexistingState) { return }
  if (Test-Path -LiteralPath $ckaTool -PathType Leaf) {
    Invoke-RetailLensBoundedProcess `
      -FilePath $ckaTool -ArgumentList @("unload") `
      -TimeoutSeconds 60 -SuppressOutput -Context "eSigner CKA final unload" | Out-Null
  }
}
Invoke-CleanupAction -Name "certificate representations" -Action {
  if (-not $preexistingState) { return }
  foreach ($store in @("Cert:\CurrentUser\My", "Cert:\CurrentUser\TrustedPeople")) {
    Get-ChildItem $store -ErrorAction SilentlyContinue |
      Where-Object { Test-RunOwnedCertificate $_ } |
      ForEach-Object { Remove-Item -LiteralPath $_.PSPath -Force }
  }
}
Invoke-CleanupAction -Name "CKA uninstall" -Action {
  if (-not $preexistingState) { return }
  $uninstaller = Join-Path $ckaHome "unins000.exe"
  if (Test-Path -LiteralPath $uninstaller -PathType Leaf) {
    Invoke-RetailLensBoundedProcess `
      -FilePath $uninstaller `
      -ArgumentList @("/VERYSILENT", "/SUPPRESSMSGBOXES", "/NORESTART") `
      -TimeoutSeconds 180 -SuppressOutput -Context "eSigner CKA uninstall" | Out-Null
  }
}
foreach ($entry in @(
  @{ Name = "CKA home"; Path = $ckaHome },
  @{ Name = "CKA master key"; Path = $masterKey },
  @{ Name = "CKA download"; Path = $download },
  @{ Name = "CKA expansion"; Path = $expanded },
  @{ Name = "CKA appdata"; Path = $ckaAppData }
)) {
  Invoke-CleanupAction -Name $entry.Name -Action {
    if (-not $preexistingState) { return }
    if ($entry.Path -and (Test-Path -LiteralPath $entry.Path)) {
      Remove-Item -LiteralPath $entry.Path -Recurse -Force
    }
  }
}
Invoke-CleanupAction -Name "final CKA recheck" -Action {
  if ($preexistingState) {
    foreach ($path in @(
      $ckaHome, $masterKey, $download, $expanded, $ckaAppData
    )) {
      if ($path -and (Test-Path -LiteralPath $path)) { throw "CKA path remained: $path" }
    }
    if (@(
      Get-ChildItem "Cert:\CurrentUser\My", "Cert:\CurrentUser\TrustedPeople" -ErrorAction SilentlyContinue |
        Where-Object { Test-RunOwnedCertificate $_ }
    ).Count -ne 0) { throw "Run-owned CKA certificate representation remained." }
  }
  if (@(
    Get-ChildItem $PWD, $temporaryRoot -Recurse -File -Force -ErrorAction SilentlyContinue |
      Where-Object { $_.Extension.ToLowerInvariant() -in @(".pfx", ".p12") }
  ).Count -ne 0) { throw "A forbidden exportable private-key bundle exists in the workspace." }
}
Invoke-CleanupAction -Name "pre-existing certificate state" -Action {
  if ($preexistingState -and (Test-Path -LiteralPath $preexistingStatePath)) {
    Remove-Item -LiteralPath $preexistingStatePath -Force
  }
}
Invoke-CleanupAction -Name "final state recheck" -Action {
  if ($preexistingState -and (Test-Path -LiteralPath $preexistingStatePath)) {
    throw "Pre-existing certificate state remained."
  }
}

if ($errors.Count -ne 0) {
  throw "eSigner cleanup encountered $($errors.Count) independent failure(s): $($errors -join ' | ')"
}
Write-Host "eSigner CKA cleanup and independent residue checks passed."

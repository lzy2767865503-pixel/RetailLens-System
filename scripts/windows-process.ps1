$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-RetailLensBoundedProcess {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,

    [string[]]$ArgumentList = @(),

    [ValidateRange(1, 7200)]
    [int]$TimeoutSeconds = 120,

    [int[]]$AllowedExitCode = @(0),

    [switch]$SuppressOutput,

    [Parameter(Mandatory = $true)]
    [string]$Context
  )

  $resolvedFile = (Get-Command $FilePath -ErrorAction Stop).Source
  $temporaryBase = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
    [System.IO.Path]::GetTempPath()
  } else {
    $env:RUNNER_TEMP
  }
  $captureRoot = Join-Path $temporaryBase ("retaillens-process-" + [Guid]::NewGuid().ToString("N"))
  $stdoutPath = Join-Path $captureRoot "stdout.txt"
  $stderrPath = Join-Path $captureRoot "stderr.txt"
  New-Item -ItemType Directory -Path $captureRoot | Out-Null

  $process = $null
  try {
    $process = Start-Process `
      -FilePath $resolvedFile `
      -ArgumentList $ArgumentList `
      -RedirectStandardOutput $stdoutPath `
      -RedirectStandardError $stderrPath `
      -PassThru `
      -NoNewWindow
    $deadline = [DateTimeOffset]::UtcNow.AddSeconds($TimeoutSeconds)
    while (-not $process.HasExited -and [DateTimeOffset]::UtcNow -lt $deadline) {
      Start-Sleep -Milliseconds 250
      $process.Refresh()
    }

    if (-not $process.HasExited) {
      $taskKill = Start-Process `
        -FilePath (Get-Command taskkill.exe -ErrorAction Stop).Source `
        -ArgumentList @("/PID", [string]$process.Id, "/T", "/F") `
        -PassThru `
        -WindowStyle Hidden
      if (-not $taskKill.WaitForExit(15000)) {
        Stop-Process -Id $taskKill.Id -Force -ErrorAction SilentlyContinue
      }
      if (-not $process.WaitForExit(15000)) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        [void]$process.WaitForExit(5000)
      }
      if (-not $process.HasExited) {
        throw "$Context TIMEOUT after $TimeoutSeconds seconds; process tree could not be terminated."
      }
      throw "$Context TIMEOUT after $TimeoutSeconds seconds; process tree was terminated."
    }

    # A second WaitForExit call flushes redirected asynchronous stream buffers.
    $process.WaitForExit()
    $stdout = if (Test-Path -LiteralPath $stdoutPath) {
      Get-Content -LiteralPath $stdoutPath -Raw
    } else { "" }
    $stderr = if (Test-Path -LiteralPath $stderrPath) {
      Get-Content -LiteralPath $stderrPath -Raw
    } else { "" }
    if (-not $SuppressOutput) {
      if (-not [string]::IsNullOrWhiteSpace($stdout)) { Write-Host $stdout.TrimEnd() }
      if (-not [string]::IsNullOrWhiteSpace($stderr)) { Write-Warning $stderr.TrimEnd() }
    }
    if ($process.ExitCode -notin $AllowedExitCode) {
      throw "$Context failed with exit code $($process.ExitCode)."
    }
    return [pscustomobject]@{
      ExitCode = $process.ExitCode
      ProcessId = $process.Id
      StandardOutput = $stdout
      StandardError = $stderr
    }
  } finally {
    if ($process) { $process.Dispose() }
    Remove-Item -LiteralPath $captureRoot -Recurse -Force -ErrorAction SilentlyContinue
  }
}

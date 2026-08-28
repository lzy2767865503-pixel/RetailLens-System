param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadDirectory,

  [Parameter(Mandatory = $true)]
  [string]$OutputDirectory
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"

$projectRoot = Split-Path $PSScriptRoot -Parent
$version = [string](Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json).version
$payloadRoot = (Resolve-Path -LiteralPath $PayloadDirectory).Path
$outputRoot = [System.IO.Path]::GetFullPath($OutputDirectory)
$releaseName = "RetailDecisionStudioByLAIZEYU-$version-x64-portable-directory"
$archiveName = "$releaseName.zip"
$archivePath = Join-Path $outputRoot $archiveName
if (Test-Path -LiteralPath $archivePath) {
  throw "Portable release archive must not pre-exist: $archivePath"
}

$sourceExecutables = @(Get-RetailLensPortableExecutable -Root $payloadRoot)
if ($sourceExecutables.Count -eq 0) {
  throw "The portable release payload contains no real MZ/PE file."
}
$temporaryBase = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
  [System.IO.Path]::GetTempPath()
} else {
  $env:RUNNER_TEMP
}
$assemblyRoot = Join-Path $temporaryBase ("retaillens-portable-" + [Guid]::NewGuid().ToString("N"))
$releaseRoot = Join-Path $assemblyRoot $releaseName

try {
  New-Item -ItemType Directory -Path $releaseRoot -Force | Out-Null
  foreach ($payloadItem in Get-ChildItem -LiteralPath $payloadRoot -Force) {
    Copy-Item -LiteralPath $payloadItem.FullName -Destination $releaseRoot -Recurse -Force
  }
  @(
    "Retail Decision Studio by LAI ZEYU $version",
    "Designed and authored by LAI ZEYU（来泽宇）.",
    "",
    "This is an auditable portable-directory distribution, not an EXE installer.",
    "Extract the complete directory, then run:",
    "Retail Decision Studio by LAI ZEYU.exe",
    "",
    "To remove the app, first use About & privacy > Clear local data if desired,",
    "close the app, and delete the extracted directory. No system-wide service is installed.",
    "Every real PE file in this archive must carry the same trusted, timestamped",
    "LAI ZEYU or 来泽宇 Authenticode identity before this archive can be published."
  ) | Set-Content -LiteralPath (Join-Path $releaseRoot "README-WINDOWS.txt") -Encoding utf8

  $copiedExecutables = @(Get-RetailLensPortableExecutable -Root $releaseRoot)
  if ($copiedExecutables.Count -ne $sourceExecutables.Count) {
    throw "Portable release assembly changed the number of discovered PE files."
  }
  foreach ($source in $sourceExecutables) {
    $relative = [System.IO.Path]::GetRelativePath($payloadRoot, $source.FullName)
    $copied = Join-Path $releaseRoot $relative
    if (
      -not (Test-Path -LiteralPath $copied -PathType Leaf) -or
      (Get-FileHash -LiteralPath $copied -Algorithm SHA256).Hash -cne
        (Get-FileHash -LiteralPath $source.FullName -Algorithm SHA256).Hash
    ) {
      throw "Portable release assembly changed signed PE bytes: $relative"
    }
  }

  New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null
  Compress-Archive -LiteralPath $releaseRoot -DestinationPath $archivePath -CompressionLevel Optimal
  if ((Get-RetailLensFileMagicKind -LiteralPath $archivePath) -ne "ZIP") {
    throw "The portable-directory release is not a ZIP archive."
  }
} finally {
  Remove-Item -LiteralPath $assemblyRoot -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Created auditable portable-directory release: $archivePath"

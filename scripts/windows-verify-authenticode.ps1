param(
  [Parameter(Mandatory = $true)]
  [string]$ArtifactDirectory,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedSignerSubject,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedSignerThumbprint,

  [string[]]$AdditionalExecutable = @(),

  [string[]]$AdditionalRoot = @(),

  [switch]$InspectEmbeddedPayload
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-signer-policy.ps1"
. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"

# Product authorship: LAI ZEYU（来泽宇）. Certificate identity is intentionally
# narrower and must use exactly LAI ZEYU or 来泽宇.

if ([string]::IsNullOrWhiteSpace($ExpectedSignerSubject)) {
  throw "ExpectedSignerSubject cannot be empty."
}
$expectedThumbprint = $ExpectedSignerThumbprint.Replace(" ", "").ToUpperInvariant()
if ($expectedThumbprint -notmatch '^[0-9A-F]{40}$') {
  throw "ExpectedSignerThumbprint is invalid."
}
$resolvedArtifacts = (Resolve-Path -LiteralPath $ArtifactDirectory).Path
$policyPath = Join-Path $PSScriptRoot "windows-release-policy.json"
$policy = Get-Content -LiteralPath $policyPath -Raw | ConvertFrom-Json
$builtInAllowedSignerSimpleNames = @("LAI ZEYU", "来泽宇")
$configuredAllowedSignerSimpleNames = @($policy.allowedSignerSimpleNames)
if (
  $configuredAllowedSignerSimpleNames.Count -ne $builtInAllowedSignerSimpleNames.Count -or
  @(Compare-Object $builtInAllowedSignerSimpleNames $configuredAllowedSignerSimpleNames -CaseSensitive).Count -ne 0
) {
  throw "Built-in signer policy was altered. Only LAI ZEYU or 来泽宇 may sign a release PE."
}

$windowsKits = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
$signTool = Get-ChildItem $windowsKits -Recurse -Filter signtool.exe |
  Where-Object { $_.FullName -like "*\x64\signtool.exe" } |
  Sort-Object FullName -Descending |
  Select-Object -First 1
if (-not $signTool) { throw "Windows SDK x64 signtool.exe was not found." }

function Assert-TrustedCertificateChain(
  [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate,
  [string]$Context
) {
  $chain = [System.Security.Cryptography.X509Certificates.X509Chain]::new()
  try {
    $chain.ChainPolicy.RevocationMode =
      [System.Security.Cryptography.X509Certificates.X509RevocationMode]::Online
    $chain.ChainPolicy.RevocationFlag =
      [System.Security.Cryptography.X509Certificates.X509RevocationFlag]::ExcludeRoot
    $chain.ChainPolicy.VerificationFlags =
      [System.Security.Cryptography.X509Certificates.X509VerificationFlags]::NoFlag
    $chain.ChainPolicy.UrlRetrievalTimeout = [TimeSpan]::FromSeconds(30)
    if (-not $chain.Build($Certificate)) {
      $statuses = @($chain.ChainStatus | ForEach-Object {
        "$($_.Status):$($_.StatusInformation.Trim())"
      }) -join "; "
      throw "Online trusted-chain validation failed for ${Context}: $statuses"
    }
  } finally {
    $chain.Dispose()
  }
}

function Assert-TrustedAuthenticode([string]$ExecutablePath) {
  $resolvedExecutable = (Resolve-Path -LiteralPath $ExecutablePath).Path
  if ((Get-RetailLensFileMagicKind -LiteralPath $resolvedExecutable) -ne "MZ_PE") {
    throw "Authenticode input is not a real PE: $resolvedExecutable"
  }
  $name = Split-Path -Leaf $resolvedExecutable
  $signature = Get-AuthenticodeSignature -LiteralPath $resolvedExecutable
  if ($signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid) {
    throw "Authenticode is not valid for ${name}: $($signature.Status)."
  }
  if (-not $signature.SignerCertificate -or -not $signature.TimeStamperCertificate) {
    throw "Signer or trusted timestamp certificate is missing for $name."
  }
  $certificate = $signature.SignerCertificate
  $simpleName = $certificate.GetNameInfo(
    [System.Security.Cryptography.X509Certificates.X509NameType]::SimpleName,
    $false
  )
  Assert-RetailLensAuthorOwnedSignerIdentity `
    -SimpleName $simpleName `
    -Subject $certificate.Subject `
    -Context $name
  if ($certificate.Subject -cne $ExpectedSignerSubject) {
    throw "Signer subject mismatch for $name."
  }
  if ($certificate.Thumbprint.Replace(" ", "").ToUpperInvariant() -cne $expectedThumbprint) {
    throw "Signer thumbprint mismatch for $name. Every release PE must use one exact certificate."
  }
  if ($certificate.Subject -ceq $certificate.Issuer) {
    throw "Self-signed certificates are forbidden for GitHub release PEs."
  }
  if ((Get-Date) -lt $certificate.NotBefore -or (Get-Date) -ge $certificate.NotAfter) {
    throw "Signer certificate is not currently valid for $name."
  }
  $hasCodeSigningEku = @($certificate.EnhancedKeyUsageList) |
    Where-Object { $_.ObjectId.Value -eq "1.3.6.1.5.5.7.3.3" }
  if (-not $hasCodeSigningEku) {
    throw "Signer certificate lacks the Code Signing EKU for $name."
  }
  Assert-TrustedCertificateChain -Certificate $certificate -Context "$name signer"
  Assert-TrustedCertificateChain `
    -Certificate $signature.TimeStamperCertificate `
    -Context "$name timestamp authority"
  $hasTimestampingEku = @($signature.TimeStamperCertificate.EnhancedKeyUsageList) |
    Where-Object { $_.ObjectId.Value -eq "1.3.6.1.5.5.7.3.8" }
  if (-not $hasTimestampingEku) {
    throw "Timestamp certificate lacks the Time Stamping EKU for $name."
  }
  $signToolVerification = Invoke-RetailLensBoundedProcess `
    -FilePath $signTool.FullName `
    -ArgumentList @("verify", "/pa", "/all", "/v", ('"' + $resolvedExecutable + '"')) `
    -TimeoutSeconds 120 `
    -Context "SignTool exact-signature verification for $name"
  $signatureIndexes = [regex]::Matches(
    $signToolVerification.StandardOutput + [Environment]::NewLine + $signToolVerification.StandardError,
    '(?im)^\s*Signature Index:\s*(\d+)(?:\s|$)'
  )
  if ($signatureIndexes.Count -ne 1 -or $signatureIndexes[0].Groups[1].Value -cne "0") {
    throw "SignTool did not prove exactly one Authenticode signature index for $name."
  }
}

function Resolve-AsarCli {
  $projectRoot = Split-Path $PSScriptRoot -Parent
  foreach ($candidate in @(
    (Join-Path $projectRoot "node_modules\.bin\asar.cmd"),
    (Join-Path $projectRoot "node_modules\.bin\asar")
  )) {
    if (Test-Path -LiteralPath $candidate -PathType Leaf) { return $candidate }
  }
  throw "The pinned @electron/asar CLI is required for hidden-PE inspection."
}

function Expand-ReleaseZipSafely(
  [string]$ArchivePath,
  [string]$Destination,
  [string]$ExpectedTopLevelDirectory
) {
  Add-Type -AssemblyName System.IO.Compression.FileSystem
  $archive = [System.IO.Compression.ZipFile]::OpenRead($ArchivePath)
  try {
    $seen = @{}
    foreach ($entry in $archive.Entries) {
      $entryName = $entry.FullName.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
      if (
        [string]::IsNullOrWhiteSpace($entryName) -or
        [System.IO.Path]::IsPathRooted($entryName)
      ) {
        throw "Release ZIP contains an empty or rooted entry."
      }
      $target = [System.IO.Path]::GetFullPath((Join-Path $Destination $entryName))
      if (-not (Test-RetailLensPathWithin -CandidatePath $target -RootPath $Destination)) {
        throw "Release ZIP contains a path-traversal entry: $($entry.FullName)"
      }
      $normalized = $entry.FullName.TrimEnd("/").ToLowerInvariant()
      if ($seen.ContainsKey($normalized)) {
        throw "Release ZIP contains a duplicate case-insensitive entry: $($entry.FullName)"
      }
      $seen[$normalized] = $true
      $unixType = ($entry.ExternalAttributes -shr 16) -band 0xF000
      if ($unixType -eq 0xA000) {
        throw "Release ZIP contains a symbolic-link entry: $($entry.FullName)"
      }
      $topLevel = $entry.FullName.Replace("\", "/").Split("/")[0]
      if ($topLevel -cne $ExpectedTopLevelDirectory) {
        throw "Release ZIP entry escaped the one exact top-level product directory."
      }
    }
  } finally {
    $archive.Dispose()
  }
  [System.IO.Compression.ZipFile]::ExtractToDirectory($ArchivePath, $Destination)
}

$inspectionRoot = $null
try {
  $rootsToScan = @($AdditionalRoot)
  $portableExecutables = @(
    Get-RetailLensPortableExecutable -Root $resolvedArtifacts
    foreach ($root in $AdditionalRoot) {
      Get-RetailLensPortableExecutable -Root $root
    }
    foreach ($path in $AdditionalExecutable) {
      $item = Get-Item -LiteralPath (Resolve-Path -LiteralPath $path).Path -Force
      if ((Get-RetailLensFileMagicKind -LiteralPath $item.FullName) -ne "MZ_PE") {
        throw "Additional executable is not a real MZ/PE file: $($item.FullName)"
      }
      $item
    }
  )

  if ($InspectEmbeddedPayload) {
    $projectVersion = [string](Get-Content -LiteralPath (Join-Path (Split-Path $PSScriptRoot -Parent) "package.json") -Raw | ConvertFrom-Json).version
    $releaseName = "RetailDecisionStudioByLAIZEYU-$projectVersion-x64-portable-directory"
    $archiveName = "$releaseName.zip"
    $archives = @(Get-ChildItem -LiteralPath $resolvedArtifacts -Recurse -File -Filter $archiveName)
    if ($archives.Count -ne 1) {
      throw "Expected exactly one auditable portable-directory ZIP, found $($archives.Count)."
    }
    if ((Get-RetailLensFileMagicKind -LiteralPath $archives[0].FullName) -ne "ZIP") {
      throw "The release archive does not have ZIP magic."
    }
    $temporaryBase = if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) {
      [System.IO.Path]::GetTempPath()
    } else { $env:RUNNER_TEMP }
    $inspectionRoot = Join-Path $temporaryBase ("retaillens-release-inspection-" + [Guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $inspectionRoot | Out-Null
    Expand-ReleaseZipSafely `
      -ArchivePath $archives[0].FullName `
      -Destination $inspectionRoot `
      -ExpectedTopLevelDirectory $releaseName
    $expandedProductRoot = Join-Path $inspectionRoot $releaseName
    $primaryExecutables = @(Get-ChildItem -LiteralPath $expandedProductRoot -File -Filter "Retail Decision Studio by LAI ZEYU.exe")
    if ($primaryExecutables.Count -ne 1) {
      throw "The release ZIP does not contain one exact primary product executable."
    }
    $portableExecutables += @(Get-RetailLensPortableExecutable -Root $expandedProductRoot)
    $rootsToScan += $expandedProductRoot

    foreach ($file in Get-ChildItem -LiteralPath $expandedProductRoot -Recurse -File -Force) {
      $kind = Get-RetailLensFileMagicKind -LiteralPath $file.FullName
      if ($kind -notin @("OTHER", "MZ_PE")) {
        throw "The release ZIP contains a nested archive or invalid MZ payload that could conceal an unsigned PE: $($file.FullName) ($kind)"
      }
    }

    $asarCli = Resolve-AsarCli
    $asarIndex = 0
    foreach ($root in $rootsToScan | Sort-Object -Unique) {
      if (-not (Test-Path -LiteralPath $root)) { continue }
      foreach ($asar in Get-ChildItem -LiteralPath $root -Recurse -File -Filter "*.asar" -Force) {
        $asarIndex += 1
        $asarRoot = Join-Path $inspectionRoot ("asar-{0:D4}" -f $asarIndex)
        New-Item -ItemType Directory -Path $asarRoot | Out-Null
        & $asarCli "extract" $asar.FullName $asarRoot | Out-Host
        if ($LASTEXITCODE -ne 0) { throw "Pinned @electron/asar could not extract $($asar.FullName)." }
        foreach ($file in Get-ChildItem -LiteralPath $asarRoot -Recurse -File -Force) {
          $kind = Get-RetailLensFileMagicKind -LiteralPath $file.FullName
          if ($kind -notin @("OTHER", "MZ_PE")) {
            throw "app.asar contains a nested archive or invalid MZ payload: $($file.FullName) ($kind)"
          }
        }
        $portableExecutables += @(Get-RetailLensPortableExecutable -Root $asarRoot)
      }
    }
  }

  $seen = @{}
  $verified = 0
  foreach ($executable in $portableExecutables) {
    $resolved = (Resolve-Path -LiteralPath $executable.FullName).Path
    $key = $resolved.ToLowerInvariant()
    if ($seen.ContainsKey($key)) { continue }
    $seen[$key] = $true
    Assert-TrustedAuthenticode -ExecutablePath $resolved
    $verified += 1
  }
  if ($verified -eq 0) { throw "No real MZ/PE file was verified." }
  Write-Host "Exact one-certificate author-owned, trusted, timestamped Authenticode passed for all $verified discovered release PEs."
} finally {
  if ($inspectionRoot -and (Test-Path -LiteralPath $inspectionRoot)) {
    Remove-Item -LiteralPath $inspectionRoot -Recurse -Force
  }
}

param(
  [Parameter(Mandatory = $true)]
  [string]$PayloadRoot,

  [Parameter(Mandatory = $true)]
  [string]$CertificateThumbprint,

  [Parameter(Mandatory = $true)]
  [string]$ExpectedSignerSubject,

  [string]$TimestampUrl = "http://ts.ssl.com",

  [string]$InventoryPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"
. "$PSScriptRoot/windows-signer-policy.ps1"

if ($TimestampUrl -cne "http://ts.ssl.com") {
  throw "The RFC 3161 timestamp URL must be the SSL.com endpoint http://ts.ssl.com."
}
$thumbprint = $CertificateThumbprint.Replace(" ", "").ToUpperInvariant()
if ($thumbprint -notmatch '^[0-9A-F]{40}$') {
  throw "The cloud certificate thumbprint is invalid."
}
$certificates = @(
  Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert |
    Where-Object { $_.Thumbprint -ceq $thumbprint }
)
if ($certificates.Count -ne 1) {
  throw "Expected exactly one eSigner CKA code-signing certificate with the configured thumbprint."
}
$certificate = $certificates[0]
if ($certificate.Subject -cne $ExpectedSignerSubject) {
  throw "The eSigner CKA certificate Subject does not match WINDOWS_SIGNER_SUBJECT."
}
$simpleName = $certificate.GetNameInfo(
  [System.Security.Cryptography.X509Certificates.X509NameType]::SimpleName,
  $false
)
Assert-RetailLensAuthorOwnedSignerIdentity `
  -SimpleName $simpleName `
  -Subject $certificate.Subject `
  -Context "eSigner CKA certificate"
if ($certificate.Subject -ceq $certificate.Issuer) {
  throw "A self-issued certificate cannot sign a public GitHub release."
}
if (-not $certificate.HasPrivateKey) {
  throw "The eSigner CKA certificate is not connected to its cloud private-key provider."
}

$resolvedRoot = (Resolve-Path -LiteralPath $PayloadRoot).Path
$payloadItem = Get-Item -LiteralPath $resolvedRoot -Force
if (-not $payloadItem.PSIsContainer -or ($payloadItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
  throw "Cloud-signing payload root must be a regular directory."
}
$portableExecutables = @(Get-RetailLensPortableExecutable -Root $resolvedRoot)
if ($portableExecutables.Count -eq 0) {
  throw "No real MZ/PE files were found in the Windows payload."
}

$windowsKits = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
# SSL.com's CKA integration guide explicitly recommends the x86 SignTool when
# the x64 client cannot load the CNG/KSP provider. Prefer x86 so the workflow
# follows the documented Cloud Key Adapter path instead of a PFX fallback.
$signTool = Get-ChildItem $windowsKits -Recurse -Filter signtool.exe |
  Where-Object { $_.FullName -like "*\x86\signtool.exe" } |
  Sort-Object FullName -Descending |
  Select-Object -First 1
if (-not $signTool) {
  throw "Windows SDK x86 signtool.exe was not found."
}

$inventory = @()
foreach ($portableExecutable in $portableExecutables | Sort-Object FullName) {
  $relativePath = [System.IO.Path]::GetRelativePath(
    $resolvedRoot,
    $portableExecutable.FullName
  )
  $existingSignature = Get-AuthenticodeSignature -LiteralPath $portableExecutable.FullName
  if ($existingSignature.SignerCertificate) {
    Invoke-RetailLensBoundedProcess `
      -FilePath $signTool.FullName `
      -ArgumentList @("remove", "/s", ('"' + $portableExecutable.FullName + '"')) `
      -TimeoutSeconds 60 `
      -Context "Remove pre-existing third-party signature from $relativePath" | Out-Null
    $unsignedState = Get-AuthenticodeSignature -LiteralPath $portableExecutable.FullName
    if ($unsignedState.SignerCertificate) {
      throw "A pre-existing embedded signature remained after removal: $relativePath"
    }
  }
  Invoke-RetailLensBoundedProcess `
    -FilePath $signTool.FullName `
    -ArgumentList @(
      "sign", "/fd", "SHA256", "/tr", $TimestampUrl, "/td", "SHA256",
      "/sha1", $thumbprint, ('"' + $portableExecutable.FullName + '"')
    ) `
    -TimeoutSeconds 180 `
    -Context "SSL.com eSigner CKA SignTool for $relativePath" | Out-Null

  $signature = Get-AuthenticodeSignature -LiteralPath $portableExecutable.FullName
  if (
    $signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
    -not $signature.SignerCertificate -or
    -not $signature.TimeStamperCertificate -or
    $signature.SignerCertificate.Subject -cne $ExpectedSignerSubject -or
    $signature.SignerCertificate.Thumbprint.Replace(" ", "").ToUpperInvariant() -cne $thumbprint
  ) {
    throw "The just-signed PE failed immediate signer/timestamp verification: $relativePath"
  }
  $hasTimestampingEku = @($signature.TimeStamperCertificate.EnhancedKeyUsageList) |
    Where-Object { $_.ObjectId.Value -eq "1.3.6.1.5.5.7.3.8" }
  if (-not $hasTimestampingEku) {
    throw "The just-signed PE timestamp certificate lacks the Time Stamping EKU: $relativePath"
  }
  $signedItem = Get-Item -LiteralPath $portableExecutable.FullName
  $inventory += [ordered]@{
    path = $relativePath.Replace("\", "/")
    size = $signedItem.Length
    sha256 = (Get-FileHash -LiteralPath $signedItem.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    signerThumbprint = $signature.SignerCertificate.Thumbprint.ToLowerInvariant()
  }
}

if (-not [string]::IsNullOrWhiteSpace($InventoryPath)) {
  $resolvedInventory = [System.IO.Path]::GetFullPath($InventoryPath)
  if (Test-Path -LiteralPath $resolvedInventory) {
    throw "Cloud-signing inventory must not pre-exist: $resolvedInventory"
  }
  New-Item -ItemType Directory -Path (Split-Path -Parent $resolvedInventory) -Force | Out-Null
  [ordered]@{
    schemaVersion = 2
    product = "Retail Decision Studio by LAI ZEYU"
    author = "LAI ZEYU（来泽宇）"
    signerSubject = $ExpectedSignerSubject
    signerThumbprint = $thumbprint.ToLowerInvariant()
    timestampUrl = $TimestampUrl
    peCount = $inventory.Count
    files = $inventory
  } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $resolvedInventory -Encoding utf8
}

Write-Host "SSL.com eSigner CKA signed every one of $($inventory.Count) real MZ/PE files through Windows SignTool."

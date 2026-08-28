function Assert-RetailLensMicrosoftWindowsTool {
  param(
    [Parameter(Mandatory = $true)] [string]$Path,
    [Parameter(Mandatory = $true)] [string]$KitsRoot,
    [Parameter(Mandatory = $true)] [string]$Label
  )

  $tool = Get-Item -LiteralPath $Path -Force
  if ($tool.PSIsContainer -or ($tool.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
    throw "$Label must be one regular non-reparse file."
  }

  $current = $tool.Directory
  $reachedRoot = $false
  while ($current) {
    $currentPath = [IO.Path]::GetFullPath($current.FullName).TrimEnd('\')
    if (($current.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
      throw "$Label path contains a reparse point."
    }
    if ([string]::Equals($currentPath, $KitsRoot, [StringComparison]::OrdinalIgnoreCase)) {
      $reachedRoot = $true
      break
    }
    $current = $current.Parent
  }

  if (-not $reachedRoot -or $tool.VersionInfo.CompanyName -cne 'Microsoft Corporation') {
    throw "$Label is outside the exact Windows Kits root or lacks Microsoft Corporation metadata."
  }

  $signature = Get-AuthenticodeSignature -LiteralPath $tool.FullName
  $simpleName = if ($signature.SignerCertificate) {
    $signature.SignerCertificate.GetNameInfo(
      [Security.Cryptography.X509Certificates.X509NameType]::SimpleName,
      $false
    )
  } else { '' }
  if (
    $signature.Status -ne [Management.Automation.SignatureStatus]::Valid -or
    -not $signature.TimeStamperCertificate -or
    $simpleName -cnotin @('Microsoft Windows', 'Microsoft Corporation')
  ) {
    throw "$Label does not have the expected valid timestamped Microsoft Authenticode identity."
  }

  $chain = [Security.Cryptography.X509Certificates.X509Chain]::new()
  try {
    $chain.ChainPolicy.RevocationMode = [Security.Cryptography.X509Certificates.X509RevocationMode]::Online
    $chain.ChainPolicy.RevocationFlag = [Security.Cryptography.X509Certificates.X509RevocationFlag]::ExcludeRoot
    $chain.ChainPolicy.VerificationFlags = [Security.Cryptography.X509Certificates.X509VerificationFlags]::IgnoreNotTimeValid
    $chain.ChainPolicy.UrlRetrievalTimeout = [TimeSpan]::FromSeconds(60)
    if (-not $chain.Build($signature.SignerCertificate)) {
      throw "$Label Microsoft signer chain did not pass online validation."
    }
  } finally {
    $chain.Dispose()
  }

  return $tool
}

function Get-RetailLensTrustedWindowsSdkTool {
  param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('makeappx.exe')]
    [string]$Name
  )

  $kitsRoot = [IO.Path]::GetFullPath(
    (Join-Path ([Environment]::GetFolderPath('ProgramFilesX86')) 'Windows Kits\10')
  ).TrimEnd('\')
  $escapedName = [Regex]::Escape($Name)
  $candidates = @(
    Get-ChildItem -LiteralPath (Join-Path $kitsRoot 'bin') -Filter $Name -File -Recurse -ErrorAction Stop |
      Where-Object { $_.FullName -match "\\bin\\\d+(?:\.\d+){3}\\x64\\$escapedName$" } |
      Sort-Object { [version]$_.Directory.Parent.Name } -Descending
  )
  if ($candidates.Count -eq 0) {
    throw "$Name was not found under a versioned Windows SDK x64 directory."
  }

  return Assert-RetailLensMicrosoftWindowsTool `
    -Path $candidates[0].FullName `
    -KitsRoot $kitsRoot `
    -Label $Name
}

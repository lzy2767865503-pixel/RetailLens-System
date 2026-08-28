$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Get-RetailLensFileMagicKind {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$LiteralPath
  )

  $resolved = (Resolve-Path -LiteralPath $LiteralPath).Path
  $item = Get-Item -LiteralPath $resolved -Force
  if (-not $item.PSIsContainer -and ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint)) {
    return "REPARSE_POINT"
  }
  if ($item.PSIsContainer) {
    throw "File magic cannot be read from a directory: $resolved"
  }

  $buffer = [byte[]]::new(4096)
  $stream = [System.IO.File]::Open(
    $resolved,
    [System.IO.FileMode]::Open,
    [System.IO.FileAccess]::Read,
    [System.IO.FileShare]::Read
  )
  try {
    $count = $stream.Read($buffer, 0, $buffer.Length)
  } finally {
    $stream.Dispose()
  }

  function Has-Bytes([int]$Offset, [byte[]]$Expected) {
    if ($count -lt ($Offset + $Expected.Length)) { return $false }
    for ($index = 0; $index -lt $Expected.Length; $index += 1) {
      if ($buffer[$Offset + $index] -ne $Expected[$index]) { return $false }
    }
    return $true
  }

  if (Has-Bytes 0 ([byte[]](0x4D, 0x5A))) {
    # "MZ" alone is not a PE. Validate the DOS e_lfanew pointer and the exact
    # PE\0\0 signature so a short text fixture cannot masquerade as an actual
    # Windows executable in release-policy tests.
    if ($count -lt 64) { return "MZ_INVALID" }
    $peOffset = [System.BitConverter]::ToInt32($buffer, 0x3c)
    if ($peOffset -lt 64 -or ([long]$peOffset + 4) -gt $item.Length) {
      return "MZ_INVALID"
    }
    $peSignature = [byte[]]::new(4)
    if (($peOffset + 4) -le $count) {
      [System.Array]::Copy($buffer, $peOffset, $peSignature, 0, 4)
    } else {
      $peStream = [System.IO.File]::Open(
        $resolved,
        [System.IO.FileMode]::Open,
        [System.IO.FileAccess]::Read,
        [System.IO.FileShare]::Read
      )
      try {
        [void]$peStream.Seek($peOffset, [System.IO.SeekOrigin]::Begin)
        if ($peStream.Read($peSignature, 0, 4) -ne 4) {
          return "MZ_INVALID"
        }
      } finally {
        $peStream.Dispose()
      }
    }
    if (
      $peSignature[0] -eq 0x50 -and
      $peSignature[1] -eq 0x45 -and
      $peSignature[2] -eq 0x00 -and
      $peSignature[3] -eq 0x00
    ) { return "MZ_PE" }
    return "MZ_INVALID"
  }
  if (
    (Has-Bytes 0 ([byte[]](0x50, 0x4B, 0x03, 0x04))) -or
    (Has-Bytes 0 ([byte[]](0x50, 0x4B, 0x05, 0x06))) -or
    (Has-Bytes 0 ([byte[]](0x50, 0x4B, 0x07, 0x08)))
  ) { return "ZIP" }
  if (Has-Bytes 0 ([byte[]](0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C))) { return "SEVEN_ZIP" }
  if (Has-Bytes 0 ([byte[]](0x52, 0x61, 0x72, 0x21, 0x1A, 0x07))) { return "RAR" }
  if (Has-Bytes 0 ([byte[]](0x4D, 0x53, 0x43, 0x46))) { return "CAB" }
  if (Has-Bytes 0 ([byte[]](0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1))) { return "OLE_MSI" }
  if (Has-Bytes 0 ([byte[]](0x1F, 0x8B))) { return "GZIP" }
  if (Has-Bytes 0 ([byte[]](0x42, 0x5A, 0x68))) { return "BZIP2" }
  if (Has-Bytes 0 ([byte[]](0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00))) { return "XZ" }
  if (Has-Bytes 0 ([byte[]](0x28, 0xB5, 0x2F, 0xFD))) { return "ZSTD" }
  if (Has-Bytes 257 ([System.Text.Encoding]::ASCII.GetBytes("ustar"))) { return "TAR" }
  return "OTHER"
}

function Get-RetailLensPortableExecutable {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Root
  )

  $resolvedRoot = (Resolve-Path -LiteralPath $Root).Path
  $rootItem = Get-Item -LiteralPath $resolvedRoot -Force
  if ($rootItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Portable-executable scan root must not be a reparse point: $resolvedRoot"
  }
  if ($rootItem.PSIsContainer) {
    $reparsePoints = @(
      Get-ChildItem -LiteralPath $resolvedRoot -Recurse -Force |
        Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }
    )
    if ($reparsePoints.Count -ne 0) {
      throw "Portable-executable scan encountered a nested reparse point: $($reparsePoints[0].FullName)"
    }
  }
  $files = if ($rootItem.PSIsContainer) {
    @(Get-ChildItem -LiteralPath $resolvedRoot -Recurse -File -Force)
  } else {
    @($rootItem)
  }
  foreach ($file in $files) {
    $kind = Get-RetailLensFileMagicKind -LiteralPath $file.FullName
    if ($kind -eq "REPARSE_POINT") {
      throw "Portable-executable scan encountered a reparse point: $($file.FullName)"
    }
    if ($kind -eq "MZ_PE") { $file }
  }
}

function Test-RetailLensPathWithin {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$CandidatePath,
    [Parameter(Mandatory = $true)]
    [string]$RootPath
  )

  $candidate = [System.IO.Path]::GetFullPath($CandidatePath).TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
  )
  $root = [System.IO.Path]::GetFullPath($RootPath).TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
  )
  if ([string]::IsNullOrWhiteSpace($root)) { return $false }
  $comparison = if ($IsWindows) {
    [System.StringComparison]::OrdinalIgnoreCase
  } else {
    [System.StringComparison]::Ordinal
  }
  if ([string]::Equals($candidate, $root, $comparison)) { return $true }
  $boundary = $root + [System.IO.Path]::DirectorySeparatorChar
  return $candidate.StartsWith($boundary, $comparison)
}

function Assert-RetailLensEvidenceDirectory {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$Directory
  )

  $resolvedDirectory = (Resolve-Path -LiteralPath $Directory).Path
  $directoryItem = Get-Item -LiteralPath $resolvedDirectory -Force
  if (-not $directoryItem.PSIsContainer) {
    throw "Evidence path is not a directory: $resolvedDirectory"
  }
  if ($directoryItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
    throw "Evidence directory must not be a reparse point: $resolvedDirectory"
  }
  $reparsePoints = @(
    Get-ChildItem -LiteralPath $resolvedDirectory -Recurse -Force |
      Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }
  )
  if ($reparsePoints.Count -ne 0) {
    throw "Evidence directory contains a nested reparse point: $($reparsePoints[0].FullName)"
  }

  $allowedExtensions = @(".json", ".txt", ".xml")
  $files = @(Get-ChildItem -LiteralPath $resolvedDirectory -Recurse -File -Force)
  if ($files.Count -eq 0) {
    throw "Evidence directory is empty: $resolvedDirectory"
  }
  foreach ($file in $files) {
    if (-not (Test-RetailLensPathWithin -CandidatePath $file.FullName -RootPath $resolvedDirectory)) {
      throw "Evidence file escaped the staging directory: $($file.FullName)"
    }
    if ($file.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
      throw "Evidence file must not be a reparse point: $($file.FullName)"
    }
    if ($file.Extension.ToLowerInvariant() -notin $allowedExtensions) {
      throw "Evidence file extension is forbidden: $($file.Name)"
    }
    $kind = Get-RetailLensFileMagicKind -LiteralPath $file.FullName
    if ($kind -ne "OTHER") {
      throw "Evidence file $($file.Name) has forbidden binary/archive magic $kind."
    }
  }

  Write-Host "Strict non-binary evidence policy passed for $($files.Count) files in $resolvedDirectory."
}

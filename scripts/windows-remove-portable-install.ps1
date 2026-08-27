param(
  [Parameter(Mandatory = $true)]
  [string]$InstallDirectory,

  [Parameter(Mandatory = $true)]
  [string]$UserDataDirectory
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$expectedInstall = [System.IO.Path]::GetFullPath(
  (Join-Path $env:LOCALAPPDATA "Programs\Retail Decision Studio by LAI ZEYU")
)
$expectedUserData = [System.IO.Path]::GetFullPath(
  (Join-Path $env:APPDATA "retaillens-system")
)
if (
  [System.IO.Path]::GetFullPath($InstallDirectory) -cne $expectedInstall -or
  [System.IO.Path]::GetFullPath($UserDataDirectory) -cne $expectedUserData
) {
  throw "Portable uninstall paths do not match the two exact product-owned locations."
}
foreach ($path in @($expectedInstall, $expectedUserData)) {
  if (Test-Path -LiteralPath $path) {
    $item = Get-Item -LiteralPath $path -Force
    if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
      throw "Portable uninstall refuses to traverse a reparse point: $path"
    }
    Remove-Item -LiteralPath $path -Recurse -Force
  }
}
if ((Test-Path -LiteralPath $expectedInstall) -or (Test-Path -LiteralPath $expectedUserData)) {
  throw "Portable uninstall left residual product-owned state."
}

param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("Add", "Remove", "Launch")]
  [string]$Operation,

  [string]$PackagePath = "",

  [string]$PackageFullName = "",

  [string]$Aumid = "",

  [switch]$AllUsers
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

switch ($Operation) {
  "Add" {
    if ([string]::IsNullOrWhiteSpace($PackagePath)) { throw "PackagePath is required." }
    Add-AppxPackage -Path (Resolve-Path -LiteralPath $PackagePath).Path -ErrorAction Stop
  }
  "Remove" {
    if ([string]::IsNullOrWhiteSpace($PackageFullName)) { throw "PackageFullName is required." }
    if ($AllUsers) {
      Remove-AppxPackage -Package $PackageFullName -AllUsers -ErrorAction Stop
    } else {
      Remove-AppxPackage -Package $PackageFullName -ErrorAction Stop
    }
  }
  "Launch" {
    if ($Aumid -notmatch '^[A-Za-z0-9._-]+![A-Za-z0-9._-]+$') {
      throw "Aumid is invalid."
    }
    Start-Process explorer.exe -ArgumentList ("shell:AppsFolder\" + $Aumid)
  }
}

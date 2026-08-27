param(
  [Parameter(Mandatory = $true)] [string]$StatePath,
  [Parameter(Mandatory = $true)] [string]$IdentityName,
  [Parameter(Mandatory = $true)] [string]$Publisher
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

. "$PSScriptRoot/windows-file-policy.ps1"
. "$PSScriptRoot/windows-process.ps1"

$projectRoot = Split-Path $PSScriptRoot -Parent
$workspaceCandidateRoot = Join-Path $projectRoot "release/windows"

$productionPublisher = "CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8"
$productionIdentityName = "LAIZEYU.RetailDecisionStudiobyLAIZEYU"
$expectedExecutable = "app\Retail Decision Studio by LAI ZEYU.exe"
$expectedExecutableName = "Retail Decision Studio by LAI ZEYU.exe"
$expectedApplicationId = "RetailDecisionStudio"
if ($Publisher -cne $productionPublisher) {
  throw "The Store technical Publisher must equal the production Partner Center Publisher."
}
if ($IdentityName -cne $productionIdentityName) {
  throw "Identity.Name must equal the reserved production Partner Center identity."
}

$resolvedStatePath = [System.IO.Path]::GetFullPath($StatePath)
if ([string]::IsNullOrWhiteSpace($env:RUNNER_TEMP)) { throw "RUNNER_TEMP is required." }
$runnerTemp = [System.IO.Path]::GetFullPath($env:RUNNER_TEMP)
if (-not (Test-RetailLensPathWithin -CandidatePath $resolvedStatePath -RootPath $runnerTemp)) {
  throw "Store state path must remain under RUNNER_TEMP."
}
if (Test-Path -LiteralPath $resolvedStatePath) {
  throw "Store state must not pre-exist: $resolvedStatePath"
}
New-Item -ItemType Directory -Path (Split-Path -Parent $resolvedStatePath) -Force | Out-Null

$existingPackages = @(
  Get-AppxPackage -Name $IdentityName -ErrorAction Stop
  Get-AppxPackage -AllUsers -Name $IdentityName -ErrorAction Stop
) | Sort-Object PackageFullName -Unique
if ($existingPackages.Count -ne 0) { throw "Store preflight found an existing exact-identity package." }
$packageDataPrefix = $IdentityName + "_"
$existingData = @(
  Get-ChildItem -LiteralPath (Join-Path $env:LOCALAPPDATA "Packages") -Directory -Force -ErrorAction SilentlyContinue |
    Where-Object { $_.Name.StartsWith($packageDataPrefix, [System.StringComparison]::OrdinalIgnoreCase) }
)
if ($existingData.Count -ne 0) { throw "Store preflight found existing exact-identity package data." }
$existingProcesses = @(
    Get-CimInstance Win32_Process -ErrorAction Stop |
    Where-Object {
      $_.Name -ieq $expectedExecutableName -or
      ($_.ExecutablePath -and $_.ExecutablePath -match ('\\WindowsApps\\' + [regex]::Escape($IdentityName) + '_'))
    }
)
if ($existingProcesses.Count -ne 0) { throw "Store preflight found an existing product/package process." }
if (@(Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort 47824 -State Listen -ErrorAction SilentlyContinue).Count -ne 0) {
  throw "Store preflight found an existing loopback listener on port 47824."
}
$proofPath = Join-Path $env:TEMP "retaillens-store-ui-proof"
if (Test-Path -LiteralPath $proofPath) { throw "Store preflight found existing UI proof state." }

$packageJson = Get-Content -LiteralPath (Join-Path $projectRoot "package.json") -Raw | ConvertFrom-Json
$packageVersion = [string]$packageJson.version
$versionParts = @($packageVersion.Split("."))
if ($versionParts.Count -ne 3 -or @($versionParts | Where-Object { $_ -notmatch '^\d+$' }).Count -ne 0) {
  throw "package.json version cannot be mapped to an AppX four-part version."
}
$appxVersion = "$($versionParts[0]).$($versionParts[1]).$($versionParts[2]).0"
$expectedAppxName = "RetailDecisionStudioByLAIZEYU-$packageVersion-x64.appx"
$appxFiles = @(Get-ChildItem -LiteralPath $workspaceCandidateRoot -File -Filter "*.appx")
if ($appxFiles.Count -ne 1 -or $appxFiles[0].Name -cne $expectedAppxName) {
  throw "Store build must produce exactly $expectedAppxName."
}
$unsignedAppx = $appxFiles[0]
if ($unsignedAppx.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
  throw "Unsigned Store AppX must not be a reparse point."
}
$unsignedSignature = Get-AuthenticodeSignature -LiteralPath $unsignedAppx.FullName
if (
  $unsignedSignature.Status -ne [System.Management.Automation.SignatureStatus]::NotSigned -or
  $unsignedSignature.SignerCertificate
) {
  throw "Store build output must be provably unsigned before the one run-owned temporary signature is applied."
}

$windowsKits = Join-Path ${env:ProgramFiles(x86)} "Windows Kits\10\bin"
$makeAppx = Get-ChildItem $windowsKits -Recurse -Filter makeappx.exe |
  Where-Object { $_.FullName -like '*\x64\makeappx.exe' } |
  Sort-Object FullName -Descending | Select-Object -First 1
$signTool = Get-ChildItem $windowsKits -Recurse -Filter signtool.exe |
  Where-Object { $_.FullName -like '*\x64\signtool.exe' } |
  Sort-Object FullName -Descending | Select-Object -First 1
if (-not $makeAppx -or -not $signTool) { throw "Windows SDK x64 MakeAppx/SignTool is missing." }

$runId = [Guid]::NewGuid().ToString("N")
$runRoot = Join-Path $runnerTemp "retaillens-store-$runId"
$manifestRoot = Join-Path $runRoot "manifest"
$candidatePath = Join-Path $runRoot $expectedAppxName
$cerPath = Join-Path $runRoot "sideload-test.cer"
$friendlyName = "RetailLens CI sideload $runId"
New-Item -ItemType Directory -Path $manifestRoot | Out-Null

$state = [ordered]@{
  schemaVersion = 1
  runId = $runId
  runRoot = $runRoot
  candidatePath = $candidatePath
  candidateSha256 = ""
  certificateThumbprint = ""
  certificateFriendlyName = $friendlyName
  identityName = $IdentityName
  publisher = $productionPublisher
  version = $appxVersion
  productVersion = $packageVersion
  applicationId = $expectedApplicationId
  executable = $expectedExecutable
  unsignedSourceDestroyed = $false
}
function Save-State {
  $temporaryStatePath = "$resolvedStatePath.tmp"
  if (Test-Path -LiteralPath $temporaryStatePath) {
    throw "Temporary Store state unexpectedly pre-exists."
  }
  try {
    $state | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $temporaryStatePath -Encoding utf8
    Move-Item -LiteralPath $temporaryStatePath -Destination $resolvedStatePath -Force
  } finally {
    Remove-Item -LiteralPath $temporaryStatePath -Force -ErrorAction SilentlyContinue
  }
}
Save-State

Invoke-RetailLensBoundedProcess `
  -FilePath $makeAppx.FullName `
  -ArgumentList @("unpack", "/p", ('"' + $unsignedAppx.FullName + '"'), "/d", ('"' + $manifestRoot + '"')) `
  -TimeoutSeconds 180 -Context "Store AppX manifest inspection" | Out-Null
[xml]$manifest = Get-Content -LiteralPath (Join-Path $manifestRoot "AppxManifest.xml") -Raw
$namespaces = [System.Xml.XmlNamespaceManager]::new($manifest.NameTable)
$namespaces.AddNamespace("f", "http://schemas.microsoft.com/appx/manifest/foundation/windows10")
$namespaces.AddNamespace("r", "http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities")
$identity = $manifest.SelectSingleNode("/f:Package/f:Identity", $namespaces)
$application = $manifest.SelectSingleNode("/f:Package/f:Applications/f:Application", $namespaces)
$displayName = $manifest.SelectSingleNode("/f:Package/f:Properties/f:DisplayName", $namespaces)
$publisherDisplayName = $manifest.SelectSingleNode("/f:Package/f:Properties/f:PublisherDisplayName", $namespaces)
$targetDeviceFamily = $manifest.SelectSingleNode("/f:Package/f:Dependencies/f:TargetDeviceFamily", $namespaces)
if (
  -not $identity -or -not $application -or
  $identity.Name -cne $IdentityName -or
  $identity.Publisher -cne $productionPublisher -or
  $identity.Version -cne $appxVersion -or
  $identity.ProcessorArchitecture -cne "x64" -or
  $application.Id -cne $expectedApplicationId -or
  ([string]$application.Executable).Replace("/", "\") -cne $expectedExecutable -or
  $displayName.InnerText -cne "Retail Decision Studio by LAI ZEYU" -or
  $publisherDisplayName.InnerText -cne "LAI ZEYU" -or
  -not $targetDeviceFamily -or
  $targetDeviceFamily.Name -cne "Windows.Desktop" -or
  $targetDeviceFamily.MinVersion -cne "10.0.17763.0" -or
  $targetDeviceFamily.MaxVersionTested -cne "10.0.26100.0"
) { throw "Store manifest exact identity/version/application/executable/display policy failed." }
$packageExecutable = Join-Path $manifestRoot $expectedExecutable
if (-not (Test-Path -LiteralPath $packageExecutable -PathType Leaf)) {
  throw "Literal Store executable is missing from the AppX."
}
& "$PSScriptRoot/windows-verify-pe-metadata.ps1" -ExecutablePath @($packageExecutable)
if (-not $manifest.SelectSingleNode("/f:Package/f:Capabilities/r:Capability[@Name='runFullTrust']", $namespaces)) {
  throw "runFullTrust capability is missing."
}
if (-not $manifest.SelectSingleNode("/f:Package/f:Capabilities/f:Capability[@Name='internetClient']", $namespaces)) {
  throw "internetClient capability is missing."
}
$languages = @($manifest.SelectNodes("/f:Package/f:Resources/f:Resource", $namespaces) | ForEach-Object { $_.Language })
$expectedLanguages = @("en-US", "zh-CN") | Sort-Object
if (
  $languages.Count -ne 2 -or
  @(Compare-Object $expectedLanguages ($languages | Sort-Object) -CaseSensitive).Count -ne 0
) { throw "Store languages are not the exact bilingual set." }
$capabilities = @(
  $manifest.SelectNodes("/f:Package/f:Capabilities/*", $namespaces) |
    ForEach-Object { $_.GetAttribute("Name") }
) | Sort-Object
if (
  $capabilities.Count -ne 2 -or
  @(Compare-Object @("internetClient", "runFullTrust") $capabilities -CaseSensitive).Count -ne 0
) { throw "Store capabilities are not the exact internetClient/runFullTrust set." }

$certificate = New-SelfSignedCertificate `
  -Type Custom `
  -Subject $productionPublisher `
  -FriendlyName $friendlyName `
  -CertStoreLocation "Cert:\CurrentUser\My" `
  -KeyAlgorithm RSA `
  -KeyLength 3072 `
  -HashAlgorithm SHA256 `
  -KeyExportPolicy NonExportable `
  -KeyUsage DigitalSignature `
  -NotAfter (Get-Date).AddDays(1) `
  -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3")
$state.certificateThumbprint = $certificate.Thumbprint.ToLowerInvariant()
Save-State
Export-Certificate -Cert $certificate -FilePath $cerPath | Out-Null
Import-Certificate -FilePath $cerPath -CertStoreLocation "Cert:\CurrentUser\TrustedPeople" | Out-Null
Copy-Item -LiteralPath $unsignedAppx.FullName -Destination $candidatePath
Invoke-RetailLensBoundedProcess `
  -FilePath $signTool.FullName `
  -ArgumentList @("sign", "/sha1", $certificate.Thumbprint, "/fd", "SHA256", ('"' + $candidatePath + '"')) `
  -TimeoutSeconds 180 -Context "Temporary non-exportable Store AppX signing" | Out-Null
$signature = Get-AuthenticodeSignature -LiteralPath $candidatePath
if (
  $signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid -or
  -not $signature.SignerCertificate -or
  $signature.SignerCertificate.Subject -cne $productionPublisher -or
  $signature.SignerCertificate.Thumbprint -cne $certificate.Thumbprint
) { throw "Prepared Store candidate signature is not exact and trusted." }
$state.candidateSha256 = (Get-FileHash -LiteralPath $candidatePath -Algorithm SHA256).Hash.ToLowerInvariant()
Save-State

$workspaceItem = Get-Item -LiteralPath $workspaceCandidateRoot -Force
if (
  -not $workspaceItem.PSIsContainer -or
  ($workspaceItem.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -or
  @(Get-ChildItem -LiteralPath $workspaceItem.FullName -Recurse -Force |
    Where-Object { $_.Attributes -band [System.IO.FileAttributes]::ReparsePoint }).Count -ne 0
) { throw "Unsigned Store source root is not a regular reparse-point-free directory." }
Remove-Item -LiteralPath $workspaceCandidateRoot -Recurse -Force
if (Test-Path -LiteralPath $workspaceCandidateRoot) { throw "Unsigned Store source remained in the workspace." }
$state.unsignedSourceDestroyed = $true
Save-State
Write-Host "Prepared one exact temporary-signed Store candidate at $candidatePath and destroyed the unsigned workspace source."

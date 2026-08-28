param(
  [Parameter(Mandatory = $true)] [string]$AppxPath,
  [Parameter(Mandatory = $true)] [string]$ExpectedExecutableSha256,
  [Parameter(Mandatory = $true)] [string]$EvidenceDirectory,
  [Parameter(Mandatory = $true)] [ValidateRange(1, 2)] [int]$Round
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$PSNativeCommandUseErrorActionPreference = $true

if (-not $IsWindows) { throw 'Store submission inspection must run on Windows.' }
if ($ExpectedExecutableSha256 -cnotmatch '^[0-9a-f]{64}$') {
  throw 'ExpectedExecutableSha256 must be one lowercase SHA-256 digest.'
}

. (Join-Path $PSScriptRoot 'windows-trusted-sdk-tool.ps1')

$expectedIdentity = 'LAIZEYU.RetailDecisionStudiobyLAIZEYU'
$expectedPublisher = 'CN=A5F91D0A-30C6-48EE-944F-B767FA872BE8'
$expectedExecutable = 'app\Retail Decision Studio by LAI ZEYU.exe'
$expectedVersion = '1.1.0.0'
$expectedAssets = [ordered]@{
  'StoreLogo.png' = @(50, 50)
  'Square44x44Logo.png' = @(44, 44)
  'Square150x150Logo.png' = @(150, 150)
  'Wide310x150Logo.png' = @(310, 150)
}

$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $projectRoot
$appx = (Resolve-Path -LiteralPath $AppxPath).Path
$appxItem = Get-Item -LiteralPath $appx -Force
if (
  $appxItem.PSIsContainer -or
  ($appxItem.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
  [IO.Path]::GetExtension($appx) -cne '.appx' -or
  (Split-Path -Leaf $appx) -cne 'RetailDecisionStudioByLAIZEYU-1.1.0-x64.appx'
) {
  throw 'Store submission candidate must be the exact expected 1.1.0 x64 AppX regular file.'
}
if (
  (Get-AuthenticodeSignature -LiteralPath $appx).Status -ne
    [Management.Automation.SignatureStatus]::NotSigned
) {
  throw 'Partner Center source AppX must remain unsigned; Microsoft signs it after certification.'
}
if (Test-Path -LiteralPath $EvidenceDirectory) {
  throw "Evidence directory already exists; refusing stale evidence: $EvidenceDirectory"
}
New-Item -ItemType Directory -Path $EvidenceDirectory | Out-Null
$evidenceRoot = (Resolve-Path -LiteralPath $EvidenceDirectory).Path
$runnerTemp = [IO.Path]::GetFullPath($env:RUNNER_TEMP).TrimEnd('\')
$workRoot = Join-Path $runnerTemp "retaillens-store-inspect-$Round-$([Guid]::NewGuid().ToString('N'))"
$unpackedRoot = Join-Path $workRoot 'unpacked'
$makeAppx = Get-RetailLensTrustedWindowsSdkTool -Name 'makeappx.exe'
$appxHashBefore = (Get-FileHash -LiteralPath $appx -Algorithm SHA256).Hash.ToLowerInvariant()
$sourceCommit = (& git rev-parse HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $sourceCommit -cnotmatch '^[a-f0-9]{40}$') {
  throw 'Source commit could not be resolved.'
}

function Assert-RetailLensNoReparsePoint {
  param([Parameter(Mandatory = $true)] [string]$Root)
  $items = @((Get-Item -LiteralPath $Root -Force)) +
    @(Get-ChildItem -LiteralPath $Root -Recurse -Force)
  $reparse = @($items | Where-Object {
    ($_.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0
  })
  if ($reparse.Count -gt 0) {
    throw "Unpacked Store candidate contains a reparse point: $($reparse[0].FullName)"
  }
}

function Get-RetailLensPngDimensions {
  param([Parameter(Mandatory = $true)] [string]$Path)
  $bytes = [IO.File]::ReadAllBytes($Path)
  if (
    $bytes.Length -lt 24 -or
    [BitConverter]::ToString($bytes[0..7]) -cne '89-50-4E-47-0D-0A-1A-0A'
  ) {
    throw "Store asset is not a valid PNG header: $Path"
  }
  return @(
    [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 16)),
    [Net.IPAddress]::NetworkToHostOrder([BitConverter]::ToInt32($bytes, 20))
  )
}

function Get-RetailLensRequiredSingleNode {
  param(
    [Parameter(Mandatory = $true)] [xml]$Document,
    [Parameter(Mandatory = $true)] [string]$XPath,
    [Parameter(Mandatory = $true)] [string]$Label
  )
  $nodes = @($Document.SelectNodes($XPath))
  if ($nodes.Count -ne 1) { throw "AppX manifest must contain exactly one $Label." }
  return $nodes[0]
}

$primaryError = $null
try {
  New-Item -ItemType Directory -Path $unpackedRoot | Out-Null
  & $makeAppx.FullName unpack /p $appx /d $unpackedRoot /o | Out-Host
  if ($LASTEXITCODE -ne 0) { throw "makeappx unpack failed with exit code $LASTEXITCODE." }
  Assert-RetailLensNoReparsePoint -Root $unpackedRoot

  if (Test-Path -LiteralPath (Join-Path $unpackedRoot 'AppxSignature.p7x')) {
    throw 'Unsigned Partner Center source unexpectedly contains AppxSignature.p7x.'
  }
  $forbiddenKeyMaterial = @(Get-ChildItem -LiteralPath $unpackedRoot -Recurse -File -Force |
    Where-Object { $_.Extension -in @('.pfx', '.p12', '.key', '.pem', '.cer', '.crt') })
  if ($forbiddenKeyMaterial.Count -gt 0) {
    throw "Store candidate contains certificate or key material: $($forbiddenKeyMaterial[0].FullName)"
  }

  $manifestPath = Join-Path $unpackedRoot 'AppxManifest.xml'
  [xml]$manifest = Get-Content -LiteralPath $manifestPath -Raw
  $identity = Get-RetailLensRequiredSingleNode -Document $manifest `
    -XPath "/*[local-name()='Package']/*[local-name()='Identity']" -Label 'Identity'
  $application = Get-RetailLensRequiredSingleNode -Document $manifest `
    -XPath "/*[local-name()='Package']/*[local-name()='Applications']/*[local-name()='Application']" `
    -Label 'Application'
  if (
    $identity.GetAttribute('Name') -cne $expectedIdentity -or
    $identity.GetAttribute('Publisher') -cne $expectedPublisher -or
    $identity.GetAttribute('ProcessorArchitecture') -cne 'x64' -or
    $identity.GetAttribute('Version') -cne $expectedVersion
  ) {
    throw 'AppX identity, publisher, architecture, or version differs from Partner Center.'
  }
  $displayName = Get-RetailLensRequiredSingleNode -Document $manifest `
    -XPath "/*[local-name()='Package']/*[local-name()='Properties']/*[local-name()='DisplayName']" `
    -Label 'Properties/DisplayName'
  $publisherDisplayName = Get-RetailLensRequiredSingleNode -Document $manifest `
    -XPath "/*[local-name()='Package']/*[local-name()='Properties']/*[local-name()='PublisherDisplayName']" `
    -Label 'Properties/PublisherDisplayName'
  if (
    $displayName.InnerText -cne 'Retail Decision Studio by LAI ZEYU' -or
    $publisherDisplayName.InnerText -cne 'LAI ZEYU'
  ) {
    throw 'Visible Store product or publisher identity is not exact.'
  }
  if (
    $application.GetAttribute('Id') -cne 'RetailDecisionStudio' -or
    $application.GetAttribute('Executable') -cne $expectedExecutable -or
    $application.GetAttribute('EntryPoint') -cne 'Windows.FullTrustApplication'
  ) {
    throw 'Store Application Id, executable, or entry point is not exact.'
  }

  $capabilities = @($manifest.SelectNodes(
    "/*[local-name()='Package']/*[local-name()='Capabilities']/*[local-name()='Capability']"
  ) | ForEach-Object { $_.GetAttribute('Name') } | Sort-Object)
  if ((Compare-Object @('internetClient', 'runFullTrust') $capabilities)) {
    throw 'Manifest capability inventory must be exactly internetClient and runFullTrust.'
  }
  $languages = @($manifest.SelectNodes(
    "/*[local-name()='Package']/*[local-name()='Resources']/*[local-name()='Resource']"
  ) | ForEach-Object { $_.GetAttribute('Language') } | Sort-Object)
  if ((Compare-Object @('en-US', 'zh-CN') $languages)) {
    throw 'Manifest language inventory must be exactly en-US and zh-CN.'
  }
  $deviceFamily = Get-RetailLensRequiredSingleNode -Document $manifest `
    -XPath "/*[local-name()='Package']/*[local-name()='Dependencies']/*[local-name()='TargetDeviceFamily']" `
    -Label 'TargetDeviceFamily'
  if (
    $deviceFamily.GetAttribute('Name') -cne 'Windows.Desktop' -or
    $deviceFamily.GetAttribute('MinVersion') -cne '10.0.17763.0' -or
    $deviceFamily.GetAttribute('MaxVersionTested') -cne '10.0.26100.0'
  ) {
    throw 'Manifest desktop device-family support differs from the reviewed Store policy.'
  }

  foreach ($assetName in $expectedAssets.Keys) {
    $assetPath = Join-Path $unpackedRoot "assets\$assetName"
    if (-not (Test-Path -LiteralPath $assetPath -PathType Leaf)) {
      throw "Required Store asset is missing: $assetName"
    }
    $dimensions = Get-RetailLensPngDimensions -Path $assetPath
    if (
      $dimensions[0] -ne $expectedAssets[$assetName][0] -or
      $dimensions[1] -ne $expectedAssets[$assetName][1]
    ) {
      throw "Store asset dimensions are wrong for $assetName."
    }
  }
  foreach ($locale in @('en-US.pak', 'zh-CN.pak')) {
    if (-not (Test-Path -LiteralPath (Join-Path $unpackedRoot "app\locales\$locale") -PathType Leaf)) {
      throw "Packaged Electron locale is missing: $locale"
    }
  }

  $storeExecutable = Join-Path $unpackedRoot $expectedExecutable
  if (-not (Test-Path -LiteralPath $storeExecutable -PathType Leaf)) {
    throw 'Store package main executable is missing.'
  }
  $storeExecutableHash = (Get-FileHash -LiteralPath $storeExecutable -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($storeExecutableHash -cne $ExpectedExecutableSha256) {
    throw 'The AppX executable differs from the exact packaged executable tested twice.'
  }
  & "$PSScriptRoot/windows-verify-pe-metadata.ps1" -ExecutablePath @($storeExecutable)

  $fuseText = (& node node_modules/@electron/fuses/dist/bin.js read --app $storeExecutable 2>&1 | Out-String)
  if ($LASTEXITCODE -ne 0) { throw 'Packaged Electron fuse inspection failed.' }
  foreach ($expectedFuse in @(
    'RunAsNode is Disabled',
    'EnableCookieEncryption is Enabled',
    'EnableNodeOptionsEnvironmentVariable is Disabled',
    'EnableNodeCliInspectArguments is Disabled',
    'EnableEmbeddedAsarIntegrityValidation is Enabled',
    'OnlyLoadAppFromAsar is Enabled',
    'LoadBrowserProcessSpecificV8Snapshot is Disabled',
    'GrantFileProtocolExtraPrivileges is Disabled',
    'WasmTrapHandlers is Enabled'
  )) {
    if (-not $fuseText.Contains($expectedFuse)) {
      throw "Packaged Electron fuse mismatch: $expectedFuse"
    }
  }

  $asarPath = Join-Path $unpackedRoot 'app\resources\app.asar'
  if (-not (Test-Path -LiteralPath $asarPath -PathType Leaf)) {
    throw 'Packaged app.asar is missing.'
  }
  $asarEvidencePath = Join-Path $evidenceRoot 'asar-inspection.json'
  & node scripts/inspect-store-asar.mjs $asarPath $asarEvidencePath
  if ($LASTEXITCODE -ne 0) { throw 'Packaged app.asar inspection failed.' }
  $asarEvidence = Get-Content -LiteralPath $asarEvidencePath -Raw | ConvertFrom-Json
  if (
    $asarEvidence.schemaVersion -ne 1 -or
    $asarEvidence.product -cne 'Retail Decision Studio by LAI ZEYU' -or
    $asarEvidence.author -cne 'LAI ZEYU（来泽宇）' -or
    $asarEvidence.version -cne '1.1.0' -or
    $asarEvidence.asarSha256 -cnotmatch '^[a-f0-9]{64}$' -or
    $asarEvidence.inventorySha256 -cnotmatch '^[a-f0-9]{64}$'
  ) {
    throw 'Packaged app.asar evidence is malformed.'
  }

  $files = @(Get-ChildItem -LiteralPath $unpackedRoot -Recurse -File -Force | Sort-Object FullName)
  if ($files.Count -lt 20 -or $files.Count -gt 20000) {
    throw "Unpacked file count is outside the reviewed bound: $($files.Count)"
  }
  $totalBytes = [long](($files | Measure-Object -Property Length -Sum).Sum)
  if ($totalBytes -le 0 -or $totalBytes -gt 1500MB) {
    throw "Unpacked byte count is outside the reviewed bound: $totalBytes"
  }
  $inventoryLines = @($files | ForEach-Object {
    $relative = [IO.Path]::GetRelativePath($unpackedRoot, $_.FullName).Replace('\', '/')
    if ($relative.StartsWith('../') -or [IO.Path]::IsPathRooted($relative)) {
      throw "Inventory path escaped the unpack root: $relative"
    }
    $hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    "$hash  $($_.Length)  $relative"
  })
  $inventoryPath = Join-Path $evidenceRoot 'unpacked-inventory.txt'
  [IO.File]::WriteAllText(
    $inventoryPath,
    ($inventoryLines -join "`n") + "`n",
    [Text.UTF8Encoding]::new($false)
  )
  $inventoryHash = (Get-FileHash -LiteralPath $inventoryPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $manifestHash = (Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
  $appxHashAfter = (Get-FileHash -LiteralPath $appx -Algorithm SHA256).Hash.ToLowerInvariant()
  if ($appxHashAfter -cne $appxHashBefore) { throw 'Inspection changed the source AppX bytes.' }

  [ordered]@{
    schemaVersion = 1
    round = $Round
    product = 'Retail Decision Studio by LAI ZEYU'
    author = 'LAI ZEYU（来泽宇）'
    publisherDisplayName = 'LAI ZEYU'
    storeProductId = '9NVNLQWQBKHD'
    identityName = $expectedIdentity
    publisher = $expectedPublisher
    version = $expectedVersion
    architecture = 'x64'
    applicationId = 'RetailDecisionStudio'
    executable = $expectedExecutable
    sourceCommit = $sourceCommit
    appxFile = (Split-Path -Leaf $appx)
    appxSha256 = $appxHashBefore
    manifestSha256 = $manifestHash
    executableSha256 = $storeExecutableHash
    asarSha256 = [string]$asarEvidence.asarSha256
    asarInventorySha256 = [string]$asarEvidence.inventorySha256
    unpackedInventorySha256 = $inventoryHash
    unpackedFileCount = $files.Count
    unpackedBytes = $totalBytes
    makeAppxSha256 = (Get-FileHash -LiteralPath $makeAppx.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    makeAppxFileVersion = [string]$makeAppx.VersionInfo.FileVersion
    createdAtUtc = [DateTime]::UtcNow.ToString('o')
  } | ConvertTo-Json -Depth 4 | Set-Content `
    -LiteralPath (Join-Path $evidenceRoot 'store-inspection.json') -Encoding UTF8
  Write-Host "Store submission static inspection round $Round passed: $appxHashBefore"
} catch {
  $primaryError = $_
} finally {
  if (Test-Path -LiteralPath $workRoot) {
    try {
      $resolvedWorkRoot = (Resolve-Path -LiteralPath $workRoot).Path.TrimEnd('\')
      $resolvedParent = [IO.Directory]::GetParent($resolvedWorkRoot).FullName.TrimEnd('\')
      if (
        -not [string]::Equals($resolvedParent, $runnerTemp, [StringComparison]::OrdinalIgnoreCase) -or
        (Split-Path -Leaf $resolvedWorkRoot) -notlike "retaillens-store-inspect-$Round-*"
      ) {
        throw 'Refusing cleanup outside the exact RUNNER_TEMP inspection root.'
      }
      Assert-RetailLensNoReparsePoint -Root $resolvedWorkRoot
      Remove-Item -LiteralPath $resolvedWorkRoot -Recurse -Force
      if (Test-Path -LiteralPath $resolvedWorkRoot) {
        throw 'Inspection cleanup did not remove its work root.'
      }
    } catch {
      if ($primaryError) {
        throw "Store inspection failed: $($primaryError.Exception.Message); cleanup also failed: $($_.Exception.Message)"
      }
      throw
    }
  }
}
if ($primaryError) { throw $primaryError }

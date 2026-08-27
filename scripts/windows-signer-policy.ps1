# Authored identity: LAI ZEYU（来泽宇）. Certificate CN remains one exact form.
function Assert-RetailLensAuthorOwnedSignerIdentity {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory = $true)]
    [string]$SimpleName,

    [Parameter(Mandatory = $true)]
    [string]$Subject,

    [string]$Context = "Windows executable"
  )

  $allowedAuthorNames = @("LAI ZEYU", "来泽宇")
  $allowedSimpleName = $allowedAuthorNames |
    Where-Object {
      [string]::Equals(
        $_,
        $SimpleName,
        [System.StringComparison]::Ordinal
      )
    } |
    Select-Object -First 1
  if (-not $allowedSimpleName) {
    throw "Signer SimpleName is not author-owned for ${Context}. Only exact LAI ZEYU or 来泽宇 is permitted; received: $SimpleName"
  }

  $commonNameMatches = [regex]::Matches(
    $Subject,
    '(?:^|[,;+]\s*)CN=([^,;+]+)',
    [System.Text.RegularExpressions.RegexOptions]::CultureInvariant
  )
  if ($commonNameMatches.Count -ne 1) {
    throw "Signer Subject must contain exactly one explicit CN for $Context."
  }
  $commonName = $commonNameMatches[0].Groups[1].Value
  if ($commonName.Length -ge 2 -and $commonName.StartsWith('"') -and $commonName.EndsWith('"')) {
    $commonName = $commonName.Substring(1, $commonName.Length - 2)
  }
  $allowedCommonName = $allowedAuthorNames |
    Where-Object {
      [string]::Equals(
        $_,
        $commonName,
        [System.StringComparison]::Ordinal
      )
    } |
    Select-Object -First 1
  if (-not $allowedCommonName) {
    throw "Signer Subject CN is not author-owned for ${Context}. Only exact LAI ZEYU or 来泽宇 is permitted; received: $commonName"
  }

  $organizationMatches = [regex]::Matches(
    $Subject,
    '(?:^|[,;+]\s*)(?:O|OU)=([^,;+]+)',
    [System.Text.RegularExpressions.RegexOptions]::CultureInvariant
  )
  foreach ($organizationMatch in $organizationMatches) {
    $organizationName = $organizationMatch.Groups[1].Value
    if ($organizationName.Length -ge 2 -and $organizationName.StartsWith('"') -and $organizationName.EndsWith('"')) {
      $organizationName = $organizationName.Substring(1, $organizationName.Length - 2)
    }
    $allowedOrganization = $allowedAuthorNames |
      Where-Object {
        [string]::Equals(
          $_,
          $organizationName,
          [System.StringComparison]::Ordinal
        )
      } |
      Select-Object -First 1
    if (-not $allowedOrganization) {
      throw "Third-party Signer Subject O/OU is forbidden for ${Context}; received: $organizationName"
    }
  }
}

# Security policy

## Supported version

Security fixes are maintained for the latest version on the `main` branch.

## Reporting a vulnerability

Please use the repository's
[private vulnerability reporting form](https://github.com/lzy2767865503-pixel/RetailLens-System/security/advisories/new).
Do not place API keys, private business data, customer data, or exploitable
details in a public issue.

## Deployment boundary

RetailLens 1.1 and its Windows distribution, **Retail Decision Studio by LAI
ZEYU**, are local/private applications bound to the stable origin
`http://127.0.0.1:47824`. A stable origin preserves the application's local
storage across restarts; exact Host, Origin, and Fetch Metadata validation
rejects DNS-rebinding and cross-site requests. The desktop shell denies
renderer permissions and non-local navigation, disables Node integration,
enables context isolation and sandboxing, and disables DevTools in production. The
bring-your-own-key API dialog is not designed for a shared, multi-user public
deployment. A public hosted service would require separate authentication,
secret management, tenant isolation, data-retention controls, abuse
protection, and a new security review.

The command-line server also accepts only an exact `127.0.0.1` Host (with an
optional valid TCP port), even when no desktop origin is supplied. This retains
local development and production-browser use while rejecting DNS-rebinding
Host headers.

## Secret handling

- Never commit `.env`, `.env.local`, API keys, access tokens, or private data.
- Only `.env.example` with empty placeholders belongs in source control.
- A browser-entered OpenAI key is held in current-page memory and is cleared
  on refresh or close.
- **About & privacy → Clear local data** removes the persisted business draft
  and model preference and clears the current in-memory key/report state.
- Rotate any credential that has been pasted into chat, screenshots, logs, or
  issue content.
- A Microsoft reviewer key belongs only in Partner Center's private
  certification notes. It must be dedicated, usage-limited, expiring, and
  independently revocable; the public certification-note template contains no
  credential.
- Public GitHub Windows executables require a publicly trusted, timestamped
  Authenticode signature whose certificate SimpleName and explicit Subject CN
  are exactly `LAI ZEYU` or `来泽宇`; any Subject O/OU must be the same exact
  author name, so a third-party signer Subject is forbidden. The app and
  uninstaller embedded by NSIS are rechecked before upload. Unsigned quality
  EXEs remain only on one ephemeral CI runner, are deleted after Round 2, and
  are never uploaded as workflow artifacts or release assets.

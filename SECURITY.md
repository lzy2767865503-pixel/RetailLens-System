# Security policy

## Supported version

Security fixes are maintained for the latest version on the `main` branch.

## Reporting a vulnerability

Please use GitHub private vulnerability reporting from the repository's
**Security** tab. Do not place API keys, private business data, customer data,
or exploitable details in a public issue.

## Deployment boundary

RetailLens 1.0 is a local/private application bound to `127.0.0.1`. The
bring-your-own-key API dialog is not designed for a shared, multi-user public
deployment. A public hosted service would require separate authentication,
secret management, tenant isolation, data-retention controls, abuse
protection, and a new security review.

## Secret handling

- Never commit `.env`, `.env.local`, API keys, access tokens, or private data.
- Only `.env.example` with empty placeholders belongs in source control.
- A browser-entered OpenAI key is held in current-page memory and is cleared
  on refresh or close.
- Rotate any credential that has been pasted into chat, screenshots, logs, or
  issue content.

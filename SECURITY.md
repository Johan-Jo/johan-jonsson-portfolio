# Security Policy

We take security seriously. If you believe you've found a vulnerability, please follow the process below.

## Reporting a Vulnerability
- Email: **security@yourdomain.tld**
- Please include steps to reproduce, impact, and any PoC.
- Do **not** open public GitHub issues for vulnerabilities.

We will acknowledge receipt within 2 business days and keep you updated on progress and timelines.

## Supported Versions
- Security fixes are applied to the `main` branch. Critical issues may be cherry-picked to the latest release if applicable.

## Handling Secrets
- Never commit secrets, tokens, or `.env` files.
- Use environment variables or a secrets manager (e.g., Vercel/Cloud secrets).
- Rotate credentials regularly and on suspected compromise.

## Dependency Security
- Run `pnpm audit` (or equivalent) weekly.
- High-severity issues must be addressed before release. CI blocks on high severity.
- Pin or replace risky packages; avoid post-install scripts.

## Authentication & Authorization
- All sensitive logic and authorization checks run on the **server**.
- Validate and sanitize inputs at API boundaries using a shared schema.
- Log and alert on repeated auth failures or suspicious activity.

## Responsible Disclosure
If you responsibly disclose a vulnerability, we will:
1. Confirm the issue and assess severity.
2. Prepare and ship a fix.
3. Credit you (if desired) in the release notes.


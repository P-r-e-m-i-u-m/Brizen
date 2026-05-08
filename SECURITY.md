# Security Policy

Please do not include secrets, tokens, credentials, private logs, or production customer data in issues, pull requests, generated docs, or workflow output.

## Reporting

For security-sensitive findings, open a minimal public issue without confidential details, or use a private channel if one is available.

## Project Expectations

- Secrets should stay in GitHub Actions secrets or local `.env` files.
- `.env.example` should document variable names without real credentials.
- Workflow logs should avoid printing secret values.
- Security fixes should include a short note in docs or the changelog when appropriate.

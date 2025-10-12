# Contributing

Thanks for helping improve this project! This doc explains how we work so changes stay fast, consistent, and safe.

## Getting Started
- **Requirements:** Node 20+, pnpm 9+, Git
- **Install:** `pnpm i`
- **Run dev:** `pnpm dev`
- **Typecheck:** `pnpm typecheck`
- **Lint/format:** `pnpm lint && pnpm format`
- **Tests:** `pnpm test` (unit/integration), `pnpm e2e` (Playwright)

> If you're new, read `README.md`, `docs/architecture.md`, and `docs/technical.md` first.

## Branching & Commits
- Branch names: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`, `docs/<scope>`
- Conventional Commits:
  - `feat: …`, `fix: …`, `refactor: …`, `docs: …`, `test: …`, `chore: …`
- One logical change per PR. Keep net diff **< 300 LOC** (excluding snapshots); bigger PRs require a short plan in the description.

## Pull Requests
- Use the PR template (auto-applies from `.github/`).
- Include a **Test Plan** and **Risk & Rollback**.
- **Approvals:** 1 reviewer; **2** for auth, security, or schema migrations.
- CI must pass: typecheck → lint/format → unit/integration → build → e2e smoke.

## Code Style & Patterns
- **TypeScript:** strict types; avoid `any` in public APIs.
- **React/Next.js:** single-responsibility components; ≤ 300 lines/file.
- **Design:** use tokens + shadcn/ui; avoid ad-hoc styles.
- **DRY:** prefer reusing existing utils/components over adding new ones.
- Update docs when behavior or public APIs change.

## Tests (policy summary)
- Unit tests for pure logic (utils, hooks, reducers) are **required** when touched.
- Integration tests required when touching IO (DB, external API, Next.js routes/actions).
- E2E (Playwright) required for new user flows and critical regressions.
- Coverage target: **~80% on changed files**. Don't chase global %.

## Data & Migrations
- Forward-only migrations. Avoid destructive changes.
- Include: migration file, (optional) backfill/cleanup script, downtime assessment.
- Use expand → migrate → switch → cleanup pattern.
- Coordinate with release/feature flags for risky changes.

## Dependencies
- Avoid adding new libraries unless justified. Note in PR "OK to add: <name>@<version>".
- No post-install scripts. Keep lockfile clean.
- Security: weekly audit; block high severity in CI.

## Secrets & Security
- Never commit secrets or `.env` files.
- Validate and sanitize all inputs server-side (shared schema, e.g., zod).
- Authorization checks on every server mutation.

## Observability
- Use structured logs with correlation IDs.
- Track p95 request latency, error rate, DB p95.
- Add traces around slow or critical spans.

## Issue Labels (lightweight)
- `type:bug`, `type:feat`, `type:refactor`, `type:docs`
- `risk:high`, `area:frontend`, `area:api`, `area:db`


# Testing Policy

This project uses TypeScript with unit, integration, and end-to-end (E2E) tests. The goals are:
- **Fast feedback** during development
- **Strong guardrails** against regressions
- **Pragmatism** (test what matters; avoid brittle tests)

---

## When Tests Are Required
- **Unit (required when logic changes):** utils, hooks, reducers, pure services.
- **Integration (required when I/O changes):** DB, external APIs, Next.js route handlers/server actions, auth/session flows.
- **E2E (required for new flows & critical fixes):** primary user journeys and previously regressed paths.

Coverage target: **≈80% on changed files**. Do not chase global %; prioritize risk and public surface areas.

---

## Commands
```bash
pnpm typecheck
pnpm lint && pnpm format
pnpm test            # unit + integration
pnpm e2e             # Playwright (E2E)
```

CI runs in this order: typecheck → lint/format → unit/integration → build → E2E smoke (on preview).

---

## Directory & Naming
```
src/
  feature/
    Component.tsx
    Component.test.tsx         # unit
    Component.integration.ts   # integration (optional)
    Component.stories.tsx      # storybook (if used)
tests/e2e/
  feature.spec.ts              # Playwright E2E
```

- Use `.test.ts` / `.test.tsx` for unit tests.
- Use `.integration.ts` for integration tests.
- Keep E2E specs in `tests/e2e`.

---

## Unit Tests (outline-first)
- **Arrange → Act → Assert**; keep tests small and focused.
- Prefer testing observable behavior over implementation details.
- Mock collaborators lightly; avoid deep/fragile mocks.

**Example (Vitest/Jest):**
```ts
describe("sum()", () => {
  it("adds two numbers", () => {
    expect(sum(2, 3)).toBe(5);
  });
});
```

---

## Integration Tests
- Exercise framework boundaries (HTTP/route handler/server action) instead of calling internals directly.
- Use a test DB/schema; run migrations in test setup; isolate data per test.
- Prefer real serialization (JSON) and realistic payloads.
- Do not hit the real internet; mock third-party APIs at the HTTP layer with contract fixtures.

**Minimal example (Next.js route handler):**
```ts
import { GET } from "@/app/api/users/route";

it("returns 200 with a user list", async () => {
  const req = new Request("http://localhost/api/users");
  const res = await GET(req);
  expect(res.status).toBe(200);
  const body = await res.json();
  expect(Array.isArray(body.users)).toBe(true);
});
```

---

## E2E Tests (Playwright)
- Cover the happy path for each major flow and one critical regression.
- Keep specs independent; reset state between tests (fixtures/seeds).
- Prefer running against a preview deployment.
- Use `data-testid`s only when semantic selectors aren't reliable.

**Example snippet:**
```ts
import { test, expect } from "@playwright/test";

test("user can sign in and see dashboard", async ({ page }) => {
  await page.goto(process.env.APP_URL!);
  await page.getByRole("button", { name: /sign in/i }).click();
  // ... sign in flow ...
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
});
```

---

## Mocks, Fixtures & Test Data
- Keep fixtures small and representative; colocate with tests.
- For external APIs, define contract fixtures (canonical request/response pairs) and reuse them.
- Use factories/builders for complex entities; avoid giant JSON blobs.

---

## Accessibility & Performance (light checks)
- For changed UI components, add at least one a11y assertion (e.g., axe) to ensure no critical violations.
- For key pages, include a simple performance smoke (bundle diff under budget, basic LCP in CI when available).

---

## Flaky Tests
- Mark with `@flaky` and link an issue.
- Quarantine only if blocking the team; never silently ignore failures.
- Investigate within the sprint; remove `@flaky` once stabilized.

---

## Data & Migrations
Each migration PR must include a test plan:
1. Apply migration to a fresh test schema
2. Backfill (if applicable) on a sample dataset
3. Validate forward-only; avoid destructive down migrations

Prefer **expand → migrate → switch → cleanup**.

---

## CI Expectations
- Failing tests block merges.
- New/changed logic without tests will be flagged in review.
- Snapshots: keep small and intentional; avoid massive DOM snapshots.

---

## Tips
- If a bug slips through, first add a failing test, then fix.
- One primary expectation per test; keep assertions clear.
- Avoid testing library internals or React implementation details.


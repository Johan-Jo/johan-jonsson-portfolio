# Observability

We instrument logs, metrics, and traces so we can detect issues quickly, understand impact, and improve the product with data.

---

## Goals & Budgets
- **API latency:** p95 < 300ms per route
- **Frontend:** LCP < 2.5s (3G emulation) on key pages
- **Errors:** < 1% error rate per route
- **DB:** p95 query time tracked; investigate outliers > 300ms

These are budgets—changes should respect them or include a clear justification.

---

## Environments
- **Local/dev:** verbose logs allowed, sampling off
- **Preview:** near-prod behavior; sampling on; used for E2E
- **Prod:** structured logs, sampling per budget, alerting enabled

---

## Logging (structured)
Server logs must be JSON and include a correlation/request ID to tie cross-service events together.

- Don't log secrets or PII. Prefer IDs/hashes over raw values.
- Suggested fields: `ts`, `level`, `rid`, `route`, `msg`, `ms`, `userId` (hashed), `error`

**Example (Next.js route handler):**
```ts
import { randomUUID } from "crypto";

export async function GET(req: Request) {
  const rid = req.headers.get("x-request-id") ?? randomUUID();
  const log = (level: "info"|"error", msg: string, extra: Record<string, unknown> = {}) =>
    console.log(JSON.stringify({ ts: Date.now(), level, rid, msg, ...extra }));

  const t0 = Date.now();
  try {
    log("info", "users:get:start");
    // handler work...
    log("info", "users:get:success", { ms: Date.now() - t0 });
    return new Response(JSON.stringify({ ok: true }), { headers: { "x-request-id": rid }});
  } catch (e) {
    log("error", "users:get:error", { err: String(e) });
    return new Response("Internal Error", { status: 500, headers: { "x-request-id": rid }});
  }
}
```

---

## Metrics
Track at minimum:
- **API:** requests, errors, latency (p50/p95), timeouts
- **DB:** query count, latency (p95), slow query count
- **Frontend:** Web Vitals (LCP, CLS, INP), JS bundle size diff
- **Caching:** hit ratio (if applicable)
- **Workers/queues:** throughput, DLQ size (if applicable)

Export Web Vitals (e.g., Next.js `reportWebVitals`) to your metrics backend.

---

## Tracing
- Use OpenTelemetry (OTel) or your APM provider to trace API → DB spans.
- Add spans for critical sections (auth, pricing, report generation).
- Include attributes like `user.id` (hashed), `route`, `org.id` where relevant.
- Sample smartly (higher sample rate on errors/slow requests).

**Example pseudo-code:**
```ts
import { trace } from "@opentelemetry/api";
const tracer = trace.getTracer("app");

await tracer.startActiveSpan("user.lookup", async (span) => {
  try {
    span.setAttribute("user.lookup.method", "byEmail");
    const user = await db.user.findByEmail(email);
    span.setStatus({ code: 1 }); // OK
    return user;
  } catch (e) {
    span.recordException(e as Error);
    span.setStatus({ code: 2, message: "lookup failed" });
    throw e;
  } finally {
    span.end();
  }
});
```

---

## Dashboards
Create product-centric dashboards:
- **Backend:** latency (p50/p95) & error rate by route; throughput; slow queries
- **Frontend:** LCP/CLS/INP by page; bundle size over time; user/session counts
- **Releases:** annotate with commit/PR; correlate metric changes to deploys

---

## Alerts (suggested)
- Error rate > 2% for 5 min on any route
- p95 latency > budget for 10 min
- DB p95 > 300ms sustained
- Web Vitals: LCP median > 3s for 15 min on a key page

Alerts should link to:
- Relevant dashboard panel
- Recent deploys/PRs
- Runbook entry

---

## Runbooks
For each critical alert, maintain a short runbook:
- **Symptom:** what the alert means
- **Likely causes:** top 3
- **Immediate actions:** e.g., roll back, disable feature flag, scale DB
- **Validation:** how to confirm recovery
- **Owner:** team/contact

---

## Privacy & PII
- Do not log secrets or raw PII.
- Hash or tokenize user identifiers when needed for correlation.
- Redact sensitive fields in error logs.

---

## Release Checklist (observability)
- ☑ New endpoints log start/success/error with correlation ID
- ☑ Metrics registered and visible on the dashboard
- ☑ Traces show API→DB spans for the new/changed path
- ☑ 30-min post-deploy watch for regressions

---

## Notes
- Prefer fewer, richer logs over noisy debug spam.
- If you add a metric, add a graph and (if critical) an alert.
- Document new dashboards/alerts in the PR description.


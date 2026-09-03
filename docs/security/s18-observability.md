# S18 — Observability / Security Events (COMPLETE 2026-09-03)

## What changed

- **`services/securityLog.js` (new):** single `secEvent(type, req, fields)`
  emitting one-line JSON per security outcome:
  `{ts, event, reqId, uid, ip, method, path, result, …}` — query strings
  stripped, payloads scrubbed, unknown types rejected. Non-request contexts
  (runner pool) use `{principal}`.
- **Wired denial paths:** `auth.fail` (every strict reject, reason log-only),
  `authz.deny` (all 11 ownership gates via `denyAuthz` + admin gate),
  `ratelimit.hit` (tier limiter + review cooldown), `ai.throttle`,
  `runner.rejected` (pool saturation + service I/O caps, route + service),
  `admin.action` (quotes refresh with count). Logging can never break the
  decision (try/catch at every site); frozen 401/403 bodies unchanged.
- **Never-log enforced:** unit-scrubbed hostile meta + static guard (no console
  statement touches authorization headers or non-origin header access).

## Proofs (8 tests)

Record shape, scrub matrix, principal contexts, emission on all five denial
families (both auth gates separately), static header guard. Live: real
`auth.fail` record observed in dev logs. Suite 190/190.

## Residual / hand-off

- Operational log (requests, cache, AI progress) stays unstructured console —
  deliberately out of scope; security outcomes are the structured subset S18
  required. Full log-schema migration is future work, not a gap in this phase.
- IP is logged for abuse response (ops-only audience per deployment docs).
- SIEM mapping (from S0, now live): auth.fail → SEC-02/03; authz.deny →
  SEC-04/06/23; ratelimit.hit → SEC-08/20/26; ai.throttle → SEC-11;
  runner.rejected → SEC-07/08/09; admin.action → SEC-16/17/21.

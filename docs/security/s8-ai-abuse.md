# S8 — AI Abuse / Cost Protection (COMPLETE 2026-09-03)

## Controls (no new deps, no architecture change)

| Control | Where | Rule |
|---|---|---|
| Per-user op-class quota | `aiLimit()` route middleware (after validate) | heavy 4/min, standard 12/min per uid, rolling 60s |
| Prompt-size budget | same middleware (body-length estimate) | 120k chars/min per uid |
| Global ceiling | same middleware | 30 AI requests/min hard reject (was: blocking `wait()` that parked ALL users behind one flood — removed as a DoS amplifier) |
| Concurrency | `callAI` slot (8 global, fail-fast, no queue) | saturated → 429, never stacked 45s timeouts |
| Retry discipline | `callAI` | max 3 attempts/request, jittered backoff, never retry boundary refusals or our own overload |
| Error mapping | `sendAiError` in all 18 AI catch sites | overload → 429 + Retry-After; refusal → 400; else safe 500 (also drops the `details: error.message` leak) |

Classes — heavy: problem-help, edge-cases, test-cases, solution, analyze-code,
custom/company-problem. Standard: similar, description, learning-notes, debrief,
problems/* AI endpoints, quotes/refresh. `forceRefresh`/`edge_cases_only` bypasses
remain allowed but each call consumes quota like any other (no free bypass).

Attacker math (worst case): 4 heavy req/min × 3 attempts = 12 provider calls/min
per user, each size-capped — versus unbounded before. Global ceiling + concurrency
cap bound the multi-user aggregate.

## Proofs (12 tests)

- Window/refill/class/user isolation, char budgets, global ceiling, middleware
  429 + Retry-After, error mapping without leaks, retry boundedness (2×429 then
  success = 3 calls; persistent 429 = exactly 3 calls then throw; blocking
  limiter provably untouched).
- HTTP flood: 6× heavy as A → 200×4 then 429×2; B unaffected; A's standard class
  unaffected; 429 carries Retry-After, no `details`.
- Suite 127/127 ×3. Full-suite runner flake (parallel IPC deserialization under
  JVM-heavy load, victim varied, logic always green) fixed by
  `--test-concurrency=2` in `npm test`.

## Residual / hand-off

- IP-level limits need trust-proxy discipline → S14. Per-endpoint token budgets
  use char estimates (≈tokens/4); provider-side usage metering → ops.
- `internal:ai` validation calls share the 8-slot concurrency pool with nothing
  else, but are NOT per-user quota-checked at the route (they ride checked
  requests) — cron-triggered refresh is the only unquoted path (1×/day).
- `npm test --test-concurrency` flag needs Node ≥20 for local/CI runs;
  the Node 18 production base predates the suite and is slated for upgrade (S16).
  Heavy JVM files still make the suite ~55s; S19 should shard the attack corpus.

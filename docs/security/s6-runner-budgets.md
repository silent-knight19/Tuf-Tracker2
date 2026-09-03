# S6 — Runner Resource Exhaustion (COMPLETE 2026-09-03)

## Budgets (enforced)

| Budget | Value | Layer |
|--------|-------|-------|
| Global concurrent executions | 4 | `runner.pool` (in-process) |
| Concurrent jobs per principal (uid / `internal:ai`) | 2 | pool |
| Queue length (global) | 20, then immediate retryable reject | pool |
| Queue wait | 60s, then retryable reject | pool |
| Compile wall-clock | 25s + `-k 5s` kill (Linux) / 25s Node | S5 (unchanged) |
| Run wall-clock | 10s + `-k 3s` kill (Linux) / 12s Node | S5 (unchanged) |
| Heap / stack / direct-mem | 64m / 256k / 16m | S5 (unchanged) |
| Source / stdin / class-count / sandbox-bytes / output | 100K / 256K / 64 / 10MB / 100K×2 | S5 (unchanged) |

Constants live in code (`runner.pool.js`), deliberately not env: silently raising
them via dashboard is a worse failure mode than a code-reviewed diff.

## Design

- Admission happens in `runJava` BEFORE any work (compile included) via
  `acquire(principal)`. Principals: token uid (HTTP), `internal:ai` (both AI
  validation paths — `validateSolutionAgainstExamples`, `computeEdgeCaseOutputs`
  — so AI retry storms also consume bounded budget), `anonymous` fallback.
- Overload never throws: `{stage:'queued', retryable:true}` → route maps to
  **429 + `Retry-After: 5`**. Queue-full and queue-timeout both degrade this way.
- Dispatch scans FIFO for the first runnable waiter (global + principal headroom),
  so one principal's backlog cannot head-of-line-block others (tested).
- Release is idempotent, in `finally`, and also covers crash paths. Queue timers
  are NOT unref'd: a waiter is real pending work and its promise must settle
  (an unref variant deadlocked synthetic tests — documented trap).
- No Node-timeout-only reliance: kernel `timeout -k` (Linux) sits under every
  execution; the pool bounds parallelism, which timeouts alone cannot do.

## Proofs

- 6-job benign volley (real JVM): all exit 0, pool drains to 0/0.
- 4-job parallel heap-bomb volley: all OOM fast (<60s total), pool drains.
- Saturation (global ceiling filled): next job returns `queued/retryable`
  without executing; HTTP mapping returns 429 + Retry-After (harness test).
- Synthetic pool tests: global ceiling, per-principal fairness under backlog,
  immediate queue-full reject, waiter timeout, idempotent release.
- Suite 106/106 green (3 consecutive runs).

## Residual / hand-off

- In-process caps don't survive multi-instance deploys (Render can run N
  instances) and aren't cgroup-hard: a determined attacker rents parallelism
  across instances. True enforcement needs the S17 isolated-runner track
  (PID/mem/CPU cgroups) and S14 per-user rate limits.
- `internal:ai` shares one 2-slot budget across all AI validation — correct for
  cost, but a burst of AI-heavy requests will 429 user code runs behind them;
  S8/S14 should split or prioritize pools.

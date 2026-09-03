# S15 — Cron / Background Jobs (COMPLETE 2026-09-03)

## What changed (quote refresh pipeline only — the sole mutating job)

- **Single-flight:** concurrent triggers (midnight cron + startup catch-up +
  manual admin) share one `_inFlight` promise — one AI spend, one wipe+rewrite,
  no interleaved batches. A failed run clears the lock (proven: next trigger
  retries instead of wedging).
- **Freshness idempotency:** `{force:false}` (cron, startup) skips when the
  newest quote is <20h old, returning the current collection (contract
  preserved); empty collections still rebuild; `{force:true}` (manual admin)
  always runs. No retries by design — failures log; the next trigger or a
  deliberate manual run handles them. No retry storms, ever.
- **Run budget:** 180s race cap (unref'd backstop timer — an earlier version
  pinned the test process for 3 minutes; documented trap), run IDs on every
  log line (start/skip/done/fail with reason + counts).
- **Keep-alive (S13 work, re-verified):** bounded fetch, no redirects, 64KB cap.

## Proofs (6 tests)

Triple-concurrent refresh → 1 AI call + 3 docs; fresh skip spends zero;
force bypasses; stale/empty rebuild; failure→retry; HTTP manual path (200 +
count) and public read; cron-wiring static guard. Suite 169/169.

## Residual / hand-off

- Single-flight is **in-process**: multi-instance deploys (Render can run N)
  can still double-spend/race — needs a distributed lock (Firestore transaction
  marker) or single-instance cron → S17/ops.
- Quote-write schema validation was S7; freshness + locks were the S15 gap.
- `updateCompanyDatabase` (shared JSON write on problem POST) is still
  lockless file mutation from request paths — flagged S3, belongs to S16/S17
  (remove file writes from request path or serialize them).

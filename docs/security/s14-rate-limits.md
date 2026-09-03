# S14 — Rate Limiting / Abuse Prevention (COMPLETE 2026-09-03)

## Tiers (`middleware/rateLimit.js`, zero new deps)

| Tier | per-user/min | per-IP/min | global/min | Applied to |
|------|--------------|------------|------------|------------|
| pre | — | 1000 | 20000 | all `/api/*` BEFORE auth (verify-cost shield) |
| public | — | 120 | 2000 | health-adjacent public GETs (quotes, run/status) |
| standard | 120 | 1000 | 5000 | default authenticated traffic, `/me` |
| create | 15 | 60 | 500 | problem/revision POST, analyze (AI+write cost) |
| scan | 30 | 200 | 1000 | analytics ×8, company ×4 (full scans) |
| review | 60 | 300 | 2000 | review submit (flood net; S12 cooldown is primary) |
| execute | 20 | 100 | 300 | code run/test/debug (pool is primary; stops queue churn) |

AI routes keep their `aiLimits` quotas (per-op-class + token budgets) instead of
a redundant tier. Order everywhere: authenticate → validate → [aiLimit] →
limitTier → handler, so 401 precedes 400 precedes 429 and junk consumes only
the pre-auth IP valve.

## Semantics

- Rolling 60s windows, first-exhausted-layer 429 with `Retry-After` +
  IETF `RateLimit-Limit/Remaining/Reset` on pass AND block. The frontend
  `rateLimitStore` already reads these headers — previously phantom, now live
  (AI paths emit them too via `aiLimit`).
- Keyspace bounded (10k reset; quotas are advisory, resets are safe).
- `trust proxy: 1` (S10) makes `req.ip` spoof-proof under Render's single hop;
  multi-proxy topologies must recount hops before relying on IP keys.

## Proofs (8 tests)

Window/layer/refill unit tests, header contract, pre-auth valve without
identity, HTTP floods: create 15×201 then 429 (B fine), scan 30×200 then 429,
raw-header assertions. Suite 163/163. Live: 401-before-tier ordering verified.

## Residual / hand-off

- Instance-local counters don't span multi-instance deploys (shared-counter or
  platform WAF → S17/ops). Distributed floods need L3/L7 protection — stated,
  not solved, here.
- IP caps are roomy by design (shared NAT/egress); per-user caps do the work.
- `express-rate-limit` remains installed-but-unused; removal/adoption decision
  → S16 (avoid churning two implementations mid-project).

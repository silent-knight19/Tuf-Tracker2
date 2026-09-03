# S2 — Authentication Hardening (COMPLETE 2026-09-03)

## What changed

- `backend/middleware/auth.middleware.js` is now the single strict-auth implementation:
  `authenticate` (default), `authenticateWithSessionCheck` (revocation + disabled),
  `requireAdmin` (server-side `ADMIN_EMAILS` allowlist, deny-closed), hardened
  `softVerifyToken` (canonical parse, never throws, never authorizes).
- `backend/routes/auth.routes.js` re-exports the hardened `authenticate` as
  `verifyToken` — all ~45 existing route usages inherit the fix with no per-route edits.
- `GET /api/run/test`, `GET /api/run/debug` → authenticated (were anonymous CPU/info).
- `POST /api/quotes/refresh` → `authenticateWithSessionCheck` + `requireAdmin`.
- `backend/server.js`: removed dead `verifyToken` import.
- S1 validator extended: `ADMIN_EMAILS` optional, format-checked (fatal when malformed/
  placeholder); unset-in-prod warns (routes deny closed regardless). `.env.example` updated.
- Tests: `backend/tests/auth.middleware.test.js` (25 tests) + 3 `ADMIN_EMAILS` validator
  tests. Suite total 49/49 green. Live adversarial matrix verified (see below).

## Route classification (enforced)

| Class | Middleware | Routes |
|-------|-----------|--------|
| PUBLIC | none | `GET /health`, `GET /api/run/status`, `GET /api/quotes` |
| AUTHENTICATED | `authenticate` | everything under `/api/problems`, `/api/revisions`, `/api/analytics`, `/api/company`, `/api/ai`, `GET /api/auth/me`, `POST /api/run/java`, `GET /api/run/test`, `GET /api/run/debug` |
| ADMIN | `authenticateWithSessionCheck` + `requireAdmin` | `POST /api/quotes/refresh` |
| OWNER | `authenticate` + per-doc `userId` check | `problems/:id`, `revisions/:id` item routes (ownership fixes → S3) |
| SYSTEM | none (in-process) | cron jobs (scoping/locks → S15) |

Soft auth (`softVerifyToken`, global on `/api/*`) is for logging/future rate-limit
whitelisting only. A static test fails the build if any file under `backend/routes/`
references it.

## Audit verdicts

- **Header parsing:** strict `Bearer <JWT>` grammar (RFC 6750 case-sensitive scheme,
  single token, JWT 3-segment shape). Old `split('Bearer ')[1]` accepted embedded-scheme
  strings like `Token Bearer x` — now `malformed`. Wrong token types (API keys, OAuth
  tokens, garbage) rejected as `wrong-type` before any crypto.
- **Signature/expiry:** Firebase Admin `verifyIdToken` (RS256, Google certs). Expired → 401.
- **Audience/issuer:** asserted explicitly against the configured project
  (`aud == projectId`, `iss == https://securetoken.google.com/<pid>`, resolved from the
  validated service account — never from the token). Wrong-project → 401.
- **Revocation:** standard routes rely on signature+expiry (1h token lifetime); full
  session enforcement (`verifyIdToken(token, true)` + `getUser` disabled check) on ADMIN
  routes. Rationale: per-request user lookups on every call would add an Admin API
  round-trip to all traffic; revocation takes effect within the token lifetime on
  standard routes and immediately on high-impact routes. Documented residual, not a gap.
- **Disabled users:** enforced on session-checked routes; standard routes inherit the
  same lifetime bound as revocation.
- **Clock skew:** Node Admin SDK exposes no clock-tolerance knob; `exp` enforced against
  server time, Firebase clients refresh ~5 min early. No custom leeway added (avoiding
  widening the acceptance window by hand).
- **Failure behavior:** uniform `401 {"error":"Unauthorized"}` / `403 {"error":"Forbidden"}`;
  machine reasons (`missing|malformed|wrong-type|expired|revoked|disabled|project-mismatch|
  invalid|not-admin`) go to server logs only. Live-verified: no oracle across classes.
- **Transport:** Bearer-in-header only (no cookies) → classic CSRF not applicable; CORS
  exposure itself is S10's job (SEC-01 still open).

## Live verification (dev server, 2026-09-03)

`run/test` 401 · `run/debug` 401 · `run/status` 200 (public by design) ·
`quotes/refresh` 401 (anon) · `problems` 401 (compat intact) ·
`Token Bearer …` / `Bearer sk-…` / `bearer …` / tampered-JWT → uniform 401.

## Residual for later phases

- `similar-problem` IDOR + `auth/me` spread + cross-user matrix → S3. AI/runner quotas → S8/S14.
  Client-side `VITE_WHITELISTED_EMAILS` cooldown bypass is cosmetic only (server enforces
  nothing today) → S8/S14. Cron locks/tenant scope → S15. Standard-route revocation bound
  (≤1h) accepted; revisit with token-cache design if threat model demands.

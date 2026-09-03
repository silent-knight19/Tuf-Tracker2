# S10 — CORS / CSRF / HTTP Security (COMPLETE 2026-09-03)

## What changed

- **CORS fail-closed** (`config/cors.policy.js`, pure + tested). The deny branch
  denied nothing before (proven live: `evil.test` got ACAO + credentials); now it
  errors. Rules: exact-match allowlist only; production allowlist is exactly
  `{ FRONTEND_URL }` (dev loopback entries are non-prod-only — a test caught them
  leaking into prod); loopback-any-port by parsed hostname, dev-only (prefix tricks
  like `http://localhost:5173.evil.test` fail); missing origin allowed (non-browser;
  safe: Bearer-only, no cookies); `credentials:true` pairs only with exact origins.
- **Helmet tightened:** API-only CSP (`default-src 'none'`, `frame-ancestors 'none'`,
  no base/object/form), HSTS 1yr + preload, explicit `Permissions-Policy`
  (camera/mic/geo/payment/usb off). `trust proxy: 1` set (Render one-hop; S14 builds on it).
- **`Retry-After` exposed** (actually sent on 429s now); phantom `X-RateLimit-*`
  exposure removed.
- **Frontend (`vercel.json` headers):** full CSP (`script-src 'self'` + Monaco's
  `cdn.jsdelivr.net` — no `unsafe-inline`; `frame-ancestors 'none'`; tight
  img/font/connect/worker lists), HSTS, nosniff, DENY framing, no-referrer,
  Permissions-Policy. CDN allowlist is the documented trade-off (self-hosting
  Monaco → S16/S17 asset work).
- **CSRF:** Bearer-only confirmed by static test (zero cookie code paths) — no
  tokens needed, nothing to steal ambiently; CORS was the actual cross-site
  control and is now real.

## Proofs

- Origin matrix unit tests (dev + prod, incl. prefix/DNS-rebinding shapes, `null`
  origin, non-URLs) + options-wiring + helmet-option tests + vercel.json policy
  test (no `unsafe-inline` scripts, `frame-ancestors 'none'`, DENY, HSTS).
- Live: evil preflight AND simple GET carry zero ACAO; allowed origin gets exact
  ACAO; response headers verified on the wire.
- Backend 127+6 suite + frontend 31/31 (below).

## Residual / hand-off

- Single `FRONTEND_URL` (S1-validated): Vercel preview deployments need manual
  allowlisting — multi-origin support is a deliberate future, not an accident.
- Missing-origin allowance is correct only while auth stays Bearer-only; any
  cookie introduction must revisit S10 (guard test will flag the code, not the
  decision — documented here).

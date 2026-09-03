# SECURITY-BASELINE.md (S0 — reconnaissance only, no code changed)

## Current architecture

- Frontend: React (installed 19.2.0; README claims 18), Vite, Zustand, React Router 7, Tailwind, Recharts, Monaco, `react-markdown` + `remark-gfm` (no sanitizer), Firebase client (Auth + Firestore). Deployed on Vercel (`frontend/vercel.json` = SPA rewrite, no security headers).
- Backend: Express 5.2.1 (`backend/server.js`), Firebase Admin (Auth + Firestore god-mode), Groq Cloud via OpenAI SDK (`qwen/qwen3.8-27b`), in-process Java runner (`javac`/`java` via `bash`+`ulimit`+`timeout`), `node-cron` (keep-alive + daily quotes). Dockerized (`node:18-slim` + `openjdk-17`, root user) on Render (`render.yaml`); local dev port 5001 vs Render/Docker 3001.
- Data: Firestore top-level `problems`, `revisions`, `users`, `ai_cache_*`, `quotes`; preloaded JSON in `backend/data/`; **no `firestore.rules` in repo**; no backend tests.

## Trust boundaries

1. Browser → Express API (Bearer Firebase ID token; soft-global + strict-per-route; CORS fail-open).
2. Express → Firebase Auth (`verifyIdToken` only; no revocation/aud-pin in app code).
3. Express → Firestore (Admin god-mode; app-level `userId` checks, uneven).
4. Express → AI provider (any-auth-user, raw prompts, shared 30/min queue, retries, cache bypasses).
5. Express → Java toolchain (auth on main endpoint only; file-write + spawn; Linux-only partial limits).
6. Java runner → OS (same root container, network + FS open, secrets in env).
7. Cron → app data (god-mode; any-user refresh; AI-JSON spread; no locks).
8. Container → host (root, no caps/FS/seccomp/resource limits; health check miswired).
9. Internet → backend (no rate limits; Helmet defaults only).

Per-boundary authN/authZ/validation/limits/failure/logging: see `docs/security/threat-model.md` §2.

## Critical assets

Firebase service-account key; Groq API key; Firestore user data (problems/revisions/notes/code/XP/streak); backend host/container; AI quota + shared AI caches; quotes collection.

## Attack surfaces

- 40+ endpoints inventoried (`docs/security/threat-model.md` §4): public anon-CPU paths (`/run/status|test|debug`, `/quotes`, `/health`); IDOR-holed `similar-problem`; wrong-collection + mass-assignment `generate-description`; unbounded AI/code/notes inputs; full-scan analytics; any-user quote wipe+spend.
- Runner: arbitrary Java as root with network/FS/secrets; anonymous burn via `/test`.
- AI: 12 endpoints, prompt injection surface in every field, output executed (runner) + rendered (HTML).
- Web: unsanitized Markdown + one `dangerouslySetInnerHTML` (AI HTML), no CSP.
- Platform: CORS fail-open + `credentials:true`; `express-rate-limit` installed but unused; errors return `err.message`/`details`; secrets fail-open boot; root Docker image; Node 18 base.

## Authentication model

Firebase ID tokens via `Authorization: Bearer`. Global `softVerifyToken` enforces nothing (by design); strict `verifyToken` (housed in `routes/auth.routes.js`, fragile `split('Bearer ')`) guards data routes today — safe-but-fragile ordering with bypass-by-omission risk. No revocation/disabled-user check, no explicit issuer/audience assertion, no token cache (verify per request).

## Authorization model

Ownership = `doc.userId === req.user.uid` enforced in code on most `problems/revisions/analytics/company` paths (good where present). Gaps: `similar-problem` (none), `generate-description` (wrong collection + body spread), revision-create (`problemId` optional), quote-refresh (any user = admin), `auth/me` response spread (doc overrides identity fields client-side). Direct client-SDK path unverified (no rules file).

## Firestore model

Top-level collections with `userId` tenant field (except `users/{uid}` and global `quotes`/`ai_cache_*` keyed by title). Server-controlled fields (XP/streak/schedules/timestamps) are server-computed on the review path (good) but unenforceable client-side without rules. `ai_cache_*` shared cross-user by normalized title (poisoning vector).

## AI data flow

User/problem content → raw string interpolation → Groq (`callAI`, 45s timeout, ×2 retry) → `parseJSON` → shared Firestore cache → client render / runner execution (validation + edge-case compute execute solution code). Uncached high-cost paths: `custom/company-problem`, `analyze-code`, debrief, `edge_cases_only`. Prompt prefixes logged. No egress allowlist; secrets/keys must never enter prompts (unenforced today except by convention).

## Code-runner data flow

`source (+stdin/input.json)` → `os.tmpdir()/java-*` → `javac` → `java Main[ input.json]` → stdout/stderr/exitCode JSON → cleanup best-effort. Shell argv is static (no direct interpolation — credited); the JVM workload itself is the attacker. `stdin` unbounded; only `source ≤100KB`. Linux: `ulimit -u 50 -f 10MB` + `timeout 10s` + heap flags + 1MB maxBuffer. macOS/dev: Node timeouts only. No user/container/network/FS/cgroup isolation, no concurrency quotas.

## Deployment model

Render Docker backend + Vercel frontend. Secrets via env (docs instruct pasting full service-account JSON; local `.env` gitignored and confirmed absent from git history — good). Boot never validates env (warn-and-continue). Dockerfile runs root, writable `/app`, no caps/seccomp/read-only FS, EOL-ish Node 18 base, health check targets authed `/api/problems` on hardcoded `:3001`. No CPU/mem limits in `render.yaml`.

## Current defenses (credited)

[S1 2026-09-03: fail-closed boot validator (`initEnv()` pre-require gate), HOST/PORT
validation with dev-loopback default, placeholder `.env.example`, 24-test suite.]
Strict `verifyToken` on data routes; per-doc ownership checks where present; server-computed XP/streak; `source ≤100KB`; static shell argv (no interpolation); temp dirs + cleanup; heap/ulimit/timeout/maxBuffer layers; minimal runner env; compile-path stripping; `.env` gitignored + dockerignored with clean history; title-keyed AI caching (reduces spend); Bearer (non-cookie) transport.

## Critical weaknesses

1. SEC-07 runner escape (root, network+FS+secrets, no isolation). 2. SEC-01 CORS fail-open + credentials. 3. SEC-04 similar-problem IDOR. 4. SEC-16 fail-open secrets boot + runner co-location. 5. SEC-09 anon runner burn. 6. SEC-10/11/12 prompt-injection → XSS/code-exec + AI spend. 7. SEC-15 missing Firestore rules. 8. SEC-20/21 no rate limits + any-user wipe/spend.

## High-risk findings

SEC-02/03 (fragile auth), SEC-06 (mass assignment + forked collection), SEC-08 (runner DoS), SEC-13 (error disclosure), SEC-14 (no validation/limits), SEC-17 (root Docker + broken health gate), SEC-19/24/25 (SSRF-adjacent, transport contradiction, log sprawl), SEC-22 (24 audit findings incl. 3 critical, untriaged), SEC-23 (identity-spread forgery).

## Recommended phase ordering

S1 (fail-closed boot) → S10 (CORS one-line critical) → S2 (strict auth) → S3 (IDOR + rules) → S14+S8 (abuse caps before exposure) → S5+S6 (runner isolation, longest lead — start early, parallel track) → S7 → S9 → S11 → S4 → S12/S13/S15/S17/S18 → S19 → S20. Full rationale in threat-model §7.

# S1 — Secure Boot / Configuration (COMPLETE 2026-09-03)

## Environment catalog (backend — enforced)

| Variable | Required in prod | Rule |
|----------|------------------|------|
| `NODE_ENV` | — (defaults to `development` + warning) | must be `development\|test\|production`; anything else is fatal everywhere |
| `PORT` | no (default 5000) | numeric, 1–65535; <1024 warns |
| `HOST` | no | valid IP/hostname; defaults `0.0.0.0` prod (container), `127.0.0.1` dev/test; `0.0.0.0` in dev warns |
| `FRONTEND_URL` | yes | valid http(s), no wildcards; prod: https + not localhost |
| `BACKEND_URL` | yes | valid http(s); prod: not localhost/`0.0.0.0` |
| `FIREBASE_SERVICE_ACCOUNT` | yes | valid JSON object, `type=service_account`, `project_id` + `private_key` (PEM header) + `client_email`; malformed-when-set is fatal everywhere; `demo-*`/placeholder refused in prod |
| `FIREBASE_DATABASE_URL` | no | valid http(s) when set |
| `GROQ_API_KEY` / `OPENROUTER_API_KEY` | at least one yes | when set: ≥20 chars, no placeholder/weak values (fatal everywhere); unknown format warns |

Failure semantics: `fatal[]` (structural errors, weak explicit secrets) refuse to boot in
**every** environment. `errors[]` refuse to boot in **production**; in dev/test they print
but allow boot (developer convenience). Secret values never appear in diagnostics —
only field names and presence metadata (redaction test included).

## Behavior matrix (verified)

| Case | Result |
|------|--------|
| prod + empty env | exit 1, 4 missing-config errors |
| prod + dev `.env` (localhost URLs) | exit 1 before `listen()` |
| dev + empty env | boots with warnings |
| dev + real local `.env` | boots, 1 warning, binds `127.0.0.1:5001`, `/health` OK |
| weak/placeholder/malformed secrets | fatal in all envs; output contains no key material |

## Files

- `backend/config/env.validation.js` — pure `validateEnv(env)` + side-effecting `initEnv()` (no new deps)
- `backend/server.js` — `initEnv()` before any route/service require; listens on validated `HOST:PORT`
- `backend/.env.example` — placeholder-only template (test asserts it boots nothing and holds no key material)
- `backend/tests/env.validation.test.js` — 24 tests, `npm test` → `node --test tests/`

## Frontend env (audited, not enforced — public build-time values by design)

`VITE_API_URL`, `VITE_FIREBASE_*` (client keys are public), `VITE_WHITELISTED_EMAILS`
(client-side only — must never be treated as authorization; flagged for S2/S3).

## Residual for later phases

- Runner still co-locates secrets with hostile workload (S5). No rotation proof (ops).
- `FIREBASE_DATABASE_URL` optional-pass-through; cron still reads raw `process.env` (S15).

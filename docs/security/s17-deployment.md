# S17 — Docker / Host / Deployment Hardening (COMPLETE 2026-09-03)

## What changed

- **`backend/Dockerfile`:** `node:18-slim` → **`node:22-slim`** (18 is EOL;
  firebase-admin 13 + the test env already run ≥20); **`USER node`** (escape
  lands unprivileged instead of uid 0); `COPY --chown=node:node`; `npm ci
  --omit=dev` (reproducible); `CMD ["node","server.js"]` (PID-1 signal-safe,
  replaces `npm start`); **PORT-aware `HEALTHCHECK` on public `/health`**
  (was: hardcoded `:3001` probing an authenticated route).
- **`render.yaml`:** `healthCheckPath: /health`; all six runtime vars
  (`FRONTEND_URL`, `BACKEND_URL`, `GROQ_API_KEY`, `FIREBASE_SERVICE_ACCOUNT`,
  `FIREBASE_DATABASE_URL`, `ADMIN_EMAILS`) declared **`sync:false`** —
  dashboard-managed, never from the repo.
- **`.dockerignore`:** `tests/`, `test_ai.js`, coverage/logs, all `.env*`
  excluded (`.env` was already out; now airtight).
- **Docs:** `DEPLOYMENT.md` fixed (real `/health`, dashboard-only secrets,
  ephemeral-disk note, Starter recommendation as billing decision) +
  corrected stale `GEMINI_API_KEY` → `GROQ_API_KEY`.
- Verified safe for non-root/read-only futures: the company-tags write-back is
  try/caught (best-effort), everything else is reads + `/tmp`.

## Proofs (7 policy tests)

Base tag, USER-before-CMD, no-ADD, chown, no secrets, single EXPOSE, direct
CMD, healthcheck shape, render health path + per-key `sync:false` + no secret
values, dockerignore entries, docs pointer. Suite 182/182. Boot smoke clean.

## Explicitly unverifiable here (no Docker daemon) — deploy-time checklist

1. First Render build on this branch must go green (base + `npm ci` + Java
   verify layer); watch for trixie/openjdk-17 path drift (`JAVA_HOME`).
2. Confirm process runs as `node` (`whoami` via one-off shell) and `/health`
   reports healthy in the dashboard.
3. Set all six `sync:false` vars before promote; boot refuses without them (S1).

## Residual / hand-off

- Render exposes no read-only-FS / cap-drop / seccomp / no-new-privs knobs:
  platform defaults apply; the `USER` + minimal-image + secret-scoping above is
  the achievable set. True runner isolation still needs the dedicated runner
  service (S5 target architecture) — unchanged.
- No `plan:` pinned in `render.yaml` (billing decision for the owner; Free
  sleeps and shares CPU — worst for runner DoS).
- Container scanning (Trivy/Grype) at build → S19 ops.

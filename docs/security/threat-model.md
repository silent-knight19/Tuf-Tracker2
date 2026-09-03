# TufTracker 2 — Threat Model (S0)

Status: `S0 reconnaissance` — no behavior changes. All claims are evidence-backed from the current tree.
Date: 2026-09-03. Scope: `backend/`, `frontend/`, `render.yaml`, `DEPLOYMENT.md`, `SETUP.md`, `README.md`.

## 1. Current architecture (as built)

```
Browser (React 19 actual / README claims 18, Vite, Zustand, ReactMarkdown, Monaco)
  │  Bearer Firebase ID token (axios interceptor, frontend/src/utils/api.js)
  ▼
Express 5.2.1 API (backend/server.js, helmet() default, broken CORS, softVerifyToken global)
  ├── Firebase Admin Auth (verifyIdToken per request, backend/routes/auth.routes.js)
  ├── Firestore (backend/config/firebase.config.js, top-level `problems`, `revisions`, `users`, `ai_cache_*`, `quotes`)
  ├── Groq Cloud via OpenAI SDK (backend/config/ai.config.js, MODEL=qwen/qwen3.8-27b, shared 30/min limiter)
  ├── Java runner (backend/services/codeRunner.service.js — javac/java via bash+ulimit+timeout, same container, same UID)
  └── node-cron (keep-alive ping + daily quote refresh, backend/cron/cron.service.js)
Deployment: backend Docker (node:18-slim + openjdk-17, runs as root) on Render; frontend on Vercel.
```

Preloaded data: `backend/data/*.json` (company tags, difficulty metadata, revision schedules, topic-patterns).
No `firestore.rules` in repo. No backend tests. No per-route rate limiting (dependency present, unused).

## 2. Trust boundaries (required model)

| # | Boundary | Authentication | Authorization | Validation | Resource limits | Failure behavior | Logging |
|---|----------|----------------|---------------|------------|-----------------|------------------|---------|
| B1 | Browser → Express API | Firebase ID token, `verifyToken` on most routes; `softVerifyToken` global is non-blocking | Per-document `userId == req.user.uid` on most routes; **missing on `POST /api/ai/similar-problem`**; `POST /api/quotes/refresh` any-user | Almost none: no schemas, no body limit set, no param/query validation | Only `source ≤ 100KB` on `/api/run/java`; shared Groq 30/min; nothing else | Fail-OPEN in places (CORS allows + logs; soft auth continues; Firebase misconfig warns + continues) | `requestLogger` (method+url+origin), route `console.log/error`; no request IDs; prompt previews logged |
| B2 | Express → Firebase Auth | Admin SDK with service-account JSON from env | N/A (identity provider) | `verifyIdToken(token)` only — no revocation check, no explicit issuer/audience pinning in app code (SDK defaults apply) | None app-side; every request re-verifies (no cache) | Throws → 401 on strict routes; swallowed → continue on soft path | Full error object to stderr on strict failure |
| B3 | Express → Firestore | Service account (god-mode bypass of security rules) | App-code ownership checks (see §4) — **rules file absent so no defense in depth against direct client SDK** | None on read paths; allowlisted fields on some writes but unbounded sizes | Full-collection scans (`analytics/*`, `company/*`) with no pagination | 500 + generic message; cascade-delete best-effort with warn | `console.log` of UID, counts, search strings |
| B4 | Express → AI provider (Groq) | `GROQ_API_KEY` env (also accepts `OPENROUTER_API_KEY` fallback) | Any authenticated user can call all AI endpoints; `forceRefresh`/`edge_cases_only` bypass cache | No prompt-size caps; no allowlists; user content interpolated raw | Shared 30 req/min global `wait()` queue (DoS amplifier), 45s timeout, retries ×2 | Retry on 429/timeout (multiplies load); else 500 with `error.message`/`details` | Prompt prefix (60 chars) + model name to stdout |
| B5 | Express → Java compiler/JVM | `verifyToken` on `POST /api/run/java` only; `/status`, `/test`, `/debug` public | None (single shared temp-dir space, no per-user isolation) | `source` required, ≤100KB; `stdin` unbounded; no class-count/depth checks | compile 25s, run 10s (Node) + `ulimit -u 50 -f 10MB` + `timeout 10s` **Linux only**; 1MB maxBuffer; no concurrency cap | Returns stdout/stderr/exitCode/timedOut/stage JSON; temp dir removed best-effort | UID, problemId, sizes, elapsed to stdout |
| B6 | Java runner → OS | None (inherits backend UID — **root in Docker**) | None (no user, no namespaces, no read-only FS, no seccomp, network on) | None (arbitrary bytecode runs) | See B5 — all host-namespace, bypassable from inside JVM | `timeout`/ulimit kill → exit 124 mapped to `timedOut` | None from inside JVM |
| B7 | Cron → app data | None (in-process, god-mode Firestore) | None (no tenant scoping needed except quote collection op) | AI-generated quotes written with `...quote` spread, no schema check | None (batch delete + 50 writes; concurrent runs unguarded) | Caught + `console.error`, process continues | Start/success/failure lines |
| B8 | Docker container → host | None | None (root, no cap-drop, no read-only FS, no USER) | N/A | None declared in `render.yaml`/`Dockerfile` | `HEALTHCHECK` targets wrong port/path-auth combo (see SEC-17) | Docker/Render logs only |
| B9 | External internet → backend | See B1 | See B1 | See B1 | None (no IP/user/endpoint limits) | Helmet defaults; CORS fail-open (see SEC-01) | See B1 |

## 3. Critical assets

1. Firebase service-account private key (`FIREBASE_SERVICE_ACCOUNT`) — full project god-mode.
2. Groq API key (`GROQ_API_KEY`) — spend + quota.
3. Firestore user data (`problems`, `revisions`, `users` incl. XP/streak/notes/code) — confidentiality + integrity.
4. Backend host/container (runs attacker Java as root, same net/fs as secrets).
5. AI quota/cost + downstream users of poisoned AI cache (`ai_cache_*` shared across users by title key).
6. Quote collection (wiped + rewritten by cron/any-user refresh).

## 4. Route inventory

Legend: AuthN = strict `verifyToken`? AuthZ = ownership/server check? Ext = external call. FS = filesystem. Exec = code execution.
Rate limit and input limits are **NONE** unless noted. (Global `softVerifyToken` runs on `/api/*` but enforces nothing.)

### System

| Endpoint | Method | AuthN | AuthZ | Firestore | Ext | FS | Exec | AI | Rate limit | Input limits | Sensitive output |
|----------|--------|-------|-------|-----------|-----|----|------|----|------------|--------------|------------------|
| `/health` | GET | no (public) | n/a | none | none | none | none | no | none | none | uptime, timestamp |
| `/api/run/status` | GET | **no** | n/a | none | none | none (`java -version` spawn) | spawns processes | no | none | none | java/javac version strings |
| `/api/run/test` | GET | **no** | n/a | none | none | temp dir + write + compile + run | **yes (Java)** | no | none | fixed sample only | full run result (stdout/stderr) |
| `/api/run/debug` | GET | **no** | n/a | none | none | none (string build) | no | no | none | fixed sample only | generated runner source (internal logic) |
| `/api/quotes` | GET | no (public) | n/a | `quotes` read (all) | no | none | none | no (may trigger 50-quote AI gen on empty!) | none | none | all quotes |

### Auth

| Endpoint | Method | AuthN | AuthZ | Firestore | Ext | FS | Exec | AI | Rate limit | Input limits | Sensitive output |
|----------|--------|-------|-------|-----------|-----|----|------|----|------------|--------------|------------------|
| `/api/auth/me` | GET | yes | self (`users/{uid}`) | `users/{uid}` read | Firebase verify | none | none | no | none | none | user doc spread **`...userData` can override `uid/email`** (SEC-23) |

### Problems (`backend/routes/problems.routes.js`)

| Endpoint | Method | AuthN | AuthZ | Firestore | Ext | FS | Exec | AI | Rate limit | Input limits | Sensitive output |
|----------|--------|-------|-------|-----------|-----|----|------|----|------------|--------------|------------------|
| `/api/problems` | GET | yes | `userId==uid` query filter | `problems` query | none | none | none | no | none | `topic/pattern/difficulty/company/search` unvalidated | all user problems |
| `/api/problems` | POST | yes | creates with `userId=uid` (good) | `problems` read (dup check) + add; `revisions` add; company JSON file write (via analyzer) | Groq (on cache/AI miss) | **writes `backend/data/company-tags.json`** (analyzer) | no | yes | none | `title` required only; rest unbounded | full doc + `message` w/ analysis source |
| `/api/problems/:id` | GET | yes | `userId==uid` else 403 (good) | `problems/{id}` read (+lazy-migration write) | Groq (on migration) | none | none | sometimes | none | `:id` unvalidated | full doc |
| `/api/problems/:id` | PUT | yes | `userId==uid` else 403 (good) | `problems/{id}` read+update | none | none | none | no | none | allowlisted fields but **unbounded sizes, no types/enums** | echoes `updates` |
| `/api/problems/:id` | DELETE | yes | `userId==uid` else 403 (good) | `problems/{id}` + `revisions` cascade query+batch delete | none | none | none | no | none | `:id` unvalidated | count log |
| `/api/problems/analyze` | POST | yes | n/a (no persistence) | none (via analyzer cache?) | Groq | none | none | yes | none | `title` required only | raw analysis |
| `/api/problems/:id/generate-notes` | POST | yes | `userId==uid` else 403 | `problems/{id}` read; `ai_cache_notes` read/write | Groq (miss) | none | none | yes | none | `forceRefresh` bool bypasses cache | notes |
| `/api/problems/generate-notes-preview` | POST | yes | none (title-keyed shared cache) | `ai_cache_notes` | Groq (miss) | none | none | yes | none | `title` required; rest unbounded; `forceRefresh` | notes (cross-user cache hit possible by design) |
| `/api/problems/generate-description-preview` | POST | yes | none (shared cache) | `ai_cache_descriptions` | Groq (miss) | none | none | yes | none | `title` required only | description |
| `/api/problems/:id/generate-description` | POST | yes | **BROKEN**: reads/writes `users/{uid}/problems/{id}` (different collection than everything else) | `users/{uid}/problems/{id}` + `ai_cache_descriptions` | Groq (miss) | none | none | yes | none | **`...problem` spread from `req.body` → mass assignment** | description |

### Revisions (`backend/routes/revision.routes.js`)

| Endpoint | Method | AuthN | AuthZ | Firestore | Ext | FS | Exec | AI | Rate limit | Input limits | Sensitive output |
|----------|--------|-------|-------|-----------|-----|----|------|----|------------|--------------|------------------|
| `/api/revisions` | GET | yes | `userId==uid` filter | `revisions` + `problems` (`__name__ in` batch for titles) | none | none | none | no | none | none | all revisions |
| `/api/revisions/due-today` | GET | yes | `userId==uid` + `archived==false` | `revisions` | none | none | none | no | none | none | grouped dues |
| `/api/revisions/:id` | GET | yes | `userId==uid` else 403 | `revisions/{id}` | none | none | none | no | none | `:id` unvalidated | revision |
| `/api/revisions` | POST | yes | creates with `userId=uid` | `revisions` dup-checks + add | none | none | none | no | none | **`problemId` not required** (`== undefined` query); all fields unbounded | revision |
| `/api/revisions/:id/review` | POST | yes | `userId==uid` else 403 | `revisions/{id}` update; `users/{uid}` XP/streak update (server-computed — good) | none | none | none | no | none | `confidence/notes/arrays` unvalidated | revision + `xpEarned` |
| `/api/revisions/:id/log-time` | PATCH | yes | `userId==uid` else 403 | `revisions/{id}` update | none | none | none | no | none | `phase/timeTaken` unvalidated (`Number()` coercion) | revision |
| `/api/revisions/:id` | DELETE | yes | `userId==uid` else 403 | `revisions/{id}` delete | none | none | none | no | none | `:id` unvalidated | message |
| `/api/revisions/:id` | PATCH | yes | `userId==uid` else 403 | `revisions/{id}` update | none | none | none | no | none | allowlisted but unbounded | revision |
| `/api/revisions/practice-session` | POST | yes | `userId==uid` + `totalReviews>0` | `revisions` query | none | none | none | no | none | `count` unvalidated (huge slice OK — slice caps naturally) | revision IDs |

### Analytics / Company

| Endpoint | Method | AuthN | AuthZ | Firestore | Ext | FS | Exec | AI | Rate limit | Input limits | Sensitive output |
|----------|--------|-------|-------|-----------|-----|----|------|----|------------|--------------|------------------|
| `/api/analytics/dashboard` | GET | yes | `userId==uid` | `problems` full scan | none | none | none | no | none | `days` via `parseInt\|\|30` (NaN→30, negative unbounded) | full aggregates |
| `/api/analytics/overview|topics|patterns|platforms|difficulty|heatmap|timeline` | GET | yes | `userId==uid` | `problems` full scan each | none | none | none | no | none | same | aggregates (+debug log of sample docs on `/overview`) |
| `/api/company` | GET | yes | none (global lists) | via service (file/JSON?) | none | reads `backend/data/*.json` | none | no | none | none | company lists |
| `/api/company/:companyName` | GET | yes | user-scoped problems input | `problems` full scan | none | data files | none | no | none | `:companyName` unvalidated (used in readiness calc) | readiness |
| `/api/company/:companyName/problems` | GET | yes | none | via service | none | data files | none | no | none | `:companyName` unvalidated | company problems |
| `/api/company/:companyName/readiness` | GET | yes | user-scoped problems input | `problems` full scan | none | data files | none | no | none | same | readiness |

### AI (`backend/routes/ai.routes.js`) — all `verifyToken`

| Endpoint | AuthZ | Firestore | AI | Notes |
|----------|-------|-----------|----|-------|
| `POST /similar-problem` | **NONE — reads `revisions/{problemId}` without ownership check (IDOR)** | `revisions/{problemId}` read | yes | `problemId` required only |
| `POST /custom-problem` | n/a | `ai_cache_*`? no (direct gen, uncached) | yes | `difficulty` required; uncached → full cost per call |
| `POST /company-problem` | n/a | none (direct gen) | yes | `company+difficulty` required; uncached |
| `POST /problem-help` | none (title-keyed shared cache) | `ai_cache_help` (+delete on `forceRefresh`) | yes; **`edge_cases_only` bypasses cache + may run user/AI code via runner** | largest input surface (title/desc/examples/constraints/signature/mode/solution) |
| `POST /problem-description` | none (shared cache) | `ai_cache_descriptions` | yes | `title` required |
| `POST /edge-cases` | none | `ai_cache_edgecases` | yes; `providedSolution` path **executes supplied code** via runner | code-execution bridge |
| `POST /learning-notes` | none (shared cache) | `ai_cache_learning` (+delete on force) | yes | `pattern∨topic` required |
| `POST /test-cases` | none (shared cache) | `ai_cache_testcases` (+delete on force) | yes | `title` required |
| `POST /solution` | none (shared cache) | `ai_cache_solutions` | yes (+ internal validation **executes AI code** via runner) | |
| `POST /analyze-code` | n/a (no persistence) | none | yes — **raw user code + description in prompt, uncached** | highest token surface |
| `POST /debrief/questions`, `POST /debrief/analyze` | n/a | none | yes, uncached | Q&A embedded raw |

All AI routes: no size caps, no per-user/IP quota, `express-rate-limit` unused, `forceRefresh` cache-bypass, retries ×2 on 429/timeout.

### Code runner (`backend/routes/codeRunner.routes.js`)

| Endpoint | Method | AuthN | AuthZ | FS | Exec | AI | Limits | Output |
|----------|--------|-------|-------|----|------|----|--------|--------|
| `/api/run/java` | POST | yes | none | temp dir write (`Main.java`/`Solution.java`/`input.json`) | **yes** | indirect (AI validation paths call service directly) | `source≤100KB`; `stdin` unbounded; timeouts best-effort | stdout/stderr/exitCode/timedOut/stage; `Server error: msg` on 500 |

## 5. Mandatory deep-inspection verdicts (S0)

1. **Soft auth → bypass?** `softVerifyToken` (middleware/auth.middleware.js:9-29) never blocks by design. Currently every state-changing/user-data route *also* applies strict `verifyToken`, so soft-then-strict ordering is safe **today** — but the pattern is fragile: (a) strict `verifyToken` lives in `routes/auth.routes.js`, not shared middleware, inviting omission; (b) three runner diagnostics + `GET /quotes` + `/health` are intentionally public, so an engineer copying that pattern for a data route would silently expose it because soft auth "succeeds". Verdict: no active bypass on data routes found, **latent bypass-by-omission**, plus weak strict validator (no revocation, fragile header split). → SEC-02, SEC-03, SEC-09.
2. **CORS restrictive? NO.** `server.js:44-49`: blocked origins hit `callback(null, true)` — allow + log. Combined with `credentials:true` and `http://localhost:` prefix allowance. Any website can call the API with credentials. → SEC-01.
3. **Firestore ownership server-side? Mostly, with holes.** `problems/*` (except generate-description path bug), `revisions/*`, `analytics/*`, `company/*` filter/check `userId`. Holes: `similar-problem` no check (SEC-04); generate-description wrong collection + body spread (SEC-06); revision create allows undefined `problemId`; no Firestore rules file for client-SDK defense. → SEC-04, SEC-06, SEC-15, SEC-23.
4. **AI input abuse? YES.** All AI inputs are raw-interpolated into prompts; no size caps, no sanitization, no per-user quota; retry/cache-bypass amplify. Prompt preview logged. AI output is executed (runner) and rendered (HTML). → SEC-10, SEC-11.
5. **Java escape? YES (by design gap).** Same-UID/container execution, network on, FS shared, root user, Linux-only partial limits, no limits at all on macOS/dev. `ulimit/timeout/maxBuffer/heap` are the *only* controls — explicitly insufficient per S5. → SEC-07.
6. **Host access from runner? YES.** `System.getenv`, file reads (`/proc`, app source, env), sockets/`URL`/`HttpClient`, metadata IP — none blocked. Secrets live in process env of the same container. → SEC-07, SEC-16.
7. **Error leakage? YES.** Global handler returns `err.message`; AI routes add `details: error.message`; compiler stderr returned verbatim (path-stripped only); version strings exposed. → SEC-13.
8. **Cron trusts attacker data? Partially.** Quote cron trusts AI JSON (spread into Firestore) and any authenticated user can trigger refresh/wipe (no admin gate); keep-alive trusts `BACKEND_URL` env. No UID-scoping bug (quotes are global by design) but integrity + cost exposure. → SEC-21.
9. **Body limits? NO.** `express.json()`/`urlencoded()` with no `limit`; only manual `source≤100KB`; `stdin`/AI fields/problems fields unbounded. → SEC-14.

## 6. Risk summary (residual, pre-fix)

- **Critical:** RCE-adjacent sandbox escape (SEC-07), CORS fail-open + credentials (SEC-01), IDOR on similar-problem (SEC-04), committed-local secrets handling + fail-open boot (SEC-16).
- **High:** public CPU-burning runner endpoints (SEC-09), prompt-injection→XSS→code-exec chain (SEC-10/12/07), AI cost exhaustion (SEC-11), missing Firestore rules (SEC-15), no rate limiting (SEC-20), cron/any-user wipe+AI-spend (SEC-21).
- Full register: `docs/security/vulnerability-register.md`.

## 7. Recommended phase ordering (unchanged from brief, with S0 evidence weights)

S1 (fail-closed boot) → S10 (CORS fail-open is one-line critical) → S2 (strict auth) → S3 (IDOR + rules) → S14+S8 (rate limits/AI quota before exposing fixes) → S5+S6 (runner isolation — longest lead time, start early) → S7 (prompt boundaries) → S9 (XSS) → S11 (errors) → S4 (validation) → S12/S13/S15/S17/S18 → S19 → S20.
Rationale: close anonymous-burn (CORS/runner/AI) and identity (S1/S2) first; data auth (S3) before validation hardening; runner isolation tracks in parallel as it needs infra work.

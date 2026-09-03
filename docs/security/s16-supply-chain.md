# S16 — Dependency / Supply-Chain Security (COMPLETE 2026-09-03)

## Audit results (no blind upgrades; semver-safe fixes only)

| Surface | Before | After | Action |
|---|---|---|---|
| backend `npm audit` | 24 (3 crit / 9 high) | **8 moderate, 0 high/critical** | `npm audit fix` (transitive only) + removed dead `express-rate-limit` |
| frontend `npm audit` | 33 (2 crit / 17 high) | **2 moderate, 0 high/critical** | `npm audit fix` (transitive only) |
| backend direct deps | 8 (1 unused) | 7, all imported (tested) | removed `express-rate-limit` (also killed its HIGH advisory) |
| backend direct-dep install scripts | 0 | 0 (tested) | — |
| transitive install scripts | 2, both benign (verified source) | accepted, documented | `@firebase/util` (license notice), `protobufjs` (version warning); esbuild fallback-downloader noted (frontend) |
| native bindings | `fsevents` (macOS-only, via nodemon) | accepted | never loads in Linux containers |
| secrets in worktree/history | none real | verified clean | one SETUP.md template + one historic `.env.example` — placeholders only |

## Reachability triage (why the remaining 10 moderates can wait)

All survivors gate on **major upgrades** (`firebase-admin` 12.x line and its
`@google-cloud/*` tree): `uuid`, `gaxios`, `google-gax`, `retry-request`,
`teeny-request`, `@google-cloud/{firestore,storage}` (+ frontend's 2). None is
attacker-reachable in this app: no attacker-controlled XML/proto/gRPC/file
paths exist server-side (verified: AI SDK speaks JSON, Firestore SDK serializes
validated data, no uploads). Fixed-host SDK transports keep cert-chain code
(server-side Google CAs) out of attacker influence. Majors deferred with this
rationale — revisit on major-bump windows, not drive-bys.

## Decisions locked by tests (`tests/supplychain.test.js`, 6 gates)

- No unused backend direct deps; `express-rate-limit` stays out.
- No install scripts in backend direct deps.
- Lockfiles tracked; `.env` never tracked; secret-shaped material absent from
  tracked files (placeholder/fixture-aware scan).

## Base image (decision for S17 to execute)

`node:18-slim` is past EOL (Apr 2025) — S16 decision: migrate to an LTS
`node:22-slim` pinned digest in S17, where the image can be rebuilt and
health-checked (no Docker in this environment; unverifiable here, so not
attempted blindly). Same for the `--test-concurrency` flag (needs Node ≥20
locally; production base predates the suite).

## Residual / hand-off

- Container scanning (Trivy/Grype) + `firebase deploy` gates → S17/S19 ops.
- esbuild's install-time fallback download (registry.npmjs.org) is accepted
  industry-standard behavior; environments requiring fully-offline installs
  should vendor + `--ignore-scripts` review.
- `company-tags.json` request-path file writes (flagged S3/S15) remain the only
  build-adjacent integrity wart → S17 (read-only FS forces the fix).

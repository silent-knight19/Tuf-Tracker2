# tests/security — permanent attack corpus (S19)

Every entry maps to the phase test that proves it and the SEC-ID it guards.
Live hostile execution is ALWAYS operator-gated (`RUN_ESCAPE_CORPUS=1`); the
default suite runs fast, hermetic proofs only.

## Java escape corpus (`java-escape.corpus.js`, live: `run-escape-corpus.js`)

| ID | Category | Verdict | Proven by |
|----|----------|---------|-----------|
| ENV-01 | secret-discovery | PARTIAL (minimal env, read works) | S5 live |
| FS-READ-01 | filesystem-escape | RESIDUAL (same FS pre-S17) | construction + S5 live (macOS-inconclusive) |
| FS-WRITE-01 | filesystem-escape | RESIDUAL (proven `wrote-absolute`) | S5 live |
| NET-01 | network-egress | RESIDUAL (egress attempts work) | S5 live |
| PROC-01 | process-spawn | RESIDUAL (spawn as process user) | S5 live |
| LOOP-01 | exhaustion | CONTAINED (timeout kill) | S5 live + `RUN_SLOW_TESTS` |
| MEM-01 | exhaustion | CONTAINED (OOM via -Xmx) | S5 live + S6 volley |
| RECUR-01 | exhaustion | CONTAINED (SOE via -Xss) | S5 live |
| OUT-01 | exhaustion | CONTAINED (maxBuffer + truncate) | S5 live |
| SYMLINK-01 | filesystem-escape | RESIDUAL (creation unblocked) | S19 live |
| TRAVERSE-01 | filesystem-escape | PARTIAL (relative contained, absolute not) | S19 live |
| CLASSPATH-01 | code-execution | CONTAINED (file allowlist + caps) | S19 live + S5 caps test |
| PROCFS-01 | secret-discovery | RESIDUAL (readable pre-S17) | construction (macOS-inconclusive) |
| DNS-01 | network-egress | RESIDUAL (resolution unfiltered) | S19 live |
| THREAD-01 | exhaustion | PARTIAL (timeout-bound only) | S5 live |

Hardening suite: `tests/coderunner.hardening.test.js` (S5). Budgets/volleys:
`tests/runner.pool.test.js` (S6).

## Full matrix — category → proving test → SEC-IDs

| Category | Test file(s) | SEC-IDs |
|----------|--------------|---------|
| missing/invalid/expired/tampered/wrong-project tokens | `auth.middleware.test.js` (S2) | SEC-02, SEC-03 |
| revoked/disabled/deleted identities | `auth.middleware.test.js` (S2) | SEC-03 |
| soft-auth-never-authorizes + route guard | `auth.middleware.test.js` (S2) | SEC-02 |
| admin gate | `auth.middleware.test.js` (S2) | SEC-21 |
| UID/doc-ID swap, cross-user read/write/delete | `firestore.authz.test.js` (S3) | SEC-04, SEC-06, SEC-23 |
| identity precedence (`/me`) | `firestore.authz.test.js` (S3) | SEC-23 |
| oversized/invalid-type/pollution/unknown-field | `validate.unit` + `validation.http` (S4) | SEC-05, SEC-14 |
| no-shell, argv, caps, env hygiene, benign e2e | `coderunner.hardening` (S5) | SEC-07 |
| pool/fairness/overflow/volleys/saturation-429 | `runner.pool` (S6) | SEC-08 |
| secret refusal, hierarchy, redaction, quote gate | `ai.boundary` (S7) | SEC-10, SEC-25 |
| quotas/windows/retry bounds/flood isolation | `ai.abuse` + `ai.flood` (S8) | SEC-11 |
| XSS corpus, URL gate, override lock | frontend `SafeMarkdown.test` (S9) | SEC-12 |
| origin matrix, CSRF posture, vercel policy | `http.policy` (S10) | SEC-01, SEC-24 |
| scrub, 500/400/404 mapping, reflection guard | `errors` (S11) | SEC-13 |
| rules policy, XP cooldown/atomicity | `firestore.rules` + `validation.http` (S12) | SEC-15, SEC-26 |
| deny ranges, caps/timeout/redirects, chokepoint | `outbound` (S13) | SEC-19 |
| tier windows, headers, pre-auth, floods | `rate.limit` + `rate.flood` (S14) | SEC-20 |
| single-flight, freshness, failure recovery | `cron.jobs` (S15) | SEC-21 |
| dep hygiene, install scripts, secret scan | `supplychain` (S16) | SEC-22 |
| image/platform policy | `deploy.policy` (S17) | SEC-17 |
| event shape/scrub/emission/header ban | `security.events` (S18) | SEC-25 |
| host-header, param pollution, hostile AI JSON | `security/attack.surface` (S19) | defense-in-depth |
| boot/config matrix | `env.validation` (S1) | SEC-16, SEC-18 |

## Not auto-proven (require operator/platform)

- Firestore rules **deploy + emulator matrix** (needs firebase-tools/Java).
- Image **build + runtime** (needs Docker/Render deploy).
- Multi-instance/distributed behaviors (locks, counters).
- Provider-side realities (Groq redirects, model steering).

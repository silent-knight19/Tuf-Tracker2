# TufTracker 2 — Security Hardening Plan

Long-lived engineering project. **One phase active at a time.** After each phase:
test → security-test → inspect diff → update docs → update security register →
update this PLAN → report → STOP. Never auto-continue.

(Note: this file was reconstructed 2026-09-03 after an operator-side truncation;
contents verified against docs/security/s*-*.md and the vulnerability register.)

## Phase tracker

| Phase | Scope | Status | Entry criteria | Exit evidence |
|-------|-------|--------|----------------|---------------|
| S0 | Reconnaissance (no behavior change) | **COMPLETE 2026-09-03** | — | `docs/security/threat-model.md`, `docs/security/vulnerability-register.md` (SEC-01…SEC-25), `SECURITY-BASELINE.md` |
| S1 | Secure boot / configuration | **COMPLETE 2026-09-03** | S0 complete | `backend/config/env.validation.js`, `initEnv()` gate, 24 tests green, `docs/security/s1-secure-boot.md`; SEC-16 partial, SEC-18 hardened |
| S2 | Authentication hardening | **COMPLETE 2026-09-03** | S1 | centralized strict middleware, route classification, run/test+debug gated, quotes/refresh→ADMIN, 49 tests green, `docs/security/s2-authentication.md`; SEC-02/03 mitigated, SEC-09/21 partial, SEC-24 noted |
| S3 | Firestore authorization / IDOR / BOLA | **COMPLETE 2026-09-03** | S2 | similar-problem IDOR closed, generate-description rebuilt, auth/me precedence, problemId required, firestore.rules authored, 65 tests green, `docs/security/s3-firestore-authz.md`; SEC-04/06/23 mitigated, SEC-15 partial |
| S4 | Input validation | **COMPLETE 2026-09-03** | S3 | validator DSL + schema catalog on all routes, 500KB cap, debrief persist fix, 86 tests green, `docs/security/s4-input-validation.md`; SEC-05/14 mitigated |
| S5 | Code runner security (isolation) | **COMPLETE 2026-09-03** | S1 | shell eliminated (execFile), portable budgets live-proven, escape corpus, 96 tests green, `docs/security/s5-code-runner.md`; SEC-07/08 partial, platform isolation → S17 |
| S6 | Runner resource exhaustion | **COMPLETE 2026-09-03** | S5 | admission pool (4/2/20+60s), 429 mapping, volley proofs, 106 tests green, `docs/security/s6-runner-budgets.md`; SEC-08 mitigated (in-process; cgroup/multi-instance → S17) |
| S7 | AI prompt injection | **COMPLETE 2026-09-03** | S4 | global gate + hierarchy + delimiters + egress inventory + quote gate, 115 tests green, `docs/security/s7-ai-boundary.md`; SEC-10 partial |
| S8 | AI abuse / cost protection | **COMPLETE 2026-09-03** | S2 | per-user quotas + global ceiling + concurrency + retry discipline + 429 mapping, 127 tests green, `docs/security/s8-ai-abuse.md`; SEC-11 mitigated |
| S9 | XSS / Markdown / user content | **COMPLETE 2026-09-03** | S7 | SafeMarkdown on all sinks, href gates, 31 frontend + 127 backend tests green, `docs/security/s9-xss.md`; SEC-12 mitigated (CSP → S10) |
| S10 | CORS / CSRF / HTTP security | **COMPLETE 2026-09-03** | S1 | fail-closed CORS + header policy + frontend CSP, live preflight proof, `docs/security/s10-cors-http.md`; SEC-01 mitigated, SEC-24 closed, SEC-12 CSP done |
| S11 | Error / information disclosure | **COMPLETE 2026-09-03** | S10 | error boundary + scrubbing + IDs, 140 tests green, `docs/security/s11-errors.md`; SEC-13 mitigated |
| S12 | Firestore rules | **COMPLETE 2026-09-03** | S3 | key allowlists + system-field locks, XP cooldown + atomic credit, 146 tests green, `docs/security/s12-firestore-rules.md`; SEC-15 hardened, SEC-26 filed+mitigated |
| S13 | SSRF / outbound | **COMPLETE 2026-09-03** | S5 | outbound chokepoint + cron migration, 155 tests green, `docs/security/s13-ssrf.md`; SEC-19 mitigated |
| S14 | Rate limiting | **COMPLETE 2026-09-03** | S2 | 7 tiers + pre-auth valve + quota headers, 163 tests green, `docs/security/s14-rate-limits.md`; SEC-20 mitigated |
| S15 | Cron / background jobs | **COMPLETE 2026-09-03** | S3 | single-flight + freshness + budgets, 169 tests green, `docs/security/s15-cron.md`; SEC-21 mitigated (distributed lock → S17) |
| S16 | Supply chain | **COMPLETE 2026-09-03** | S1 | audits 24→8 / 33→2, dead dep removed, 175 tests green, `docs/security/s16-supply-chain.md`; SEC-22 mitigated |
| S17 | Docker / host / deployment | **COMPLETE 2026-09-03** | S5 | USER node, Node 22, health/secret scoping, 182 tests green, `docs/security/s17-deployment.md`; SEC-17 mitigated (build verify at deploy) |
| S18 | Observability / security events | **COMPLETE 2026-09-03** | S2 | event pipeline on all denial paths, 190 tests green, `docs/security/s18-observability.md`; SEC-25 mitigated |
| S19 | Adversarial testing | **COMPLETE 2026-09-03** | all prior | corpus index + 15 probes + sweep (caught+fixed 413 regression), 195+31 tests green, `docs/security/s19-adversarial.md` |
| S20 | Final gate + assessment | **COMPLETE 2026-09-03** | S19 | `docs/security/final-security-assessment.md`; verdict: Hardened / Security-tested / Known residuals documented |

## Findings index

26 findings: SEC-01…SEC-26 in `docs/security/vulnerability-register.md`.
Critical: SEC-01 (CORS fail-open — mitigated S10), SEC-04 (similar-problem IDOR — mitigated S3), SEC-07 (runner escape — partial S5).
High: SEC-02, SEC-03, SEC-06, SEC-08, SEC-09, SEC-10, SEC-11, SEC-12, SEC-15, SEC-16, SEC-17, SEC-20, SEC-26.
See register for Medium/Low + full records. Open/high-risk remainder centers on:
platform isolation (S17), rate limits (S14), cron locks (S15), supply chain (S16),
observability (S18), rules deploy + emulator matrix (S19).

## Project status: COMPLETE (2026-09-03)

All 20 phases complete. Backend 195/195, frontend 31/31, build clean. 26 findings: 19 mitigated, 1 closed, 4 partial, 2 hardened-pending-deploy. Residuals owned: S20 §9 + per-phase docs. Further work is tracked as follow-ups, not phases.

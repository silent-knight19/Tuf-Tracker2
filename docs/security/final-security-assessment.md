# TufTracker 2 — Final Security Assessment (S20, 2026-09-03)

**Verdict: Hardened. Security-tested. Known residual risks documented.**
This is not a claim of perfect security — §9 lists what remains open and who
must do what. Do not deploy beyond the conditions in §9 without accepting them.

## 1. Executive Summary

Over S0–S19 the application went from fail-open defaults to layered,
tested controls: 26 findings filed (3 Critical), 19 mitigated, 1 closed,
4 partially mitigated, 2 hardened-pending-deploy. Test inventory: **195
backend + 31 frontend tests green**, plus a 15-probe live-fired Java escape
corpus and adversarial live sweeps. No frameworks replaced, no parallel app,
4 new runtime deps total across 20 phases (`rehype-sanitize`, `vitest` on the
frontend; zero new backend runtime deps).

What changed most: CORS now denies (was allow-all + credentials), auth is
centralized/strict with an admin gate, Firestore authorization is
ownership-enforced + rules-locked, every route validates strictly, the Java
runner is shell-free with proven single-shot budgets and admission control,
AI has prompt boundaries + cost quotas, rendering is sanitized behind CSP,
errors are generic + correlated, and every denial emits a structured event.

What did NOT change (by design): Express/Firebase/Firestore/React/Vite, the AI
architecture, the feature set. The runner shares its container (platform
isolation is specified, not shipped), Firestore rules await deploy, and the
image build awaits its first Render run.

## 2. Threat Model (condensed; full: `threat-model.md`)

Actors: anonymous attacker, malicious/compromised authenticated users,
code-submission and prompt/content adversaries, abusive API clients, malicious
Firestore clients. Nine boundaries (Browser→API→Auth/Firestore/AI/JVM→OS,
Cron→data, Container→host, Internet→backend), each rated on
authN/authZ/validation/limits/failure/logging. Crown assets: Firebase SA key,
Groq key, user data + XP economy, the container the hostile workload shares,
AI quota, shared caches. Route inventory: ~40 endpoints classified
PUBLIC/AUTHENTICATED/ADMIN/OWNER/SYSTEM (`s2-authentication.md`).

## 3. Critical Findings

- **SEC-01 CORS fail-open + credentials — MITIGATED.** Deny branch allowed
  every origin (proven live pre-fix). Now exact-allowlist, prod = {FRONTEND_URL},
  parsed-hostname loopback dev-only, live re-proven (evil: zero ACAO). Residual:
  single-origin value; missing-origin allowance stands only while Bearer-only.
- **SEC-04 similar-problem IDOR — MITIGATED.** Cross-user revision read with no
  check. Ownership enforced + HTTP matrix + mutation control (revert fails exactly).
- **SEC-07 Java sandbox escape — PARTIALLY MITIGATED (defining residual).**
  Shell eliminated (execFile everywhere + static guard), 0700 sandboxes,
  secret-free env (proven), JVM budgets, timeouts, class/size caps, admission
  pool. Live-proven contained: loop/heap/stack/output bombs. Live-proven STILL
  POSSIBLE: absolute-path FS write, socket egress, process spawn as container
  UID (root in prod), no thread/PID cap. See §7.

## 4. High Findings (15)

Mitigated (11): SEC-02/03 fragile auth → centralized strict + revocation path +
uniform failures; SEC-06 mass-assignment fork → rebuilt endpoint; SEC-08 runner
DoS → admission pool + 429s + volley proofs; SEC-11 AI spend → quotas + retry
discipline + flood isolation; SEC-12 XSS → sanitizer + href gates (+CSP S10);
SEC-14 no validation → schemas on all routes + 500KB cap; SEC-17 root/EOL/broken
gate → USER node, Node 22, /health, secret scoping (build verify at deploy);
SEC-20 no rate limits → 7 tiers + pre-auth valve + live headers; SEC-21 quote
wipe/spend → ADMIN + single-flight + idempotency; SEC-26 XP farming (S12 find) →
cooldown + atomic credit.
Partially mitigated (3): SEC-09 (anon burn closed, authed flood → quotas);
SEC-10 (prompt guards + gates; steering still possible → downstream containment);
SEC-16 (fail-closed boot + hygiene; secrets still share the runner container).
Hardened pending deploy (1): SEC-15 rules authored + policy-tested, not deployed.

## 5. Medium Findings (6)

SEC-05 unbounded stored content → sized/strict (meaning → S7/S9 gates);
SEC-13 error disclosure → generic + correlated + guarded; SEC-19 SSRF →
chokepoint + cron migration (TOCTOU noted); SEC-22 supply chain → 24→8 / 33→2,
dead dep removed, gates green; SEC-23 identity spread → token-wins + test;
SEC-24 transport → CLOSED (Bearer-only proven, CORS fixed).

## 6. Low Findings (2)

SEC-18 bind posture → hardened (validated HOST, dev loopback); SEC-25 log
sprawl → structured event stream + header ban (ops logs stay unstructured).

## 7. Code Runner Risk (explicit)

Single-shot hostile workloads are contained and budgeted (proven). The runner
is **not isolated**: same UID/FS/network as secrets and the app. Threats that
remain live until the isolated-runner track ships: host-secret theft via
absolute FS reads, metadata/internal-network egress, persistence, PID/thread
exhaustion beyond timeouts, cross-instance parallelism. The S5 target
architecture (unprivileged user, no-net, read-only FS, seccomp, cgroups,
secret-free env) is specified in `s5-code-runner.md`. Do not describe the
current runner as sandboxed.

## 8. AI Risk (explicit)

Prompts are delimited, secrets refused pre-network, egress inventoried, spend
quota-bound, output gated. Remaining: model steering by crafted content is
mitigated-in-depth, not solved — containment rests on the renderer (S9), the
executor (S5/S6), and the Firestore gates (S3/S12). Shared title-keyed caches
are cross-user readable by design; `forceRefresh` spends quota, not bypass.
Cron-refresh is the only unquoted AI path (1×/day, admin-forced otherwise).

## 9. Architecture & Deployment Risks + Accepted Risks

1. **Firestore rules undeployed** — server checks hold; direct-SDK path relies
   on deploy. Owner: ops. Gate: `firebase deploy --only firestore:rules` +
   emulator matrix (S19-listed).
2. **Image build unverified here** (no Docker daemon) — policy-tested; first
   Render build must go green per the 3-item checklist in `s17-deployment.md`.
3. **Multi-instance gaps** — locks/counters/quotas are in-process; distributed
   lock + shared counters or single-instance cron before scaling out.
4. **Platform gaps** — no read-only FS / caps / seccomp knobs on Render;
   L3/L7 flood protection and container scanning are ops-side.
5. **Majors deferred** — firebase-admin line + 10 moderate advisories triaged
   unreachable; revisit on major-bump windows.
6. **Patient abuse ceilings** — XP farming (~600/hr/revision), AI math (12
   calls/min/user worst case): bounded, monitored via events, tunable.
7. **Monaco CDN in script-src** — self-host to tighten CSP further.

## 10. Testing Coverage

Backend 195 (auth matrix, cross-user HTTP + mutation control, validation,
hardening + live corpus, pool/volleys, AI boundary/abuse/flood, XSS policy
via frontend 31, origin/CSRF/CSP, errors + reflection guard, rules + economy,
SSRF, tiers + floods, jobs, supply chain, deploy policy, events), frontend 31,
`vite build` clean, live sweeps per phase (CORS-zero, 401/403/404/413/429
matrices, kill signatures, boot refusal). Permanent corpus indexed in
`tests/security/README.md` (38 suites, zero orphan attack classes).

## 11. Remaining Recommendations (ordered)

1. Deploy Firestore rules + emulator CI (closes SEC-15 fully).
2. First Render build + runtime verification (closes S17).
3. Isolated runner service (closes SEC-07; biggest risk reduction available).
4. Distributed cron lock + shared rate counters before scaling instances.
5. firebase-admin major + Node toolchain alignment (S16 notes).
6. Self-host Monaco; Trivy/Grype in build; full ops-log schema.
7. Re-run this assessment after 1–3 (evidence updates, not re-architecture).

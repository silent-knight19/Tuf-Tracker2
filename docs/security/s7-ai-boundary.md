# S7 — AI Security / Prompt Injection (COMPLETE 2026-09-03)

## Boundary design (no architecture change)

The provider is an untrusted-data processor, never an authority. Three layers:

1. **Global gate in `callAI` (covers all 15+ methods, including dormant ones):**
   secret-shaped content → fail-closed refusal (provider never hit, retries
   skipped); prompt >150k chars → refused; constant SYSTEM instruction-hierarchy
   message on every call; logs carry label + sizes only (prompt preview logging
   removed).
2. **Delimited builders on the hottest prompts:** `analyzeUserCode` (user code +
   description + execution feedback), `generateSolutionOnly` (description),
   `generateTestInputsOnly` (signature + constraints) wrap untrusted sections in
   `<untrusted-data name="…">` with per-section caps.
3. **Output gates:** AI JSON is validated before persistence (`sanitizeQuotes`:
   allowlisted keys, category enum, length caps — the `...quote` spread is gone);
   AI-generated code only ever executes via the shell-free, budgeted S5/S6
   runner; model output never touches auth/shell/FS/DB paths.

## Egress inventory — exactly what leaves the infrastructure per endpoint

| Endpoint | Leaves infra |
|----------|--------------|
| analyze / similar / custom / company-problem | title, platform/topic/pattern/difficulty/company strings |
| problem-description | title, platform, difficulty, topics, patterns |
| problem-help / edge-cases / test-cases | title, description, examples, constraints, signature, provided solution code |
| solution | title, description, difficulty, signature, test cases |
| analyze-code | **user code**, problem description, examples, constraints, optimal-complexity hint, execution feedback |
| learning-notes | pattern/topic |
| debrief | title, difficulty, questions + user answers |
| quotes refresh | fixed coach prompt (no user data) |

**Never leaves (enforced by refusal scan):** Firebase SA/keys, `GROQ/OPENROUTER` keys,
Bearer tokens, OAuth/VCS/cloud credentials, private-key material. S4 size caps sit
in front; the 150k global cap sits behind.

## Verified behaviors (9 tests)

- 6 secret classes refused pre-network (incl. no-retry, message names class only).
- Empty/oversized refused. System guard present on the wire; user code provably
  inside `<untrusted-data>`; prompt content absent from logs.
- Quote injection (unknown keys, bad categories) dropped; unusable output throws.
- Dormant methods (`summarizeNotes`, `detectWeaknesses`, `suggestRelatedProblems`
  — no route callers) inherit the global gate automatically.

## Residual / hand-off

- Delimiters + hierarchy are mitigation, not a solved problem: a capable model can
  still be steered by crafted content — hence output gates + execution sandboxing
  remain the real containment (defense in depth, documented as such).
- Shared title-keyed caches are cross-user readable by design (cost); `forceRefresh`
  poisoning and token-budget abuse → S8/S14. Caches are also why prompt-injection
  payloads must additionally be treated as cache-poisoning attempts.
- `updateCompanyDatabase` (shared JSON write from analyzed input) still unhardened → S8.
- Heavy JVM test files contend under parallel `node --test` (~45s); S19 should
  serialize/split the attack corpus runs.

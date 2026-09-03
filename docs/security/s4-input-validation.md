# S4 — Input Validation (COMPLETE 2026-09-03)

## What changed

- `backend/middleware/validate.js` (new, zero deps): schema DSL
  (`string/number/boolean/arrayOf/union/object/optional/nullable/docId/urlString/scalar`)
  + `validate()` middleware. Global guards on every validated payload: prototype-
  pollution keys → 400, nesting depth > 12 → 400, unknown fields on strict objects
  → 400. Failures return `400 {"error":"Invalid request","details":[{path,message}]}`
  — paths + messages only, values never echoed.
- `backend/middleware/schemas.js` (new): the full contract catalog for all ~40
  endpoints — sizes (title ≤200, notes ≤50k, code ≤100k, stdin ≤200k, description
  ≤20k, arrays 10–100 items), `docId` (no slashes/whitespace/dot-only), http(s)
  URLs, numeric coercion with bounds (confidence 1–5, count 1–50, days 1–9999,
  timeTaken 0–86400), `learning-notes` requireAny refine, AI-echo shapes bounded.
- Wired `validate()` after `authenticate` on every input-taking route
  (problems ×10, revisions ×7, ai ×12, analytics queries, company params,
  run/java). No per-route handler logic changed except one fix below.
- `server.js`: global `express.json/urlencoded({limit:'500kb'})` (live-verified 413).
- **S4 fix:** `PATCH /revisions/:id` now validates AND persists the debrief fields
  (`confidenceScore`, `aiAdvice`) the UI already sends but the server silently
  dropped (data-loss bug; compat-tested).
- Ownership fields (`userId`/`uid`) appear in NO schema — S3 posture hardened
  further: UID-swap attempts are now 400, not just ignored (S3 tests updated).

## Compat (strict mode vs the real UI — audited, then tested)

Accepted-and-ignored (documented in schemas): `difficulty/topics/patterns/status`
on create, `status` on update, `guidedData`/`checklist` on review, legacy problem
fields on generate-description. Rejected: everything else unknown. HTTP compat
tests lock the UI contract (create/update/review/debrief/generate-description/
problem-help/run-java shapes).

## Tests

- `tests/validate.unit.test.js` (11): strictness, pollution at depth, depth cap,
  docId traversal, coercion, enums, URLs, nullable+refine.
- `tests/validation.http.test.js` (10): 400-matrix + compat-matrix over the S3
  harness (company + codeRunner routers mounted for S4; AI methods stubbed).
- Suite 86/86 green. Live: 600KB → 413 pre-auth; auth-before-validate ordering
  confirmed (401 precedes 400).

## Residual / hand-off

- Value *safety* (XSS/prompt-injection inside accepted strings) → S7/S9; S4 bounds
  size/shape, not meaning.
- `difficulty`/`status` are format-checked strings, not strict enums (legacy stored
  values must keep round-tripping) — tighten if the data model ever enums them.
- AI-echo containers validate shape + size, not semantic truth → S7.
- Per-user/token budgets and retry discipline → S8/S14; wall-clock/output/compute
  budgets → S5/S6.

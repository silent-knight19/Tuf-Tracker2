# S19 — Adversarial Testing (COMPLETE 2026-09-03)

## What changed

- **Corpus home:** `tests/security/` now holds the permanent attack corpus:
  15-entry Java escape set (+5 S19 probes, all live-fired with honest verdicts),
  `attack.surface.test.js` (host-header, param pollution, hostile AI JSON),
  and `README.md` — the full matrix mapping every category → proving test →
  SEC-ID (38 suites covered, zero orphan attack classes from the S19 brief).
- **Sweep catch (real):** adversarial live probes found oversized bodies
  returning **500 instead of 413** — an S11 regression (entity.too.large fell
  through to generic 500). Safe direction, wrong semantics + contradicted S4
  docs. Fixed in `middleware/errors.js` (entity.* → clean 4xx), regression
  test added, 413 re-proven live. No SEC filed: no leak, no integrity or
  availability impact — generic 500 on an already-received body.
- **Sweep re-proofs (live):** health OK, evil CORS zero-ACAO, pollution +
  bad-token uniform 401, oversized 413.

## Final counts

- Backend **195/195** green; frontend **31/31** green.
- Corpus: 15 Java probes (6 CONTAINED, 5 RESIDUAL-proven, 4 PARTIAL — see
  security/README.md), web/API/auth/AI suites per matrix.

## Residual / hand-off (operator + platform only)

- Firestore rules deploy + emulator matrix; image build + runtime; distributed
  locks/counters; provider-side realities. All four are enumerated in
  `tests/security/README.md` §"Not auto-proven" and owned by S20's accepted-
  risks section.

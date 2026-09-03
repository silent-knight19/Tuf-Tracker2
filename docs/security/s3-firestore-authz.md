# S3 — Firestore Authorization / IDOR / BOLA (COMPLETE 2026-09-03)

## Per-collection authorization matrix (server-enforced, live-tested)

| Collection | Who owns | Read | Write | Delete | Immutable | Server-controlled |
|------------|----------|------|-------|--------|-----------|-------------------|
| `problems` | `userId` = token uid | owner only (`== uid` filter or doc check) | owner only; created with token uid; `userId` never taken from body | owner only (+ cascade own revisions) | `userId` (PUT allowlist excludes it; tested) | `userId`, `createdAt`, server-set analysis fields |
| `revisions` | `userId` = token uid | owner only | owner only; `problemId` now required; created with token uid | owner only | `userId`, `problemId` (rules + code) | `phase`, `nextDueDate`, `scheduledReviews`, XP/streak via `users` |
| `users` | doc id = token uid | self (`/auth/me`) | **none** (server-only via Admin SDK) | none | all client-visible | `totalXP`, `currentStreak`, `longestStreak`, `lastActiveDate` |
| `ai_cache_*` | n/a (shared cost-saver) | server only | server only | server (`forceRefresh`) | n/a | cache keys |
| `quotes` | n/a (global) | public | ADMIN only (S2 gate) | ADMIN (batch) | n/a | `order`, timestamps |

Every `collection()` call-site was inventoried (25 hits across routes/services):
all user-data paths scope by `req.user.uid`; frontend sends no `userId`/`uid` in any
body (verified by grep); ownership comes only from the verified token.

## Fixes (this phase)

1. **SEC-04 — `POST /api/ai/similar-problem` IDOR closed.** `revisions/{problemId}`
   now requires `problemData.userId === req.user.uid` (fail-closed incl. legacy docs
   without `userId`). Mutation-tested: revert → exactly this test fails.
2. **SEC-06 — `POST /api/problems/:id/generate-description` rebuilt.** Canonical
   `problems/{id}` + ownership check; the `users/{uid}/problems` fork, the
   `...req.body` mass-assignment spread, and create-from-body are gone. Request body
   is no longer used for persistence. Response shape (`{description}`) unchanged —
   the one frontend caller (`problemStore.generateDescription`) is compatible.
3. **SEC-23 — `/auth/me` identity precedence fixed.** Stored doc spreads first;
   `uid`/`email`/`name` from the verified token always win. Test seeds a poisoned
   doc (`uid: user-B`) and asserts the token identity is returned.
4. **`POST /api/revisions` requires `problemId`** (400 otherwise) — kills the
   `where('problemId','==',undefined)` query. Safe: no UI caller omits it
   (server-side auto-add always passes it).
5. **Dead second Firestore import removed** (`@google-cloud/firestore` in
   `spaced-repetition.service.js` was never called) — exactly one client remains.
6. **`firestore.rules` (new, root): deny-by-default**, owner-only problems/revisions,
   owner-read + server-write-only users (XP/streak unforgable client-side),
   server-only AI caches (also blocks client cache-poisoning), public-read quotes.
   Deploy: `firebase deploy --only firestore:rules`. Emulator matrix → S19.

## Tests

`backend/tests/firestore.authz.test.js` — 16 HTTP-level attack scenarios over an
in-memory Firestore (helpers: `fake-firestore.js`, `app.harness.js`; require-cache
stubs for Firebase/auth/AI/analyzer; real Express routers, real cache + scheduling
services). Suite total 65/65 green. Live dev-server regression: 401s intact,
`/health` + `/quotes` public paths intact, zero boot errors.

## Observed, handed off (not this phase)

- `problem-analyzer.updateCompanyDatabase` lets any authenticated problem-POST rewrite
  the shared `backend/data/company-tags.json` (global mutation from user input) → S4/S7.
- Shared title-keyed AI caches: cross-user reads are by design (cost); `forceRefresh`
  poisoning → S7/S8. Review-XP `read-modify-write` in `updateUserStats` can lose
  concurrent updates (availability, not inflation) → S15.
- Rules file needs `firebase deploy` + emulator CI → S12/S17/S19.

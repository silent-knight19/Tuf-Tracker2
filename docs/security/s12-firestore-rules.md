# S12 — Firestore Rules Depth + XP Economy (COMPLETE 2026-09-03)

## What changed

- **`firestore.rules` hardened (S3 authored → S12 locked):** key allowlists
  (`hasOnly`) on problems/revisions create; update diffs restricted to
  cosmetic fields (`affectedKeys().hasOnly(...)`). Server-controlled and
  XP-adjacent fields are unwritable by clients: problems
  `{userId,title,platform,platformUrl,companies,solvedAt,revisionDates,
  nextRevision,isAIGenerated,createdAt,description,aiNotes}`;
  revisions `{userId,problemId,phase,nextDueDate,scheduledReviews,totalReviews,
  lastReviewedAt,lastConfidence,archived,archivedDate,createdAt}`.
  Server paths use the Admin SDK (bypasses rules), so API behavior is unchanged
  while direct-SDK forgery is structurally impossible. `users/*` was already
  server-write-only; AI caches server-only; quotes public-read.
- **XP farming closed (new SEC-26):** `POST /:id/review` had no cooldown — XP
  minted at request speed. Now one XP-bearing review per revision per 60s
  (429 + Retry-After beyond); genuine reviews take minutes, never bound.
- **Atomic XP credit:** `totalXP` via `FieldValue.increment` (concurrent reviews
  both count; no lost updates).
- **Robustness fix found by tests:** `updateUserStats` crashed on plain-`Date`
  `lastActiveDate` (exactly what our own writes store in non-Timestamp
  backends) — XP silently skipped after the first review. Now accepts
  Timestamp/Date/ISO-string.

## Proofs

- 5 rules-policy tests (deny-by-default shape, owner scope, allowlists,
  server-only sets, cache/quote blocks) + 2 HTTP tests (flood → 429 with zero
  XP minted; due review → 200 with atomic credit).
- Suite 146/146.

## Residual / hand-off

- Rules are authored + policy-tested, NOT yet `firebase deploy`ed and without an
  emulator matrix (needs firebase-tools + Java): deploy + CI gate → S19;
  Render env scoping notes → S17.
- 60s cooldown bounds scripted floods, not patient farming (1 XP-min… ~600
  XP/hour ceiling per revision); XP-economy rate design → S14 if needed.
- Direct-SDK create with forged `difficulty` still self-poisons own analytics
  (no cross-user or XP impact) — accepted, documented.

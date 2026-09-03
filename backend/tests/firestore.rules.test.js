/**
 * S12 — Firestore rules policy tests (static contract on firestore.rules).
 * The emulator matrix (behavioral) is S19's job; this file locks the policy
 * text: owner scope, key allowlists, system-field locks, default deny.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const RULES = fs.readFileSync(path.join(__dirname, '..', '..', 'firestore.rules'), 'utf8');

describe('S12 rules policy', () => {
  it('deny-by-default with explicit blocks only', () => {
    assert.ok(RULES.includes('match /{document=**}'));
    assert.ok(RULES.includes('allow read, write: if false;'));
    // The only `if true` in the file must be the public quotes read.
    const trues = RULES.split('\n').filter((l) => l.includes('if true'));
    assert.equal(trues.length, 1);
    assert.ok(trues[0].includes('get, list'));
  });

  it('users: owner-read, zero client writes (XP unforgable)', () => {
    assert.ok(/match \/users\/\{uid\}[\s\S]*?allow get: if isOwner\(uid\)/.test(RULES));
    assert.ok(RULES.includes('allow create, update, delete: if false;'));
  });

  it('problems: owner scope + create/update key allowlists', () => {
    assert.ok(RULES.includes('problemCreateKeysOk'));
    assert.ok(RULES.includes('problemUpdateKeysOk'));
    assert.ok(RULES.includes('ownerUnchanged()'));
    for (const k of ['userId', 'solvedAt', 'nextRevision', 'isAIGenerated', 'createdAt']) {
      // system fields must NOT appear in the update allowlist block
      const m = RULES.match(/function problemUpdateKeysOk\(\) \{[\s\S]*?\n    \}/);
      assert.ok(m && !m[0].includes(`'${k}'`), k);
    }
  });

  it('revisions: scheduling/XP-adjacent fields are server-only on update', () => {
    const m = RULES.match(/function revisionUpdateKeysOk\(\) \{[\s\S]*?\n    \}/);
    assert.ok(m);
    for (const k of ['phase', 'nextDueDate', 'scheduledReviews', 'totalReviews', 'archived', 'userId', 'problemId']) {
      assert.ok(!m[0].includes(`'${k}'`), k);
    }
    for (const k of ['notes', 'coreIdea', 'confidenceScore', 'aiAdvice']) {
      assert.ok(m[0].includes(`'${k}'`), k);
    }
  });

  it('AI caches are server-only; quotes are public-read only', () => {
    for (const c of ['ai_cache_help', 'ai_cache_notes', 'ai_cache_descriptions', 'ai_cache_edgecases', 'ai_cache_learning', 'ai_cache_testcases', 'ai_cache_solutions']) {
      assert.ok(RULES.includes(`match /${c}/{doc} { allow read, write: if false; }`), c);
    }
    assert.ok(/match \/quotes\/\{quoteId\} \{[\s\S]*?allow get, list: if true;/.test(RULES));
  });
});

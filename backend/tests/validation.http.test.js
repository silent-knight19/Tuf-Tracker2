/**
 * S4 — HTTP validation matrix over the S3 harness (in-memory Firestore).
 * Asserts 400s for hostile shapes AND 200s for legitimate UI payloads
 * (compat: strict mode must not break the frontend contract audited in S4).
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { FakeFirestore, installStubs, startApp, api } = require('./helpers/app.harness');

const A = 'user-A';

describe('S4 validation matrix', () => {
  let base;
  let close;
  let db;

  before(async () => {
    db = new FakeFirestore();
    db.seed('problems', 'prob-A1', { userId: A, title: 'Two Sum', difficulty: 'Easy', topics: [], patterns: [] });
    db.seed('revisions', 'rev-A1', {
      userId: A, problemId: 'prob-A1', problemTitle: 'Two Sum', phase: 'day_2',
      nextDueDate: new Date(Date.now() + 86400000), scheduledReviews: [], totalReviews: 0,
      archived: false, createdAt: new Date(), updatedAt: new Date(),
    });
    db.seed('users', A, { totalXP: 0, currentStreak: 0, longestStreak: 0 });
    db.seed('revisions', 'rev-A2', {
      userId: A, problemId: 'prob-A1', problemTitle: 'Two Sum', phase: 'day_2',
      nextDueDate: new Date(Date.now() + 86400000), scheduledReviews: [], totalReviews: 1,
      lastReviewedAt: new Date(), archived: false, createdAt: new Date(), updatedAt: new Date(),
    });
    db.seed('revisions', 'rev-A3', {
      userId: A, problemId: 'prob-A1', problemTitle: 'Two Sum', phase: 'day_2',
      nextDueDate: new Date(Date.now() - 1000), scheduledReviews: [], totalReviews: 1,
      lastReviewedAt: new Date(Date.now() - 3600000), archived: false, createdAt: new Date(), updatedAt: new Date(),
    });
    installStubs(db);
    ({ base, close } = await startApp());
  });

  after(async () => { await close(); });

  it('400s unknown fields, missing title, oversized title, pollution (POST /problems)', async () => {
    assert.equal((await api(base, 'POST', '/api/problems', { user: A, body: { title: 'X', isAdmin: true } })).status, 400);
    assert.equal((await api(base, 'POST', '/api/problems', { user: A, body: {} })).status, 400);
    assert.equal((await api(base, 'POST', '/api/problems', { user: A, body: { title: 'x'.repeat(201) } })).status, 400);
    assert.equal((await api(base, 'POST', '/api/problems', { user: A, body: JSON.parse('{"title":"X","__proto__":{"pwn":1}}') })).status, 400);
  });

  it('compat: UI create payloads still pass (incl. ignored legacy fields)', async () => {
    const r = await api(base, 'POST', '/api/problems', {
      user: A,
      body: { title: 'Fresh', platform: 'LeetCode', platformUrl: '', difficulty: 'Medium', topics: ['Array'], patterns: [], status: 'Todo' },
    });
    assert.equal(r.status, 201);
    const stored = db.read('problems', r.json.id);
    assert.equal(stored.title, 'Fresh');
    assert.equal(stored.status, undefined); // ignored, not persisted
    assert.equal(stored.userId, A);
  });

  it('400s userId injection and bad IDs (PUT /problems/:id)', async () => {
    assert.equal((await api(base, 'PUT', '/api/problems/prob-A1', { user: A, body: { userId: 'user-B' } })).status, 400);
    assert.equal((await api(base, 'PUT', '/api/problems/a%2Fb', { user: A, body: { notes: 'x' } })).status, 400);
  });

  it('compat: UI update payloads ({notes}, {aiNotes}, {status}) pass', async () => {
    assert.equal((await api(base, 'PUT', '/api/problems/prob-A1', { user: A, body: { notes: 'n' } })).status, 200);
    assert.equal((await api(base, 'PUT', '/api/problems/prob-A1', { user: A, body: { status: 'Todo' } })).status, 200);
    assert.equal(db.read('problems', 'prob-A1').status, undefined);
  });

  it('400s bad review shapes; 200s a valid review', async () => {
    assert.equal((await api(base, 'POST', '/api/revisions/rev-A1/review', { user: A, body: { confidence: 9 } })).status, 400);
    assert.equal((await api(base, 'POST', '/api/revisions/rev-A1/review', { user: A, body: { confidence: 'high' } })).status, 400);
    assert.equal((await api(base, 'POST', '/api/revisions/rev-A1/review', { user: A, body: {} })).status, 400);
    const ok = await api(base, 'POST', '/api/revisions/rev-A1/review', {
      user: A, body: { confidence: 4, notes: 'good', guidedData: { recalledPattern: 'x' }, checklist: { a: true } },
    });
    assert.equal(ok.status, 200);
  });

  it('400s bad practice/log-time/analytics/company inputs', async () => {
    assert.equal((await api(base, 'POST', '/api/revisions/practice-session', { user: A, body: { count: 1000 } })).status, 400);
    assert.equal((await api(base, 'PATCH', '/api/revisions/rev-A1/log-time', { user: A, body: {} })).status, 400);
    assert.equal((await api(base, 'GET', '/api/analytics/timeline?days=abc', { user: A })).status, 400);
    assert.equal((await api(base, 'GET', '/api/analytics/timeline?days=30', { user: A })).status, 200);
    assert.equal((await api(base, 'GET', '/api/company/' + encodeURIComponent('<img src=x>'), { user: A })).status, 400);
    // Path traversal never reaches the handler (Express normalizes to 404) — assert it is not honored.
    const traversal = await api(base, 'GET', '/api/company/' + encodeURIComponent('../../x'), { user: A });
    assert.notEqual(traversal.status, 200);
  });

  it('compat: debrief PATCH persists confidenceScore + aiAdvice', async () => {
    const r = await api(base, 'PATCH', '/api/revisions/rev-A1', {
      user: A, body: { confidenceScore: 4, aiAdvice: 'Keep going' },
    });
    assert.equal(r.status, 200);
    const stored = db.read('revisions', 'rev-A1');
    assert.equal(stored.confidenceScore, 4);
    assert.equal(stored.aiAdvice, 'Keep going');
  });

  it('400s AI abuse shapes; compat valid problem-help passes', async () => {
    assert.equal((await api(base, 'POST', '/api/ai/similar-problem', { user: A, body: {} })).status, 400);
    assert.equal((await api(base, 'POST', '/api/ai/learning-notes', { user: A, body: {} })).status, 400);
    assert.equal((await api(base, 'POST', '/api/ai/debrief/analyze', {
      user: A, body: { title: 'T', questions: 'not-array', answers: [] },
    })).status, 400);
    assert.equal((await api(base, 'POST', '/api/ai/problem-help', {
      user: A, body: { title: 'Two Sum', description: 'Add two numbers', difficulty: 'Easy', pattern: null, functionSignature: null, examples: [], constraints: [] },
    })).status, 200);
  });

  it('compat: generate-description with legacy UI body passes (body ignored)', async () => {
    const r = await api(base, 'POST', '/api/problems/prob-A1/generate-description', {
      user: A, body: { title: 'Two Sum', platform: 'LeetCode', difficulty: 'Easy', topics: [], patterns: [] },
    });
    assert.equal(r.status, 200);
  });

  it('429 on pool saturation (Retry-After) — S6 mapping', async () => {
    const r = await api(base, 'POST', '/api/run/java', { user: A, body: { source: 'TRIGGER_429' } });
    assert.equal(r.status, 429);
    assert.equal(r.json.retryable, true);
  });

  it('S12: review cooldown 429s floods; due reviews credit XP atomically', async () => {
    const before = db.read('users', A).totalXP;
    const spam = await api(base, 'POST', '/api/revisions/rev-A2/review', {
      user: A, body: { confidence: 5 },
    });
    assert.equal(spam.status, 429);
    assert.equal(spam.json.retryAfterSec, 60);
    // Flood attempt minted nothing.
    assert.equal(db.read('users', A).totalXP, before);
    const due = await api(base, 'POST', '/api/revisions/rev-A3/review', {
      user: A, body: { confidence: 4 },
    });
    assert.equal(due.status, 200);
    assert.ok(due.json.xpEarned >= 10);
    assert.ok(db.read('users', A).totalXP >= before + 10);
  });

  it('400s code-runner abuse shapes; missing source stays 400', async () => {
    assert.equal((await api(base, 'POST', '/api/run/java', { user: A, body: {} })).status, 400);
    assert.equal((await api(base, 'POST', '/api/run/java', { user: A, body: { source: 'x'.repeat(100001) } })).status, 400);
    assert.equal((await api(base, 'POST', '/api/run/java', { user: A, body: { source: 'class X{}', extra: 1 } })).status, 400);
  });
});

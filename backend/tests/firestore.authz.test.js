/**
 * S3 — cross-user (IDOR/BOLA) regression tests over HTTP.
 *
 * Every test is an attack scenario from the S3 brief: User A supplies User B's
 * document IDs, swaps UIDs in bodies, or reads another user's aggregates.
 * Harness: in-memory Firestore + stubbed auth/AI (see helpers/app.harness.js).
 * No network, no Firebase, no AI calls.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { FakeFirestore, installStubs, startApp, api } = require('./helpers/app.harness');

const A = 'user-A';
const B = 'user-B';

describe('S3 cross-user authorization', () => {
  let base;
  let close;
  let db;

  before(async () => {
    db = new FakeFirestore();
    // Seed two users' private data.
    db.seed('problems', 'prob-A1', { userId: A, title: 'Two Sum', difficulty: 'Easy', topics: [], patterns: [] });
    db.seed('problems', 'prob-B1', { userId: B, title: 'Median Quest', difficulty: 'Hard', topics: [], patterns: [] });
    db.seed('revisions', 'rev-A1', {
      userId: A, problemId: 'prob-A1', problemTitle: 'Two Sum', phase: 'day_2',
      nextDueDate: new Date(Date.now() + 86400000), scheduledReviews: [], totalReviews: 1,
      archived: false, createdAt: new Date(), updatedAt: new Date(),
    });
    db.seed('revisions', 'rev-B1', {
      userId: B, problemId: 'prob-B1', problemTitle: 'Median Quest', phase: 'day_2',
      nextDueDate: new Date(Date.now() + 86400000), scheduledReviews: [], totalReviews: 1,
      archived: false, createdAt: new Date(), updatedAt: new Date(),
    });
    db.seed('users', A, { uid: B, email: 'attacker-planted@test.dev', totalXP: 9999 });
    db.seed('users', B, { totalXP: 10 });

    installStubs(db);
    ({ base, close } = await startApp());
  });

  after(async () => { await close(); });

  // ---- problems ---------------------------------------------------------
  it("A cannot read B's problem (doc-ID swap)", async () => {
    const r = await api(base, 'GET', '/api/problems/prob-B1', { user: A });
    assert.equal(r.status, 403);
  });

  it('A can read their own problem', async () => {
    const r = await api(base, 'GET', '/api/problems/prob-A1', { user: A });
    assert.equal(r.status, 200);
    assert.equal(r.json.title, 'Two Sum');
  });

  it("A cannot overwrite B's problem, and B's doc is unchanged", async () => {
    const r = await api(base, 'PUT', '/api/problems/prob-B1', { user: A, body: { notes: 'pwned' } });
    assert.equal(r.status, 403);
    assert.deepEqual(db.read('problems', 'prob-B1').notes, undefined);
  });

  it('ownership is immutable: userId in PUT body is rejected (S4 strict)', async () => {
    const r = await api(base, 'PUT', '/api/problems/prob-A1', {
      user: A, body: { userId: B, notes: 'mine' },
    });
    assert.equal(r.status, 400);
    const ok = await api(base, 'PUT', '/api/problems/prob-A1', {
      user: A, body: { notes: 'mine' },
    });
    assert.equal(ok.status, 200);
    const stored = db.read('problems', 'prob-A1');
    assert.equal(stored.userId, A);
    assert.equal(stored.notes, 'mine');
  });

  it('created problems are always owned by the token identity (UID swap rejected)', async () => {
    const bad = await api(base, 'POST', '/api/problems', {
      user: A, body: { title: 'Sneaky', userId: B },
    });
    assert.equal(bad.status, 400);
    const r = await api(base, 'POST', '/api/problems', {
      user: A, body: { title: 'Sneaky' },
    });
    assert.equal(r.status, 201);
    assert.equal(db.read('problems', r.json.id).userId, A);
  });

  it("A cannot delete B's problem", async () => {
    const r = await api(base, 'DELETE', '/api/problems/prob-B1', { user: A });
    assert.equal(r.status, 403);
    assert.notEqual(db.read('problems', 'prob-B1'), undefined);
  });

  it("A cannot generate a description for B's problem", async () => {
    const r = await api(base, 'POST', '/api/problems/prob-B1/generate-description', { user: A });
    assert.equal(r.status, 403);
  });

  it('A can generate a description for their own problem (canonical collection)', async () => {
    const r = await api(base, 'POST', '/api/problems/prob-A1/generate-description', { user: A });
    assert.equal(r.status, 200);
    assert.ok(r.json.description);
    assert.ok(db.read('problems', 'prob-A1').description);
  });

  it("A's problem list never contains B's problems", async () => {
    const r = await api(base, 'GET', '/api/problems', { user: A });
    assert.equal(r.status, 200);
    assert.ok(r.json.problems.length >= 1);
    assert.ok(r.json.problems.every((p) => p.userId === A));
  });

  // ---- revisions --------------------------------------------------------
  it("A cannot read/review/delete/log-time on B's revision", async () => {
    assert.equal((await api(base, 'GET', '/api/revisions/rev-B1', { user: A })).status, 403);
    assert.equal((await api(base, 'POST', '/api/revisions/rev-B1/review', { user: A, body: { confidence: 5 } })).status, 403);
    assert.equal((await api(base, 'DELETE', '/api/revisions/rev-B1', { user: A })).status, 403);
    assert.equal((await api(base, 'PATCH', '/api/revisions/rev-B1/log-time', { user: A, body: { phase: 'day_2', timeTaken: 5 } })).status, 403);
    assert.equal((await api(base, 'PATCH', '/api/revisions/rev-B1', { user: A, body: { notes: 'x' } })).status, 403);
    assert.notEqual(db.read('revisions', 'rev-B1'), undefined);
  });

  it('revision creation requires problemId (no undefined-key queries)', async () => {
    const r = await api(base, 'POST', '/api/revisions', { user: A, body: { problemTitle: 'No Id' } });
    assert.equal(r.status, 400);
  });

  it("A's revision list never contains B's revisions", async () => {
    const r = await api(base, 'GET', '/api/revisions', { user: A });
    assert.equal(r.status, 200);
    assert.ok(r.json.revisions.every((x) => x.userId === A));
  });

  // ---- AI boundary ------------------------------------------------------
  it("A cannot launder B's revision through similar-problem (SEC-04)", async () => {
    const r = await api(base, 'POST', '/api/ai/similar-problem', { user: A, body: { problemId: 'rev-B1' } });
    assert.equal(r.status, 403);
  });

  it('A can use similar-problem on their own revision', async () => {
    const r = await api(base, 'POST', '/api/ai/similar-problem', { user: A, body: { problemId: 'rev-A1' } });
    assert.equal(r.status, 200);
    assert.ok(r.json.title);
  });

  // ---- identity integrity (SEC-23) --------------------------------------
  it('/auth/me returns token identity even with a poisoned user doc', async () => {
    const r = await api(base, 'GET', '/api/auth/me', { user: A });
    assert.equal(r.status, 200);
    assert.equal(r.json.uid, A);
    assert.equal(r.json.email, `${A}@test.dev`);
  });

  // ---- analytics isolation ----------------------------------------------
  it('analytics aggregates only the requester’s own problems', async () => {
    const r = await api(base, 'GET', '/api/analytics/overview', { user: A });
    assert.equal(r.status, 200);
    // Seeded: A owns prob-A1 (+1 created above); B's Hard problem must not leak in.
    const blob = JSON.stringify(r.json);
    assert.ok(!blob.includes('Median Quest'));
  });
});

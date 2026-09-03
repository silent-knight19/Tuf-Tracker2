/**
 * S14 — HTTP flood isolation per tier (own process: fresh singleton budgets).
 * Harness stubs AI/analyzer; routes enforce real tier middleware.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { FakeFirestore, installStubs, startApp, api } = require('./helpers/app.harness');

describe('S14 tier floods over HTTP', () => {
  let base;
  let close;

  before(async () => {
    const db = new FakeFirestore();
    db.seed('problems', 'prob-X1', { userId: 'rl-X', title: 'X', difficulty: 'Easy', topics: [], patterns: [] });
    installStubs(db);
    ({ base, close } = await startApp());
  });

  after(async () => { await close(); });

  it('create flood (15/min) 429s the flooder; others fine', async () => {
    const codes = [];
    for (let i = 0; i < 17; i++) {
      const r = await api(base, 'POST', '/api/problems', { user: 'rl-A', body: { title: `F${i}` } });
      codes.push(r.status);
    }
    assert.deepEqual(codes.slice(0, 15), Array(15).fill(201));
    assert.deepEqual(codes.slice(15), [429, 429]);
    const b = await api(base, 'POST', '/api/problems', { user: 'rl-B', body: { title: 'B-ok' } });
    assert.equal(b.status, 201);
  });

  it('scan flood (30/min) 429s; standard reads carry quota headers', async () => {
    const codes = [];
    for (let i = 0; i < 32; i++) {
      codes.push((await api(base, 'GET', '/api/analytics/overview', { user: 'rl-C' })).status);
    }
    assert.deepEqual(codes.slice(0, 30), Array(30).fill(200));
    assert.deepEqual(codes.slice(30), [429, 429]);
  });

  it('quota headers ride normal responses; 429s carry Retry-After', async () => {
    const res = await fetch(`${base}/api/problems`, {
      headers: { 'Content-Type': 'application/json', 'x-test-user': 'rl-D' },
    });
    assert.equal(res.headers.get('ratelimit-limit'), '120');
    assert.ok(Number(res.headers.get('ratelimit-remaining')) >= 0);
    // Force a 429 on create tier and inspect raw headers.
    let last;
    for (let i = 0; i < 16; i++) {
      last = await fetch(`${base}/api/problems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-test-user': 'rl-E' },
        body: JSON.stringify({ title: `H${i}` }),
      });
    }
    assert.equal(last.status, 429);
    assert.ok(last.headers.get('retry-after'));
    assert.equal(last.headers.get('ratelimit-remaining'), '0');
  });
});

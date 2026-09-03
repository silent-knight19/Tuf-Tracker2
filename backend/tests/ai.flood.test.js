/**
 * S8 — HTTP flood isolation (separate process from ai.abuse.test.js: the
 * harness stubs ai.service while ai.abuse needs the real one).
 * Routes enforce real aiLimit quotas; the AI service itself is stubbed.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { FakeFirestore, installStubs, startApp, api } = require('./helpers/app.harness');

describe('S8 flood isolation over HTTP', () => {
  let base;
  let close;

  before(async () => {
    installStubs(new FakeFirestore());
    ({ base, close } = await startApp());
  });

  after(async () => { await close(); });

  it('heavy flood 429s the flooder only; others unaffected', async () => {
    const A = 'flood-A';
    const codes = [];
    for (let i = 0; i < 6; i++) {
      const r = await api(base, 'POST', '/api/ai/solution', {
        user: A, body: { title: `Flood ${i}` },
      });
      codes.push(r.status);
    }
    assert.deepEqual(codes.slice(0, 4), [200, 200, 200, 200]);
    assert.deepEqual(codes.slice(4), [429, 429]);
    // Different user, same endpoint: unaffected.
    const b = await api(base, 'POST', '/api/ai/solution', { user: 'flood-B', body: { title: 'B' } });
    assert.equal(b.status, 200);
    // Same flooder, independent class: unaffected.
    const s = await api(base, 'POST', '/api/ai/debrief/questions', { user: A, body: { title: 'T' } });
    assert.equal(s.status, 200);
  });

  it('429 carries Retry-After and no provider-shaped leak', async () => {
    const A = 'flood-C';
    let last;
    for (let i = 0; i < 5; i++) {
      last = await api(base, 'POST', '/api/ai/solution', { user: A, body: { title: `X${i}` } });
    }
    assert.equal(last.status, 429);
    assert.ok(last.json.retryAfterSec > 0);
    assert.ok(!JSON.stringify(last.json).includes('details'));
  });
});

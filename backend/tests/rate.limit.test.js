/**
 * S14 — layered rate-limit tests. Unit: tiers/layers/headers/refill.
 * HTTP: per-tier floods degrade to 429 for the flooder only.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  RateLimiter, RateLimitError, limitTier, preAuthValve,
} = require('../middleware/rateLimit');

const tinyTiers = () => ({
  t: { perUser: 2, perIp: 3, global: 100 },
  g: { perUser: 100, perIp: 100, global: 2 },
});

function mockRes() {
  return {
    statusCode: null, body: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
}

describe('S14 tier windows (unit)', () => {
  it('exhausts per-user first, then IP, then global — each names Retry-After', () => {
    const l = new RateLimiter(tinyTiers());
    l.check('t', { ip: '1.1.1.1', uid: 'u1' });
    l.check('t', { ip: '1.1.1.1', uid: 'u1' });
    assert.throws(() => l.check('t', { ip: '1.1.1.1', uid: 'u1' }), (e) => (
      e instanceof RateLimitError && e.retryAfterSec >= 1
    ));
    // Same IP, other user: IP budget now 2/3 → one more ok, then IP binds.
    l.check('t', { ip: '1.1.1.1', uid: 'u2' });
    assert.throws(() => l.check('t', { ip: '1.1.1.1', uid: 'u3' }), RateLimitError);
    // Fresh IP/user unaffected.
    l.check('t', { ip: '9.9.9.9', uid: 'u9' });
  });

  it('global ceiling binds across everything', () => {
    const l = new RateLimiter(tinyTiers());
    l.check('g', { ip: 'a', uid: 'a' });
    l.check('g', { ip: 'b', uid: 'b' });
    assert.throws(() => l.check('g', { ip: 'c', uid: 'c' }), /Rate limit/);
  });

  it('windows roll over (white-box aging)', () => {
    const l = new RateLimiter(tinyTiers());
    l.check('t', { ip: '1.1.1.1', uid: 'u1' });
    l.check('t', { ip: '1.1.1.1', uid: 'u1' });
    assert.throws(() => l.check('t', { ip: '1.1.1.1', uid: 'u1' }), RateLimitError);
    for (const m of l.maps.get('t').values()) m.hits = [Date.now() - 61000];
    l.check('t', { ip: '1.1.1.1', uid: 'u1' });
  });
});

describe('S14 middleware headers + pre-auth valve', () => {
  it('emits quota headers on pass, full 429 contract on block', () => {
    const l = new RateLimiter(tinyTiers());
    const mw = limitTier('t', l);
    const run = (uid) => {
      const res = mockRes();
      let next = false;
      mw({ ip: '2.2.2.2', user: { uid }, socket: {} }, res, () => { next = true; });
      return { res, next };
    };
    const first = run('u');
    assert.equal(first.next, true);
    assert.equal(first.res.headers['RateLimit-Limit'], '2');
    assert.equal(first.res.headers['RateLimit-Remaining'], '1');
    run('u');
    const blocked = run('u');
    assert.equal(blocked.next, false);
    assert.equal(blocked.res.statusCode, 429);
    assert.equal(blocked.res.headers['RateLimit-Remaining'], '0');
    assert.ok(blocked.res.headers['Retry-After']);
    assert.ok(blocked.res.body.retryAfterSec >= 1);
  });

  it('pre-auth valve keys on IP without identity', () => {
    const l = new RateLimiter({ pre: { perUser: Infinity, perIp: 2, global: 100 } });
    const mw = preAuthValve(l);
    const run = () => {
      const res = mockRes();
      let next = false;
      mw({ ip: '3.3.3.3', headers: {}, socket: {} }, res, () => { next = true; });
      return { res, next };
    };
    assert.equal(run().next, true);
    assert.equal(run().next, true);
    assert.equal(run().res.statusCode, 429);
  });
});

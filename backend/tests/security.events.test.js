/**
 * S18 — security-event tests: record shape, scrubbing, emission on every
 * denial path, and a static ban on header/token logging.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { secEvent, EVENTS } = require('../services/securityLog');

function capture() {
  const lines = [];
  const orig = console.log;
  console.log = (...a) => lines.push(a.join(' '));
  return { lines, restore: () => { console.log = orig; } };
}

const eventsOf = (lines) => lines
  .map((l) => {
    try { return JSON.parse(l); } catch { return null; }
  })
  .filter((o) => o && EVENTS.has(o.event));

describe('S18 record shape + scrubbing', () => {
  it('emits the required fields with safe types', () => {
    const c = capture();
    try {
      secEvent('auth.fail', { id: 'r1', user: { uid: 'u1' }, method: 'POST', url: '/api/x?token=abc', ip: '9.9.9.9', headers: {} }, { result: 'deny', reason: 'expired' });
    } finally { c.restore(); }
    const [e] = eventsOf(c.lines);
    assert.ok(e);
    assert.equal(e.reqId, 'r1');
    assert.equal(e.uid, 'u1');
    assert.equal(e.method, 'POST');
    assert.equal(e.path, '/api/x'); // query stripped
    assert.equal(e.result, 'deny');
    assert.equal(e.reason, 'expired');
    assert.ok(Date.parse(e.ts));
  });

  it('scrubs hostile meta (headers, tokens, keys, nesting)', () => {
    const c = capture();
    try {
      secEvent('ratelimit.hit', { id: 'r2', headers: {} }, {
        result: 'deny',
        authorization: 'Bearer eyJhbGciOiJSUzI1NiJ9.evil.sig-material-long',
        nested: { apiKey: 'gsk_FIXTUREsupersecretvalue1234567890', ok: 1 },
        key: '-----BEGIN PRIVATE KEY-----\nMIIE...',
      });
    } finally { c.restore(); }
    const blob = c.lines.join('\n');
    assert.ok(!blob.includes('eyJhbGci'));
    assert.ok(!blob.includes('gsk_FIXTUREsupersecret'));
    assert.ok(!blob.includes('BEGIN PRIVATE'));
    assert.ok(blob.includes('"ok":1'));
  });

  it('supports principal-only contexts and rejects unknown types', () => {
    const c = capture();
    try {
      secEvent('runner.rejected', { principal: 'u9' }, { result: 'deny', reason: 'pool-saturated' });
    } finally { c.restore(); }
    const [e] = eventsOf(c.lines);
    assert.equal(e.uid, 'u9');
    assert.throws(() => secEvent('nope', {}, {}), /unknown security event/);
  });
});

describe('S18 emission on denial paths', () => {
  it('auth.fail on bad tokens (reason log-only, body uniform)', async () => {
    const { buildAuthenticate } = require('../middleware/auth.middleware');
    const auth = buildAuthenticate({ sessionCheck: false });
    const run = async (header, id) => {
      const c = capture();
      try {
        const res = { statusCode: null, body: null, status(s) { this.statusCode = s; return this; }, json(b) { this.body = b; return this; } };
        let next = false;
        await auth(
          { headers: { authorization: header }, id, method: 'POST', url: '/api/problems', ip: '1.2.3.4' },
          res, () => { next = true; },
          { auth: { verifyIdToken: async () => { throw { code: 'auth/id-token-expired' }; } }, projectId: 'p' }
        );
        assert.equal(next, false);
        assert.equal(res.statusCode, 401);
        assert.deepEqual(res.body, { error: 'Unauthorized' });
        const [e] = eventsOf(c.lines);
        return e;
      } finally { c.restore(); }
    };
    // Parse gate (wrong token type, verify never reached).
    const e1 = await run('Bearer garbage', 't1a');
    assert.ok(e1 && e1.event === 'auth.fail' && e1.reason === 'wrong-type' && e1.reqId === 't1a');
    // Verify gate (shape-valid JWT, expired).
    const e2 = await run('Bearer aaa.bbb.ccc', 't1b');
    assert.ok(e2 && e2.event === 'auth.fail' && e2.reason === 'expired' && e2.reqId === 't1b');
  });

  it('authz.deny via denyAuthz keeps the frozen 403 body', () => {
    const { denyAuthz } = require('../middleware/errors');
    const c = capture();
    try {
      const res = { statusCode: null, body: null, status(s) { this.statusCode = s; return this; }, json(b) { this.body = b; return this; } };
      denyAuthz(res, { id: 't2', user: { uid: 'u1' }, method: 'GET', url: '/api/problems/x', ip: '1.2.3.4' }, 'problems:item');
      assert.equal(res.statusCode, 403);
      assert.deepEqual(res.body, { error: 'Unauthorized' });
    } finally { c.restore(); }
    const [e] = eventsOf(c.lines);
    assert.ok(e && e.event === 'authz.deny' && e.resource === 'problems:item');
  });

  it('ratelimit.hit + ai.throttle fire with tier/class', async () => {
    const { RateLimiter, limitTier } = require('../middleware/rateLimit');
    const tiny = new RateLimiter({ t: { perUser: 1, perIp: 10, global: 100 } });
    const c = capture();
    try {
      const run = (uid) => {
        const res = { statusCode: null, body: null, headers: {}, status(s) { this.statusCode = s; return this; }, json(b) { this.body = b; return this; }, set(k, v) { this.headers[k] = v; return this; } };
        let next = false;
        limitTier('t', tiny)({ ip: '5.5.5.5', user: { uid }, id: 't3', method: 'GET', url: '/api/x' }, res, () => { next = true; });
        return { res, next };
      };
      assert.equal(run('u').next, true);
      assert.equal(run('u').res.statusCode, 429);
    } finally { c.restore(); }
    const [e] = eventsOf(c.lines);
    assert.ok(e && e.event === 'ratelimit.hit' && e.tier === 't');

    // ai.throttle over the real singleton (fresh process budget: heavy 4/min).
    const { aiLimit } = require('../services/ai.limits');
    const c2 = capture();
    try {
      const uid = `ai-ev-${Date.now()}`;
      for (let i = 0; i < 4; i++) {
        const res = { statusCode: null, headers: {}, status(s) { this.statusCode = s; return this; }, json() { return this; }, set(k, v) { this.headers[k] = v; return this; } };
        let next = false;
        aiLimit('heavy')({ user: { uid }, body: { title: 'x' }, id: 't4', method: 'POST', url: '/api/ai/solution', ip: '6.6.6.6' }, res, () => { next = true; });
        assert.equal(next, true);
      }
      const res = { statusCode: null, body: null, headers: {}, status(s) { this.statusCode = s; return this; }, json(b) { this.body = b; return this; }, set(k, v) { this.headers[k] = v; return this; } };
      let next = false;
      aiLimit('heavy')({ user: { uid }, body: { title: 'x' }, id: 't4', method: 'POST', url: '/api/ai/solution', ip: '6.6.6.6' }, res, () => { next = true; });
      assert.equal(res.statusCode, 429);
    } finally { c2.restore(); }
    const [e2] = eventsOf(c2.lines);
    assert.ok(e2 && e2.event === 'ai.throttle' && e2.class === 'heavy');
  });

  it('runner.rejected fires on pool saturation (principal context)', async () => {
    const { runnerPool } = require('../services/runner.pool');
    const service = require('../services/codeRunner.service');
    const saved = { c: runnerPool.maxConcurrent, q: runnerPool.maxQueue };
    const held = [];
    const c = capture();
    try {
      runnerPool.maxQueue = 0;
      held.push(await runnerPool.acquire('s18-a'));
      held.push(await runnerPool.acquire('s18-a'));
      held.push(await runnerPool.acquire('s18-b'));
      held.push(await runnerPool.acquire('s18-c'));
      const r = await service.runJava('public class Main {}', '', { principal: 's18-victim' });
      assert.equal(r.retryable, true);
    } finally {
      held.forEach((s) => s.release());
      runnerPool.maxConcurrent = saved.c;
      runnerPool.maxQueue = saved.q;
      c.restore();
    }
    const [e] = eventsOf(c.lines);
    assert.ok(e && e.event === 'runner.rejected' && e.uid === 's18-victim');
  });
});

describe('S18 static guard: headers/tokens never logged', () => {
  it('no console statement touches authorization headers or tokens', () => {
    const offenders = [];
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) {
          if (!['node_modules', 'tests'].includes(f.name)) walk(p);
        } else if (/\.js$/.test(f.name)) {
          fs.readFileSync(p, 'utf8').split('\n').forEach((line, i) => {
            if (!/console\.(log|warn|error|info|debug)/.test(line)) return;
            if (/authorization/i.test(line) && !/Bearer-only|without|never/i.test(line)) {
              offenders.push(`${path.relative(path.join(__dirname, '..'), p)}:${i + 1}`);
            }
            if (/req\.headers(?!\.origin)/.test(line)) offenders.push(`${path.relative(path.join(__dirname, '..'), p)}:${i + 1}`);
          });
        }
      }
    };
    walk(path.join(__dirname, '..'));
    assert.deepEqual(offenders, []);
  });
});

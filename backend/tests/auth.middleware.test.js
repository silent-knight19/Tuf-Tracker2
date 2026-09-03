/**
 * S2 — authentication-hardening regression tests (Node built-ins only).
 * Run: `npm test` (backend) → `node --test tests/`
 *
 * Matrix: no/malformed/wrong-type/expired/tampered/wrong-project tokens,
 * revoked + disabled identities (session-checked path), soft-auth safety,
 * ADMIN gate, and a static guard that no route file can use soft auth.
 *
 * Firebase is never touched: fake auth clients are injected via the 4th
 * middleware argument; route files are inspected as text (never required,
 * so no Firebase init happens in tests).
 */

const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  extractBearerToken,
  assertTokenProject,
  parseAdminAllowlist,
  buildAuthenticate,
  authenticateWithSessionCheck,
  requireAdmin,
  softVerifyToken,
} = require('../middleware/auth.middleware');

const authenticate = buildAuthenticate({ sessionCheck: false });

// Three-segment base64url shape — passes the JWT gate, never verified for real.
const FAKE_JWT = 'eyJhbGciOiJSUzI1NiJ9.eyJ1aWQiOiIxIn0.c2ln';
const PROJECT = 'tuftracker';
const GOOD_DECODED = {
  uid: 'user-1',
  email: 'User@Example.com',
  aud: PROJECT,
  iss: `https://securetoken.google.com/${PROJECT}`,
};

function reqWith(authHeader) {
  return { headers: authHeader === undefined ? {} : { authorization: authHeader } };
}
function mockRes() {
  return {
    statusCode: null,
    body: null,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
  };
}
function fakeAuth(overrides = {}) {
  return {
    verifyIdToken: async () => ({ ...GOOD_DECODED }),
    getUser: async (uid) => ({ uid, disabled: false }),
    ...overrides,
  };
}
const throwing = (err) => async () => { throw err; };

describe('S2 header parsing (extractBearerToken)', () => {
  it('reports missing for absent/empty headers', () => {
    assert.equal(extractBearerToken(reqWith(undefined)).error, 'missing');
    assert.equal(extractBearerToken(reqWith('')).error, 'missing');
    assert.equal(extractBearerToken(reqWith('   ')).error, 'missing');
  });
  it('rejects wrong scheme and bare tokens', () => {
    assert.equal(extractBearerToken(reqWith('Token abc.def.ghi')).error, 'malformed');
    assert.equal(extractBearerToken(reqWith('bearer ' + FAKE_JWT)).error, 'malformed');
    assert.equal(extractBearerToken(reqWith('Bearer')).error, 'malformed');
    assert.equal(extractBearerToken(reqWith(FAKE_JWT)).error, 'malformed');
  });
  it('rejects embedded-scheme tricks ("Token Bearer x")', () => {
    assert.equal(
      extractBearerToken(reqWith('Token Bearer ' + FAKE_JWT)).error,
      'malformed'
    );
  });
  it('rejects wrong token types (API keys, garbage)', () => {
    assert.equal(extractBearerToken(reqWith('Bearer sk-test-123')).error, 'wrong-type');
    assert.equal(extractBearerToken(reqWith('Bearer not-a-jwt')).error, 'wrong-type');
    assert.equal(extractBearerToken(reqWith('Bearer aaa.bbb')).error, 'wrong-type');
  });
  it('accepts canonical Bearer JWT', () => {
    const r = extractBearerToken(reqWith('Bearer ' + FAKE_JWT));
    assert.equal(r.token, FAKE_JWT);
  });
});

describe('S2 project assertion (assertTokenProject)', () => {
  it('rejects wrong audience and wrong issuer', () => {
    assert.equal(assertTokenProject({ ...GOOD_DECODED, aud: 'other' }, PROJECT), 'project-mismatch');
    assert.equal(
      assertTokenProject({ ...GOOD_DECODED, iss: 'https://evil.test/x' }, PROJECT),
      'project-mismatch'
    );
  });
  it('accepts matching claims; skips when project unknown', () => {
    assert.equal(assertTokenProject(GOOD_DECODED, PROJECT), null);
    assert.equal(assertTokenProject({ aud: 'anything' }, null), null);
  });
});

describe('S2 strict authenticate (no/revoked/session-agnostic path)', () => {
  const run = (header, auth, projectId = PROJECT) => {
    const req = reqWith(header);
    const res = mockRes();
    let nextCalled = false;
    return authenticate(req, res, () => { nextCalled = true; }, { auth, projectId })
      .then(() => ({ req, res, nextCalled }));
  };

  it('401s with no token and never calls next', async () => {
    const { res, nextCalled } = await run(undefined, fakeAuth());
    assert.equal(res.statusCode, 401);
    assert.deepEqual(res.body, { error: 'Unauthorized' });
    assert.equal(nextCalled, false);
  });

  it('returns a uniform body for every failure reason (no oracle)', async () => {
    const cases = [
      ['Bearer garbage-token', fakeAuth()],
      ['Bearer ' + FAKE_JWT, fakeAuth({ verifyIdToken: throwing({ code: 'auth/id-token-expired' }) })],
      ['Bearer ' + FAKE_JWT, fakeAuth({ verifyIdToken: throwing(new Error('invalid signature')) })],
    ];
    for (const [h, a] of cases) {
      const { res } = await run(h, a);
      assert.equal(res.statusCode, 401, h);
      assert.deepEqual(res.body, { error: 'Unauthorized' }, h);
    }
    const wrongProject = await run('Bearer ' + FAKE_JWT, fakeAuth(), 'other-project');
    assert.equal(wrongProject.res.statusCode, 401);
    assert.deepEqual(wrongProject.res.body, { error: 'Unauthorized' });
  });

  it('rejects expired, tampered, and wrong-project tokens', async () => {
    const expired = await run('Bearer ' + FAKE_JWT, fakeAuth({
      verifyIdToken: throwing({ code: 'auth/id-token-expired' }),
    }));
    assert.equal(expired.res.statusCode, 401);
    const tampered = await run('Bearer ' + FAKE_JWT, fakeAuth({
      verifyIdToken: throwing(new Error('Decoding Firebase ID token failed')),
    }));
    assert.equal(tampered.res.statusCode, 401);
  });

  it('attaches identity and calls next for valid tokens', async () => {
    const { req, res, nextCalled } = await run('Bearer ' + FAKE_JWT, fakeAuth());
    assert.equal(nextCalled, true);
    assert.equal(res.statusCode, null);
    assert.equal(req.user.uid, 'user-1');
    assert.equal(req.auth.uid, 'user-1');
    assert.equal(req.auth.sessionChecked, false);
  });
});

describe('S2 session-checked authenticate (revocation + disabled)', () => {
  const run = (auth) => {
    const req = reqWith('Bearer ' + FAKE_JWT);
    const res = mockRes();
    let nextCalled = false;
    return authenticateWithSessionCheck(req, res, () => { nextCalled = true; }, { auth, projectId: PROJECT })
      .then(() => ({ req, res, nextCalled }));
  };

  it('rejects revoked tokens', async () => {
    const { res, nextCalled } = await run(fakeAuth({
      verifyIdToken: throwing({ code: 'auth/id-token-revoked' }),
    }));
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('rejects disabled users', async () => {
    const { res, nextCalled } = await run(fakeAuth({
      getUser: async (uid) => ({ uid, disabled: true }),
    }));
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('fails closed for deleted/unknown users', async () => {
    const { res, nextCalled } = await run(fakeAuth({
      getUser: throwing({ code: 'auth/user-not-found' }),
    }));
    assert.equal(res.statusCode, 401);
    assert.equal(nextCalled, false);
  });

  it('passes enabled, unrevoked users with sessionChecked=true', async () => {
    const { req, nextCalled } = await run(fakeAuth());
    assert.equal(nextCalled, true);
    assert.equal(req.auth.sessionChecked, true);
  });
});

describe('S2 soft auth never authorizes', () => {
  // NOTE: only missing/malformed/wrong-type inputs are exercised here — they
  // are rejected by the parse gate before any Firebase call, so these tests
  // never touch the network. A well-formed JWT would reach verifyIdToken and
  // is therefore NOT passed to softVerifyToken in tests.
  it('continues with req.user unset on missing/invalid tokens', async () => {
    for (const h of [undefined, '', 'garbage', 'Bearer', 'Token abc.def.ghi', 'Bearer nope']) {
      const req = reqWith(h);
      const res = mockRes();
      let nextCalled = false;
      await softVerifyToken(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true, JSON.stringify(h));
      assert.equal(req.user, undefined, JSON.stringify(h));
    }
  });

  it('STATIC GUARD: no route file may reference softVerifyToken', () => {
    const routesDir = path.join(__dirname, '..', 'routes');
    const offenders = fs.readdirSync(routesDir)
      .filter((f) => f.endsWith('.js'))
      .filter((f) => fs.readFileSync(path.join(routesDir, f), 'utf8').includes('softVerifyToken'));
    assert.deepEqual(offenders, []);
  });

  it('STATIC GUARD: auth.routes re-exports the hardened middleware (no split-parse)', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'routes', 'auth.routes.js'), 'utf8');
    assert.ok(src.includes("require('../middleware/auth.middleware')"));
    assert.ok(!src.includes("split('Bearer ')"));
  });
});

describe('S2 ADMIN gate (requireAdmin)', () => {
  const saved = process.env.ADMIN_EMAILS;
  afterEach(() => {
    if (saved === undefined) delete process.env.ADMIN_EMAILS;
    else process.env.ADMIN_EMAILS = saved;
  });

  const run = (user) => {
    const req = user ? { user, headers: {} } : { headers: {} };
    const res = mockRes();
    let nextCalled = false;
    requireAdmin(req, res, () => { nextCalled = true; });
    return { req, res, nextCalled };
  };

  it('denies everyone when ADMIN_EMAILS is unset (deny-closed)', () => {
    delete process.env.ADMIN_EMAILS;
    const { res, nextCalled } = run({ uid: 'u', email: 'boss@example.com' });
    assert.equal(nextCalled, false);
    assert.equal(res.statusCode, 403);
    assert.deepEqual(res.body, { error: 'Forbidden' });
  });

  it('rejects non-allowlisted emails with 403 and unauthenticated with 401', () => {
    process.env.ADMIN_EMAILS = 'boss@example.com';
    const denied = run({ uid: 'u', email: 'user@example.com' });
    assert.equal(denied.res.statusCode, 403);
    const anon = run(null);
    assert.equal(anon.res.statusCode, 401);
  });

  it('allows allowlisted emails (case-insensitive) and marks req.auth.admin', () => {
    process.env.ADMIN_EMAILS = 'Boss@Example.com, ops@example.com';
    const { req, nextCalled } = run({ uid: 'u', email: 'boss@example.com' });
    assert.equal(nextCalled, true);
    assert.equal(req.auth.admin, true);
  });

  it('parseAdminAllowlist normalizes entries', () => {
    assert.deepEqual(
      [...parseAdminAllowlist('A@x.com, b@Y.com ,,')],
      ['a@x.com', 'b@y.com']
    );
    assert.deepEqual([...parseAdminAllowlist('')], []);
  });
});

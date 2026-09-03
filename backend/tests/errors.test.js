/**
 * S11 — error-disclosure tests: scrubbing, middleware mapping, and a static
 * guard that no route reflects raw internals to clients.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  scrub, scrubString, publicError, notFound, errorMiddleware,
} = require('../middleware/errors');

function mockRes() {
  return {
    statusCode: null, body: null, headers: {}, headersSent: false,
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    setHeader(k, v) { this.headers[k] = v; },
  };
}
const req = (id = 'req-123') => ({ id, method: 'POST', url: '/api/x' });

describe('S11 scrubbing', () => {
  it('redacts secret-shaped strings, keeps normal text', () => {
    assert.equal(scrubString('hello world'), 'hello world');
    assert.ok(!scrubString('key=gsk_FIXTUREabcDEF1234567890xyz').includes('gsk_'));
    assert.ok(!scrubString('-----BEGIN PRIVATE KEY-----\nMIIE...').includes('BEGIN'));
    assert.ok(!scrubString('Bearer eyJhbGciOiJSUzI1NiJ9.long.signature').includes('eyJ'));
    assert.ok(!scrubString('"private_key": "-----BEGIN').includes('BEGIN'));
  });

  it('deep-scrubs objects, redacts secret-named keys, survives circularity', () => {
    const evil = { nested: { apiKey: 'gsk_FIXTUREsecretvalue1234567890', ok: 'fine' } };
    evil.self = evil;
    const out = scrub(evil);
    assert.equal(out.nested.apiKey, '[REDACTED]');
    assert.equal(out.nested.ok, 'fine');
    assert.equal(out.self, '[circular]');
    const err = new Error('boom /etc/passwd stack');
    err.code = 'ENOENT';
    const se = scrub(err);
    assert.ok(se.message.includes('/etc/passwd')); // logs keep diagnostics…
    assert.ok(!('requestId' in se));
  });
});

describe('S11 middleware mapping', () => {
  const silence = () => {
    const orig = console.error;
    console.error = () => {};
    return () => { console.error = orig; };
  };

  it('malformed JSON → 400 Invalid JSON (no parser echo)', () => {
    const restore = silence();
    try {
      const res = mockRes();
      const err = new SyntaxError('Unexpected token } in JSON at position 12 "{\\"a\\":}"');
      err.status = 400;
      err.type = 'entity.parse.failed';
      errorMiddleware(err, req(), res, () => {});
      assert.equal(res.statusCode, 400);
      assert.deepEqual(res.body, { error: 'Invalid JSON body', requestId: 'req-123' });
    } finally { restore(); }
  });

  it('oversized bodies map to 413, not 500 (S19 sweep regression)', () => {
    const restore = silence();
    try {
      const res = mockRes();
      const err = new Error('request entity too large');
      err.type = 'entity.too.large';
      err.status = 413;
      errorMiddleware(err, req('id-8'), res, () => {});
      assert.equal(res.statusCode, 413);
      assert.deepEqual(res.body, { error: 'Request body too large', requestId: 'id-8' });
    } finally { restore(); }
  });

  it('500s are generic + correlated despite hostile error content', () => {
    const restore = silence();
    try {
      const res = mockRes();
      const err = new Error('connect ECONNREFUSED /var/run/db.sock key=gsk_FIXTUREnoisevalue1234567890');
      err.stack = 'Error: x\n    at /app/services/secret.js:3:1\ngsk_FIXTUREnoisevalue1234567890';
      errorMiddleware(err, req('id-9'), res, () => {});
      assert.equal(res.statusCode, 500);
      assert.deepEqual(res.body, { error: 'Internal Server Error', requestId: 'id-9' });
    } finally { restore(); }
  });

  it('log line carries the id and scrubbed content', () => {
    const lines = [];
    const orig = console.error;
    console.error = (...a) => lines.push(a.join(' '));
    try {
      errorMiddleware(new Error('x gsk_FIXTURElogvalue1234567890'), req('id-7'), mockRes(), () => {});
    } finally { console.error = orig; }
    assert.ok(lines.join('\n').includes('id-7'));
    assert.ok(!lines.join('\n').includes('gsk_FIXTURElogvalue'));
  });

  it('headersSent delegates; notFound/publicError shapes hold', () => {
    let nexted = null;
    errorMiddleware(new Error('x'), req(), { headersSent: true }, (e) => { nexted = e; });
    assert.ok(nexted instanceof Error);
    const r404 = mockRes();
    notFound(req('n1'), r404);
    assert.deepEqual(r404.body, { error: 'Not found', requestId: 'n1' });
  });
});

describe('S11 static guard: no raw reflections in responses', () => {
  it('routes/server never send err.message / details to clients', () => {
    const offenders = [];
    const allow = new Set([
      // sendAiError: 400 branch returns OUR OWN 'Refusing AI call…' string
      // (instanceof/code-gated), never foreign internals.
      'services/ai.limits.js',
    ]);
    const scan = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) {
          if (!['node_modules', 'tests'].includes(f.name)) scan(p);
        } else if (/\.js$/.test(f.name)) {
          checkFile(p, path.relative(path.join(__dirname, '..'), p));
        }
      }
    };
    const checkFile = (p, rel) => {
      if (allow.has(rel)) return;
      const src = fs.readFileSync(p, 'utf8');
      const lines = src.split('\n');
      lines.forEach((line, i) => {
        if (/console\./.test(line)) return; // logs (S18 structures them)
        if (/\berr(or)?\.message\b/.test(line) && /res\./.test(context(lines, i))) {
          offenders.push(`${rel}:${i + 1}`);
        }
        if (/details\s*:/.test(line) && !/^\s*(\/\/|\*)/.test(line)) offenders.push(`${rel}:${i + 1}`);
      });
    };
    scan(path.join(__dirname, '..', 'routes'));
    // server.js is a file, not a dir: check it directly.
    const srv = path.join(__dirname, '..', 'server.js');
    checkFile(srv, path.relative(path.join(__dirname, '..'), srv));
    assert.deepEqual(offenders, []);
  });
});

// Lines around i that mention res.* (multi-line res.status().json() chains).
function context(lines, i) {
  return lines.slice(Math.max(0, i - 3), i + 4).join('\n');
}

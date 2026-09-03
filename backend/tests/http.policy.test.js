/**
 * S10 — CORS/CSRF/HTTP-header tests (pure policy + live preflight/headers).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildAllowedOrigins, isAllowedOrigin, corsOptions, helmetOptions,
} = require('../config/cors.policy');

const devEnv = { frontendUrl: 'https://app.vercel.app', isProduction: false };
const prodEnv = { frontendUrl: 'https://app.vercel.app', isProduction: true };

describe('S10 origin matrix', () => {
  it('dev: exact + loopback-any-port + missing allowed; everything else denied', () => {
    const allowed = buildAllowedOrigins(devEnv);
    const yes = [
      'https://app.vercel.app',
      'http://localhost:5173',
      'http://localhost:9999',
      'http://127.0.0.1:3000',
      undefined, null, '',
    ];
    const no = [
      'https://evil.test',
      'https://app.vercel.app.evil.test',
      'https://evil.app.vercel.app',
      'http://localhost:5173.evil.test', // prefix trick
      'http://localhost.evil.test',
      'https://localhost:5173', // https loopback is not the dev shape
      'null', // sandboxed-iframe origin string
      'not-a-url',
    ];
    for (const o of yes) assert.equal(isAllowedOrigin(o, allowed, false), true, String(o));
    for (const o of no) assert.equal(isAllowedOrigin(o, allowed, false), false, String(o));
  });

  it('prod: exact allowlist only (no loopback, no prefix tricks)', () => {
    const allowed = buildAllowedOrigins(prodEnv);
    assert.equal(isAllowedOrigin('https://app.vercel.app', allowed, true), true);
    const no = [
      'http://localhost:5173', 'http://127.0.0.1:5173', 'https://evil.test',
      'http://localhost:5173.evil.test', 'https://app.vercel.app.evil.test', 'null',
    ];
    for (const o of no) assert.equal(isAllowedOrigin(o, allowed, true), false, String(o));
    assert.equal(isAllowedOrigin(undefined, allowed, true), true); // non-browser
  });

  it('cors options: deny branch errors, credentials exact-only, Retry-After exposed', async () => {
    const opts = corsOptions(devEnv);
    assert.equal(opts.credentials, true);
    assert.ok(opts.exposedHeaders.includes('Retry-After'));
    assert.ok(opts.exposedHeaders.includes('X-Request-Id'));
    assert.ok(!opts.exposedHeaders.some((h) => h.includes('X-RateLimit')));
    const call = (origin) => new Promise((resolve) => {
      opts.origin(origin, (err, ok) => resolve({ err, ok }));
    });
    assert.equal((await call('https://app.vercel.app')).ok, true);
    const denied = await call('https://evil.test');
    assert.ok(denied.err instanceof Error);
    assert.equal(denied.ok, undefined);
  });

  it('helmet options: API-tight CSP + HSTS preload', () => {
    const o = helmetOptions();
    assert.deepEqual(o.contentSecurityPolicy.directives.frameAncestors, ["'none'"]);
    assert.deepEqual(o.contentSecurityPolicy.directives.defaultSrc, ["'none'"]);
    assert.equal(o.hsts.preload, true);
  });
});

describe('S10 CSRF posture (static)', () => {
  it('no cookie-based auth anywhere (Bearer-only, CSRF n/a)', () => {
    const hits = [];
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) {
          if (f.name !== 'node_modules' && f.name !== 'tests') walk(p);
        } else if (f.name.endsWith('.js')) {
          const src = fs.readFileSync(p, 'utf8');
          if (/cookie-parser|req\.cookies|res\.cookie/.test(src)) hits.push(p);
        }
      }
    };
    walk(path.join(__dirname, '..'));
    assert.deepEqual(hits, []);
  });

  it('frontend vercel.json ships CSP + framing/transport guards', () => {
    const vercel = JSON.parse(fs.readFileSync(
      path.join(__dirname, '..', '..', 'frontend', 'vercel.json'), 'utf8'
    ));
    const headers = vercel.headers[0].headers;
    const get = (k) => headers.find((h) => h.key.toLowerCase() === k).value;
    const csp = get('content-security-policy');
    assert.ok(csp.includes("frame-ancestors 'none'"));
    assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp));
    assert.ok(csp.includes("object-src 'none'"));
    assert.ok(!/(^|[;\s])\*([;\s]|$)/.test(csp.replace(/localhost:\*/g, '')));
    assert.equal(get('x-frame-options'), 'DENY');
    assert.ok(get('strict-transport-security').includes('includeSubDomains'));
    assert.equal(get('x-content-type-options'), 'nosniff');
  });
});

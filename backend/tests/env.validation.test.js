/**
 * S1 — secure-boot regression tests (Node built-ins only: node:test + assert).
 * Run: `npm test` (backend)  →  `node --test tests/`
 *
 * Covers the S1 acceptance matrix:
 *  missing env · invalid env · weak secret · development config in production
 *  · invalid Firebase configuration · missing AI credentials
 * plus: secret redaction (SEC-25) and .env.example hygiene (SEC-16).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateEnv } = require('../config/env.validation');

const REAL_SA = JSON.stringify({
  type: 'service_account',
  project_id: 'tuftracker',
  private_key_id: 'abc123',
  private_key: '-----BEGIN PRIVATE KEY-----\nMIIErealkeymaterial\n-----END PRIVATE KEY-----\n',
  client_email: 'firebase-adminsdk-fbsvc@tuftracker.iam.gserviceaccount.com',
  client_id: '108743225036434425227',
});
const REAL_KEY = 'gsk_FIXTUREvalidkey0123456789abcdefghij0001'; // clearly fake; strength-shaped only

function baseProd(overrides = {}) {
  return {
    NODE_ENV: 'production',
    PORT: '3001',
    FRONTEND_URL: 'https://tuftracker.vercel.app',
    BACKEND_URL: 'https://tuftracker-backend.onrender.com',
    FIREBASE_SERVICE_ACCOUNT: REAL_SA,
    GROQ_API_KEY: REAL_KEY,
    ...overrides,
  };
}

function baseDev(overrides = {}) {
  return {
    NODE_ENV: 'development',
    PORT: '5001',
    FRONTEND_URL: 'http://localhost:5173',
    BACKEND_URL: 'http://localhost:5001',
    ...overrides,
  };
}

describe('S1 production happy path', () => {
  it('accepts a complete, sane production config', () => {
    const r = validateEnv(baseProd());
    assert.deepEqual(r.fatal, []);
    assert.deepEqual(r.errors, []);
    assert.equal(r.config.isProduction, true);
    assert.equal(r.config.port, 3001);
    assert.equal(r.config.host, '0.0.0.0');
    assert.equal(r.config.aiKeySource, 'GROQ_API_KEY');
  });

  it('accepts OPENROUTER_API_KEY as the AI credential', () => {
    const env = baseProd();
    delete env.GROQ_API_KEY;
    env.OPENROUTER_API_KEY = 'sk-or-v1-0123456789abcdef0123456789abcdef';
    const r = validateEnv(env);
    assert.deepEqual(r.fatal, []);
    assert.deepEqual(r.errors, []);
    assert.equal(r.config.aiKeySource, 'OPENROUTER_API_KEY');
  });
});

describe('S1 missing env in production (fail closed)', () => {
  it('refuses boot without Firebase credentials', () => {
    const env = baseProd();
    delete env.FIREBASE_SERVICE_ACCOUNT;
    const r = validateEnv(env);
    assert.ok(r.errors.some((e) => e.includes('FIREBASE_SERVICE_ACCOUNT')));
  });

  it('refuses boot without any AI key', () => {
    const env = baseProd();
    delete env.GROQ_API_KEY;
    const r = validateEnv(env);
    assert.ok(r.errors.some((e) => e.includes('GROQ_API_KEY')));
  });

  it('refuses boot without FRONTEND_URL (unsafe CORS input)', () => {
    const env = baseProd();
    delete env.FRONTEND_URL;
    const r = validateEnv(env);
    assert.ok(r.errors.some((e) => e.includes('FRONTEND_URL')));
  });

  it('refuses boot without BACKEND_URL', () => {
    const env = baseProd();
    delete env.BACKEND_URL;
    const r = validateEnv(env);
    assert.ok(r.errors.some((e) => e.includes('BACKEND_URL')));
  });
});

describe('S1 invalid env', () => {
  it('rejects unknown NODE_ENV everywhere (fatal)', () => {
    // Note: blank/missing NODE_ENV defaults to development with a warning
    // (tested below) — only unknown non-blank values are fatal.
    for (const ne of ['prod', 'Production', 'staging']) {
      const env = baseDev({ NODE_ENV: ne === '' ? '' : ne });
      const r = validateEnv(env);
      assert.ok(r.fatal.some((e) => e.includes('NODE_ENV')), `NODE_ENV=${JSON.stringify(ne)}`);
    }
  });

  it('rejects non-numeric and out-of-range PORT', () => {
    for (const p of ['abc', '80x', '0', '99999', '-1']) {
      const r = validateEnv(baseProd({ PORT: p }));
      assert.ok(
        r.errors.some((e) => e.includes('PORT')) || r.fatal.some((e) => e.includes('PORT')),
        `PORT=${p}`
      );
    }
  });

  it('rejects malformed HOST', () => {
    const r = validateEnv(baseProd({ HOST: 'not a host!!' }));
    assert.ok(r.errors.some((e) => e.includes('HOST')));
  });

  it('rejects wildcard FRONTEND_URL', () => {
    const r = validateEnv(baseProd({ FRONTEND_URL: 'https://*.vercel.app' }));
    assert.ok(r.errors.concat(r.fatal).some((e) => e.includes('FRONTEND_URL')));
  });

  it('rejects non-http(s) BACKEND_URL', () => {
    const r = validateEnv(baseProd({ BACKEND_URL: 'ftp://internal/x' }));
    assert.ok(r.errors.some((e) => e.includes('BACKEND_URL')));
  });
});

describe('S1 weak / default secrets (fatal everywhere once set)', () => {
  it('rejects short AI keys in every environment', () => {
    for (const ne of ['development', 'test', 'production']) {
      const env = (ne === 'development' ? baseDev() : baseProd({ NODE_ENV: ne }));
      env.GROQ_API_KEY = 'short';
      const r = validateEnv(env);
      assert.ok(r.fatal.some((e) => e.includes('GROQ_API_KEY')), `NODE_ENV=${ne}`);
    }
  });

  it('rejects placeholder AI keys', () => {
    for (const k of ['your-groq-api-key-here', 'test', 'changeme', 'xxx']) {
      const r = validateEnv(baseDev({ GROQ_API_KEY: k }));
      assert.ok(r.fatal.some((e) => e.includes('GROQ_API_KEY')), `key=${k}`);
    }
  });

  it('rejects malformed FIREBASE_SERVICE_ACCOUNT JSON everywhere', () => {
    for (const ne of ['development', 'production']) {
      const env = ne === 'development' ? baseDev() : baseProd();
      env.FIREBASE_SERVICE_ACCOUNT = '{not-json';
      const r = validateEnv(env);
      assert.ok(r.fatal.some((e) => e.includes('FIREBASE_SERVICE_ACCOUNT')), `NODE_ENV=${ne}`);
    }
  });

  it('rejects service-account JSON missing required fields', () => {
    const r = validateEnv(baseDev({
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify({ type: 'service_account', project_id: 'x' }),
    }));
    assert.ok(r.fatal.some((e) => e.includes('FIREBASE_SERVICE_ACCOUNT')));
  });
});

describe('S1 development config in production', () => {
  it('refuses localhost FRONTEND_URL in production (dev config shipped to prod)', () => {
    const r = validateEnv(baseProd({ FRONTEND_URL: 'http://localhost:5173' }));
    assert.ok(r.errors.some((e) => e.includes('FRONTEND_URL')));
  });

  it('refuses localhost BACKEND_URL in production', () => {
    const r = validateEnv(baseProd({ BACKEND_URL: 'http://localhost:3001' }));
    assert.ok(r.errors.some((e) => e.includes('BACKEND_URL')));
  });

  it('refuses http FRONTEND_URL for non-localhost hosts in production', () => {
    const r = validateEnv(baseProd({ FRONTEND_URL: 'http://tuftracker.vercel.app' }));
    assert.ok(r.errors.some((e) => e.includes('FRONTEND_URL')));
  });

  it('refuses demo/development Firebase credentials in production', () => {
    const demo = JSON.stringify({
      type: 'service_account',
      project_id: 'demo-test',
      private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
      client_email: 'x@demo-test.iam.gserviceaccount.com',
    });
    const r = validateEnv(baseProd({ FIREBASE_SERVICE_ACCOUNT: demo }));
    assert.ok(r.errors.some((e) => e.includes('FIREBASE_SERVICE_ACCOUNT')));
  });

  it('refuses the shipped .env.example values in production', () => {
    const example = fs.readFileSync(path.join(__dirname, '..', '.env.example'), 'utf8');
    const vals = {};
    for (const line of example.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !line.trim().startsWith('#')) vals[m[1]] = m[2];
    }
    const r = validateEnv({ ...vals, NODE_ENV: 'production' });
    assert.ok(
      r.errors.length > 0 || r.fatal.length > 0,
      'example placeholders must never boot production'
    );
  });
});

describe('S1 development convenience (warn, do not block)', () => {
  it('boots in development without Firebase/AI keys (warnings only)', () => {
    const r = validateEnv(baseDev());
    assert.deepEqual(r.fatal, []);
    assert.deepEqual(r.errors, []);
    assert.ok(r.warnings.length > 0);
    assert.equal(r.config.isProduction, false);
    assert.equal(r.config.host, '127.0.0.1');
  });

  it('defaults missing NODE_ENV to development with a warning', () => {
    const env = baseDev();
    delete env.NODE_ENV;
    const r = validateEnv(env);
    assert.deepEqual(r.fatal, []);
    assert.equal(r.config.nodeEnv, 'development');
    assert.ok(r.warnings.some((w) => w.includes('NODE_ENV')));
  });
});

describe('S1 secret redaction (no secret values in diagnostics)', () => {
  it('never echoes credential material in errors/fatal/warnings/config', () => {
    const evil = {
      NODE_ENV: 'production',
      PORT: 'notaport',
      HOST: 'bad host!!',
      FRONTEND_URL: 'https://tuftracker.vercel.app',
      BACKEND_URL: 'https://tuftracker-backend.onrender.com',
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify({
        type: 'service_account',
        project_id: 'tuftracker',
        private_key: '-----BEGIN PRIVATE KEY-----\nSUPERSECRETMATERIAL\n-----END PRIVATE KEY-----\n',
        client_email: 'a@b.iam.gserviceaccount.com',
      }),
      GROQ_API_KEY: 'x',
    };
    const r = validateEnv(evil);
    const blob = JSON.stringify({
      e: r.errors, f: r.fatal, w: r.warnings, c: r.config,
    });
    assert.ok(!blob.includes('SUPERSECRETMATERIAL'), 'private key material leaked');
    assert.ok(!blob.includes('-----BEGIN PRIVATE KEY-----'), 'key header leaked');
    assert.ok(r.fatal.length > 0 || r.errors.length > 0);
  });
});

describe('S2 ADMIN_EMAILS validation (S1 extension)', () => {
  const { validateEnv } = require('../config/env.validation');
  it('accepts a well-formed allowlist', () => {
    const r = validateEnv({
      NODE_ENV: 'production',
      PORT: '3001',
      FRONTEND_URL: 'https://x.vercel.app',
      BACKEND_URL: 'https://x.onrender.com',
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify({
        type: 'service_account',
        project_id: 'p',
        private_key: '-----BEGIN PRIVATE KEY-----\nk\n-----END PRIVATE KEY-----\n',
        client_email: 'a@p.iam.gserviceaccount.com',
      }),
      GROQ_API_KEY: 'gsk_0123456789abcdef0123456789abcdef01234567',
      ADMIN_EMAILS: 'lead@tuftracker.app, ops@tuftracker.app',
    });
    assert.deepEqual(r.fatal, []);
    assert.deepEqual(r.errors, []);
  });
  it('rejects malformed and placeholder allowlists everywhere', () => {
    for (const v of ['not-an-email', 'a@b, nope', 'admin@example.com']) {
      const r = validateEnv({ NODE_ENV: 'development', ADMIN_EMAILS: v });
      assert.ok(r.fatal.some((e) => e.includes('ADMIN_EMAILS')), v);
    }
  });
  it('warns (not errors) when unset in production — routes deny closed', () => {
    const r = validateEnv({
      NODE_ENV: 'production',
      PORT: '3001',
      FRONTEND_URL: 'https://x.vercel.app',
      BACKEND_URL: 'https://x.onrender.com',
      FIREBASE_SERVICE_ACCOUNT: JSON.stringify({
        type: 'service_account',
        project_id: 'p',
        private_key: '-----BEGIN PRIVATE KEY-----\nk\n-----END PRIVATE KEY-----\n',
        client_email: 'a@p.iam.gserviceaccount.com',
      }),
      GROQ_API_KEY: 'gsk_0123456789abcdef0123456789abcdef01234567',
    });
    assert.ok(r.warnings.some((w) => w.includes('ADMIN_EMAILS')));
    assert.ok(!r.errors.some((e) => e.includes('ADMIN_EMAILS')));
  });
});

describe('S1 secret hygiene: .env.example ships no real secrets', () => {  it('example file has placeholders, not key material', () => {
    const p = path.join(__dirname, '..', '.env.example');
    assert.ok(fs.existsSync(p), 'backend/.env.example must exist');
    const text = fs.readFileSync(p, 'utf8');
    assert.ok(/your-|example|changeme/i.test(text), 'example must contain obvious placeholders');
    assert.ok(!/gsk_[A-Za-z0-9]{20,}/.test(text), 'example must not contain a real Groq key');
    assert.ok(
      !/-----BEGIN PRIVATE KEY-----[A-Za-z0-9+/=\\\n ]{100,}/.test(text),
      'example must not contain real key material'
    );
  });
});

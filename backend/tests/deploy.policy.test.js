/**
 * S17 — deployment policy tests (static; no Docker daemon here by design).
 * Whatever the Dockerfile/render.yaml promise must hold as text, because the
 * image itself can only be verified at build/deploy time.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('S17 image policy (backend/Dockerfile)', () => {
  const df = read('backend/Dockerfile');

  it('runs non-root on a supported LTS base', () => {
    assert.match(df, /^FROM node:2\d-slim/m);
    assert.ok(!/^FROM node:18/m.test(df), 'Node 18 is EOL');
    assert.ok(/^USER node$/m.test(df), 'must drop privileges');
    assert.ok(!/^USER root$/m.test(df));
    // USER must precede the runtime (not set-then-overridden).
    assert.ok(df.indexOf('USER node') < df.indexOf('CMD ['), 'USER before CMD');
  });

  it('keeps the image minimal and reproducible', () => {
    assert.ok(df.includes('COPY --chown=node:node . .'));
    assert.ok(df.includes('npm ci --omit=dev'), 'reproducible prod-only install');
    assert.ok(df.includes('rm -rf /var/lib/apt/lists/*'), 'apt cache cleaned');
    assert.ok(!/^\s*ADD\s/m.test(df), 'COPY, not ADD');
  });

  it('bakes in no secrets and exposes one port with direct invocation', () => {
    assert.ok(!/gsk_|BEGIN PRIVATE KEY|AKIA[0-9A-Z]{16}|FIREBASE_SERVICE_ACCOUNT=/.test(df));
    const exposes = df.match(/^EXPOSE .+$/gm) || [];
    assert.deepEqual(exposes, ['EXPOSE 3001']);
    assert.ok(df.includes('CMD ["node", "server.js"]'), 'direct node (signal-safe), not npm');
  });

  it('healthcheck probes the public route and honors PORT', () => {
    assert.ok(df.includes('HEALTHCHECK'));
    assert.ok(df.includes('/health'), 'public endpoint, not an authed route');
    assert.ok(df.includes('process.env.PORT'), 'PORT-aware, not hardcoded');
    assert.ok(df.includes('java -version') && df.includes('javac -version'), 'toolchain verified at build');
  });
});

describe('S17 platform policy (render.yaml, .dockerignore, docs)', () => {
  it('render.yaml gates health correctly and scopes secrets to the dashboard', () => {
    const y = read('render.yaml');
    assert.ok(y.includes('healthCheckPath: /health'));
    for (const k of ['FIREBASE_SERVICE_ACCOUNT', 'GROQ_API_KEY', 'FRONTEND_URL', 'BACKEND_URL', 'ADMIN_EMAILS']) {
      assert.ok(y.includes(`key: ${k}`), k);
      assert.ok(new RegExp(`key: ${k}\\s*\\n\\s*sync: false`).test(y), `${k} sync:false`);
    }
    assert.ok(!/gsk_[A-Za-z0-9]{10,}|BEGIN PRIVATE KEY/.test(y), 'no secret values in blueprint');
  });

  it('.dockerignore keeps secrets and dev payload out of the image', () => {
    const di = read('backend/.dockerignore').split('\n').map((l) => l.trim());
    for (const entry of ['.env', 'node_modules', 'tests/', 'test_ai.js']) {
      assert.ok(di.includes(entry), entry);
    }
  });

  it('deployment docs point at the real health endpoint', () => {
    assert.ok(read('DEPLOYMENT.md').includes('/health'));
  });
});

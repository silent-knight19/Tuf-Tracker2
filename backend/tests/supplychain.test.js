/**
 * S16 — supply-chain policy gates (static, no network).
 * Locks the audit decisions: no dead deps, no install scripts in direct deps,
 * lockfiles present, no secret-shaped material in tracked files.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..', '..');
const BACKEND = path.join(ROOT, 'backend');

function trackedFiles() {
  const out = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
  return out.split('\n').map((f) => f.trim()).filter(Boolean);
}

function jsSources(dir, acc = []) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) {
      if (!['node_modules', 'dist', 'tests'].includes(f.name)) jsSources(p, acc);
    } else if (/\.jsx?$/.test(f.name)) acc.push(p);
  }
  return acc;
}

describe('S16 dependency hygiene', () => {
  it('every backend direct dependency is imported somewhere (no dead deps)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(BACKEND, 'package.json'), 'utf8'));
    const src = jsSources(BACKEND).map((p) => fs.readFileSync(p, 'utf8')).join('\n');
    const unused = Object.keys(pkg.dependencies || {}).filter((dep) => {
      const re = new RegExp(`require\\(['"]${dep}['"]\\)|from ['"]${dep}['"]`);
      return !re.test(src);
    });
    assert.deepEqual(unused, []);
  });

  it('express-rate-limit stays removed (unused, formerly vulnerable)', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(BACKEND, 'package.json'), 'utf8'));
    assert.ok(!((pkg.dependencies || {})['express-rate-limit']));
  });

  it('no install scripts in backend direct dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(BACKEND, 'package.json'), 'utf8'));
    const offenders = [];
    for (const dep of Object.keys(pkg.dependencies || {})) {
      try {
        const dp = JSON.parse(fs.readFileSync(
          path.join(BACKEND, 'node_modules', dep, 'package.json'), 'utf8'
        ));
        for (const k of Object.keys(dp.scripts || {})) {
          if (/^(pre|post)?install$/.test(k)) offenders.push(`${dep}: ${k}`);
        }
      } catch {
        // Not installed locally — CI installs before testing.
      }
    }
    assert.deepEqual(offenders, []);
  });

  it('lockfiles exist and are tracked', () => {
    const files = trackedFiles();
    assert.ok(files.includes('backend/package-lock.json'));
    assert.ok(files.includes('frontend/package-lock.json'));
  });
});

describe('S16 secret scan (tracked files)', () => {
  it('no secret-shaped material outside obvious placeholders/fixtures', () => {
    const SECRET_RE = /gsk_[A-Za-z0-9]{10,}|sk-or-v1-[A-Za-z0-9]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----[A-Za-z0-9+/=\s]{40,}|AKIA[0-9A-Z]{16}|ya29\.[A-Za-z0-9-_]{10,}|ghp_[A-Za-z0-9]{10,}|xox[bpas]-[A-Za-z0-9-]{6,}/;
    const FIXTURE_OK = /\.\.\.|your-|example|UNIQUE|MARKER|FIXTURE|0123456789abcdef|test-should-never|placeholder|changeme|<[^>]*>/i;
    const SKIP_EXT = ['.lock', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.map'];
    const hits = [];
    for (const f of trackedFiles()) {
      if (f.includes('node_modules') || SKIP_EXT.some((e) => f.endsWith(e))) continue;
      let text;
      try {
        text = fs.readFileSync(path.join(ROOT, f), 'utf8');
      } catch {
        continue;
      }
      text.split('\n').forEach((line, i) => {
        if (SECRET_RE.test(line) && !FIXTURE_OK.test(line)) hits.push(`${f}:${i + 1}`);
      }
      );
    }
    assert.deepEqual(hits, []);
  });

  it('.env files are never tracked', () => {
    const files = trackedFiles();
    const envs = files.filter((f) => /(^|\/)\.env$/.test(f));
    assert.deepEqual(envs, []);
  });
});

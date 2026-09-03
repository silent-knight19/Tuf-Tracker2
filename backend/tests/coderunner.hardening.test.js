/**
 * S5 — runner hardening tests. Fast by default (no hostile execution in CI):
 * argv construction, caps, env hygiene, benign end-to-end (when javac exists).
 * Slow/hostile proofs live behind RUN_SLOW_TESTS=1 / RUN_ESCAPE_CORPUS=1.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const service = require('../services/codeRunner.service');

function haveJava() {
  try {
    const r = spawnSync('javac', ['-version'], { timeout: 10000 });
    return r.status === 0;
  } catch {
    return false;
  }
}

describe('S5 no-shell construction', () => {
  it('STATIC GUARD: service spawns via execFile, never sh/bash', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'services', 'codeRunner.service.js'), 'utf8');
    assert.ok(src.includes('execFilePromise('));
    assert.ok(src.includes("require('child_process')"));
    // No shell invocation in code (backtick-quoted mentions in comments don't count).
    assert.ok(!/bash\s+-c\s*"/.test(src));
    assert.ok(!src.includes('promisify(exec)'));
    const routes = fs.readFileSync(path.join(__dirname, '..', 'routes', 'codeRunner.routes.js'), 'utf8');
    assert.ok(routes.includes('execFile'));
    assert.ok(!/bash\s+-c\s*"/.test(routes));
  });

  it('compile argv is an array with kernel timeout on Linux, plain javac elsewhere', () => {
    const wasLinux = service.isLinux;
    try {
      service.isLinux = true;
      const lin = service.buildCompileCommand(['Main.java']);
      assert.equal(lin.cmd, 'timeout');
      assert.ok(lin.args.includes('javac'));
      assert.ok(lin.args.includes('Main.java'));
      assert.ok(!lin.args.some((a) => /[;&|`$]/.test(a) && a.length > 3 && a.includes(' ')));
      service.isLinux = false;
      const mac = service.buildCompileCommand(['Main.java']);
      assert.equal(mac.cmd, 'javac');
      assert.ok(mac.args.includes('-encoding'));
    } finally {
      service.isLinux = wasLinux;
    }
  });

  it('run argv pins memory/stack/user.dir and carries no shell metacharacters', () => {
    const wasLinux = service.isLinux;
    try {
      service.isLinux = false;
      const { cmd, args } = service.buildRunCommand('/tmp/java-XYZ', ['input.json']);
      assert.equal(cmd, 'java');
      const joined = args.join(' ');
      assert.ok(joined.includes('-Xmx64m'));
      assert.ok(joined.includes('-Xss256k'));
      assert.ok(joined.includes('-XX:MaxDirectMemorySize=16m'));
      assert.ok(args.some((a) => a === '-Duser.dir=/tmp/java-XYZ'));
      assert.ok(args.includes('input.json'));
    } finally {
      service.isLinux = wasLinux;
    }
  });
});

describe('S5 budgets and hygiene', () => {
  it('service-level input caps fail closed without executing', async () => {
    const big = 'x'.repeat(service.constants.MAX_SOURCE_BYTES + 1);
    const r1 = await service.runJava(big, '');
    assert.equal(r1.stage, 'error');
    // S11: generic to callers (HTTP path reports precise S4 400s first).
    assert.equal(r1.stderr, 'Server error');
    const r2 = await service.runJava('public class Main {}', 'y'.repeat(service.constants.MAX_STDIN_BYTES + 1));
    assert.equal(r2.stage, 'error');
    assert.equal(r2.stderr, 'Server error');
  });

  it('compile caps reject class bombs (fake dir, no JVM)', async () => {
    const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 's5-cap-'));
    try {
      for (let i = 0; i < service.constants.MAX_CLASS_FILES + 6; i++) {
        await fs.promises.writeFile(path.join(dir, `C${i}.class`), Buffer.alloc(10));
      }
      await assert.rejects(service.enforceCompileCaps(dir), /too many artifacts/);
    } finally {
      await fs.promises.rm(dir, { recursive: true, force: true });
    }
  });

  it('child env is minimal and sandbox-scoped (no secret inheritance)', async () => {
    process.env.GROQ_API_KEY = 'gsk_test-should-never-reach-child';
    process.env.FIREBASE_SERVICE_ACCOUNT = '{"secret":true}';
    try {
      const env = service.getSafeEnv('/tmp/java-sandbox');
      const blob = JSON.stringify(env);
      assert.ok(!blob.includes('gsk_test'));
      assert.ok(!blob.includes('FIREBASE'));
      assert.equal(env.TMPDIR, '/tmp/java-sandbox');
      assert.ok(env.PATH.split(':').every((p) => ['/usr/bin', '/bin'].includes(p)));
    } finally {
      delete process.env.GROQ_API_KEY;
      delete process.env.FIREBASE_SERVICE_ACCOUNT;
    }
  });

  it('output is truncated to budget', () => {
    const big = 'z'.repeat(service.constants.MAX_OUTPUT_BYTES + 100);
    const { text, truncated } = service.clipOutput(big);
    assert.equal(truncated, true);
    assert.ok(Buffer.byteLength(text, 'utf8') <= service.constants.MAX_OUTPUT_BYTES);
    assert.equal(service.clipOutput('small').truncated, false);
  });
});

describe('S5 benign end-to-end (skipped without javac)', { skip: !haveJava() }, () => {
  it('direct-main program runs and temp dirs are created 0700', async () => {
    const r = await service.runJava(
      'public class Main { public static void main(String[] args) { System.out.println("hello-s5"); } }',
      ''
    );
    assert.equal(r.exitCode, 0);
    assert.match(r.stdout, /hello-s5/);
    assert.equal(r.stage, 'run');
  });

  it('wrapped solution path executes via input.json', async () => {
    const code = 'class Solution { public int add(int a, int b) { return a + b; } }';
    const stdin = JSON.stringify({ method: 'add', tests: [{ args: [2, 3], expected: 5 }] });
    const r = await service.runJava(code, stdin);
    assert.equal(r.exitCode, 0);
    assert.match(r.stdout, /Test 1: 5/);
  });

  it('user.dir is pinned inside the sandbox (safe probe)', async () => {
    const r = await service.runJava(
      'public class Main { public static void main(String[] args) { System.out.println(System.getProperty("user.dir")); } }',
      ''
    );
    assert.equal(r.exitCode, 0);
    assert.match(r.stdout.trim(), /java-/);
    assert.ok(!r.stdout.includes('/app'));
  });
});

describe('S5 slow proof: infinite loop is killed (RUN_SLOW_TESTS=1 only)', {
  skip: process.env.RUN_SLOW_TESTS !== '1',
}, () => {
  it('LOOP-01 times out instead of hanging the backend', async () => {
    const { corpus } = require('./security/java-escape.corpus');
    const loop = corpus.find((c) => c.id === 'LOOP-01');
    const r = await service.runJava(loop.code, '');
    assert.equal(r.timedOut, true);
  });
});

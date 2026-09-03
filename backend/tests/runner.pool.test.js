/**
 * S6 — admission-control tests.
 * Pool semantics: tiny synthetic pools (fast, exact). Volley proofs: real JVM
 * through the singleton pool (bounded wall-clock, no bombs beyond fast OOMs).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { RunnerPool, PoolOverloadError, runnerPool } = require('../services/runner.pool');

const tick = (ms = 5) => new Promise((r) => setTimeout(r, ms));

async function hold(pool, principal, ms) {
  const slot = await pool.acquire(principal);
  await tick(ms);
  slot.release();
}

describe('S6 pool semantics (synthetic)', () => {
  it('enforces the global ceiling under volley', async () => {
    const pool = new RunnerPool({ maxConcurrent: 2, maxPerPrincipal: 10, maxQueue: 10 });
    let live = 0;
    let peak = 0;
    await Promise.all(Array.from({ length: 6 }, async () => {
      const slot = await pool.acquire('u');
      live += 1;
      peak = Math.max(peak, live);
      await tick(10);
      live -= 1;
      slot.release();
    }));
    assert.ok(peak <= 2, `peak=${peak}`);
    assert.deepEqual(pool.stats().running, 0);
  });

  it('per-principal cap cannot starve other principals (no HOL blocking)', async () => {
    const pool = new RunnerPool({ maxConcurrent: 3, maxPerPrincipal: 1, maxQueue: 10 });
    const order = [];
    const aJobs = [1, 2, 3].map(async (i) => {
      const slot = await pool.acquire('A');
      order.push(`A${i}`);
      await tick(15);
      slot.release();
    });
    await tick(2); // let A occupy + queue
    const bJob = (async () => {
      const slot = await pool.acquire('B');
      order.push('B');
      slot.release();
    })();
    await Promise.all([...aJobs, bJob]);
    // B must run before A's backlog drains (global had room, B had budget).
    assert.ok(order.indexOf('B') < order.length - 1, order.join(','));
    assert.ok(order.indexOf('B') <= 2, order.join(','));
  });

  it('rejects immediately when the queue is full (retryable)', async () => {
    const pool = new RunnerPool({ maxConcurrent: 1, maxPerPrincipal: 5, maxQueue: 1 });
    const s1 = await pool.acquire('u');
    const queued = pool.acquire('u'); // occupies the single queue slot
    await assert.rejects(pool.acquire('u'), (e) => e instanceof PoolOverloadError && e.retryable === true);
    s1.release();
    await queued.then((s) => s.release());
  });

  it('waiters time out instead of wedging', async () => {
    const pool = new RunnerPool({ maxConcurrent: 1, maxPerPrincipal: 5, maxQueue: 5, queueTimeoutMs: 30 });
    const s1 = await pool.acquire('u');
    await assert.rejects(pool.acquire('u'), /timed out/);
    s1.release();
    const s2 = await pool.acquire('u');
    s2.release();
  });

  it('release is idempotent and always drains', async () => {
    const pool = new RunnerPool({ maxConcurrent: 1, maxPerPrincipal: 1, maxQueue: 1 });
    const s = await pool.acquire('u');
    s.release();
    s.release();
    assert.deepEqual(pool.stats(), { running: 0, queued: 0, maxConcurrent: 1, maxPerPrincipal: 1, maxQueue: 1 });
  });

  it('slow holder blocks strangers but queued work proceeds after release', async () => {
    const pool = new RunnerPool({ maxConcurrent: 1, maxPerPrincipal: 1, maxQueue: 5 });
    await hold(pool, 'holder', 1);
    assert.deepEqual(pool.stats().running, 0);
  });
});

describe('S6 live volleys (real JVM, singleton pool)', () => {
  const service = require('../services/codeRunner.service');
  const HELLO = 'public class Main { public static void main(String[] args) { System.out.println("v"); } }';

  it('6 parallel benign runs all complete (queued, not dead)', async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, (_, i) => service.runJava(HELLO, '', { principal: `volley-${i % 3}` }))
    );
    assert.ok(results.every((r) => r.exitCode === 0), JSON.stringify(results.map((r) => r.stderr)));
    const st = runnerPool.stats();
    assert.equal(st.running, 0);
    assert.equal(st.queued, 0);
  });

  it('4 parallel heap bombs fail fast and the pool drains', async () => {
    const { corpus } = require('./security/java-escape.corpus');
    const mem = corpus.find((c) => c.id === 'MEM-01').code;
    const t0 = Date.now();
    const results = await Promise.all(
      Array.from({ length: 4 }, (_, i) => service.runJava(mem, '', { principal: `mem-${i}` }))
    );
    assert.ok(results.every((r) => r.exitCode === 1 && !r.timedOut));
    assert.ok(Date.now() - t0 < 60000);
    assert.equal(runnerPool.stats().running, 0);
  });

  it('saturation degrades to retryable without executing (fast, capped singleton)', async () => {
    const saved = { c: runnerPool.maxConcurrent, q: runnerPool.maxQueue };
    const held = [];
    try {
      runnerPool.maxQueue = 0;
      // Fill the (real) global ceiling with raw slots across principals.
      held.push(await runnerPool.acquire('sat-a'));
      held.push(await runnerPool.acquire('sat-a'));
      held.push(await runnerPool.acquire('sat-b'));
      held.push(await runnerPool.acquire('sat-c'));
      assert.equal(runnerPool.stats().running, saved.c);
      const r = await service.runJava(HELLO, '', { principal: 'sat-victim' });
      assert.equal(r.stage, 'queued');
      assert.equal(r.retryable, true);
    } finally {
      held.forEach((s) => s.release());
      runnerPool.maxConcurrent = saved.c;
      runnerPool.maxQueue = saved.q;
    }
    assert.equal(runnerPool.stats().running, 0);
  });
});

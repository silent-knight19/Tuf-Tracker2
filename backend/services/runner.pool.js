/**
 * S6 — runner admission control (no new dependencies).
 *
 * Bounds the one resource S5 deliberately left open: PARALLELISM. Every
 * execution — HTTP (`principal` = token uid) or internal AI validation
 * (`principal` = 'internal:ai') — holds a slot from this pool:
 *
 *  - maxConcurrent: global ceiling (JVMs are heavy; fail fast beyond it).
 *  - maxPerPrincipal: one abusive user can never occupy the whole pool.
 *  - maxQueue: bounded waiters; beyond that reject immediately (no unbounded
 *    promise buildup = no memory-DoS via queueing).
 *  - queueTimeoutMs: waiters give up instead of wedging behind a stuck job.
 *
 * Dispatch scans FIFO for the first runnable waiter (global + principal
 * capacity), so one principal's backlog cannot head-of-line-block others.
 * Release is idempotent and always runs (finally), including on crashes.
 */

class PoolOverloadError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PoolOverloadError';
    this.retryable = true;
  }
}

class RunnerPool {
  constructor({ maxConcurrent = 4, maxPerPrincipal = 2, maxQueue = 20, queueTimeoutMs = 60000 } = {}) {
    this.maxConcurrent = maxConcurrent;
    this.maxPerPrincipal = maxPerPrincipal;
    this.maxQueue = maxQueue;
    this.queueTimeoutMs = queueTimeoutMs;
    this._running = 0;
    this._perPrincipal = new Map();
    this._queue = []; // [{ principal, resolve, reject, timer, queuedAt }]
  }

  _count(principal) {
    return this._perPrincipal.get(principal) || 0;
  }

  _canRun(principal) {
    return this._running < this.maxConcurrent && this._count(principal) < this.maxPerPrincipal;
  }

  _take(principal) {
    this._running += 1;
    this._perPrincipal.set(principal, this._count(principal) + 1);
    let released = false;
    return {
      release: () => {
        if (released) return;
        released = true;
        this._running -= 1;
        const left = this._count(principal) - 1;
        if (left <= 0) this._perPrincipal.delete(principal);
        else this._perPrincipal.set(principal, left);
        this._pump();
      },
    };
  }

  _pump() {
    for (let i = 0; i < this._queue.length; i++) {
      const waiter = this._queue[i];
      if (this._canRun(waiter.principal)) {
        this._queue.splice(i, 1);
        clearTimeout(waiter.timer);
        waiter.resolve(this._take(waiter.principal));
        // Capacity may remain (multi-release paths) — keep scanning.
      }
    }
  }

  acquire(principal) {
    const who = principal || 'anonymous';
    if (this._canRun(who)) return Promise.resolve(this._take(who));
    if (this._queue.length >= this.maxQueue) {
      return Promise.reject(new PoolOverloadError('Server busy: execution queue is full.'));
    }
    return new Promise((resolve, reject) => {
      const waiter = { principal: who, resolve, reject, queuedAt: Date.now(), timer: null };
      waiter.timer = setTimeout(() => {
        const idx = this._queue.indexOf(waiter);
        if (idx !== -1) this._queue.splice(idx, 1);
        reject(new PoolOverloadError('Server busy: timed out waiting for an execution slot.'));
      }, this.queueTimeoutMs);
      // No unref: a queued waiter is real pending work and its promise must
      // settle (timeout or dispatch). The timer is always cleared on pump.
      this._queue.push(waiter);
    });
  }

  stats() {
    return {
      running: this._running,
      queued: this._queue.length,
      maxConcurrent: this.maxConcurrent,
      maxPerPrincipal: this.maxPerPrincipal,
      maxQueue: this.maxQueue,
    };
  }
}

// Budgets: conservative for small hosts (each slot ≈ 1 JVM + 1 javac at peak).
// Externalized to constants (not env) on purpose — see s6-runner-budgets.md.
const runnerPool = new RunnerPool({
  maxConcurrent: 4,
  maxPerPrincipal: 2,
  maxQueue: 20,
  queueTimeoutMs: 60000,
});

module.exports = { RunnerPool, PoolOverloadError, runnerPool };

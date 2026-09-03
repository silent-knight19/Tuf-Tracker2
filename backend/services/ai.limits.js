/**
 * S8 — AI cost/abuse protection (no new dependencies).
 *
 * Every AI call passes two gates:
 *  1. Route middleware `aiLimit(opClass)`: per-user quotas per operation class
 *     + prompt-size estimate accounting, per rolling minute. Rejects 429.
 *  2. `checkAttempt()` inside callAI: exact prompt chars per ATTEMPT (retries
 *     included), global per-minute ceiling, and concurrency slots. Throws
 *     AiOverloadError (mapped to 429 by sendAiError, never 500).
 *
 * Why both: the middleware sees only the request (cheap admission, no state
 * churn on validation failures when ordered validate→limit); the service sees
 * the exact prompt and every retry. An attacker's retries therefore consume
 * the attacker's own budget instead of multiplying load — the S8 core rule.
 *
 * Budgets are v1 tunables (see s8-ai-abuse.md). IP-level limits are S14's job
 * (needs trust-proxy discipline); everything here keys on the verified uid.
 */

const { RunnerPool } = require('./runner.pool');

const WINDOW_MS = 60 * 1000;

// v1 budgets: { requests/min, chars/min } per uid; global ceiling/min.
const DEFAULT_BUDGETS = {
  heavy: { perUserPerMin: 4, perUserCharsPerMin: 120000 },
  standard: { perUserPerMin: 12, perUserCharsPerMin: 120000 },
  globalPerMin: 30, // Groq free-tier ceiling: hard reject, never block-wait
};

class AiOverloadError extends Error {
  constructor(message, retryAfterSec = 60) {
    super(message);
    this.name = 'AiOverloadError';
    this.code = 'AI_OVERLOAD';
    this.retryAfterSec = retryAfterSec;
  }
}

function now() {
  return Date.now();
}

/** Rolling-window counter: prunes expired entries on touch. */
class Window {
  constructor() {
    this.hits = []; // timestamps
  }
  count(t) {
    while (this.hits.length > 0 && this.hits[0] <= t - WINDOW_MS) this.hits.shift();
    return this.hits.length;
  }
  add(t, n = 1) {
    for (let i = 0; i < n; i++) this.hits.push(t);
  }
}

class AiLimits {
  constructor(budgets = DEFAULT_BUDGETS, poolOpts = { maxConcurrent: 8, maxPerPrincipal: 8, maxQueue: 0, queueTimeoutMs: 1 }) {
    this.budgets = budgets;
    this.reqWindows = new Map(); // `${uid}:${class}` -> Window
    this.charWindows = new Map(); // `${uid}` -> { window, chars: [[t, n]] }
    this.globalWindow = new Window();
    // AI concurrency: no queue (maxQueue 0) — saturated provider calls fail
    // fast with 429 instead of stacking 45s timeouts behind each other.
    this.pool = new RunnerPool(poolOpts);
    this._usersSeen = new Set();
  }

  _key(map, k) {
    let w = map.get(k);
    if (!w) {
      // Bound memory: drop all state if the keyspace explodes (uid cardinality
      // attack). 10k uids is far beyond this app's size; reset is safe because
      // windows are advisory quotas, not security invariants.
      if (map.size > 10000) map.clear();
      w = new Window();
      map.set(k, w);
    }
    return w;
  }

  _charsUsed(t, uid) {
    const entry = this.charWindows.get(uid);
    if (!entry) return 0;
    while (entry.samples.length > 0 && entry.samples[0][0] <= t - WINDOW_MS) entry.samples.shift();
    return entry.samples.reduce((sum, [, n]) => sum + n, 0);
  }

  _addChars(uid, t, n) {
    let entry = this.charWindows.get(uid);
    if (!entry) {
      if (this.charWindows.size > 10000) this.charWindows.clear();
      entry = { samples: [] };
      this.charWindows.set(uid, entry);
    }
    entry.samples.push([t, n]);
  }

  /**
   * Route-level admission. `estChars` ≈ JSON body length (proxy for tokens).
   * Throws AiOverloadError with retryAfterSec. Counted once per request.
   */
  checkRequest(uid, opClass, estChars = 0) {
    const t = now();
    const budget = this.budgets[opClass] || this.budgets.standard;
    const who = uid || 'anonymous';
    if (this._key(this.reqWindows, `${who}:${opClass}`).count(t) >= budget.perUserPerMin) {
      throw new AiOverloadError(`AI ${opClass} quota exceeded. Try again shortly.`, 60);
    }
    if (this._charsUsed(t, who) + estChars > budget.perUserCharsPerMin) {
      throw new AiOverloadError('AI size quota exceeded. Try again shortly.', 60);
    }
    if (this.globalWindow.count(t) >= this.budgets.globalPerMin) {
      throw new AiOverloadError('AI service is saturated. Try again shortly.', 30);
    }
    this._key(this.reqWindows, `${who}:${opClass}`).add(t);
    this._addChars(who, t, estChars);
    this.globalWindow.add(t);
  }

  /**
   * Service-level gate: concurrency slot only. Per-user/per-request quotas
   * live at the route (checkRequest); retries are bounded by count (default
   * max 3 attempts/request) × jittered backoff, and attempts never touch the
   * request windows — otherwise one request would consume 4× global budget.
   * Direct service callers (cron) inherit the global concurrency bound.
   */
  async acquireSlot() {
    try {
      return await this.pool.acquire('ai');
    } catch {
      throw new AiOverloadError('AI service is saturated. Try again shortly.', 10);
    }
  }

  stats() {
    return { pool: this.pool.stats(), globalLastMin: this.globalWindow.count(now()) };
  }
}

const aiLimits = new AiLimits();

/** Remaining quota snapshot for IETF RateLimit-* headers (S14 wiring). */
function quotaInfo(uid, opClass) {
  const t = Date.now();
  const budget = DEFAULT_BUDGETS[opClass] || DEFAULT_BUDGETS.standard;
  const key = `${uid || 'anonymous'}:${opClass}`;
  const w = aiLimits.reqWindows.get(key);
  if (!w) return { limit: budget.perUserPerMin, remaining: budget.perUserPerMin, resetSec: 60 };
  const hits = w.count(t);
  const oldest = w.hits[0] || t;
  return {
    limit: budget.perUserPerMin,
    remaining: Math.max(0, budget.perUserPerMin - hits),
    resetSec: Math.max(1, Math.ceil((oldest + 60000 - t) / 1000)),
  };
}

function setQuotaHeaders(res, info) {
  res.set('RateLimit-Limit', String(info.limit));
  res.set('RateLimit-Remaining', String(info.remaining));
  res.set('RateLimit-Reset', String(info.resetSec));
}

/** Route middleware factory: validate → aiLimit(opClass) → handler. */
function aiLimit(opClass) {
  return (req, res, next) => {
    const uid = req.user && req.user.uid;
    try {
      let estChars = 0;
      try {
        estChars = Buffer.byteLength(JSON.stringify(req.body || {}), 'utf8');
      } catch {
        estChars = 0;
      }
      aiLimits.checkRequest(uid, opClass, estChars);
      // S14: real quota headers (the frontend store already reads these).
      setQuotaHeaders(res, quotaInfo(uid, opClass));
      return next();
    } catch (error) {
      if (error instanceof AiOverloadError) {
        res.set('Retry-After', String(error.retryAfterSec));
        const info = quotaInfo(uid, opClass);
        setQuotaHeaders(res, { ...info, remaining: 0, resetSec: error.retryAfterSec });
        try {
          require('./securityLog').secEvent('ai.throttle', req, { result: 'deny', class: opClass, retryAfterSec: error.retryAfterSec });
        } catch { /* logging never breaks limiting */ }
        return res.status(429).json({ error: error.message, retryAfterSec: error.retryAfterSec });
      }
      return next(error);
    }
  };
}

/** Map AI errors to HTTP: overload → 429, everything else → 500 (safe msg). */
function sendAiError(res, error, fallback = 'AI request failed') {
  if (error instanceof AiOverloadError || error.code === 'AI_OVERLOAD') {
    res.set('Retry-After', String(error.retryAfterSec || 60));
    return res.status(429).json({ error: error.message, retryAfterSec: error.retryAfterSec || 60 });
  }
  if (error && String(error.message || '').startsWith('Refusing AI call')) {
    return res.status(400).json({ error: error.message });
  }
  return res.status(500).json({ error: fallback });
}

module.exports = { AiLimits, AiOverloadError, aiLimits, aiLimit, sendAiError, quotaInfo, DEFAULT_BUDGETS };

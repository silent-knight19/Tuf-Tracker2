/**
 * S14 — layered rate limiting (no new dependencies; express-rate-limit, though
 * installed, is unused — this module is the single implementation so quotas,
 * keys, and headers stay consistent with aiLimits/runnerPool).
 *
 * Layers per tier: client IP (pre-auth flood, verify-cost protection) +
 * authenticated user (abuse) + global (instance safety valve). Order in
 * routes: authenticate → validate → [aiLimit] → limitTier → handler, so
 * unauthenticated floods still meet the pre-auth IP valve in server.js.
 *
 * Responses: 429 + Retry-After + IETF RateLimit-Limit/Remaining/Reset
 * (the frontend rateLimitStore already reads these — previously phantom).
 * Windows roll per 60s; keyspace bounded (10k reset, advisory quotas).
 */

const WINDOW_MS = 60 * 1000;
const MAX_KEYS = 10000;

// v1 tiers: { perUser/min, perIp/min, global/min }. IP caps are deliberately
// roomy (many users can share NAT/Vercel egress); per-user caps do the work.
const TIERS = {
  // Unauthenticated-but-cheap public reads.
  public: { perUser: Infinity, perIp: 120, global: 2000 },
  // Default authenticated traffic.
  standard: { perUser: 120, perIp: 1000, global: 5000 },
  // Creation paths (problem/revision POST, analyze): AI + write cost.
  create: { perUser: 15, perIp: 60, global: 500 },
  // Full-collection scans.
  scan: { perUser: 30, perIp: 200, global: 1000 },
  // Reviews (S12 cooldown is the primary control; this is the flood net).
  review: { perUser: 60, perIp: 300, global: 2000 },
  // Code execution (runner pool is primary; this stops queue churn).
  execute: { perUser: 20, perIp: 100, global: 300 },
  // Pre-auth valve for all /api traffic (verify-cost protection).
  pre: { perUser: Infinity, perIp: 1000, global: 20000 },
};

class RateLimitError extends Error {
  constructor(retryAfterSec, limit, remaining, resetSec) {
    super('Rate limit exceeded. Try again shortly.');
    this.name = 'RateLimitError';
    this.retryAfterSec = retryAfterSec;
    this.limit = limit;
    this.remaining = remaining;
    this.resetSec = resetSec;
  }
}

class TierWindow {
  constructor() {
    this.hits = [];
  }
  prune(t) {
    while (this.hits.length > 0 && this.hits[0] <= t - WINDOW_MS) this.hits.shift();
    return this.hits;
  }
}

class RateLimiter {
  constructor(tiers = TIERS) {
    this.tiers = tiers;
    this.maps = new Map(); // tier -> Map(key -> TierWindow)
  }

  _map(tier) {
    let m = this.maps.get(tier);
    if (!m) {
      if (this.maps.size > 20) this.maps.clear();
      m = new Map();
      this.maps.set(tier, m);
    }
    return m;
  }

  _window(tier, key) {
    const m = this._map(tier);
    let w = m.get(key);
    if (!w) {
      if (m.size > MAX_KEYS) m.clear();
      w = new TierWindow();
      m.set(key, w);
    }
    return w;
  }

  /**
   * Check + record. Throws RateLimitError naming the FIRST exhausted layer.
   * Returns { limit, remaining, resetSec } for headers (user layer).
   */
  check(tierName, { ip, uid } = {}) {
    const t = Date.now();
    const tier = this.tiers[tierName];
    if (!tier) throw new Error(`unknown rate tier: ${tierName}`);
    const checks = [];
    if (Number.isFinite(tier.global)) checks.push(['global', `g:${tierName}`, tier.global]);
    if (ip && Number.isFinite(tier.perIp)) checks.push(['ip', `ip:${tierName}:${ip}`, tier.perIp]);
    if (uid && Number.isFinite(tier.perUser)) checks.push(['user', `u:${tierName}:${uid}`, tier.perUser]);
    let userInfo = { limit: tier.perUser, remaining: tier.perUser, resetSec: 0 };
    for (const [, key, max] of checks) {
      const w = this._window(tierName, key);
      const hits = w.prune(t);
      if (hits.length >= max) {
        const resetSec = Math.max(1, Math.ceil((hits[0] + WINDOW_MS - t) / 1000));
        throw new RateLimitError(resetSec, max, 0, resetSec);
      }
    }
    for (const [, key] of checks) this._window(tierName, key).hits.push(t);
    if (uid && Number.isFinite(tier.perUser)) {
      const hits = this._window(tierName, `u:${tierName}:${uid}`).hits;
      userInfo = {
        limit: tier.perUser,
        remaining: Math.max(0, tier.perUser - hits.length),
        resetSec: Math.max(1, Math.ceil((hits[0] + WINDOW_MS - t) / 1000)),
      };
    }
    return userInfo;
  }
}

const rateLimiter = new RateLimiter();

function clientIp(req) {
  // S10 sets `trust proxy: 1` (single Render hop): leftmost untrusted entry
  // is the client; Express resolves it into req.ip. Fallbacks for tests.
  return (req.ip || req.socket?.remoteAddress || 'unknown').toString();
}

/** Route middleware factory. Attaches quota headers; 429s on exhaustion. */
function limitTier(tierName, limiter = rateLimiter) {
  return (req, res, next) => {
    try {
      const info = limiter.check(tierName, {
        ip: clientIp(req),
        uid: req.user && req.user.uid,
      });
      if (Number.isFinite(info.limit)) {
        res.set('RateLimit-Limit', String(info.limit));
        res.set('RateLimit-Remaining', String(info.remaining));
        res.set('RateLimit-Reset', String(info.resetSec));
      }
      return next();
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.set('Retry-After', String(error.retryAfterSec));
        res.set('RateLimit-Limit', String(error.limit));
        res.set('RateLimit-Remaining', '0');
        res.set('RateLimit-Reset', String(error.resetSec));
        try {
          require('../services/securityLog').secEvent('ratelimit.hit', req, { result: 'deny', tier: tierName, retryAfterSec: error.retryAfterSec });
        } catch { /* logging never breaks limiting */ }
        return res.status(429).json({ error: error.message, retryAfterSec: error.retryAfterSec });
      }
      return next(error);
    }
  };
}

/** Pre-auth IP valve for mounting in server.js before any auth work. */
function preAuthValve(limiter = rateLimiter) {
  return (req, res, next) => limitTier('pre', limiter)(req, res, next);
}

module.exports = { TIERS, RateLimiter, RateLimitError, rateLimiter, limitTier, preAuthValve, clientIp };

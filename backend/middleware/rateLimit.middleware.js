const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

/**
 * UNIFIED AI RATE LIMITER
 * Enforces a strict combined limit of 20 requests per hour for ALL AI features
 * (Questions + Notes + Edge Cases + Hints = Combined Pool)
 * 
 * Uses ipKeyGenerator helper to properly handle IPv6 addresses
 */
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 Hour Window
  max: 20, // Limit to 20 requests per hour combined
  standardHeaders: true, // Return RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    error: 'AI Usage Limit Reached (20/hour). Please wait for your quota to reset.',
    status: 429
  },
  // Skip rate limiting for whitelisted emails
  skip: (req) => {
    if (!req.user || !req.user.email) return false;
    const whitelist = (process.env.WHITELISTED_EMAILS || '').split(',').map(e => e.trim());
    return whitelist.includes(req.user.email);
  },
  // Use a custom key generator that groups all AI requests by IP + 'ai_combined'
  // This ensures all endpoints verify against the SAME counter
  // Using ipKeyGenerator to properly handle IPv6 addresses
  keyGenerator: (req) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const safeIp = ipKeyGenerator(ip);
    return `ai_combined:${safeIp}`;
  }
});

// Simple standard limiter for other API routes (300/15min)
// Uses default keyGenerator which handles IPv6 properly
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please slow down.' },
  skip: (req) => {
    if (!req.user || !req.user.email) return false;
    const whitelist = (process.env.WHITELISTED_EMAILS || '').split(',').map(e => e.trim());
    return whitelist.includes(req.user.email);
  }
});

module.exports = { aiLimiter, standardLimiter };

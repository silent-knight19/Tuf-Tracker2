/**
 * S11 — internal/public error separation (no new dependencies).
 *
 * Contract:
 *  - Clients receive SAFE messages + a request/correlation ID. 5xx bodies are
 *    always generic; nothing below reflects err.message, stacks, paths,
 *    dependency internals, DB errors, shell text, or env values.
 *  - Diagnostics go to logs ONLY, passed through scrub() (secret-shaped
 *    material → [REDACTED]).
 *  - Frozen S2/S4/S8 4xx bodies ({error:'Unauthorized'} etc.) are untouched —
 *    contract stability beats uniformity there; everything NEW uses
 *    publicError() with requestId.
 */

const crypto = require('crypto');

function requestId(req, res, next) {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
}

const SECRET_RES = [
  /\b(gsk_|sk-or-|AIza)[A-Za-z0-9-_]{8,}/g,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  /\bBearer\s+[A-Za-z0-9-_.~+/=]{10,}/g,
  /\bya29\.[A-Za-z0-9-_]{10,}/g,
  /\b(ghp_|gho_|github_pat_|xox[bpas]-)[A-Za-z0-9-_]{6,}/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /"private_key"\s*:\s*"[^"]*/g,
];

function scrubString(s) {
  let out = s;
  for (const re of SECRET_RES) {
    re.lastIndex = 0;
    out = out.replace(re, '[REDACTED]');
  }
  return out;
}

/** Deep, circular-safe scrub for log payloads (strings, arrays, plain objects). */
function scrub(value, seen = new WeakSet(), depth = 0) {
  if (typeof value === 'string') return scrubString(value);
  if (typeof value !== 'object' || value === null || depth > 5) return value;
  if (seen.has(value)) return '[circular]';
  if (value instanceof Error) {
    seen.add(value);
    return {
      name: value.name,
      message: scrubString(value.message || ''),
      code: value.code,
      stack: value.stack ? scrubString(value.stack.split('\n').slice(0, 5).join('\n')) : undefined,
    };
  }
  if (Array.isArray(value)) {
    seen.add(value);
    return value.slice(0, 20).map((v) => scrub(v, seen, depth + 1));
  }
  if (value.constructor && value.constructor.name !== 'Object') return '[object]';
  seen.add(value);
  const out = {};
  for (const [k, v] of Object.entries(value).slice(0, 50)) {
    out[k] = /token|secret|key|auth|password|private/i.test(k) && typeof v === 'string'
      ? '[REDACTED]'
      : scrub(v, seen, depth + 1);
  }
  return out;
}

function logInternal(req, err, note = 'unhandled') {
  try {
    console.error(
      `[error] id=${req.id || '-'} ${note} ${req.method || ''} ${req.originalUrl || req.url || ''} ::`,
      JSON.stringify(scrub(err)).slice(0, 2000)
    );
  } catch {
    console.error(`[error] id=${req.id || '-'} ${note} (unloggable error object)`);
  }
}

/** New-surface errors: safe message + correlation id. */
function publicError(res, req, status, fallbackMessage) {
  return res.status(status).json({ error: fallbackMessage, requestId: req.id || null });
}

/**
 * S18: ownership denial with event. `resource` is a TYPE label + doc id only
 * (never the other party's data). Response shape frozen to S2's 403.
 */
function denyAuthz(res, req, resource) {
  try {
    require('../services/securityLog').secEvent('authz.deny', req, {
      result: 'deny',
      resource: typeof resource === 'string' ? resource : 'unknown',
    });
  } catch {
    // Logging must never break authorization.
  }
  return res.status(403).json({ error: 'Unauthorized' });
}

function notFound(req, res) {
  return publicError(res, req, 404, 'Not found');
}

// Final Express error middleware (4-arity). Mount AFTER routes.
function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  // Body-parser failures: express.json throws entity.* errors with status.
  // Map to clean 4xx (never the parser message — it echoes body snippets).
  // S19 caught this: entity.too.large (413) must not become a 500.
  if (err && typeof err.type === 'string' && err.type.startsWith('entity.')) {
    logInternal(req, err, 'bad-body');
    const status = err.status === 413 ? 413 : 400;
    return publicError(res, req, status, status === 413 ? 'Request body too large' : 'Invalid JSON body');
  }
  if (err && err instanceof SyntaxError && err.status === 400) {
    logInternal(req, err, 'bad-json');
    return publicError(res, req, 400, 'Invalid JSON body');
  }
  logInternal(req, err, 'unhandled');
  return publicError(res, req, 500, 'Internal Server Error');
}

module.exports = { requestId, scrub, scrubString, publicError, denyAuthz, notFound, errorMiddleware, logInternal };

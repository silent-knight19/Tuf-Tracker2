/**
 * S18 — structured security events (no new dependencies).
 *
 * ONE function emits every security-relevant outcome as a single-line JSON
 * record: { ts, event, reqId, uid, ip, method, path, result, ...fields }.
 * Payloads pass through scrub() — tokens, keys, secrets, and header material
 * can never reach the logs even if a caller passes them by mistake.
 *
 * Event catalog (see s18-observability.md):
 *  auth.fail, authz.deny, ratelimit.hit, ai.throttle, runner.rejected,
 *  admin.action
 */

const { clientIp } = require('../middleware/rateLimit');

const EVENTS = new Set([
  'auth.fail',
  'authz.deny',
  'ratelimit.hit',
  'ai.throttle',
  'runner.rejected',
  'admin.action',
]);

/**
 * @param {string} type one of EVENTS
 * @param {object} req Express req (or { principal } for non-request contexts)
 * @param {object} fields small, safe-typed extras (result, reason, resource…)
 */
function secEvent(type, req, fields = {}) {
  if (!EVENTS.has(type)) throw new Error(`unknown security event: ${type}`);
  // Lazy require: errors.js also exposes denyAuthz which uses this module.
  const { scrub } = require('../middleware/errors');
  const record = {
    ts: new Date().toISOString(),
    event: type,
    reqId: (req && req.id) || null,
    uid: (req && req.user && req.user.uid) || (req && req.principal) || null,
    ip: req && req.ip ? clientIp(req) : null,
    method: (req && req.method) || null,
    path: req && (req.originalUrl || req.url)
      ? String(req.originalUrl || req.url).split('?')[0]
      : null,
    ...scrub(fields),
  };
  console.log(JSON.stringify(record));
  return record;
}

module.exports = { secEvent, EVENTS };

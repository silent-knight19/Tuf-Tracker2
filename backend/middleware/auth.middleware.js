/**
 * S2 — Authentication hardening.
 *
 * Firebase ID tokens are the identity boundary. This module is the ONLY place
 * strict authentication lives (previously it was defined inside
 * routes/auth.routes.js with fragile `split('Bearer ')` parsing).
 *
 * Helpers:
 *  - `authenticate` — strict default. Canonical `Bearer <JWT>` parse, signature
 *    + expiry via Admin SDK, explicit audience/issuer assertion against the
 *    configured Firebase project. Rejects revoked tokens only when the SDK
 *    reports them; full session enforcement (revocation + disabled) is
 *    `authenticateWithSessionCheck` (ADMIN routes) — per-request user lookups
 *    are too expensive for every route, see docs/security/s2-authentication.md.
 *  - `authenticateWithSessionCheck` — strict + `checkRevoked` + disabled-user
 *    lookup. For ADMIN / high-impact routes.
 *  - `requireAdmin` — runs AFTER authenticate; server-side ADMIN_EMAILS
 *    allowlist, deny-closed when unset. Never trust client-side gating.
 *  - `softVerifyToken` — non-blocking best-effort identity for logging/future
 *    rate-limit whitelisting. MUST NEVER be used for authorization (a static
 *    test enforces that no route file references it).
 *
 * Failure responses are deliberately uniform (401 Unauthorized / 403 Forbidden)
 * so failures are not an oracle. Rejection reasons go to logs only, never
 * including token material.
 */

function getAuthClient() {
  return require('../config/firebase.config').auth;
}

function getAdminSdk() {
  return require('../config/firebase.config').admin;
}

// Firebase ID tokens are JWTs: three base64url segments. Anything else is the
// wrong token type (API key, OAuth access token, custom token, garbage).
const JWT_RE = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

/**
 * Canonical Authorization header parse.
 * Returns { token } or { error: 'missing' | 'malformed' | 'wrong-type' }.
 */
function extractBearerToken(req) {
  const header = req.headers && req.headers.authorization;
  if (header === undefined || header === null || String(header).trim() === '') {
    return { error: 'missing' };
  }
  const value = String(header).trim();
  const space = value.indexOf(' ');
  if (space === -1) return { error: 'malformed' };
  const scheme = value.slice(0, space);
  const token = value.slice(space + 1).trim();
  // Scheme is case-sensitive per RFC 6750 ("Bearer"); wrong scheme or
  // embedded-scheme tricks like "Token Bearer x" are rejected.
  if (scheme !== 'Bearer' || token === '' || /\s/.test(token)) {
    return { error: 'malformed' };
  }
  if (!JWT_RE.test(token)) return { error: 'wrong-type' };
  return { token };
}

/** Resolve the expected Firebase project id (never from the token itself). */
function resolveProjectId() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw && String(raw).trim() !== '') {
      const sa = JSON.parse(raw);
      if (sa && typeof sa.project_id === 'string' && sa.project_id.trim() !== '') {
        return sa.project_id.trim();
      }
    }
  } catch {
    // fall through to Admin SDK options
  }
  try {
    const pid = getAdminSdk().app().options.projectId;
    if (typeof pid === 'string' && pid !== '') return pid;
  } catch {
    // Admin app may not be initialized (dev without creds) — caller skips.
  }
  return null;
}

/**
 * Explicit audience/issuer assertion (defense in depth over the SDK's own
 * checks; also makes wrong-project rejection unit-testable).
 * Returns null when OK or skipped (unknown project), else a reason string.
 */
function assertTokenProject(decoded, projectId) {
  if (!projectId) return null; // cannot assert — SDK checks still apply
  if (decoded.aud !== projectId) return 'project-mismatch';
  if (decoded.iss !== `https://securetoken.google.com/${projectId}`) return 'project-mismatch';
  return null;
}

function firebaseReason(error) {
  const code = error && error.code;
  if (code === 'auth/id-token-expired') return 'expired';
  if (code === 'auth/id-token-revoked') return 'revoked';
  if (code === 'auth/user-disabled') return 'disabled';
  if (code === 'auth/argument-error') return 'malformed';
  if (error && /audience|issuer|signature|malformed|jwt|token/i.test(error.message || '')) {
    return 'invalid';
  }
  return 'invalid';
}

function reject(req, res, reason, status = 401) {
  // Uniform client response (no oracle). Reason goes to the event stream.
  try {
    require('../services/securityLog').secEvent('auth.fail', req, { result: 'deny', reason });
  } catch {
    // Logging must never break authentication.
  }
  return res.status(status).json({ error: status === 403 ? 'Forbidden' : 'Unauthorized' });
}

function attachUser(req, decoded, sessionChecked) {
  req.user = decoded;
  req.auth = {
    uid: decoded.uid,
    email: decoded.email || null,
    sessionChecked: !!sessionChecked,
    admin: isAdminEmail(decoded.email),
  };
}

/**
 * Strict authentication. Use on every non-PUBLIC route.
 * Injectable `deps` ({ auth, projectId }) exist for tests; production callers
 * pass nothing.
 */
function buildAuthenticate({ sessionCheck = false } = {}) {
  return async function authenticate(req, res, next, deps = {}) {
    const parsed = extractBearerToken(req);
    if (parsed.error) return reject(req, res, parsed.error);

    const auth = deps.auth || getAuthClient();
    const projectId = deps.projectId !== undefined ? deps.projectId : resolveProjectId();

    let decoded;
    try {
      decoded = sessionCheck
        ? await auth.verifyIdToken(parsed.token, true)
        : await auth.verifyIdToken(parsed.token);
    } catch (error) {
      return reject(req, res, firebaseReason(error));
    }

    const mismatch = assertTokenProject(decoded || {}, projectId);
    if (mismatch) return reject(req, res, mismatch);

    if (sessionCheck) {
      try {
        const user = await auth.getUser(decoded.uid);
        if (user && user.disabled) return reject(req, res, 'disabled');
      } catch (error) {
        // Unknown/deleted user between verify and lookup: fail closed.
        return reject(req, res, firebaseReason(error));
      }
    }

    attachUser(req, decoded, sessionCheck);
    return next();
  };
}

const authenticate = buildAuthenticate({ sessionCheck: false });
const authenticateWithSessionCheck = buildAuthenticate({ sessionCheck: true });

/** Parse the server-side admin allowlist. Pure — unit-tested. */
function parseAdminAllowlist(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') return new Set();
  return new Set(
    String(raw)
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e !== '')
  );
}

function isAdminEmail(email) {
  if (!email) return false;
  return parseAdminAllowlist(process.env.ADMIN_EMAILS).has(String(email).toLowerCase());
}

/**
 * ADMIN gate. Must run after authenticate/authenticateWithSessionCheck.
 * Deny-closed: empty/unset ADMIN_EMAILS denies everyone.
 */
function requireAdmin(req, res, next) {
  if (!req.user) return reject(req, res, 'missing-identity');
  if (!isAdminEmail(req.user.email)) {
    try {
      require('../services/securityLog').secEvent('authz.deny', req, { result: 'deny', resource: 'admin' });
    } catch { /* logging never breaks authz */ }
    return reject(req, res, 'not-admin', 403);
  }
  req.auth = req.auth || {};
  req.auth.admin = true;
  return next();
}

/**
 * Soft (non-blocking) identity for logging / future rate-limit whitelisting.
 * NEVER for authorization: on ANY failure req.user stays unset and the
 * request continues. Hardened vs the S0 version: canonical parse only, no
 * throw paths, explicit unset.
 */
async function softVerifyToken(req, res, next) {
  try {
    const parsed = extractBearerToken(req);
    if (parsed.error) return next();
    const decoded = await getAuthClient().verifyIdToken(parsed.token);
    req.user = decoded;
    return next();
  } catch {
    req.user = undefined;
    return next();
  }
}

module.exports = {
  extractBearerToken,
  assertTokenProject,
  resolveProjectId,
  parseAdminAllowlist,
  isAdminEmail,
  buildAuthenticate,
  authenticate,
  authenticateWithSessionCheck,
  requireAdmin,
  softVerifyToken,
  // Backwards-compatible alias: route files historically imported this name.
  verifyToken: authenticate,
};

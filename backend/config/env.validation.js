/**
 * S1 — Secure boot / environment validation.
 *
 * Single choke point for backend configuration. `server.js` calls `initEnv()`
 * before requiring any route/service so a misconfigured process can never
 * serve traffic (fail closed).
 *
 * Design rules:
 *  - `validateEnv(env)` is pure (no process access, no exit) so it is unit-testable.
 *  - `initEnv()` is the only function with side effects (warn/error/exit).
 *  - Secret VALUES never appear in messages, logs, or the returned config —
 *    only presence/source metadata. (CWE-532 / CWE-312)
 *  - No new dependencies (Node built-ins only).
 */

const net = require('net');

const VALID_NODE_ENVS = ['development', 'test', 'production'];
const MIN_AI_KEY_LENGTH = 20;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

// Matches obvious placeholder / default / example secrets. Intentionally broad:
// a real provider key never looks like any of these.
const PLACEHOLDER_RE =
  /(your[-_ ]|example|changeme|placeholder|xxx+|dummy|sample|todo|fixme|here|none|null|undefined|<[^>]*>)/i;

// Very short or obviously fake keys, even without placeholder words.
const WEAK_KEY_RE = /^(test|key|api[-_]?key|secret|password|12345+|abc+)$/i;

function isBlank(v) {
  return v === undefined || v === null || String(v).trim() === '';
}

function isPlaceholder(v) {
  const s = String(v).trim();
  return PLACEHOLDER_RE.test(s) || WEAK_KEY_RE.test(s);
}

function isLocalHostname(hostname) {
  return LOCAL_HOSTS.has(String(hostname).toLowerCase());
}

/** Parse an http(s) URL env var. Returns { url } or { error }. Never echoes the value. */
function parseHttpUrl(raw, name, out) {
  let url;
  try {
    url = new URL(String(raw).trim());
  } catch {
    out.errors.push(`${name} is not a valid URL.`);
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    out.errors.push(`${name} must use http(s).`);
    return null;
  }
  if (/\*/.test(url.host)) {
    out.errors.push(`${name} must not contain wildcards.`);
    return null;
  }
  return url;
}

/**
 * Validate a Firebase service-account JSON string.
 * `fatalWhenSet` is always true: an explicitly configured but malformed
 * credential is a misconfiguration in every environment (fail fast with a
 * safe message instead of crashing later inside firebase-admin).
 */
function validateServiceAccount(raw, out) {
  let sa;
  try {
    sa = JSON.parse(raw);
  } catch {
    out.fatal.push('FIREBASE_SERVICE_ACCOUNT is not valid JSON.');
    return;
  }
  if (typeof sa !== 'object' || sa === null || Array.isArray(sa)) {
    out.fatal.push('FIREBASE_SERVICE_ACCOUNT must be a JSON object.');
    return;
  }
  const problems = [];
  if (sa.type !== 'service_account') problems.push('type');
  if (typeof sa.project_id !== 'string' || sa.project_id.trim() === '') problems.push('project_id');
  if (typeof sa.private_key !== 'string' || !sa.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
    problems.push('private_key');
  }
  if (typeof sa.client_email !== 'string' || !sa.client_email.includes('@')) problems.push('client_email');
  if (problems.length > 0) {
    out.fatal.push(
      `FIREBASE_SERVICE_ACCOUNT is missing or has invalid fields: ${problems.join(', ')}.`
    );
    return;
  }
  // Development / demo credentials must never run production traffic.
  if (sa.project_id.startsWith('demo-') || isPlaceholder(sa.project_id)) {
    out.errors.push('FIREBASE_SERVICE_ACCOUNT looks like a development/demo credential.');
  }
  if (isPlaceholder(sa.client_email)) {
    out.errors.push('FIREBASE_SERVICE_ACCOUNT looks like a development/demo credential.');
  }
}

/** Validate one provider key value. Weak-when-set is fatal in every environment. */
function validateAiKeyValue(raw, name, out) {
  const s = String(raw).trim();
  if (s.length < MIN_AI_KEY_LENGTH || isPlaceholder(s)) {
    out.fatal.push(`${name} looks like a placeholder or weak secret.`);
    return;
  }
  if (!/^(gsk_|sk-or-|sk-)/.test(s)) {
    out.warnings.push(`${name} does not match a known provider key format.`);
  }
}

function validateEnv(env) {
  const out = { errors: [], fatal: [], warnings: [], config: null };

  // ---- NODE_ENV (environment separation) ----
  let nodeEnv = env.NODE_ENV;
  if (isBlank(nodeEnv)) {
    out.warnings.push('NODE_ENV is not set; defaulting to "development".');
    nodeEnv = 'development';
  } else {
    nodeEnv = String(nodeEnv).trim();
    if (!VALID_NODE_ENVS.includes(nodeEnv)) {
      out.fatal.push(`NODE_ENV must be one of: ${VALID_NODE_ENVS.join(', ')}.`);
      nodeEnv = 'development'; // keep shape stable for callers/tests
    }
  }
  const prod = String(env.NODE_ENV || '').trim() === 'production' && out.fatal.length === 0;

  // ---- PORT / HOST (host binding) ----
  let port = 5000;
  if (!isBlank(env.PORT)) {
    const raw = String(env.PORT).trim();
    if (!/^\d+$/.test(raw)) {
      out.errors.push('PORT must be a number.');
    } else {
      port = parseInt(raw, 10);
      if (port < 1 || port > 65535) out.errors.push('PORT must be between 1 and 65535.');
      else if (port < 1024) out.warnings.push('PORT is privileged (<1024); prefer a high port behind the platform router.');
    }
  }
  // Container-safe default for prod; loopback default for dev/test so a
  // development server (with the weak sandbox) is not exposed to the LAN.
  // Override explicitly with HOST when LAN access is really needed.
  let host = prod ? '0.0.0.0' : '127.0.0.1';
  if (!isBlank(env.HOST)) {
    const h = String(env.HOST).trim();
    const isIp = net.isIP(h) !== 0;
    const isHostname = /^[a-zA-Z0-9]([a-zA-Z0-9.-]{0,253}[a-zA-Z0-9])?$/.test(h);
    if (!isIp && !isHostname) out.errors.push('HOST is not a valid IP address or hostname.');
    else host = h;
  } else if (!prod && !isBlank(env.PORT)) {
    // no-op: explicit port with loopback default is fine
  }
  if (!prod && host === '0.0.0.0') {
    out.warnings.push('HOST is 0.0.0.0 in a non-production environment; the dev server is reachable from the network.');
  }

  // ---- FRONTEND_URL (CORS allowlist input) ----
  if (isBlank(env.FRONTEND_URL)) {
    if (prod) out.errors.push('FRONTEND_URL is required in production.');
    else out.warnings.push('FRONTEND_URL is not set; CORS allowlist falls back to localhost only.');
  } else {
    const url = parseHttpUrl(env.FRONTEND_URL, 'FRONTEND_URL', out);
    if (url && prod) {
      // A production API pointing at a localhost frontend is a development
      // config shipped to prod: it silently breaks the real frontend's CORS.
      if (isLocalHostname(url.hostname)) {
        out.errors.push('FRONTEND_URL must not be localhost in production.');
      } else if (url.protocol !== 'https:') {
        out.errors.push('FRONTEND_URL must use https in production.');
      }
    }
  }

  // ---- BACKEND_URL (cron/self-reference) ----
  if (isBlank(env.BACKEND_URL)) {
    if (prod) out.errors.push('BACKEND_URL is required in production.');
  } else {
    const url = parseHttpUrl(env.BACKEND_URL, 'BACKEND_URL', out);
    if (url) {
      if (isLocalHostname(url.hostname) || url.hostname === '0.0.0.0') {
        if (prod) out.errors.push('BACKEND_URL must not be localhost in production.');
        else out.warnings.push('BACKEND_URL is localhost; platform keep-alive will not work from outside.');
      }
      if (prod && url.protocol !== 'https:' && !isLocalHostname(url.hostname)) {
        out.errors.push('BACKEND_URL must use https in production.');
      }
    }
  }

  // ---- Firebase ----
  if (isBlank(env.FIREBASE_SERVICE_ACCOUNT)) {
    if (prod) out.errors.push('FIREBASE_SERVICE_ACCOUNT is required in production.');
    else out.warnings.push('FIREBASE_SERVICE_ACCOUNT is not set; Firebase features are disabled.');
  } else {
    validateServiceAccount(env.FIREBASE_SERVICE_ACCOUNT, out);
  }
  if (!isBlank(env.FIREBASE_DATABASE_URL)) {
    parseHttpUrl(env.FIREBASE_DATABASE_URL, 'FIREBASE_DATABASE_URL', out);
  }

  // ---- AI provider ----
  const groqSet = !isBlank(env.GROQ_API_KEY);
  const orSet = !isBlank(env.OPENROUTER_API_KEY);
  if (!groqSet && !orSet) {
    if (prod) out.errors.push('An AI API key (GROQ_API_KEY) is required in production.');
    else out.warnings.push('No AI API key is set; AI features will fail at call time.');
  } else {
    if (groqSet) validateAiKeyValue(env.GROQ_API_KEY, 'GROQ_API_KEY', out);
    if (orSet) validateAiKeyValue(env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY', out);
  }

  // ---- ADMIN_EMAILS (S2 server-side admin allowlist) ----
  // Optional. When set: comma-separated emails, each validated. When unset:
  // ADMIN-gated routes deny everyone (fail-closed at the route, warned here).
  if (!isBlank(env.ADMIN_EMAILS)) {
    const bad = String(env.ADMIN_EMAILS)
      .split(',')
      .map((e) => e.trim())
      .filter((e) => e !== '')
      .filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (bad.length > 0) {
      out.fatal.push('ADMIN_EMAILS contains invalid email addresses.');
    }
    if (isPlaceholder(env.ADMIN_EMAILS)) {
      out.fatal.push('ADMIN_EMAILS looks like a placeholder.');
    }
  } else if (prod) {
    out.warnings.push('ADMIN_EMAILS is not set; ADMIN routes will deny everyone.');
  }

  out.config = {
    nodeEnv: prod ? 'production' : nodeEnv,
    isProduction: prod,
    isDevelopment: !prod && nodeEnv !== 'test',
    isTest: nodeEnv === 'test',
    port,
    host,
    frontendUrl: isBlank(env.FRONTEND_URL) ? null : String(env.FRONTEND_URL).trim(),
    backendUrl: isBlank(env.BACKEND_URL) ? null : String(env.BACKEND_URL).trim(),
    firebaseDatabaseUrl: isBlank(env.FIREBASE_DATABASE_URL)
      ? null
      : String(env.FIREBASE_DATABASE_URL).trim(),
    firebaseConfigured: !isBlank(env.FIREBASE_SERVICE_ACCOUNT),
    aiConfigured: groqSet || orSet,
    aiKeySource: groqSet ? 'GROQ_API_KEY' : orSet ? 'OPENROUTER_API_KEY' : null,
  };
  return out;
}

/**
 * Validate `process.env` at boot. Fails closed:
 *  - `fatal` entries (structural misconfiguration, weak explicit secrets)
 *    refuse to boot in EVERY environment.
 *  - `errors` refuse to boot in production; in dev/test they are printed
 *    but the process continues (developer convenience, explicitly logged).
 */
function initEnv(env = process.env) {
  const result = validateEnv(env);
  for (const w of result.warnings) {
    console.warn(`[env] warning: ${w}`);
  }
  if (result.fatal.length > 0) {
    console.error('[env] Invalid configuration:');
    for (const e of result.fatal) console.error(`[env]   - ${e}`);
    console.error('[env] Refusing to boot with an invalid configuration.');
    process.exit(1);
  }
  if (result.errors.length > 0) {
    if (result.config.isProduction) {
      console.error('[env] Invalid production configuration:');
      for (const e of result.errors) console.error(`[env]   - ${e}`);
      console.error('[env] Refusing to boot in production with an invalid configuration.');
      process.exit(1);
    }
    for (const e of result.errors) console.error(`[env] dev/test notice (fatal in production): ${e}`);
  }
  return result.config;
}

module.exports = { validateEnv, initEnv };

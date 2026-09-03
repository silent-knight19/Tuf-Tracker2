/**
 * S10 — CORS + HTTP header policy (pure, unit-tested; no Express required at
 * import time beyond the cors/helmet option builders).
 */

function buildAllowedOrigins(env) {
  // Dev loopback origins exist ONLY outside production: a production
  // allowlist is exactly { FRONTEND_URL } — nothing ambient, nothing local.
  const list = [env.frontendUrl];
  if (!env.isProduction) list.push('http://localhost:5173', 'http://127.0.0.1:5173');
  return new Set(list.filter(Boolean));
}

/**
 * Origin decision. Missing origin = non-browser client (curl/mobile/cron):
 * allowed — there is no ambient authority to steal (Bearer-only, no cookies).
 * Localhost allowance exists ONLY outside production (dev convenience: random
 * Vite ports) and matches by parsed hostname — never by string prefix (so
 * `http://localhost:5173.evil.test` does NOT match).
 */
function isAllowedOrigin(origin, allowedOrigins, isProduction) {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;
  if (!isProduction) {
    try {
      const url = new URL(origin);
      if (url.protocol === 'http:'
        && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

function corsOptions(env) {
  const allowedOrigins = buildAllowedOrigins(env);
  return {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin, allowedOrigins, env.isProduction)) {
        return callback(null, true);
      }
      console.warn(`CORS denied for origin: ${origin}`);
      return callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization', 'Retry-After', 'X-Request-Id'],
  };
}

/** Helmet options: JSON-API-tight CSP + HSTS preload. */
function helmetOptions() {
  return {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        objectSrc: ["'none'"],
        formAction: ["'none'"],
      },
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  };
}

module.exports = { buildAllowedOrigins, isAllowedOrigin, corsOptions, helmetOptions };

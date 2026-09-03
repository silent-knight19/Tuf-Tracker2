/**
 * S4 — dependency-free request validation.
 *
 * Tiny schema DSL + `validate()` middleware. Every rule returns a normalized
 * value or records `{ path, message }` (paths + messages only — values are
 * never echoed, so failures can't reflect secrets).
 *
 * Global guards (applied to every validated body/query/params object):
 *  - prototype-pollution keys (`__proto__`, `constructor`, `prototype`) → 400
 *  - nesting depth > MAX_DEPTH (12) → 400
 *  - unknown fields on strict objects → 400 (mass-assignment control)
 */

const MAX_DEPTH = 12;
const POLLUTION_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

function isPlainObject(v) {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function scanKeys(value, path, errors) {
  // Iterative walk: rejects pollution keys and over-deep structures anywhere.
  const stack = [{ v: value, p: path || 'body', d: 1 }];
  while (stack.length > 0) {
    const { v, p, d } = stack.pop();
    if (d > MAX_DEPTH) {
      errors.push({ path: p, message: `exceeds maximum nesting depth of ${MAX_DEPTH}` });
      return false;
    }
    if (Array.isArray(v)) {
      for (let i = 0; i < v.length; i++) {
        const item = v[i];
        if (isPlainObject(item) || Array.isArray(item)) stack.push({ v: item, p: `${p}[${i}]`, d: d + 1 });
      }
    } else if (isPlainObject(v)) {
      for (const k of Object.keys(v)) {
        if (POLLUTION_KEYS.has(k)) {
          errors.push({ path: p === 'body' ? k : `${p}.${k}`, message: 'forbidden key' });
          return false;
        }
        const child = v[k];
        if (isPlainObject(child) || Array.isArray(child)) stack.push({ v: child, p: `${p}.${k}`, d: d + 1 });
      }
    }
  }
  return true;
}

function fail(errors, path, message) {
  errors.push({ path, message });
  return undefined;
}

// --- leaf rules ------------------------------------------------------------

function string({ min = 1, max = 1000, pattern, enum: enumVals, trim = true } = {}) {
  return (v, path, errors) => {
    if (typeof v !== 'string') return fail(errors, path, 'must be a string');
    const s = trim ? v.trim() : v;
    if (s.length < min) return fail(errors, path, `must be at least ${min} characters`);
    if (s.length > max) return fail(errors, path, `must be at most ${max} characters`);
    if (enumVals && !enumVals.includes(s)) return fail(errors, path, 'has an invalid value');
    if (pattern && !pattern.test(s)) return fail(errors, path, 'has an invalid format');
    return s;
  };
}

function number({ min, max, int = false, coerce = false } = {}) {
  return (v, path, errors) => {
    let n = v;
    if (coerce && typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim())) n = Number(v.trim());
    if (typeof n !== 'number' || !Number.isFinite(n)) return fail(errors, path, 'must be a number');
    if (int && !Number.isInteger(n)) return fail(errors, path, 'must be an integer');
    if (min !== undefined && n < min) return fail(errors, path, `must be >= ${min}`);
    if (max !== undefined && n > max) return fail(errors, path, `must be <= ${max}`);
    return n;
  };
}

function boolean() {
  return (v, path, errors) => {
    if (typeof v !== 'boolean') return fail(errors, path, 'must be a boolean');
    return v;
  };
}

function arrayOf(item, { min = 0, max = 50 } = {}) {
  return (v, path, errors) => {
    if (!Array.isArray(v)) return fail(errors, path, 'must be an array');
    if (v.length < min) return fail(errors, path, `must have at least ${min} items`);
    if (v.length > max) return fail(errors, path, `must have at most ${max} items`);
    let bad = false;
    const out = v.map((itemV, i) => {
      const r = item(itemV, `${path}[${i}]`, errors);
      if (r === undefined) bad = true;
      return r;
    });
    return bad ? undefined : out;
  };
}

function union(rules) {
  return (v, path, errors) => {
    const trial = [];
    for (const r of rules) {
      const out = r(v, path, trial);
      if (out !== undefined) return out;
    }
    return fail(errors, path, 'has an invalid value');
  };
}

function object(shape, { strict = true, minKeys = 0, refine } = {}) {
  return (v, path, errors) => {
    if (!isPlainObject(v)) return fail(errors, path, 'must be an object');
    const keys = Object.keys(v);
    if (strict) {
      const unknown = keys.filter((k) => !(k in shape));
      if (unknown.length > 0) {
        return fail(errors, path, `has unexpected fields: ${unknown.slice(0, 5).join(', ')}`);
      }
    }
    if (keys.length < minKeys) return fail(errors, path, 'must not be empty');
    let bad = false;
    const out = {};
    for (const [key, entry] of Object.entries(shape)) {
      const has = Object.prototype.hasOwnProperty.call(v, key);
      if (!has || v[key] === undefined) {
        if (!entry.optional) {
          fail(errors, `${path}.${key}`, 'is required');
          bad = true;
        }
        continue;
      }
      let val = v[key];
      if (val === null) {
        if (!entry.nullable) {
          fail(errors, `${path}.${key}`, 'must not be null');
          bad = true;
          continue;
        }
        out[key] = null;
        continue;
      }
      const r = entry.rule(val, `${path}.${key}`, errors);
      if (r === undefined) bad = true;
      else out[key] = r;
    }
    if (bad) return undefined;
    if (refine) {
      const msg = refine(out);
      if (msg) return fail(errors, path, msg);
    }
    return out;
  };
}

// --- composed rules ---------------------------------------------------------

const optional = (rule) => ({ rule, optional: true });
const nullable = (rule) => ({ rule, optional: true, nullable: true });
const req = (rule) => ({ rule });

/** Firestore-ish document id: short, no slashes/whitespace (path traversal). */
const docId = () => string({ min: 1, max: 256, pattern: /^(?!\.+$)[^\s/]{1,256}$/ });

/** Optional http(s) URL string (empty string allowed for unset fields). */
function urlString(max = 2000) {
  return (v, path, errors) => {
    if (typeof v !== 'string') return fail(errors, path, 'must be a string');
    const s = v.trim();
    if (s === '') return '';
    if (s.length > max) return fail(errors, path, `must be at most ${max} characters`);
    if (!/^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(s)) return fail(errors, path, 'must be a valid http(s) URL');
    return s;
  };
}

/** Scalar leaf for AI-echo containers (examples, test cases). */
function scalar(maxStr = 2000) {
  return union([string({ min: 1, max: maxStr }), number(), boolean()]);
}

// --- middleware -------------------------------------------------------------

function validate(schemas) {
  return (req, res, next) => {
    const errors = [];
    for (const [part, rule] of Object.entries(schemas)) {
      const value = part === 'body' ? req.body : part === 'query' ? req.query : req.params;
      if (value === undefined) continue;
      if (!isPlainObject(value) && !Array.isArray(value)) {
        errors.push({ path: part, message: 'must be an object' });
        continue;
      }
      if (!scanKeys(value, part, errors)) continue;
      rule(value, part, errors);
    }
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid request', details: errors.slice(0, 10) });
    }
    return next();
  };
}

module.exports = {
  MAX_DEPTH,
  string,
  number,
  boolean,
  arrayOf,
  union,
  object,
  optional,
  nullable,
  req,
  docId,
  urlString,
  scalar,
  validate,
};

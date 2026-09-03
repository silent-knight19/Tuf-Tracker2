/**
 * S4 — validator unit tests (no I/O).
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const v = require('../middleware/validate');

function run(rule, value) {
  const errors = [];
  const out = rule(value, 'body', errors);
  return { out, errors };
}

describe('S4 strict objects', () => {
  it('rejects unknown fields (mass assignment)', () => {
    const r = v.object({ a: v.req(v.string()) }, { strict: true });
    const { out, errors } = run(r, { a: 'x', userId: 'attacker', isAdmin: true });
    assert.equal(out, undefined);
    assert.ok(errors.some((e) => e.message.includes('unexpected fields')));
  });
  it('accepts exact shapes and trims strings', () => {
    const r = v.object({ a: v.req(v.string({ min: 1, max: 5 })) }, { strict: true });
    const { out, errors } = run(r, { a: '  hi  ' });
    assert.deepEqual(errors, []);
    assert.equal(out.a, 'hi');
  });
  it('enforces minKeys', () => {
    const r = v.object({ a: v.optional(v.string()) }, { strict: true, minKeys: 1 });
    const { errors } = run(r, {});
    assert.ok(errors.length > 0);
  });
});

describe('S4 injection guards', () => {
  it('rejects prototype-pollution keys at any depth', async () => {
    const { validate } = v;
    const mw = validate({ body: v.object({}, { strict: false }) });
    for (const payload of [
      JSON.parse('{"__proto__":{"x":1}}'),
      { a: [{ b: JSON.parse('{"constructor":1}') }] },
      { a: { b: { prototype: true } } },
    ]) {
      let status = null;
      let next = false;
      mw({ body: payload, query: {}, params: {} }, {
        status(c) { status = c; return this; },
        json() { return this; },
      }, () => { next = true; });
      assert.equal(status, 400);
      assert.equal(next, false);
    }
  });
  it('rejects nesting deeper than MAX_DEPTH', () => {
    let deep = { v: 1 };
    for (let i = 0; i < 20; i++) deep = { nest: deep };
    const mw = v.validate({ body: v.object({}, { strict: false }) });
    let status = null;
    mw({ body: deep, query: {}, params: {} }, {
      status(c) { status = c; return this; },
      json() { return this; },
    }, () => {});
    assert.equal(status, 400);
  });
  it('rejects doc IDs with slashes (path traversal)', () => {
    for (const bad of ['a/b', '..', 'a b', 'x'.repeat(300)]) {
      const { errors } = run(v.docId(), bad);
      assert.ok(errors.length > 0, bad);
    }
    assert.equal(run(v.docId(), 'prob_ABC-123').errors.length, 0);
  });
});

describe('S4 coercion and enums', () => {
  it('coerces numeric strings for numbers with coerce:true', () => {
    const r = v.number({ min: 1, max: 5, int: true, coerce: true });
    assert.equal(run(r, '4', ).out, 4);
    assert.ok(run(r, 'high').errors.length > 0);
    assert.ok(run(r, '4.5').errors.length > 0);
    assert.ok(run(r, 9).errors.length > 0);
  });
  it('rejects non-numeric without coerce', () => {
    assert.ok(run(v.number(), '4').errors.length > 0);
  });
  it('enforces enums and patterns', () => {
    const r = v.string({ enum: ['a', 'b'] });
    assert.ok(run(r, 'c').errors.length > 0);
    assert.equal(run(r, 'a').out, 'a');
  });
  it('validates http(s) URLs, allowing empty unset', () => {
    assert.equal(run(v.urlString(), '').out, '');
    assert.ok(run(v.urlString(), 'javascript:alert(1)').errors.length > 0);
    assert.ok(run(v.urlString(), 'https://leetcode.com/x').out.startsWith('https://'));
  });
  it('supports nullable + refine (learning-notes requireAny)', () => {
    const S = require('../middleware/schemas');
    const runBody = (b) => {
      const errors = [];
      const out = S.ai.learningNotes.body(b, 'body', errors);
      return { out, errors };
    };
    assert.ok(runBody({}).errors.length > 0);
    assert.equal(runBody({ pattern: 'Two Pointers' }).errors.length, 0);
    assert.equal(runBody({ pattern: null, topic: 'Arrays' }).errors.length, 0);
  });
});

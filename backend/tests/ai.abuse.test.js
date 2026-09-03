/**
 * S8 — AI cost/abuse tests.
 * Unit: windows, class isolation, char budgets, global ceiling, middleware,
 * error mapping. Service: retry boundedness. HTTP: flood → 429s for the
 * flooder only (per-user isolation), classes independent.
 */

const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');

const {
  AiLimits, AiOverloadError, aiLimit, sendAiError,
} = require('../services/ai.limits');

const tiny = () => new AiLimits(
  {
    heavy: { perUserPerMin: 2, perUserCharsPerMin: 1000 },
    standard: { perUserPerMin: 5, perUserCharsPerMin: 1000 },
    globalPerMin: 100,
  },
  { maxConcurrent: 8, maxPerPrincipal: 8, maxQueue: 0, queueTimeoutMs: 1 }
);

function mockRes() {
  return {
    statusCode: null, body: null, headers: {},
    status(c) { this.statusCode = c; return this; },
    json(b) { this.body = b; return this; },
    set(k, v) { this.headers[k] = v; return this; },
  };
}

describe('S8 quota windows (unit)', () => {
  it('rejects past per-user class quota with retryAfter', () => {
    const l = tiny();
    l.checkRequest('u', 'heavy', 10);
    l.checkRequest('u', 'heavy', 10);
    assert.throws(() => l.checkRequest('u', 'heavy', 10), (e) => (
      e instanceof AiOverloadError && e.retryAfterSec === 60
    ));
  });

  it('classes are independent; users are independent', () => {
    const l = tiny();
    l.checkRequest('u', 'heavy', 10);
    l.checkRequest('u', 'heavy', 10);
    l.checkRequest('u', 'standard', 10); // fine
    l.checkRequest('other', 'heavy', 10); // fine
  });

  it('char budget binds oversized estimates', () => {
    const l = tiny();
    assert.throws(() => l.checkRequest('u', 'standard', 5000), /size quota/);
  });

  it('global ceiling binds across users', () => {
    const l = new AiLimits(
      {
        heavy: { perUserPerMin: 100, perUserCharsPerMin: 1e9 },
        standard: { perUserPerMin: 100, perUserCharsPerMin: 1e9 },
        globalPerMin: 2,
      },
      { maxConcurrent: 8, maxPerPrincipal: 8, maxQueue: 0, queueTimeoutMs: 1 }
    );
    l.checkRequest('a', 'standard', 0);
    l.checkRequest('b', 'standard', 0);
    assert.throws(() => l.checkRequest('c', 'standard', 0), /saturated/);
  });

  it('windows roll over (white-box aged hits)', () => {
    const l = tiny();
    l.checkRequest('u', 'heavy', 10);
    l.checkRequest('u', 'heavy', 10);
    assert.throws(() => l.checkRequest('u', 'heavy', 10), AiOverloadError);
    for (const w of l.reqWindows.values()) w.hits = [Date.now() - 61000];
    l.checkRequest('u', 'heavy', 10); // refilled
  });
});

describe('S8 middleware + error mapping', () => {
  it('aiLimit passes under quota, 429s with Retry-After over quota (singleton)', async () => {
    // Singleton default: heavy = 4/min for a fresh uid.
    const uid = `flood-${Date.now()}`;
    const mw = aiLimit('heavy');
    const run = () => {
      const res = mockRes();
      let next = false;
      mw({ user: { uid }, body: { title: 'x' } }, res, () => { next = true; });
      return { res, next };
    };
    for (let i = 0; i < 4; i++) assert.equal(run().next, true);
    const over = run();
    assert.equal(over.next, false);
    assert.equal(over.res.statusCode, 429);
    assert.equal(over.res.headers['Retry-After'], '60');
  });

  it('sendAiError maps overload→429, refusal→400, generic→500 without leaks', () => {
    let r = mockRes();
    sendAiError(r, new AiOverloadError('busy', 30));
    assert.equal(r.statusCode, 429);
    assert.equal(r.headers['Retry-After'], '30');

    r = mockRes();
    sendAiError(r, new Error('Refusing AI call: prompt contains provider API key shaped content.'));
    assert.equal(r.statusCode, 400);

    r = mockRes();
    sendAiError(r, new Error('some Groq internals exploded: ECONNRESET key=gsk_secret'), 'Fallback');
    assert.equal(r.statusCode, 500);
    assert.deepEqual(r.body, { error: 'Fallback' });
  });
});

describe('S8 service retry discipline (stubbed provider)', () => {
  let aiService;
  let providerCalls;
  let behavior;

  before(() => {
    const aiConfigPath = require.resolve('../config/ai.config');
    providerCalls = [];
    behavior = { failTimes: 0 };
    require.cache[aiConfigPath] = {
      id: aiConfigPath, filename: aiConfigPath, loaded: true,
      exports: {
        openRouterClient: {
          chat: {
            completions: {
              create: async () => {
                providerCalls.push(Date.now());
                if (providerCalls.length <= behavior.failTimes) {
                  const e = new Error('Too Many Requests');
                  e.status = 429;
                  throw e;
                }
                return { choices: [{ message: { content: '{"ok":true}' } }] };
              },
            },
          },
        },
        MODEL: 'test-model',
        generationConfig: { temperature: 0.6, top_p: 0.9, max_tokens: 50 },
        rateLimiter: { wait: async () => { throw new Error('blocking limiter must not be used'); } },
      },
    };
    aiService = require('../services/ai.service');
  });

  it('transient 429s retry with jitter, then succeed (bounded)', async () => {
    providerCalls.length = 0;
    behavior.failTimes = 2;
    const out = await aiService.callAI('Return JSON: {"a":1}', true, 2, { label: 'retry-ok' });
    assert.ok(out.includes('ok'));
    assert.equal(providerCalls.length, 3); // 1 + 2 retries, no more
  });

  it('persistent 429s stop after 1+retries (no multiplication)', async () => {
    providerCalls.length = 0;
    behavior.failTimes = 99;
    await assert.rejects(aiService.callAI('Return JSON: {"a":1}', true, 2, { label: 'retry-max' }));
    assert.equal(providerCalls.length, 3);
  });

  it('never touches the blocking limiter', async () => {
    // Proven by construction: stubbed wait() throws; calls above succeeded.
    assert.ok(providerCalls.length >= 3);
  });
});

/**
 * S15 — background-job safety: single-flight, freshness idempotency,
 * failure recovery, and the HTTP manual path. Fake Firestore + stubbed AI;
 * no network, no Firebase.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const { FakeFirestore, installStubs, api } = require('./helpers/app.harness');

const AI_QUOTES = () => ({
  quotes: [
    { text: 'Keep going', author: 'Coach A', category: 'Focus' },
    { text: 'Stay sharp', author: 'Coach B', category: 'Discipline' },
    { text: 'Dream big', author: 'Coach C', category: 'Vision' },
  ],
});

describe('S15 quote refresh jobs', () => {
  let db;
  let quoteService;
  let aiCalls;
  let aiFailNext;
  let base;
  let close;

  before(async () => {
    db = new FakeFirestore();
    installStubs(db);
    // Richer AI stub AFTER harness install (call counting + overlap delay).
    aiCalls = 0;
    aiFailNext = false;
    const aiPath = require.resolve('../services/ai.service');
    require.cache[aiPath] = {
      id: aiPath, filename: aiPath, loaded: true,
      exports: {
        callAI: async () => {
          aiCalls += 1;
          await new Promise((r) => setTimeout(r, 50)); // force overlap
          if (aiFailNext) {
            aiFailNext = false;
            throw new Error('provider down');
          }
          return JSON.stringify(AI_QUOTES());
        },
        parseJSON: (t) => JSON.parse(t),
      },
    };
    quoteService = require('../services/quote.service');

    const app = express();
    app.use(express.json());
    app.use('/api/quotes', require('../routes/quotes.routes'));
    const server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    base = `http://127.0.0.1:${server.address().port}`;
    close = () => new Promise((r) => server.close(r));
  });

  after(async () => { await close(); });

  it('concurrent refreshes share one run (single AI call, one collection)', async () => {
    const results = await Promise.all([
      quoteService.refreshDailyQuotes({ force: true }),
      quoteService.refreshDailyQuotes({ force: true }),
      quoteService.refreshDailyQuotes({ force: true }),
    ]);
    assert.equal(aiCalls, 1);
    for (const r of results) assert.equal(r.length, 3);
    const all = await db.collection('quotes').get();
    assert.equal(all.size, 3);
  });

  it('soft refresh skips when fresh; force bypasses the skip', async () => {
    const before = aiCalls;
    const skipped = await quoteService.refreshDailyQuotes({ force: false });
    assert.equal(aiCalls, before); // no AI spent
    assert.equal(skipped.length, 3);
    await quoteService.refreshDailyQuotes({ force: true });
    assert.equal(aiCalls, before + 1);
  });

  it('stale collection refreshes on soft trigger; empty collection too', async () => {
    // Age every quote 30h back.
    const snap = await db.collection('quotes').get();
    for (const d of snap.docs) {
      await db.collection('quotes').doc(d.id).update({
        updatedAt: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
      });
    }
    const before = aiCalls;
    await quoteService.refreshDailyQuotes({ force: false });
    assert.equal(aiCalls, before + 1);
    // Wipe everything: soft trigger must rebuild, not skip.
    const snap2 = await db.collection('quotes').get();
    for (const d of snap2.docs) await db.collection('quotes').doc(d.id).delete();
    await quoteService.refreshDailyQuotes({ force: false });
    assert.equal(aiCalls, before + 2);
  });

  it('a failed run does not wedge the lock (next trigger retries)', async () => {
    aiFailNext = true;
    await assert.rejects(quoteService.refreshDailyQuotes({ force: true }), /provider down/);
    const before = aiCalls;
    const ok = await quoteService.refreshDailyQuotes({ force: true });
    assert.equal(aiCalls, before + 1);
    assert.equal(ok.length, 3);
  });

  it('HTTP manual refresh works; public read serves the collection', async () => {
    const r = await api(base, 'POST', '/api/quotes/refresh', { user: 'admin-u' });
    assert.equal(r.status, 200);
    assert.equal(r.json.count, 3);
    const g = await api(base, 'GET', '/api/quotes', { user: 'admin-u' });
    assert.equal(g.status, 200);
    assert.equal(g.json.length, 3);
  });

  it('cron wiring: bounded soft refresh via the outbound chokepoint (static)', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'cron', 'cron.service.js'), 'utf8');
    assert.ok(src.includes('services/outbound'));
    assert.ok(src.includes('refreshDailyQuotes({ force: false })'));
    assert.ok(!src.includes('client.get'));
  });
});

const { db } = require('../config/firebase.config');
const aiService = require('./ai.service');

// S15: a refresh younger than this is idempotent-skipped unless forced.
const FRESH_MS = 20 * 60 * 60 * 1000;
// S15: overall run budget (AI 45s + commit headroom).
const REFRESH_TIMEOUT_MS = 180000;

class QuoteService {
  constructor() {
    this.collection = db.collection('quotes');
    // S15: single-flight — concurrent triggers (cron + startup + manual)
    // share one run instead of each spending AI + racing batch writes.
    this._inFlight = null;
  }

  /** Newest quotes timestamp, or null when the collection is empty. */
  async _newestUpdatedAt() {
    const snap = await this.collection.orderBy('updatedAt', 'desc').limit(1).get();
    if (snap.empty) return null;
    const v = snap.docs[0].data().updatedAt;
    const t = v ? new Date(v).getTime() : NaN;
    return Number.isNaN(t) ? null : t;
  }

  /**
   * Generates 50 new motivational quotes using AI
   */
  async generateDailyQuotes() {
    try {
      const prompt = `You are a world-class high-performance coach and philosopher.
TASK: Generate 50 unique, powerful, and deeply moving motivational quotes for high-achievers.

THEMES:
- Relentless pursuit of excellence
- Mental toughness and resilience
- Emotional intelligence and mindfulness
- Time mastery and discipline
- Overcoming fear and self-doubt
- The philosophy of consistency
- Visionary thinking and legacy

OUTPUT FORMAT:
Return a JSON object with a "quotes" field containing an array of 50 objects. Each object must have:
- "text": The quote content (concise, visceral, and punchy)
- "author": A famous historical figure, modern visionary, or "TufTracker Intelligence"
- "category": One of [Discipline, Vision, Resilience, Growth, Focus]

RULES:
- Return ONLY valid JSON.
- Ensure all 50 quotes are distinct and non-cliché.
- Quotes should feel timeless and premium.`;

      const responseText = await aiService.callAI(prompt, true);
      const data = aiService.parseJSON(responseText);

      if (!data || !data.quotes || !Array.isArray(data.quotes)) {
        throw new Error('Invalid AI response structure');
      }

      return data.quotes;
    } catch (error) {
      console.error('Error generating daily quotes:', error);
      throw error;
    }
  }

  /**
   * Refreshes the database with 50 new quotes.
   * S15: single-flight shared; `{ force: false }` (cron/startup) skips when
   * the collection is fresh; `{ force: true }` (manual admin) always runs.
   * No retries here by design — a failed run logs and the next trigger
   * (or a deliberate manual refresh) handles it. No retry storms.
   */
  async refreshDailyQuotes({ force = false } = {}) {
    if (!this._inFlight) {
      this._inFlight = this._refreshInner({ force }).finally(() => {
        this._inFlight = null;
      });
    }
    return this._inFlight;
  }

  async _refreshInner({ force }) {
    const runId = Math.random().toString(36).slice(2, 8);
    console.log(`🔄 [quotes:${runId}] refresh requested (force=${force})...`);
    if (!force) {
      const newest = await this._newestUpdatedAt();
      if (newest !== null && Date.now() - newest < FRESH_MS) {
        console.log(`⏭️  [quotes:${runId}] skipped — collection is fresh.`);
        const snap = await this.collection.orderBy('order').get();
        return snap.docs.map((doc) => doc.data());
      }
    }
    // Backstop only: unref'd so an idle process never lingers on it.
    // (Unlike the S6 pool timers, the raced refresh holds real I/O handles.)
    let timer;
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error('Quote refresh timed out')), REFRESH_TIMEOUT_MS);
      if (timer.unref) timer.unref();
    });
    try {
      return await Promise.race([this._doRefresh(runId), timeout]);
    } catch (error) {
      console.error(`❌ [quotes:${runId}] refresh failed:`, error);
      throw error;
    }
  }

  /** The destructive half (wipe + rewrite) runs only inside _refreshInner. */
  async _doRefresh(runId) {
    console.log(`🔄 [quotes:${runId}] generating + replacing collection...`);
    const newQuotes = await this.generateDailyQuotes();

    // Batch delete old quotes
    const snapshot = await this.collection.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));

    // S7: shape-validate AI output — never spread model JSON into the
    // database (field injection). Unknown keys dropped, category enumed.
    const clean = sanitizeQuotes(newQuotes);
    clean.forEach((quote, index) => {
      const ref = this.collection.doc();
      batch.set(ref, {
        text: quote.text,
        author: quote.author,
        category: quote.category,
        id: ref.id,
        order: index,
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();
    console.log(`✅ [quotes:${runId}] refreshed ${clean.length} quotes at ${new Date().toISOString()}`);
    return clean;
  }

  /**
   * Fetches all current daily quotes
   */
  async getDailyQuotes() {
    try {
      const snapshot = await this.collection.orderBy('order').get();
      
      if (snapshot.empty) {
        // If DB is empty, trigger a refresh immediately
        return await this.refreshDailyQuotes();
      }

      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Error fetching daily quotes:', error);
      return [];
    }
  }
}

/**
 * S7 — AI quote shape gate. Returns only well-formed quotes; throws when the
 * model output is unusable so callers fail closed instead of writing junk.
 */
function sanitizeQuotes(quotes) {
  const CATEGORIES = new Set(['Discipline', 'Vision', 'Resilience', 'Growth', 'Focus']);
  if (!Array.isArray(quotes)) throw new Error('Invalid AI response structure');
  const clean = [];
  for (const q of quotes) {
    if (!q || typeof q !== 'object') continue;
    const text = typeof q.text === 'string' ? q.text.trim().slice(0, 500) : '';
    const author = typeof q.author === 'string' ? q.author.trim().slice(0, 120) : '';
    const category = typeof q.category === 'string' ? q.category.trim() : '';
    if (text === '' || author === '' || !CATEGORIES.has(category)) continue;
    clean.push({ text, author, category });
  }
  if (clean.length === 0) throw new Error('Invalid AI response structure');
  return clean;
}

const quoteService = new QuoteService();
quoteService.sanitizeQuotes = sanitizeQuotes;
module.exports = quoteService;

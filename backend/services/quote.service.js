const { db } = require('../config/firebase.config');
const { geminiEdgeCaseModel, rateLimiter } = require('../config/ai.config');

class QuoteService {
  constructor() {
    this.collection = db.collection('quotes');
  }

  /**
   * Generates 50 new motivational quotes using Gemini
   */
  async generateDailyQuotes() {
    try {
      await rateLimiter.checkAndWait();

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

      const result = await geminiEdgeCaseModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove possible markdown JSON blocks
      const cleanJson = text.replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);

      if (!data.quotes || !Array.isArray(data.quotes)) {
        throw new Error('Invalid AI response structure');
      }

      return data.quotes;
    } catch (error) {
      console.error('Error generating daily quotes:', error);
      throw error;
    }
  }

  /**
   * Refreshes the database with 50 new quotes
   */
  async refreshDailyQuotes() {
    console.log('🔄 Refreshing daily motivational quotes...');
    try {
      const newQuotes = await this.generateDailyQuotes();
      
      // Batch delete old quotes
      const snapshot = await this.collection.get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));

      // Batch add new quotes with timestamps
      newQuotes.forEach((quote, index) => {
        const ref = this.collection.doc();
        batch.set(ref, {
          ...quote,
          id: ref.id,
          order: index,
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
      console.log(`✅ Successfully refreshed 50 daily quotes at ${new Date().toISOString()}`);
      return newQuotes;
    } catch (error) {
      console.error('Failed to refresh daily quotes:', error);
      throw error;
    }
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

module.exports = new QuoteService();

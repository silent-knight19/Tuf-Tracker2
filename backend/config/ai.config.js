const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: 'application/json',
  }
});

// Rate limiting for AI calls
class AIRateLimiter {
  constructor() {
    this.calls = [];
    this.maxCallsPerMinute = 15; // Free tier limit
  }

  async checkAndWait() {
    const now = Date.now();
    // Remove calls older than 1 minute
    this.calls = this.calls.filter(time => now - time < 60000);

    if (this.calls.length >= this.maxCallsPerMinute) {
      const oldestCall = this.calls[0];
      const waitTime = 60000 - (now - oldestCall);
      console.log(`⏳ Rate limit reached. Waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      return this.checkAndWait();
    }

    this.calls.push(now);
  }
}

const rateLimiter = new AIRateLimiter();

module.exports = { model, rateLimiter };

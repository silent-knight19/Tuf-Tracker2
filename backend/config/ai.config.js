require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

// --- CEREBRAS CONFIGURATION (Primary) ---
const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

const models = {
  cerebras: {
    fast: 'qwen-3-235b-a22b-instruct-2507',     // User requested Qwen-3-235b
    complex: 'qwen-3-235b-a22b-instruct-2507',  // For reasoning (Study notes, solutions)
  },
  gemini: {
    general: 'gemini-3-flash-preview', // Using valid latest model
    reasoning: 'gemini-3-flash-preview', // Using valid latest model
  }
};

// --- GEMINI CONFIGURATION (Fallback) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Main model: Gemma 3 27B for general AI tasks
const geminiModel = genAI.getGenerativeModel({ 
  model: models.gemini.general,
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  }
});

// Edge case model: Gemini 2.5 Flash for better JSON generation and reasoning
const geminiEdgeCaseModel = genAI.getGenerativeModel({ 
  model: models.gemini.reasoning,
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
    this.maxCallsPerMinute = 30; // Increased limit for Cerebras (higher throughput)
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

module.exports = { 
  cerebrasClient, 
  models, 
  geminiModel, 
  geminiEdgeCaseModel, 
  rateLimiter 
};

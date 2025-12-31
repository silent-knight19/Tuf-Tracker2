require('dotenv').config();
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

// --- CEREBRAS CONFIGURATION (Qwen 3 235B) ---
const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Qwen 3 235B model - optimized settings based on official recommendations
const models = {
  cerebras: {
    default: 'qwen-3-235b-a22b-instruct-2507', // Qwen 3 235B for all tasks
  }
};

// Optimal generation config for Qwen 3 235B (from official docs)
const qwenConfig = {
  temperature: 0.7,
  top_p: 0.8,
  top_k: 20,
  max_tokens: 8192, // Full output capacity
};

// Rate limiting for AI calls
class AIRateLimiter {
  constructor() {
    this.calls = [];
    this.maxCallsPerMinute = 60; // Cerebras has high throughput
  }

  async checkAndWait() {
    const now = Date.now();
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
  qwenConfig,
  rateLimiter 
};

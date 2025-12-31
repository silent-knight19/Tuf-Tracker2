/**
 * Cerebras AI Configuration
 * Optimized for Qwen 3 235B model
 * 
 * Supported params: model, messages, temperature, top_p, max_tokens, response_format, stop, seed
 * NOT supported: top_k, presence_penalty, frequency_penalty
 */

require('dotenv').config();
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

// Cerebras Client
const cerebrasClient = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY,
});

// Model Configuration
const MODEL = 'gpt-oss-120b';

// Generation Config (only Cerebras-supported params)
const generationConfig = {
  temperature: 0.7,
  top_p: 0.9,
  max_tokens: 16384, // Increased for comprehensive learning notes
};

// Rate Limiter
class RateLimiter {
  constructor(maxPerMinute = 60) {
    this.calls = [];
    this.max = maxPerMinute;
  }

  async wait() {
    const now = Date.now();
    this.calls = this.calls.filter(t => now - t < 60000);
    
    if (this.calls.length >= this.max) {
      const waitMs = 60000 - (now - this.calls[0]);
      console.log(`⏳ Rate limit. Waiting ${Math.round(waitMs/1000)}s...`);
      await new Promise(r => setTimeout(r, waitMs));
      return this.wait();
    }
    
    this.calls.push(now);
  }
}

const rateLimiter = new RateLimiter(60);

module.exports = {
  cerebrasClient,
  MODEL,
  generationConfig,
  rateLimiter,
};

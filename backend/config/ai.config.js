/**
 * Groq AI Configuration
 * 
 * Configured for Groq Cloud using OpenAI-compatible API
 * Model: qwen/qwen3.8-27b
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const OpenAI = require("openai");

// Create the Groq client using OpenAI SDK format
const groqClient = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY,
});

// Model Configuration requested by user
const MODEL = "qwen/qwen3.8-27b";

// Generation Config
const generationConfig = {
  temperature: 0.6,
  top_p: 0.9,
  max_tokens: 8192,
};

// Rate Limiter for Groq free tier (30 requests/minute)
class RateLimiter {
  constructor(maxPerMinute = 30) {
    this.calls = [];
    this.max = maxPerMinute;
  }

  async wait() {
    const now = Date.now();
    this.calls = this.calls.filter((t) => now - t < 60000);

    if (this.calls.length >= this.max) {
      const waitMs = 60000 - (now - this.calls[0]);
      console.log(`⏳ Rate limit. Waiting ${Math.round(waitMs / 1000)}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return this.wait();
    }

    this.calls.push(now);
  }

  // Backwards compatibility alias
  async checkAndWait() {
    return this.wait();
  }
}

const rateLimiter = new RateLimiter(30);

module.exports = {
  groqClient,
  aiClient: groqClient,
  openRouterClient: groqClient, // Backwards compatibility alias for existing imports
  MODEL,
  generationConfig,
  rateLimiter,
};


/**
 * OpenRouter AI Configuration
 *
 * This file sets up the OpenRouter client using the OpenAI SDK.
 * OpenRouter is an API gateway that gives us access to many AI models
 * (like GPT-4, Claude, Llama, etc.) through a single OpenAI-compatible API.
 *
 * Why OpenAI SDK? Because OpenRouter uses the same API format as OpenAI,
 * so we can use the official OpenAI SDK and just point it to OpenRouter's URL.
 */

require("dotenv").config();

// We use the OpenAI SDK because OpenRouter follows the same API format
const OpenAI = require("openai");

// Create the OpenRouter client
// - baseURL tells the SDK to send requests to OpenRouter instead of OpenAI
// - apiKey is our OpenRouter API key from the .env file
const openRouterClient = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Model Configuration
// You can change this to any model available on OpenRouter
// Examples: 'google/gemini-2.0-flash-001', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3-70b-instruct'
// Check https://openrouter.ai/models for all available models
const MODEL = "google/gemini-2.0-flash-001";

// Generation Config - these control how the AI generates responses
const generationConfig = {
  temperature: 0.7, // Controls randomness (0 = deterministic, 1 = creative)
  top_p: 0.9, // Controls diversity of word choices
  max_tokens: 16384, // Max length of the AI response (increased for detailed notes)
};

// Rate Limiter - prevents us from sending too many requests too fast
// This protects us from hitting OpenRouter's rate limits
class RateLimiter {
  constructor(maxPerMinute = 60) {
    this.calls = []; // Tracks timestamps of recent API calls
    this.max = maxPerMinute; // Max calls allowed per minute
  }

  // Waits if we've hit the rate limit, otherwise lets the call through
  async wait() {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.calls = this.calls.filter((t) => now - t < 60000);

    // If we've made too many calls, wait until the oldest one expires
    if (this.calls.length >= this.max) {
      const waitMs = 60000 - (now - this.calls[0]);
      console.log(`⏳ Rate limit. Waiting ${Math.round(waitMs / 1000)}s...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return this.wait(); // Check again after waiting
    }

    // Record this call's timestamp
    this.calls.push(now);
  }
}

const rateLimiter = new RateLimiter(60);

// Export everything so other files can use the AI client and config
module.exports = {
  openRouterClient,
  MODEL,
  generationConfig,
  rateLimiter,
};

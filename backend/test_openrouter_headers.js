require('dotenv').config({ path: './.env' });
const OpenAI = require('openai');

async function test() {
  const openRouterClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5001",
      "X-Title": "TufTracker",
    }
  });

  try {
    const response = await openRouterClient.chat.completions.create({
      model: 'minimax/minimax-01', // Let's try a standard minimax model too
      messages: [{ role: 'user', content: 'Say hello!' }]
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
  }
}

test();

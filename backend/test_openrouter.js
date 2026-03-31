require("dotenv").config({ path: "./.env" });
const OpenAI = require("openai");

async function test() {
  console.log("Key length:", process.env.OPENROUTER_API_KEY?.length || 0);
  const openRouterClient = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  try {
    const response = await openRouterClient.chat.completions.create({
      model: "minimax/minimax-m2.5:free",
      messages: [{ role: "user", content: "Say hello!" }],
    });
    console.log("Success:", response.choices[0].message.content);
  } catch (error) {
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

test();

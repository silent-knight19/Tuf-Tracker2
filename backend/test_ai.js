const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { groqClient, MODEL } = require('./config/ai.config');

async function testConnection() {
  console.log(`Testing Groq connection with model: ${MODEL}...`);
  try {
    const response = await groqClient.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Reply with JSON: {"status": "ok", "message": "Connection verified"}' }],
      response_format: { type: 'json_object' },
    });
    console.log('✅ Response:', response.choices[0].message.content);
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();

const axios = require('axios');
require('dotenv').config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'your-api-key';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

async function testDeepseekAPI() {
  try {
    console.log('Testing DeepSeek API...');
    
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: 'You are a helpful fitness coach. When asked to create a workout plan, respond with a message and include structured JSON data with the plan details.' },
          { role: 'user', content: 'Create a simple workout plan for beginners' }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    console.log('\n\n==== DEEPSEEK API RESPONSE START ====');
    console.log('Full Response Object:');
    console.log(JSON.stringify(response.data, null, 2));
    
    console.log('\nResponse Content:');
    console.log(response.data.choices[0].message.content);
    
    // Try to extract JSON from the response
    try {
      const content = response.data.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                        content.match(/```\n([\s\S]*?)\n```/) || 
                        content.match(/{[\s\S]*?}/);
      
      if (jsonMatch) {
        console.log('\nDETECTED JSON DATA IN RESPONSE:');
        const jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
        try {
          const jsonData = JSON.parse(jsonStr);
          console.log(JSON.stringify(jsonData, null, 2));
        } catch (jsonError) {
          console.log('Failed to parse JSON, showing raw match:');
          console.log(jsonStr);
        }
      }
    } catch (error) {
      console.log('Error checking for JSON in response:', error.message);
    }
    
    console.log('==== DEEPSEEK API RESPONSE END ====\n\n');
    
  } catch (error) {
    console.error('Error calling DeepSeek API:', error.response ? error.response.data : error.message);
  }
}

testDeepseekAPI();

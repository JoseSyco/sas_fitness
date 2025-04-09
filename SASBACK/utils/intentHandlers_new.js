const logger = require('./logger');
const db = require('../db');
const { INTENT_TYPES } = require('./intentRecognition');
const SYSTEM_PROMPTS = require('./systemPrompts');
const axios = require('axios');

/**
 * Call Deepseek API with a prompt and specific system prompt
 * @param {string} prompt - Prompt to send to Deepseek API
 * @param {number} userId - User ID
 * @param {string} systemPromptType - Type of system prompt to use
 * @returns {Object} - Deepseek API response
 */
async function callDeepseekAPI(prompt, userId, systemPromptType = 'GENERAL_COACH', requestId = null) {
  try {
    const logPrefix = requestId ? `[${requestId}]` : '';
    logger.info(`${logPrefix} 💬 DEEPSEEK API: Calling API with ${systemPromptType} prompt`, { promptLength: prompt.length, systemPromptType });

    // Get the appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[systemPromptType] || SYSTEM_PROMPTS.GENERAL_COACH;

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        }
      }
    );

    // Log the interaction
    try {
      await db.query(
        'INSERT INTO ai_interaction_logs (user_id, interaction_type, prompt_data, response_data) VALUES (?, ?, ?, ?)',
        [userId, 'deepseek_api_call', JSON.stringify({ prompt }), JSON.stringify(response.data)]
      );
    } catch (error) {
      logger.error('Error logging AI interaction', error);
      // Continue even if logging fails
    }

    // Log the full DeepSeek response
    console.log('\n\n==== DEEPSEEK API RESPONSE START ====');
    console.log(`Request ID: ${requestId || 'N/A'}`);
    console.log(`System Prompt Type: ${systemPromptType}`);
    console.log(`User ID: ${userId}`);
    console.log('\nResponse Content:');
    console.log(response.data.choices[0].message.content);

    // Check if the response contains JSON data
    try {
      const content = response.data.choices[0].message.content;
      // Try to find JSON in the content
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

    logger.info(`${logPrefix} 📬 DEEPSEEK API: Received response`, {
      responseLength: JSON.stringify(response.data).length,
      firstTokens: response.data.choices[0].message.content.substring(0, 100) + '...'
    });

    return response.data;
  } catch (error) {
    logger.error('Error calling Deepseek API', error);
    throw new Error('Failed to get response from Deepseek API');
  }
}

/**
 * Extract JSON from Deepseek API response
 * @param {Object} aiResponse - Deepseek API response
 * @returns {Object} - Extracted JSON with message and data
 */
function extractJsonFromResponse(aiResponse) {
  try {
    const content = aiResponse.choices[0].message.content;

    // Log the raw content for debugging
    console.log('\n\n==== EXTRACTING JSON FROM RESPONSE ====');
    console.log('Raw content:');
    console.log(content);

    // Try to parse the entire content as JSON first (new format)
    try {
      const parsedJson = JSON.parse(content);
      if (parsedJson.message && parsedJson.data) {
        logger.info('Successfully parsed structured JSON response with message and data');
        console.log('\nParsed JSON:');
        console.log(JSON.stringify(parsedJson, null, 2));

        // Explicitly log the data part
        if (parsedJson.data && Object.keys(parsedJson.data).length > 0) {
          console.log('\nEXTRACTED DATA:');
          console.log(JSON.stringify(parsedJson.data, null, 2));
        }

        console.log('==== JSON EXTRACTION COMPLETE ====\n\n');
        return parsedJson;
      }
    } catch (initialError) {
      logger.debug('Content is not a complete JSON object, trying to extract JSON from markdown', initialError);
    }

    // Fall back to extracting JSON from markdown code blocks
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) ||
                      content.match(/```\n([\s\S]*?)\n```/) ||
                      content.match(/{[\s\S]*?}/);

    if (jsonMatch) {
      const jsonStr = jsonMatch[0].replace(/```json\n|```\n|```/g, '');
      console.log('\nExtracted JSON string:');
      console.log(jsonStr);

      try {
        const extractedJson = JSON.parse(jsonStr);

        // Check if it's already in our expected format
        if (extractedJson.message && extractedJson.data) {
          logger.info('Successfully extracted structured JSON with message and data from markdown');
          console.log('\nExtracted JSON with message and data:');
          console.log(JSON.stringify(extractedJson, null, 2));

          // Explicitly log the data part
          if (extractedJson.data && Object.keys(extractedJson.data).length > 0) {
            console.log('\nEXTRACTED DATA:');
            console.log(JSON.stringify(extractedJson.data, null, 2));
          }

          console.log('==== JSON EXTRACTION COMPLETE ====\n\n');
          return extractedJson;
        } else {
          // If it's just raw data, wrap it in our expected format
          logger.info('Extracted raw JSON data, wrapping in structured format');
          const result = {
            message: content.replace(jsonMatch[0], '').trim(),
            data: extractedJson
          };
          console.log('\nWrapped JSON:');
          console.log(JSON.stringify(result, null, 2));

          // Explicitly log the data part
          console.log('\nEXTRACTED DATA (wrapped):');
          console.log(JSON.stringify(extractedJson, null, 2));

          console.log('==== JSON EXTRACTION COMPLETE ====\n\n');
          return result;
        }
      } catch (jsonError) {
        console.log('\nFailed to parse extracted JSON:');
        console.log(jsonError.message);
        console.log('Raw match:');
        console.log(jsonStr);
      }
    }

    // If no JSON found or parsing failed, treat the entire content as a message
    logger.info('No valid JSON found in response, treating entire content as message');
    console.log('\nNo valid JSON found, using content as message');
    console.log('==== JSON EXTRACTION COMPLETE ====\n\n');
    return {
      message: content,
      data: {}
    };
  } catch (error) {
    logger.error('Error extracting JSON from AI response', error);
    console.log('==== JSON EXTRACTION ERROR ====');
    console.log(error);
    throw new Error('Failed to parse AI response');
  }
}

// The rest of the file remains the same...

const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const { authenticateToken } = require('../middleware/auth.middleware');
const { devAuthMiddleware } = require('../middleware/dev.middleware');
const { recognizeIntent } = require('../utils/intentRecognition');
const { handleIntent, callDeepseekAPI } = require('../utils/intentHandlers');

// Use development middleware in development mode
const authMiddleware = process.env.NODE_ENV === 'production' ? authenticateToken : devAuthMiddleware;

// Generate workout plan
router.post('/generate-workout', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { goal, fitness_level, days_per_week, equipment_available, focus_areas, duration_minutes } = req.body;

    // Get user profile for personalization
    const profileResult = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profile = profileResult.rows[0] || {};

    // Construct prompt for Deepseek API
    const prompt = `
      Create a personalized workout plan with the following details:
      - Goal: ${goal}
      - Fitness Level: ${fitness_level}
      - Days per week: ${days_per_week}
      - Available Equipment: ${equipment_available || 'None specified'}
      - Focus Areas: ${focus_areas || 'Full body'}
      - Duration: ${duration_minutes || 60} minutes per session

      User Profile:
      - Age: ${profile.age || 'Not specified'}
      - Gender: ${profile.gender || 'Not specified'}
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Activity Level: ${profile.activity_level || 'Not specified'}

      Please provide a structured workout plan with:
      1. A name for the plan
      2. A brief description
      3. For each day of the week (${days_per_week} days total):
         - The focus area for that day
         - 4-6 exercises with sets, reps, and rest periods
         - Any special instructions

      Format the response as JSON with the following structure:
      {
        "plan_name": "Name of the plan",
        "description": "Brief description",
        "sessions": [
          {
            "day_of_week": "Monday",
            "focus_area": "Chest and Triceps",
            "duration_minutes": 60,
            "exercises": [
              {
                "name": "Bench Press",
                "sets": 3,
                "reps": 10,
                "rest_seconds": 90,
                "notes": "Focus on form"
              },
              ...more exercises
            ]
          },
          ...more days
        ]
      }
    `;

    // Call Deepseek API
    const aiResponse = await callDeepseekAPI(prompt, userId);

    // Extract the workout plan from the response
    let workoutPlan;
    try {
      // Find JSON in the response
      const content = aiResponse.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);

      if (jsonMatch) {
        workoutPlan = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
      } else {
        workoutPlan = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({
        message: 'Failed to parse AI response',
        raw_response: aiResponse.choices[0].message.content
      });
    }

    res.status(200).json({
      message: 'Workout plan generated successfully',
      workout_plan: workoutPlan
    });
  } catch (error) {
    console.error('Error generating workout plan:', error);
    res.status(500).json({ message: 'Server error while generating workout plan' });
  }
});

// Generate nutrition plan
router.post('/generate-nutrition', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { goal, dietary_restrictions, calories_target, meals_per_day } = req.body;

    // Get user profile for personalization
    const profileResult = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profile = profileResult.rows[0] || {};

    // Construct prompt for Deepseek API
    const prompt = `
      Create a personalized nutrition plan with the following details:
      - Goal: ${goal}
      - Dietary Restrictions: ${dietary_restrictions || 'None'}
      - Target Calories: ${calories_target || 'Calculate based on profile'}
      - Meals per Day: ${meals_per_day || 3}

      User Profile:
      - Age: ${profile.age || 'Not specified'}
      - Gender: ${profile.gender || 'Not specified'}
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Activity Level: ${profile.activity_level || 'Not specified'}

      Please provide a structured nutrition plan with:
      1. A name for the plan
      2. Daily calorie target
      3. Macronutrient breakdown (protein, carbs, fat in grams)
      4. For each meal:
         - Meal name (Breakfast, Lunch, Dinner, Snack, etc.)
         - Description of the meal
         - Calories and macros for the meal

      Format the response as JSON with the following structure:
      {
        "plan_name": "Name of the plan",
        "daily_calories": 2000,
        "protein_grams": 150,
        "carbs_grams": 200,
        "fat_grams": 70,
        "meals": [
          {
            "meal_name": "Breakfast",
            "description": "Detailed description of the meal",
            "calories": 500,
            "protein_grams": 30,
            "carbs_grams": 60,
            "fat_grams": 15
          },
          ...more meals
        ]
      }
    `;

    // Call Deepseek API
    const aiResponse = await callDeepseekAPI(prompt, userId);

    // Extract the nutrition plan from the response
    let nutritionPlan;
    try {
      // Find JSON in the response
      const content = aiResponse.choices[0].message.content;
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*?}/);

      if (jsonMatch) {
        nutritionPlan = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));
      } else {
        nutritionPlan = JSON.parse(content);
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return res.status(500).json({
        message: 'Failed to parse AI response',
        raw_response: aiResponse.choices[0].message.content
      });
    }

    res.status(200).json({
      message: 'Nutrition plan generated successfully',
      nutrition_plan: nutritionPlan
    });
  } catch (error) {
    console.error('Error generating nutrition plan:', error);
    res.status(500).json({ message: 'Server error while generating nutrition plan' });
  }
});

// Process chat message and handle intent
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    logger.info('Received chat message', { userId, messageLength: message.length });

    // Store the user message in chat history
    try {
      await db.query(
        'INSERT INTO user_chat_history (user_id, message_text, is_user_message) VALUES (?, ?, TRUE)',
        [userId, message]
      );
    } catch (error) {
      logger.error('Error storing user message in chat history', error);
      // Continue even if storing fails
    }

    // Recognize intent from the message
    const intent = await recognizeIntent(message, req.requestId);

    // Handle the intent
    const response = await handleIntent(intent, userId, message, req.requestId);

    // Store the AI response in chat history
    try {
      await db.query(
        'INSERT INTO user_chat_history (user_id, message_text, is_user_message, related_action_type, related_entity_id) VALUES (?, ?, FALSE, ?, ?)',
        [userId, response.message, response.action?.type || null, response.action?.planId || response.action?.progressId || null]
      );
    } catch (error) {
      logger.error('Error storing AI response in chat history', error);
      // Continue even if storing fails
    }

    res.status(200).json({
      message: response.message,
      action: response.action,
      data: response.data || {}
    });
  } catch (error) {
    logger.error('Error processing chat message:', error);
    res.status(500).json({ message: 'Server error while processing your message' });
  }
});

// Get fitness advice (legacy endpoint, now redirects to chat)
router.post('/advice', async (req, res) => {
  try {
    // For demo purposes, use a default user ID if not authenticated
    const userId = req.user?.user_id || 1;
    const { query } = req.body;

    logger.info('Received advice request (legacy endpoint)', { query });

    // Recognize intent from the query
    const intent = await recognizeIntent(query, req.requestId);

    // Handle the intent
    const response = await handleIntent(intent, userId, query, req.requestId);

    res.status(200).json({
      message: response.message,
      action: response.action,
      data: response.data || {}
    });
  } catch (error) {
    logger.error('Error generating fitness advice:', error);
    res.status(500).json({ message: 'Server error while generating fitness advice' });
  }
});

module.exports = router;

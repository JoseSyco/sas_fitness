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

    // Try to parse the entire content as JSON first (new format)
    try {
      const parsedJson = JSON.parse(content);
      if (parsedJson.message && parsedJson.data) {
        logger.info('Successfully parsed structured JSON response with message and data');
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
      const extractedJson = JSON.parse(jsonMatch[0].replace(/```json\n|```\n|```/g, ''));

      // Check if it's already in our expected format
      if (extractedJson.message && extractedJson.data) {
        logger.info('Successfully extracted structured JSON with message and data from markdown');
        return extractedJson;
      } else {
        // If it's just raw data, wrap it in our expected format
        logger.info('Extracted raw JSON data, wrapping in structured format');
        return {
          message: content.replace(jsonMatch[0], '').trim(),
          data: extractedJson
        };
      }
    } else {
      // If no JSON found, treat the entire content as a message
      logger.info('No JSON found in response, treating entire content as message');
      return {
        message: content,
        data: {}
      };
    }
  } catch (error) {
    logger.error('Error extracting JSON from AI response', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * Handle create workout intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleCreateWorkout(intent, userId) {
  try {
    logger.info('Handling create workout intent', { userId, parameters: intent.parameters });

    // Get user profile for personalization
    const [profileRows] = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const profile = profileRows[0] || {};

    // Set default values for missing parameters
    const goal = intent.parameters.goal || 'general_fitness';
    const fitnessLevel = intent.parameters.fitness_level || 'intermediate';
    const daysPerWeek = intent.parameters.days_per_week || 3;
    const equipmentAvailable = intent.parameters.equipment_available || 'basic';
    const focusAreas = intent.parameters.focus_areas || 'full_body';
    const durationMinutes = intent.parameters.duration_minutes || 60;

    // Construct prompt for Deepseek API
    const prompt = `
      Create a personalized workout plan with the following details:
      - Goal: ${goal}
      - Fitness Level: ${fitnessLevel}
      - Days per week: ${daysPerWeek}
      - Available Equipment: ${equipmentAvailable}
      - Focus Areas: ${focusAreas}
      - Duration: ${durationMinutes} minutes per session

      User Profile:
      - Age: ${profile.age || 'Not specified'}
      - Gender: ${profile.gender || 'Not specified'}
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Activity Level: ${profile.activity_level || 'Not specified'}

      Please provide a structured workout plan with:
      1. A name for the plan
      2. A brief description
      3. For each day of the week (${daysPerWeek} days total):
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

    // Call Deepseek API with workout creation prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'WORKOUT_CREATION');

    // Extract the workout plan from the response
    const workoutPlan = extractJsonFromResponse(aiResponse);

    // Save the workout plan to the database
    const [result] = await db.query(
      'INSERT INTO workout_plans (user_id, plan_name, description, is_ai_generated) VALUES (?, ?, ?, TRUE)',
      [userId, workoutPlan.plan_name, workoutPlan.description]
    );

    const planId = result.insertId;

    // Save the workout sessions
    for (const session of workoutPlan.sessions) {
      const [sessionResult] = await db.query(
        'INSERT INTO workout_sessions (plan_id, day_of_week, focus_area, duration_minutes) VALUES (?, ?, ?, ?)',
        [planId, session.day_of_week, session.focus_area, session.duration_minutes]
      );

      const sessionId = sessionResult.insertId;

      // Save the exercises for this session
      for (const exercise of session.exercises) {
        // Check if the exercise exists
        const [exerciseRows] = await db.query(
          'SELECT exercise_id FROM exercises WHERE name = ?',
          [exercise.name]
        );

        let exerciseId;

        if (exerciseRows.length > 0) {
          exerciseId = exerciseRows[0].exercise_id;
        } else {
          // Create the exercise
          const [exerciseResult] = await db.query(
            'INSERT INTO exercises (name, description, muscle_group, difficulty_level) VALUES (?, ?, ?, ?)',
            [exercise.name, exercise.notes || '', session.focus_area, fitnessLevel]
          );

          exerciseId = exerciseResult.insertId;
        }

        // Save the workout exercise
        await db.query(
          'INSERT INTO workout_exercises (session_id, exercise_id, sets, reps, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)',
          [sessionId, exerciseId, exercise.sets, exercise.reps, exercise.rest_seconds, exercise.notes || '']
        );
      }
    }

    // Generate a user-friendly response
    const response = {
      message: `He creado un nuevo plan de entrenamiento llamado "${workoutPlan.plan_name}". Puedes verlo en la sección de RUTINAS. El plan incluye ${daysPerWeek} días de entrenamiento por semana, enfocados en diferentes grupos musculares. ¿Necesitas que ajuste algo específico?`,
      action: {
        type: 'CREATED_WORKOUT_PLAN',
        planId: planId
      }
    };

    logger.info('Created workout plan', { planId });

    return response;
  } catch (error) {
    logger.error('Error handling create workout intent', error);
    return {
      message: 'Lo siento, tuve un problema al crear tu plan de entrenamiento. Por favor, intenta de nuevo o proporciona más detalles sobre lo que buscas.',
      error: error.message
    };
  }
}

/**
 * Handle create nutrition intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleCreateNutrition(intent, userId) {
  try {
    logger.info('Handling create nutrition intent', { userId, parameters: intent.parameters });

    // Get user profile for personalization
    const [profileRows] = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const profile = profileRows[0] || {};

    // Set default values for missing parameters
    const goal = intent.parameters.goal || 'maintenance';
    const dietaryRestrictions = intent.parameters.dietary_restrictions || 'none';
    const caloriesTarget = intent.parameters.calories_target || '';
    const mealsPerDay = intent.parameters.meals_per_day || 3;

    // Construct prompt for Deepseek API
    const prompt = `
      Create a personalized nutrition plan with the following details:
      - Goal: ${goal}
      - Dietary Restrictions: ${dietaryRestrictions}
      - Target Calories: ${caloriesTarget || 'Calculate based on profile'}
      - Meals per Day: ${mealsPerDay}

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

    // Call Deepseek API with nutrition creation prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'NUTRITION_CREATION');

    // Extract the nutrition plan from the response
    const nutritionPlan = extractJsonFromResponse(aiResponse);

    // Save the nutrition plan to the database
    const [result] = await db.query(
      'INSERT INTO nutrition_plans (user_id, plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, is_ai_generated) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
      [
        userId,
        nutritionPlan.plan_name,
        nutritionPlan.daily_calories,
        nutritionPlan.protein_grams,
        nutritionPlan.carbs_grams,
        nutritionPlan.fat_grams
      ]
    );

    const planId = result.insertId;

    // Save the meals
    for (const meal of nutritionPlan.meals) {
      await db.query(
        'INSERT INTO meals (nutrition_plan_id, meal_name, description, calories, protein_grams, carbs_grams, fat_grams) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          planId,
          meal.meal_name,
          meal.description,
          meal.calories,
          meal.protein_grams,
          meal.carbs_grams,
          meal.fat_grams
        ]
      );
    }

    // Generate a user-friendly response
    const response = {
      message: `He creado un nuevo plan de nutrición llamado "${nutritionPlan.plan_name}". Puedes verlo en la sección de NUTRICIÓN. El plan incluye ${mealsPerDay} comidas diarias con un total de ${nutritionPlan.daily_calories} calorías. ¿Necesitas que ajuste algo específico?`,
      action: {
        type: 'CREATED_NUTRITION_PLAN',
        planId: planId
      }
    };

    logger.info('Created nutrition plan', { planId });

    return response;
  } catch (error) {
    logger.error('Error handling create nutrition intent', error);
    return {
      message: 'Lo siento, tuve un problema al crear tu plan de nutrición. Por favor, intenta de nuevo o proporciona más detalles sobre lo que buscas.',
      error: error.message
    };
  }
}

/**
 * Handle log progress intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleLogProgress(intent, userId) {
  try {
    logger.info('Handling log progress intent', { userId, parameters: intent.parameters });

    const weight = intent.parameters.weight;
    const bodyFatPercentage = intent.parameters.body_fat_percentage;
    const notes = intent.parameters.notes || '';

    // Save the progress to the database
    const [result] = await db.query(
      'INSERT INTO progress_tracking (user_id, tracking_date, weight, body_fat_percentage, notes) VALUES (?, CURDATE(), ?, ?, ?)',
      [userId, weight, bodyFatPercentage, notes]
    );

    // Generate a user-friendly response
    let responseMessage = 'He registrado tu progreso. ';

    if (weight) {
      responseMessage += `Peso actual: ${weight} kg. `;
    }

    if (bodyFatPercentage) {
      responseMessage += `Porcentaje de grasa corporal: ${bodyFatPercentage}%. `;
    }

    responseMessage += 'Puedes ver tu progreso en la sección de PROGRESO.';

    const response = {
      message: responseMessage,
      action: {
        type: 'LOGGED_PROGRESS',
        progressId: result.insertId
      }
    };

    logger.info('Logged progress', { progressId: result.insertId });

    return response;
  } catch (error) {
    logger.error('Error handling log progress intent', error);
    return {
      message: 'Lo siento, tuve un problema al registrar tu progreso. Por favor, intenta de nuevo o proporciona más detalles.',
      error: error.message
    };
  }
}

/**
 * Handle get progress intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGetProgress(intent, userId) {
  try {
    logger.info('Handling get progress intent', { userId, parameters: intent.parameters });

    const period = intent.parameters.period || 'month';

    // Define the date range based on the period
    let dateClause = '';
    if (period === 'week') {
      dateClause = 'AND tracking_date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
    } else if (period === 'month') {
      dateClause = 'AND tracking_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
    } else if (period === 'year') {
      dateClause = 'AND tracking_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)';
    }

    // Get the progress data
    const [progressRows] = await db.query(
      `SELECT * FROM progress_tracking
       WHERE user_id = ? ${dateClause}
       ORDER BY tracking_date DESC`,
      [userId]
    );

    // Generate a user-friendly response
    let responseMessage = '';

    if (progressRows.length === 0) {
      responseMessage = `No he encontrado registros de progreso en el último ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}. ¿Quieres registrar tu progreso actual?`;
    } else {
      const latestProgress = progressRows[0];
      const oldestProgress = progressRows[progressRows.length - 1];

      responseMessage = `Aquí está tu progreso del último ${period === 'week' ? 'semana' : period === 'month' ? 'mes' : 'año'}:\n\n`;

      if (latestProgress.weight && oldestProgress.weight) {
        const weightDiff = latestProgress.weight - oldestProgress.weight;
        responseMessage += `Peso: ${latestProgress.weight} kg (${weightDiff > 0 ? '+' : ''}${weightDiff.toFixed(1)} kg)\n`;
      } else if (latestProgress.weight) {
        responseMessage += `Peso actual: ${latestProgress.weight} kg\n`;
      }

      if (latestProgress.body_fat_percentage && oldestProgress.body_fat_percentage) {
        const fatDiff = latestProgress.body_fat_percentage - oldestProgress.body_fat_percentage;
        responseMessage += `Grasa corporal: ${latestProgress.body_fat_percentage}% (${fatDiff > 0 ? '+' : ''}${fatDiff.toFixed(1)}%)\n`;
      } else if (latestProgress.body_fat_percentage) {
        responseMessage += `Grasa corporal actual: ${latestProgress.body_fat_percentage}%\n`;
      }

      responseMessage += '\nPuedes ver más detalles en la sección de PROGRESO.';
    }

    const response = {
      message: responseMessage,
      action: {
        type: 'RETRIEVED_PROGRESS',
        period: period,
        count: progressRows.length
      }
    };

    logger.info('Retrieved progress', { count: progressRows.length });

    return response;
  } catch (error) {
    logger.error('Error handling get progress intent', error);
    return {
      message: 'Lo siento, tuve un problema al obtener tu progreso. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle get workout info intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGetWorkoutInfo(intent, userId) {
  try {
    logger.info('Handling get workout info intent', { userId });

    // Get the latest workout plan
    const [planRows] = await db.query(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (planRows.length === 0) {
      return {
        message: 'No he encontrado ningún plan de entrenamiento. ¿Quieres que te ayude a crear uno?',
        action: {
          type: 'NO_WORKOUT_PLANS'
        }
      };
    }

    const plan = planRows[0];

    // Get the sessions for this plan
    const [sessionRows] = await db.query(
      'SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      [plan.plan_id]
    );

    // Generate a user-friendly response
    let responseMessage = `Tu plan de entrenamiento actual es "${plan.plan_name}".\n\n`;
    responseMessage += `${plan.description}\n\n`;
    responseMessage += 'Resumen de sesiones:\n';

    for (const session of sessionRows) {
      responseMessage += `- ${session.day_of_week}: ${session.focus_area} (${session.duration_minutes} minutos)\n`;
    }

    responseMessage += '\nPuedes ver los detalles completos en la sección de RUTINAS.';

    const response = {
      message: responseMessage,
      action: {
        type: 'RETRIEVED_WORKOUT_INFO',
        planId: plan.plan_id
      }
    };

    logger.info('Retrieved workout info', { planId: plan.plan_id });

    return response;
  } catch (error) {
    logger.error('Error handling get workout info intent', error);
    return {
      message: 'Lo siento, tuve un problema al obtener la información de tu rutina. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle get nutrition info intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGetNutritionInfo(intent, userId) {
  try {
    logger.info('Handling get nutrition info intent', { userId });

    // Get the latest nutrition plan
    const [planRows] = await db.query(
      'SELECT * FROM nutrition_plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );

    if (planRows.length === 0) {
      return {
        message: 'No he encontrado ningún plan de nutrición. ¿Quieres que te ayude a crear uno?',
        action: {
          type: 'NO_NUTRITION_PLANS'
        }
      };
    }

    const plan = planRows[0];

    // Get the meals for this plan
    const [mealRows] = await db.query(
      'SELECT * FROM meals WHERE nutrition_plan_id = ? ORDER BY meal_id',
      [plan.nutrition_plan_id]
    );

    // Generate a user-friendly response
    let responseMessage = `Tu plan de nutrición actual es "${plan.plan_name}".\n\n`;
    responseMessage += `Calorías diarias: ${plan.daily_calories} kcal\n`;
    responseMessage += `Macronutrientes: ${plan.protein_grams}g proteína, ${plan.carbs_grams}g carbohidratos, ${plan.fat_grams}g grasas\n\n`;
    responseMessage += 'Resumen de comidas:\n';

    for (const meal of mealRows) {
      responseMessage += `- ${meal.meal_name} (${meal.calories} kcal): ${meal.description.substring(0, 50)}...\n`;
    }

    responseMessage += '\nPuedes ver los detalles completos en la sección de NUTRICIÓN.';

    const response = {
      message: responseMessage,
      action: {
        type: 'RETRIEVED_NUTRITION_INFO',
        planId: plan.nutrition_plan_id
      }
    };

    logger.info('Retrieved nutrition info', { planId: plan.nutrition_plan_id });

    return response;
  } catch (error) {
    logger.error('Error handling get nutrition info intent', error);
    return {
      message: 'Lo siento, tuve un problema al obtener la información de tu plan de nutrición. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle get exercise info intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGetExerciseInfo(intent, userId) {
  try {
    logger.info('Handling get exercise info intent', { userId, parameters: intent.parameters });

    const exerciseName = intent.parameters.exercise_name;

    if (!exerciseName) {
      return {
        message: 'Por favor, especifica qué ejercicio te gustaría conocer. Por ejemplo, "¿Cómo se hace una sentadilla correctamente?"',
        action: {
          type: 'MISSING_EXERCISE_NAME'
        }
      };
    }

    // Construct prompt for Deepseek API
    const prompt = `
      Proporciona una explicación detallada sobre cómo realizar correctamente el ejercicio "${exerciseName}".
      Incluye:
      1. Posición inicial
      2. Ejecución paso a paso
      3. Músculos trabajados
      4. Consejos para una técnica correcta
      5. Errores comunes a evitar
      6. Variaciones del ejercicio (si las hay)

      Responde en español y de manera concisa pero completa.
    `;

    // Call Deepseek API with exercise guidance prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'EXERCISE_GUIDANCE');

    // Extract the content from the response
    const content = aiResponse.choices[0].message.content;

    const response = {
      message: content,
      action: {
        type: 'PROVIDED_EXERCISE_INFO',
        exerciseName: exerciseName
      }
    };

    logger.info('Provided exercise info', { exerciseName });

    return response;
  } catch (error) {
    logger.error('Error handling get exercise info intent', error);
    return {
      message: 'Lo siento, tuve un problema al obtener la información sobre ese ejercicio. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle general advice intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @param {string} message - Original user message
 * @returns {Object} - Handler response
 */
/**
 * Process structured data from AI response and create appropriate records
 * @param {Object} data - Structured data from AI response
 * @param {number} userId - User ID
 * @returns {Object} - Processing result
 */
async function processStructuredData(data, userId) {
  try {
    if (!data || Object.keys(data).length === 0) {
      return { processed: false, reason: 'No structured data provided' };
    }

    logger.info('Processing structured data', { dataType: data.type, userId });

    // Process workout plan data
    if (data.type === 'workout_plan' && data.plan) {
      const plan = data.plan;

      // Create workout plan
      const [result] = await db.query(
        'INSERT INTO workout_plans (user_id, plan_name, description, is_ai_generated) VALUES (?, ?, ?, TRUE)',
        [userId, plan.name || 'Plan de entrenamiento', plan.description || '']
      );

      const planId = result.insertId;
      logger.info('Created workout plan from structured data', { planId });

      // Create sessions if available
      if (plan.sessions && Array.isArray(plan.sessions)) {
        for (const session of plan.sessions) {
          const [sessionResult] = await db.query(
            'INSERT INTO workout_sessions (plan_id, day_of_week, focus_area, duration_minutes) VALUES (?, ?, ?, ?)',
            [planId, session.day || 'Día 1', session.focus_area || 'General', session.duration_minutes || 60]
          );

          const sessionId = sessionResult.insertId;

          // Create exercises if available
          if (session.exercises && Array.isArray(session.exercises)) {
            for (const exercise of session.exercises) {
              // Check if exercise exists
              const [exerciseRows] = await db.query(
                'SELECT exercise_id FROM exercises WHERE name = ?',
                [exercise.name]
              );

              let exerciseId;

              if (exerciseRows.length > 0) {
                exerciseId = exerciseRows[0].exercise_id;
              } else {
                // Create exercise
                const [exerciseResult] = await db.query(
                  'INSERT INTO exercises (name, description, muscle_group, difficulty_level) VALUES (?, ?, ?, ?)',
                  [exercise.name, exercise.description || '', session.focus_area || 'General', 'intermediate']
                );

                exerciseId = exerciseResult.insertId;
              }

              // Add exercise to session
              await db.query(
                'INSERT INTO workout_exercises (session_id, exercise_id, sets, reps, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)',
                [sessionId, exerciseId, exercise.sets || 3, exercise.reps || 10, exercise.rest_seconds || 60, exercise.notes || '']
              );
            }
          }
        }
      }

      return {
        processed: true,
        type: 'workout_plan',
        planId,
        action: {
          type: 'CREATED_WORKOUT_PLAN',
          planId: planId
        }
      };
    }

    // Process nutrition plan data
    else if (data.type === 'nutrition_plan' && data.plan) {
      const plan = data.plan;

      // Create nutrition plan
      const [result] = await db.query(
        'INSERT INTO nutrition_plans (user_id, plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, is_ai_generated) VALUES (?, ?, ?, ?, ?, ?, TRUE)',
        [
          userId,
          plan.name || 'Plan de nutrición',
          plan.daily_calories || 2000,
          plan.protein_grams || 150,
          plan.carbs_grams || 200,
          plan.fat_grams || 70
        ]
      );

      const planId = result.insertId;
      logger.info('Created nutrition plan from structured data', { planId });

      // Create meals if available
      if (plan.meals && Array.isArray(plan.meals)) {
        for (const meal of plan.meals) {
          await db.query(
            'INSERT INTO meals (nutrition_plan_id, meal_name, description, calories, protein_grams, carbs_grams, fat_grams) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
              planId,
              meal.name || 'Comida',
              meal.description || '',
              meal.calories || 0,
              meal.protein_grams || 0,
              meal.carbs_grams || 0,
              meal.fat_grams || 0
            ]
          );
        }
      }

      return {
        processed: true,
        type: 'nutrition_plan',
        planId,
        action: {
          type: 'CREATED_NUTRITION_PLAN',
          planId: planId
        }
      };
    }

    // Process exercise suggestion
    else if (data.type === 'exercise_suggestion' && data.exercise) {
      const exercise = data.exercise;

      // Check if exercise exists
      const [exerciseRows] = await db.query(
        'SELECT exercise_id FROM exercises WHERE name = ?',
        [exercise.name]
      );

      let exerciseId;

      if (exerciseRows.length > 0) {
        exerciseId = exerciseRows[0].exercise_id;
      } else {
        // Create exercise
        const [exerciseResult] = await db.query(
          'INSERT INTO exercises (name, description, muscle_group, difficulty_level) VALUES (?, ?, ?, ?)',
          [exercise.name, exercise.description || '', exercise.muscle_group || 'General', exercise.difficulty_level || 'intermediate']
        );

        exerciseId = exerciseResult.insertId;
      }

      // Create suggested exercise
      const [suggestionResult] = await db.query(
        'INSERT INTO suggested_exercises (user_id, exercise_id, sets, reps, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, exerciseId, exercise.sets || 3, exercise.reps || 10, exercise.rest_seconds || 60, exercise.notes || '']
      );

      const suggestionId = suggestionResult.insertId;

      return {
        processed: true,
        type: 'exercise_suggestion',
        exerciseId,
        suggestionId,
        action: {
          type: 'SUGGESTED_EXERCISE',
          exerciseId,
          suggestionId
        }
      };
    }

    return { processed: false, reason: 'Unrecognized data type' };
  } catch (error) {
    logger.error('Error processing structured data', error);
    return { processed: false, error: error.message };
  }
}

async function handleGeneralAdvice(intent, userId, message) {
  try {
    logger.info('Handling general advice intent', { userId });

    // Construct prompt for Deepseek API
    const prompt = `
      Proporciona asesoramiento de fitness y nutrición para la siguiente consulta:
      "${message}"

      Responde de manera útil, basada en evidencia y accionable. Mantén la respuesta concisa pero informativa.
      Si la consulta no está relacionada con fitness o nutrición, sugiere amablemente que pregunten sobre temas de fitness, nutrición, ejercicio o bienestar.

      Si estás sugiriendo un plan de entrenamiento, inclúyelo como datos JSON estructurados con el siguiente formato:
      {
        "type": "workout_plan",
        "plan": {
          "name": "Nombre del plan",
          "description": "Descripción del plan",
          "sessions": [
            {
              "day": "Día 1",
              "focus_area": "Pecho",
              "duration_minutes": 60,
              "exercises": [
                {
                  "name": "Nombre del ejercicio",
                  "sets": 3,
                  "reps": 10,
                  "rest_seconds": 60,
                  "notes": "Notas sobre el ejercicio"
                }
              ]
            }
          ]
        }
      }

      Si estás sugiriendo un plan de nutrición, inclúyelo como datos JSON estructurados con el siguiente formato:
      {
        "type": "nutrition_plan",
        "plan": {
          "name": "Nombre del plan",
          "daily_calories": 2000,
          "protein_grams": 150,
          "carbs_grams": 200,
          "fat_grams": 70,
          "meals": [
            {
              "name": "Desayuno",
              "description": "Descripción de la comida",
              "calories": 500,
              "protein_grams": 30,
              "carbs_grams": 50,
              "fat_grams": 20
            }
          ]
        }
      }

      Si estás sugiriendo un ejercicio específico, inclúyelo como datos JSON estructurados con el siguiente formato:
      {
        "type": "exercise_suggestion",
        "exercise": {
          "name": "Nombre del ejercicio",
          "muscle_group": "Grupo muscular",
          "sets": 3,
          "reps": 10,
          "rest_seconds": 60,
          "notes": "Notas sobre el ejercicio"
        }
      }
    `;

    // Call Deepseek API with general coach prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'GENERAL_COACH');

    // Extract the structured response using our new function
    const parsedResponse = extractJsonFromResponse(aiResponse);

    // Process structured data if available
    let processResult = { processed: false };
    if (parsedResponse.data && Object.keys(parsedResponse.data).length > 0) {
      processResult = await processStructuredData(parsedResponse.data, userId);
      logger.info('Processed structured data result', { processResult });
    }

    const response = {
      message: parsedResponse.message,
      action: processResult.processed ? processResult.action : {
        type: 'PROVIDED_GENERAL_ADVICE'
      },
      data: parsedResponse.data // Include the structured data for potential use by the frontend
    };

    logger.info('Provided general advice');

    return response;
  } catch (error) {
    logger.error('Error handling general advice intent', error);
    return {
      message: 'Lo siento, tuve un problema al procesar tu consulta. Por favor, intenta de nuevo o formula tu pregunta de otra manera.',
      error: error.message
    };
  }
}

/**
 * Handle habit formation intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleCreateHabit(intent, userId) {
  try {
    logger.info('Handling create habit intent', { userId, parameters: intent.parameters });

    const habitType = intent.parameters.habit_type || 'general';
    const frequency = intent.parameters.frequency || 'daily';

    // Construct prompt for Deepseek API
    const prompt = `
      Ayúdame a crear un hábito relacionado con ${habitType === 'exercise' ? 'ejercicio' :
                                                habitType === 'nutrition' ? 'nutrición' :
                                                habitType === 'hydration' ? 'hidratación' :
                                                habitType === 'sleep' ? 'sueño' : 'bienestar general'}.

      Quiero incorporar este hábito con una frecuencia ${typeof frequency === 'number' ? `de ${frequency} veces por semana` : 'diaria'}.

      Por favor, proporciona:
      1. Una descripción clara del hábito a formar
      2. Pasos específicos para implementarlo
      3. Estrategias para mantener la consistencia
      4. Cómo superar posibles obstáculos
      5. Cómo medir el progreso
    `;

    // Call Deepseek API with habit formation prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'HABIT_FORMATION');

    // Extract the content from the response
    const content = aiResponse.choices[0].message.content;

    const response = {
      message: content,
      action: {
        type: 'CREATED_HABIT',
        habitType: habitType
      }
    };

    logger.info('Created habit plan', { habitType });

    return response;
  } catch (error) {
    logger.error('Error handling create habit intent', error);
    return {
      message: 'Lo siento, tuve un problema al crear tu plan de hábitos. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle motivation intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGetMotivation(intent, userId) {
  try {
    logger.info('Handling get motivation intent', { userId, parameters: intent.parameters });

    const area = intent.parameters.area || 'general';

    // Construct prompt for Deepseek API
    const prompt = `
      El usuario necesita motivación para continuar con su ${area === 'exercise' ? 'rutina de ejercicios' :
                                                           area === 'nutrition' ? 'plan de alimentación' :
                                                           area === 'habits' ? 'formación de hábitos saludables' : 'plan de fitness'}.

      Por favor, proporciona:
      1. Palabras de aliento y motivación
      2. Recordatorios de los beneficios a largo plazo
      3. Estrategias para superar la falta de motivación
      4. Una cita o mantra inspirador
      5. Un pequeño desafío para recuperar el impulso
    `;

    // Call Deepseek API with motivation prompt
    const aiResponse = await callDeepseekAPI(prompt, userId, 'MOTIVATION');

    // Extract the structured response using our new function
    const parsedResponse = extractJsonFromResponse(aiResponse);

    const response = {
      message: parsedResponse.message,
      action: {
        type: 'PROVIDED_MOTIVATION',
        area: area
      },
      data: parsedResponse.data // Include the structured data for potential use by the frontend
    };

    logger.info('Provided motivation', { area });

    return response;
  } catch (error) {
    logger.error('Error handling get motivation intent', error);
    return {
      message: 'Lo siento, tuve un problema al generar tu mensaje motivacional. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle user data provision intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleProvideUserData(intent, userId) {
  try {
    logger.info('Handling provide user data intent', { userId, parameters: intent.parameters });

    // Extract user data from intent parameters
    const { weight, height, age, goal } = intent.parameters;

    // Check if we have any data to update
    if (!weight && !height && !age && !goal) {
      // If no specific data provided, ask for more information
      const prompt = `
        El usuario quiere proporcionar datos para su perfil, pero no ha especificado qué datos exactamente.
        Por favor, solicita amablemente información específica como peso, altura, edad, nivel de actividad o metas de fitness.
        Explica brevemente por qué estos datos son importantes para personalizar sus planes de entrenamiento y nutrición.
      `;

      // Call Deepseek API with data collection prompt
      const aiResponse = await callDeepseekAPI(prompt, userId, 'DATA_COLLECTION');

      // Extract the structured response using our new function
      const parsedResponse = extractJsonFromResponse(aiResponse);

      return {
        message: parsedResponse.message,
        action: {
          type: 'REQUESTED_USER_DATA'
        },
        data: parsedResponse.data // Include the structured data for potential use by the frontend
      };
    }

    // Update user profile in the database with the provided data
    try {
      // Check if user profile exists
      const [profileRows] = await db.query(
        'SELECT * FROM user_profiles WHERE user_id = ?',
        [userId]
      );

      if (profileRows.length > 0) {
        // Update existing profile
        let updateQuery = 'UPDATE user_profiles SET ';
        const updateValues = [];
        const updateFields = [];

        if (weight) {
          updateFields.push('weight = ?');
          updateValues.push(weight);
        }

        if (height) {
          updateFields.push('height = ?');
          updateValues.push(height);
        }

        if (age) {
          updateFields.push('age = ?');
          updateValues.push(age);
        }

        if (updateFields.length > 0) {
          updateQuery += updateFields.join(', ') + ' WHERE user_id = ?';
          updateValues.push(userId);

          await db.query(updateQuery, updateValues);
        }
      } else {
        // Create new profile
        await db.query(
          'INSERT INTO user_profiles (user_id, weight, height, age) VALUES (?, ?, ?, ?)',
          [userId, weight || null, height || null, age || null]
        );
      }

      // If goal is provided, update or create a fitness goal
      if (goal) {
        // Check if user has an active goal
        const [goalRows] = await db.query(
          'SELECT * FROM fitness_goals WHERE user_id = ? AND status = "active" ORDER BY created_at DESC LIMIT 1',
          [userId]
        );

        if (goalRows.length > 0) {
          // Update existing goal
          await db.query(
            'UPDATE fitness_goals SET goal_type = ?, updated_at = CURRENT_TIMESTAMP WHERE goal_id = ?',
            [goal, goalRows[0].goal_id]
          );
        } else {
          // Create new goal
          await db.query(
            'INSERT INTO fitness_goals (user_id, goal_type, start_date, status) VALUES (?, ?, CURDATE(), "active")',
            [userId, goal]
          );
        }
      }
    } catch (dbError) {
      logger.error('Error updating user profile in database', dbError);
      // Continue even if database update fails
    }

    // Construct a response based on the data provided
    let responseMessage = 'He actualizado tu perfil con la siguiente información:\n';

    if (weight) responseMessage += `- Peso: ${weight} kg\n`;
    if (height) responseMessage += `- Altura: ${height} cm\n`;
    if (age) responseMessage += `- Edad: ${age} años\n`;
    if (goal) {
      const goalText = goal === 'weight_loss' ? 'Pérdida de peso' :
                      goal === 'muscle_gain' ? 'Ganancia muscular' :
                      goal === 'toning' ? 'Tonificación' :
                      goal === 'endurance' ? 'Mejorar resistencia' :
                      goal === 'health' ? 'Mejorar salud general' : goal;

      responseMessage += `- Objetivo: ${goalText}\n`;
    }

    responseMessage += '\n¿Hay algún otro dato que quieras actualizar o alguna otra cosa en la que pueda ayudarte?';

    return {
      message: responseMessage,
      action: {
        type: 'UPDATED_USER_DATA',
        updatedFields: {
          weight: weight || undefined,
          height: height || undefined,
          age: age || undefined,
          goal: goal || undefined
        }
      }
    };
  } catch (error) {
    logger.error('Error handling provide user data intent', error);
    return {
      message: 'Lo siento, tuve un problema al actualizar tus datos. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle greeting intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleGreeting(intent, userId) {
  try {
    logger.info('Handling greeting intent', { userId });

    // Get user profile for personalization
    let userName = 'amigo';
    try {
      const [userRows] = await db.query(
        'SELECT first_name FROM users WHERE user_id = ?',
        [userId]
      );

      if (userRows.length > 0 && userRows[0].first_name) {
        userName = userRows[0].first_name;
      }
    } catch (dbError) {
      logger.error('Error getting user name from database', dbError);
      // Continue even if database query fails
    }

    // Get time of day for appropriate greeting
    const hour = new Date().getHours();
    let timeGreeting = 'Hola';

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
      timeGreeting = 'Buenas tardes';
    } else {
      timeGreeting = 'Buenas noches';
    }

    const greetingMessage = `${timeGreeting}, ${userName}! Soy tu entrenador personal virtual. ¿En qué puedo ayudarte hoy? Puedo crear planes de entrenamiento, planes de nutrición, darte consejos sobre ejercicios específicos, ayudarte a formar hábitos saludables o simplemente motivarte en tu camino hacia tus objetivos de fitness.`;

    return {
      message: greetingMessage,
      action: {
        type: 'GREETED_USER'
      }
    };
  } catch (error) {
    logger.error('Error handling greeting intent', error);
    return {
      message: 'Hola! ¿En qué puedo ayudarte hoy?',
      error: error.message
    };
  }
}

/**
 * Handle intent based on type
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @param {string} message - Original user message
 * @returns {Object} - Handler response
 */
async function handleIntent(intent, userId, message, requestId = null) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  logger.info(`${logPrefix} 🛠 INTENT HANDLER: Processing ${intent.type} intent`, { type: intent.type, userId });

  try {
    switch (intent.type) {
      case INTENT_TYPES.CREATE_WORKOUT:
        return await handleCreateWorkout(intent, userId);

      case INTENT_TYPES.CREATE_NUTRITION:
        return await handleCreateNutrition(intent, userId);

      case INTENT_TYPES.LOG_PROGRESS:
        return await handleLogProgress(intent, userId);

      case INTENT_TYPES.GET_PROGRESS:
        return await handleGetProgress(intent, userId);

      case INTENT_TYPES.GET_WORKOUT_INFO:
        return await handleGetWorkoutInfo(intent, userId);

      case INTENT_TYPES.GET_NUTRITION_INFO:
        return await handleGetNutritionInfo(intent, userId);

      case INTENT_TYPES.GET_EXERCISE_INFO:
        return await handleGetExerciseInfo(intent, userId);

      case INTENT_TYPES.SUGGEST_EXERCISE:
        return await handleSuggestExercise(intent, userId, requestId);

      case INTENT_TYPES.UPDATE_EXERCISE:
        return await handleUpdateExercise(intent, userId, requestId);

      case INTENT_TYPES.REMOVE_EXERCISE:
        return await handleRemoveExercise(intent, userId, requestId);

      case INTENT_TYPES.CREATE_HABIT:
        return await handleCreateHabit(intent, userId);

      case INTENT_TYPES.GET_MOTIVATION:
        return await handleGetMotivation(intent, userId);

      case INTENT_TYPES.PROVIDE_USER_DATA:
        return await handleProvideUserData(intent, userId);

      case INTENT_TYPES.GREETING:
        return await handleGreeting(intent, userId);

      case INTENT_TYPES.GENERAL_ADVICE:
      case INTENT_TYPES.UNKNOWN:
      default:
        return await handleGeneralAdvice(intent, userId, message);
    }
  } catch (error) {
    logger.error('Error in intent handler', error);
    return {
      message: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.',
      error: error.message
    };
  }
}

/**
 * Handle suggest exercise intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleSuggestExercise(intent, userId, requestId = null) {
  try {
    const logPrefix = requestId ? `[${requestId}]` : '';
    logger.info(`${logPrefix} Handling suggest exercise intent`, { userId, parameters: intent.parameters });

    // Extract exercise information from intent
    const exerciseName = intent.parameters.exercise_name;
    const muscleGroup = intent.parameters.muscle_group || 'General';
    const sets = intent.parameters.sets || 3;
    const reps = intent.parameters.reps || 10;
    const restSeconds = intent.parameters.rest_seconds || 60;
    const notes = intent.parameters.notes || '';

    if (!exerciseName) {
      return {
        message: 'Necesito saber qué ejercicio quieres que te sugiera. Por favor, especifica el nombre del ejercicio.',
        action: {
          type: 'REQUEST_MORE_INFO',
          requiredField: 'exercise_name'
        }
      };
    }

    // Check if the exercise exists
    const [exerciseRows] = await db.query(
      'SELECT exercise_id FROM exercises WHERE name = ?',
      [exerciseName]
    );

    let exerciseId;

    if (exerciseRows.length > 0) {
      exerciseId = exerciseRows[0].exercise_id;
      logger.info(`${logPrefix} Found existing exercise: ${exerciseName} (ID: ${exerciseId})`);
    } else {
      // Create the exercise
      const [exerciseResult] = await db.query(
        'INSERT INTO exercises (name, description, muscle_group, difficulty_level) VALUES (?, ?, ?, ?)',
        [exerciseName, notes, muscleGroup, 'intermediate']
      );

      exerciseId = exerciseResult.insertId;
      logger.info(`${logPrefix} Created new exercise: ${exerciseName} (ID: ${exerciseId})`);
    }

    // Create a suggested exercise entry
    const [suggestionResult] = await db.query(
      'INSERT INTO suggested_exercises (user_id, exercise_id, sets, reps, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, exerciseId, sets, reps, restSeconds, notes]
    );

    const suggestionId = suggestionResult.insertId;
    logger.info(`${logPrefix} Created exercise suggestion (ID: ${suggestionId})`);

    return {
      message: `He registrado el ejercicio ${exerciseName} en tu lista de ejercicios sugeridos. Te recomiendo hacer ${sets} series de ${reps} repeticiones con ${restSeconds} segundos de descanso entre series.`,
      action: {
        type: 'SUGGESTED_EXERCISE',
        exerciseId: exerciseId,
        suggestionId: suggestionId
      }
    };
  } catch (error) {
    logger.error('Error handling suggest exercise intent', error);
    return {
      message: 'Lo siento, tuve un problema al registrar el ejercicio sugerido.',
      error: error.message
    };
  }
}

/**
 * Handle update exercise intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleUpdateExercise(intent, userId, requestId = null) {
  try {
    const logPrefix = requestId ? `[${requestId}]` : '';
    logger.info(`${logPrefix} Handling update exercise intent`, { userId, parameters: intent.parameters });

    const exerciseName = intent.parameters.exercise_name;
    const exerciseId = intent.parameters.exercise_id;
    const newSets = intent.parameters.sets;
    const newReps = intent.parameters.reps;
    const newRestSeconds = intent.parameters.rest_seconds;
    const newNotes = intent.parameters.notes;

    if (!exerciseId && !exerciseName) {
      return {
        message: 'Necesito saber qué ejercicio quieres actualizar. Por favor, especifica el nombre del ejercicio.',
        action: {
          type: 'REQUEST_MORE_INFO',
          requiredField: 'exercise_name'
        }
      };
    }

    // Find the exercise ID if only name was provided
    let targetExerciseId = exerciseId;
    if (!targetExerciseId && exerciseName) {
      const [exerciseRows] = await db.query(
        'SELECT exercise_id FROM exercises WHERE name = ?',
        [exerciseName]
      );

      if (exerciseRows.length > 0) {
        targetExerciseId = exerciseRows[0].exercise_id;
      } else {
        return {
          message: `No encontré ningún ejercicio llamado "${exerciseName}". ¿Quieres que lo agregue como un nuevo ejercicio?`,
          action: {
            type: 'EXERCISE_NOT_FOUND',
            exerciseName: exerciseName
          }
        };
      }
    }

    // Check if the exercise is in a workout plan
    const [workoutExerciseRows] = await db.query(
      `SELECT we.workout_exercise_id, we.session_id, ws.plan_id
       FROM workout_exercises we
       JOIN workout_sessions ws ON we.session_id = ws.session_id
       JOIN workout_plans wp ON ws.plan_id = wp.plan_id
       WHERE we.exercise_id = ? AND wp.user_id = ?`,
      [targetExerciseId, userId]
    );

    // Check if the exercise is in suggested exercises
    const [suggestedExerciseRows] = await db.query(
      'SELECT suggestion_id FROM suggested_exercises WHERE exercise_id = ? AND user_id = ?',
      [targetExerciseId, userId]
    );

    let updatedWorkoutExercises = 0;
    let updatedSuggestedExercises = 0;

    // Update workout exercises if found
    if (workoutExerciseRows.length > 0) {
      const updateFields = [];
      const updateValues = [];

      if (newSets) {
        updateFields.push('sets = ?');
        updateValues.push(newSets);
      }

      if (newReps) {
        updateFields.push('reps = ?');
        updateValues.push(newReps);
      }

      if (newRestSeconds) {
        updateFields.push('rest_seconds = ?');
        updateValues.push(newRestSeconds);
      }

      if (newNotes) {
        updateFields.push('notes = ?');
        updateValues.push(newNotes);
      }

      if (updateFields.length > 0) {
        const workoutExerciseIds = workoutExerciseRows.map(row => row.workout_exercise_id);
        const placeholders = workoutExerciseIds.map(() => '?').join(',');

        const [updateResult] = await db.query(
          `UPDATE workout_exercises SET ${updateFields.join(', ')} WHERE workout_exercise_id IN (${placeholders})`,
          [...updateValues, ...workoutExerciseIds]
        );

        updatedWorkoutExercises = updateResult.affectedRows;
        logger.info(`${logPrefix} Updated ${updatedWorkoutExercises} workout exercises`);
      }
    }

    // Update suggested exercises if found
    if (suggestedExerciseRows.length > 0) {
      const updateFields = [];
      const updateValues = [];

      if (newSets) {
        updateFields.push('sets = ?');
        updateValues.push(newSets);
      }

      if (newReps) {
        updateFields.push('reps = ?');
        updateValues.push(newReps);
      }

      if (newRestSeconds) {
        updateFields.push('rest_seconds = ?');
        updateValues.push(newRestSeconds);
      }

      if (newNotes) {
        updateFields.push('notes = ?');
        updateValues.push(newNotes);
      }

      if (updateFields.length > 0) {
        const suggestionIds = suggestedExerciseRows.map(row => row.suggestion_id);
        const placeholders = suggestionIds.map(() => '?').join(',');

        const [updateResult] = await db.query(
          `UPDATE suggested_exercises SET ${updateFields.join(', ')} WHERE suggestion_id IN (${placeholders})`,
          [...updateValues, ...suggestionIds]
        );

        updatedSuggestedExercises = updateResult.affectedRows;
        logger.info(`${logPrefix} Updated ${updatedSuggestedExercises} suggested exercises`);
      }
    }

    // If no exercises were found or updated
    if (updatedWorkoutExercises === 0 && updatedSuggestedExercises === 0) {
      // Create a new suggested exercise
      const [suggestionResult] = await db.query(
        'INSERT INTO suggested_exercises (user_id, exercise_id, sets, reps, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, targetExerciseId, newSets || 3, newReps || 10, newRestSeconds || 60, newNotes || '']
      );

      const suggestionId = suggestionResult.insertId;
      logger.info(`${logPrefix} Created new exercise suggestion (ID: ${suggestionId})`);

      return {
        message: `No encontré este ejercicio en tus planes actuales, así que lo he agregado como una nueva sugerencia.`,
        action: {
          type: 'SUGGESTED_EXERCISE',
          exerciseId: targetExerciseId,
          suggestionId: suggestionId
        }
      };
    }

    return {
      message: `He actualizado el ejercicio con las nuevas especificaciones. ${updatedWorkoutExercises > 0 ? `Actualizado en ${updatedWorkoutExercises} planes de entrenamiento.` : ''} ${updatedSuggestedExercises > 0 ? `Actualizado en ${updatedSuggestedExercises} sugerencias.` : ''}`,
      action: {
        type: 'UPDATED_EXERCISE',
        exerciseId: targetExerciseId,
        updatedWorkoutExercises,
        updatedSuggestedExercises
      }
    };
  } catch (error) {
    logger.error('Error handling update exercise intent', error);
    return {
      message: 'Lo siento, tuve un problema al actualizar el ejercicio.',
      error: error.message
    };
  }
}

/**
 * Handle remove exercise intent
 * @param {Object} intent - Recognized intent
 * @param {number} userId - User ID
 * @returns {Object} - Handler response
 */
async function handleRemoveExercise(intent, userId, requestId = null) {
  try {
    const logPrefix = requestId ? `[${requestId}]` : '';
    logger.info(`${logPrefix} Handling remove exercise intent`, { userId, parameters: intent.parameters });

    const exerciseName = intent.parameters.exercise_name;
    const exerciseId = intent.parameters.exercise_id;
    const planId = intent.parameters.plan_id;

    if (!exerciseId && !exerciseName) {
      return {
        message: 'Necesito saber qué ejercicio quieres eliminar. Por favor, especifica el nombre del ejercicio.',
        action: {
          type: 'REQUEST_MORE_INFO',
          requiredField: 'exercise_name'
        }
      };
    }

    // Find the exercise ID if only name was provided
    let targetExerciseId = exerciseId;
    if (!targetExerciseId && exerciseName) {
      const [exerciseRows] = await db.query(
        'SELECT exercise_id FROM exercises WHERE name = ?',
        [exerciseName]
      );

      if (exerciseRows.length > 0) {
        targetExerciseId = exerciseRows[0].exercise_id;
      } else {
        return {
          message: `No encontré ningún ejercicio llamado "${exerciseName}". ¿Estás seguro de que ese es el nombre correcto?`,
          action: {
            type: 'EXERCISE_NOT_FOUND',
            exerciseName: exerciseName
          }
        };
      }
    }

    let removedFromWorkout = 0;
    let removedFromSuggestions = 0;

    // If a plan ID was specified, remove from that specific plan
    if (planId) {
      const [deleteResult] = await db.query(
        `DELETE we FROM workout_exercises we
         JOIN workout_sessions ws ON we.session_id = ws.session_id
         WHERE we.exercise_id = ? AND ws.plan_id = ? AND ws.plan_id IN (
           SELECT plan_id FROM workout_plans WHERE user_id = ?
         )`,
        [targetExerciseId, planId, userId]
      );

      removedFromWorkout = deleteResult.affectedRows;
      logger.info(`${logPrefix} Removed ${removedFromWorkout} exercises from workout plan ${planId}`);
    } else {
      // Remove from all workout plans
      const [deleteResult] = await db.query(
        `DELETE we FROM workout_exercises we
         JOIN workout_sessions ws ON we.session_id = ws.session_id
         JOIN workout_plans wp ON ws.plan_id = wp.plan_id
         WHERE we.exercise_id = ? AND wp.user_id = ?`,
        [targetExerciseId, userId]
      );

      removedFromWorkout = deleteResult.affectedRows;
      logger.info(`${logPrefix} Removed ${removedFromWorkout} exercises from all workout plans`);

      // Remove from suggested exercises
      const [deleteSuggestionsResult] = await db.query(
        'DELETE FROM suggested_exercises WHERE exercise_id = ? AND user_id = ?',
        [targetExerciseId, userId]
      );

      removedFromSuggestions = deleteSuggestionsResult.affectedRows;
      logger.info(`${logPrefix} Removed ${removedFromSuggestions} suggested exercises`);
    }

    if (removedFromWorkout === 0 && removedFromSuggestions === 0) {
      return {
        message: `No encontré este ejercicio en tus planes o sugerencias. ¿Estás seguro de que ese es el ejercicio correcto?`,
        action: {
          type: 'EXERCISE_NOT_FOUND_IN_PLANS',
          exerciseId: targetExerciseId
        }
      };
    }

    return {
      message: `He eliminado el ejercicio de tus ${planId ? 'plan de entrenamiento específico' : 'planes y sugerencias'}. ${removedFromWorkout > 0 ? `Eliminado de ${removedFromWorkout} planes.` : ''} ${removedFromSuggestions > 0 ? `Eliminado de ${removedFromSuggestions} sugerencias.` : ''}`,
      action: {
        type: 'REMOVED_EXERCISE',
        exerciseId: targetExerciseId,
        planId: planId,
        removedFromWorkout,
        removedFromSuggestions
      }
    };
  } catch (error) {
    logger.error('Error handling remove exercise intent', error);
    return {
      message: 'Lo siento, tuve un problema al eliminar el ejercicio.',
      error: error.message
    };
  }
}

module.exports = {
  handleIntent,
  callDeepseekAPI,
  handleCreateWorkout,
  handleCreateNutrition,
  handleLogProgress,
  handleGetProgress,
  handleGetWorkoutInfo,
  handleGetNutritionInfo,
  handleGetExerciseInfo,
  handleCreateHabit,
  handleGetMotivation,
  handleProvideUserData,
  handleGreeting,
  handleGeneralAdvice,
  handleSuggestExercise,
  handleUpdateExercise,
  handleRemoveExercise
};

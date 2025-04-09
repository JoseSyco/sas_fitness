const logger = require('./logger');
const db = require('../db');

/**
 * Intent types
 */
const INTENT_TYPES = {
  // Plan creation intents
  CREATE_WORKOUT: 'create_workout',
  UPDATE_WORKOUT: 'update_workout',
  CREATE_NUTRITION: 'create_nutrition',
  UPDATE_NUTRITION: 'update_nutrition',

  // Progress tracking intents
  LOG_PROGRESS: 'log_progress',
  GET_PROGRESS: 'get_progress',

  // Information retrieval intents
  GET_WORKOUT_INFO: 'get_workout_info',
  GET_NUTRITION_INFO: 'get_nutrition_info',
  GET_EXERCISE_INFO: 'get_exercise_info',

  // Exercise management intents
  SUGGEST_EXERCISE: 'suggest_exercise',
  UPDATE_EXERCISE: 'update_exercise',
  REMOVE_EXERCISE: 'remove_exercise',

  // Habit and motivation intents
  CREATE_HABIT: 'create_habit',
  GET_MOTIVATION: 'get_motivation',

  // Data collection intent
  PROVIDE_USER_DATA: 'provide_user_data',

  // General intents
  GENERAL_ADVICE: 'general_advice',
  GREETING: 'greeting',
  UNKNOWN: 'unknown'
};

/**
 * Recognize intent from user message
 * @param {string} message - User message
 * @returns {Object} - Recognized intent and parameters
 */
async function recognizeIntent(message, requestId = null) {
  const logPrefix = requestId ? `[${requestId}]` : '';
  logger.info(`${logPrefix} 🔍 INTENT RECOGNITION: Starting intent recognition for message`, { messageLength: message.length });

  // Convert message to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Initialize intent object
  let intent = {
    type: INTENT_TYPES.UNKNOWN,
    confidence: 0,
    parameters: {}
  };

  // Check for workout creation intent
  if (
    (lowerMessage.includes('crear') || lowerMessage.includes('nueva') || lowerMessage.includes('generar')) &&
    (lowerMessage.includes('rutina') || lowerMessage.includes('entrenamiento') || lowerMessage.includes('workout'))
  ) {
    intent.type = INTENT_TYPES.CREATE_WORKOUT;
    intent.confidence = 0.8;

    // Extract parameters
    if (lowerMessage.includes('pérdida de peso') || lowerMessage.includes('perder peso')) {
      intent.parameters.goal = 'weight_loss';
    } else if (lowerMessage.includes('ganar músculo') || lowerMessage.includes('musculación')) {
      intent.parameters.goal = 'muscle_gain';
    } else if (lowerMessage.includes('resistencia') || lowerMessage.includes('cardio')) {
      intent.parameters.goal = 'endurance';
    }

    // Extract fitness level
    if (lowerMessage.includes('principiante')) {
      intent.parameters.fitness_level = 'beginner';
    } else if (lowerMessage.includes('intermedio')) {
      intent.parameters.fitness_level = 'intermediate';
    } else if (lowerMessage.includes('avanzado')) {
      intent.parameters.fitness_level = 'advanced';
    }

    // Extract days per week
    const daysMatch = lowerMessage.match(/(\d+)\s*días/);
    if (daysMatch) {
      intent.parameters.days_per_week = parseInt(daysMatch[1]);
    }

    // Extract duration
    const durationMatch = lowerMessage.match(/(\d+)\s*minutos/);
    if (durationMatch) {
      intent.parameters.duration_minutes = parseInt(durationMatch[1]);
    }
  }

  // Check for nutrition plan creation intent
  else if (
    (lowerMessage.includes('crear') || lowerMessage.includes('nueva') || lowerMessage.includes('generar')) &&
    (lowerMessage.includes('dieta') || lowerMessage.includes('nutrición') || lowerMessage.includes('alimentación') || lowerMessage.includes('comida'))
  ) {
    intent.type = INTENT_TYPES.CREATE_NUTRITION;
    intent.confidence = 0.8;

    // Extract parameters
    if (lowerMessage.includes('pérdida de peso') || lowerMessage.includes('perder peso')) {
      intent.parameters.goal = 'weight_loss';
    } else if (lowerMessage.includes('ganar músculo') || lowerMessage.includes('musculación')) {
      intent.parameters.goal = 'muscle_gain';
    } else if (lowerMessage.includes('mantenimiento')) {
      intent.parameters.goal = 'maintenance';
    }

    // Extract dietary restrictions
    if (lowerMessage.includes('vegetariano')) {
      intent.parameters.dietary_restrictions = 'vegetarian';
    } else if (lowerMessage.includes('vegano')) {
      intent.parameters.dietary_restrictions = 'vegan';
    } else if (lowerMessage.includes('sin gluten')) {
      intent.parameters.dietary_restrictions = 'gluten_free';
    }

    // Extract meals per day
    const mealsMatch = lowerMessage.match(/(\d+)\s*comidas/);
    if (mealsMatch) {
      intent.parameters.meals_per_day = parseInt(mealsMatch[1]);
    }
  }

  // Check for progress logging intent
  else if (
    (lowerMessage.includes('registrar') || lowerMessage.includes('anotar') || lowerMessage.includes('guardar')) &&
    (lowerMessage.includes('progreso') || lowerMessage.includes('peso') || lowerMessage.includes('medidas'))
  ) {
    intent.type = INTENT_TYPES.LOG_PROGRESS;
    intent.confidence = 0.8;

    // Extract weight
    const weightMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos)/);
    if (weightMatch) {
      intent.parameters.weight = parseFloat(weightMatch[1]);
    }

    // Extract body fat
    const bodyFatMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:%|por ciento)\s*(?:de)?\s*(?:grasa)/);
    if (bodyFatMatch) {
      intent.parameters.body_fat_percentage = parseFloat(bodyFatMatch[1]);
    }
  }

  // Check for progress retrieval intent
  else if (
    (lowerMessage.includes('ver') || lowerMessage.includes('mostrar') || lowerMessage.includes('cómo va')) &&
    (lowerMessage.includes('progreso') || lowerMessage.includes('avance') || lowerMessage.includes('evolución'))
  ) {
    intent.type = INTENT_TYPES.GET_PROGRESS;
    intent.confidence = 0.8;

    // Extract time period
    if (lowerMessage.includes('semana')) {
      intent.parameters.period = 'week';
    } else if (lowerMessage.includes('mes')) {
      intent.parameters.period = 'month';
    } else if (lowerMessage.includes('año')) {
      intent.parameters.period = 'year';
    }
  }

  // Check for workout information retrieval intent
  else if (
    (lowerMessage.includes('ver') || lowerMessage.includes('mostrar') || lowerMessage.includes('cuál es')) &&
    (lowerMessage.includes('rutina') || lowerMessage.includes('entrenamiento') || lowerMessage.includes('workout'))
  ) {
    intent.type = INTENT_TYPES.GET_WORKOUT_INFO;
    intent.confidence = 0.8;
  }

  // Check for nutrition information retrieval intent
  else if (
    (lowerMessage.includes('ver') || lowerMessage.includes('mostrar') || lowerMessage.includes('cuál es')) &&
    (lowerMessage.includes('dieta') || lowerMessage.includes('nutrición') || lowerMessage.includes('alimentación') || lowerMessage.includes('comida'))
  ) {
    intent.type = INTENT_TYPES.GET_NUTRITION_INFO;
    intent.confidence = 0.8;
  }

  // Check for exercise information intent
  else if (
    (lowerMessage.includes('cómo') || lowerMessage.includes('explicar')) &&
    (lowerMessage.includes('ejercicio') || lowerMessage.includes('hacer'))
  ) {
    intent.type = INTENT_TYPES.GET_EXERCISE_INFO;
    intent.confidence = 0.7;

    // Try to extract exercise name
    // This is a simplified approach - in a real system, you'd use NLP to extract entities
    const exerciseKeywords = [
      'sentadilla', 'press de banca', 'peso muerto', 'dominada', 'plancha',
      'burpee', 'zancada', 'flexión', 'abdominal', 'curl', 'extensión'
    ];

    for (const keyword of exerciseKeywords) {
      if (lowerMessage.includes(keyword)) {
        intent.parameters.exercise_name = keyword;
        break;
      }
    }
  }

  // Check for suggest exercise intent
  else if (
    (lowerMessage.includes('sugerir') || lowerMessage.includes('recomendar') || lowerMessage.includes('proponer')) &&
    (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenamiento'))
  ) {
    intent.type = INTENT_TYPES.SUGGEST_EXERCISE;
    intent.confidence = 0.8;

    // Extract exercise name if present
    const exerciseKeywords = [
      'sentadilla', 'press de banca', 'peso muerto', 'dominada', 'plancha',
      'burpee', 'zancada', 'flexión', 'abdominal', 'curl', 'extensión',
      'press militar', 'fondos', 'remo', 'hip thrust', 'elevaciones'
    ];

    for (const keyword of exerciseKeywords) {
      if (lowerMessage.includes(keyword)) {
        intent.parameters.exercise_name = keyword;
        break;
      }
    }

    // Extract muscle group
    if (lowerMessage.includes('pecho')) {
      intent.parameters.muscle_group = 'Pecho';
    } else if (lowerMessage.includes('espalda')) {
      intent.parameters.muscle_group = 'Espalda';
    } else if (lowerMessage.includes('pierna')) {
      intent.parameters.muscle_group = 'Piernas';
    } else if (lowerMessage.includes('hombro')) {
      intent.parameters.muscle_group = 'Hombros';
    } else if (lowerMessage.includes('bíceps')) {
      intent.parameters.muscle_group = 'Bíceps';
    } else if (lowerMessage.includes('tríceps')) {
      intent.parameters.muscle_group = 'Tríceps';
    } else if (lowerMessage.includes('abdomen') || lowerMessage.includes('abdominales')) {
      intent.parameters.muscle_group = 'Abdomen';
    }

    // Extract sets and reps
    const setsMatch = lowerMessage.match(/(\d+)\s*series/i);
    if (setsMatch) {
      intent.parameters.sets = parseInt(setsMatch[1]);
    }

    const repsMatch = lowerMessage.match(/(\d+)\s*repeticiones/i);
    if (repsMatch) {
      intent.parameters.reps = parseInt(repsMatch[1]);
    }

    // Extract rest time
    const restMatch = lowerMessage.match(/(\d+)\s*segundos\s*(?:de)?\s*descanso/i);
    if (restMatch) {
      intent.parameters.rest_seconds = parseInt(restMatch[1]);
    }
  }

  // Check for update exercise intent
  else if (
    (lowerMessage.includes('actualizar') || lowerMessage.includes('modificar') || lowerMessage.includes('cambiar')) &&
    (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenamiento'))
  ) {
    intent.type = INTENT_TYPES.UPDATE_EXERCISE;
    intent.confidence = 0.8;

    // Extract exercise name
    const exerciseKeywords = [
      'sentadilla', 'press de banca', 'peso muerto', 'dominada', 'plancha',
      'burpee', 'zancada', 'flexión', 'abdominal', 'curl', 'extensión',
      'press militar', 'fondos', 'remo', 'hip thrust', 'elevaciones'
    ];

    for (const keyword of exerciseKeywords) {
      if (lowerMessage.includes(keyword)) {
        intent.parameters.exercise_name = keyword;
        break;
      }
    }

    // Extract sets and reps
    const setsMatch = lowerMessage.match(/(\d+)\s*series/i);
    if (setsMatch) {
      intent.parameters.sets = parseInt(setsMatch[1]);
    }

    const repsMatch = lowerMessage.match(/(\d+)\s*repeticiones/i);
    if (repsMatch) {
      intent.parameters.reps = parseInt(repsMatch[1]);
    }

    // Extract rest time
    const restMatch = lowerMessage.match(/(\d+)\s*segundos\s*(?:de)?\s*descanso/i);
    if (restMatch) {
      intent.parameters.rest_seconds = parseInt(restMatch[1]);
    }
  }

  // Check for remove exercise intent
  else if (
    (lowerMessage.includes('eliminar') || lowerMessage.includes('quitar') || lowerMessage.includes('borrar') || lowerMessage.includes('remover')) &&
    (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenamiento'))
  ) {
    intent.type = INTENT_TYPES.REMOVE_EXERCISE;
    intent.confidence = 0.8;

    // Extract exercise name
    const exerciseKeywords = [
      'sentadilla', 'press de banca', 'peso muerto', 'dominada', 'plancha',
      'burpee', 'zancada', 'flexión', 'abdominal', 'curl', 'extensión',
      'press militar', 'fondos', 'remo', 'hip thrust', 'elevaciones'
    ];

    for (const keyword of exerciseKeywords) {
      if (lowerMessage.includes(keyword)) {
        intent.parameters.exercise_name = keyword;
        break;
      }
    }

    // Extract plan ID if mentioned
    const planMatch = lowerMessage.match(/plan\s*(\d+)/i);
    if (planMatch) {
      intent.parameters.plan_id = parseInt(planMatch[1]);
    }
  }

  // Check for habit formation intent
  else if (
    (lowerMessage.includes('hábito') || lowerMessage.includes('costumbre') || lowerMessage.includes('rutina diaria')) &&
    (lowerMessage.includes('crear') || lowerMessage.includes('formar') || lowerMessage.includes('desarrollar'))
  ) {
    intent.type = INTENT_TYPES.CREATE_HABIT;
    intent.confidence = 0.8;

    // Extract habit type
    if (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenamiento')) {
      intent.parameters.habit_type = 'exercise';
    } else if (lowerMessage.includes('alimentación') || lowerMessage.includes('comida') || lowerMessage.includes('nutrición')) {
      intent.parameters.habit_type = 'nutrition';
    } else if (lowerMessage.includes('agua') || lowerMessage.includes('hidratación')) {
      intent.parameters.habit_type = 'hydration';
    } else if (lowerMessage.includes('sueño') || lowerMessage.includes('dormir')) {
      intent.parameters.habit_type = 'sleep';
    }

    // Extract frequency
    const frequencyMatch = lowerMessage.match(/(\d+)\s*(?:veces|días)/i);
    if (frequencyMatch) {
      intent.parameters.frequency = parseInt(frequencyMatch[1]);
    }
  }

  // Check for motivation intent
  else if (
    (lowerMessage.includes('motivación') || lowerMessage.includes('motivarme') || lowerMessage.includes('ánimo')) ||
    (lowerMessage.includes('no tengo ganas') || lowerMessage.includes('me cuesta') || lowerMessage.includes('desmotivado'))
  ) {
    intent.type = INTENT_TYPES.GET_MOTIVATION;
    intent.confidence = 0.8;

    // Extract motivation area
    if (lowerMessage.includes('ejercicio') || lowerMessage.includes('entrenamiento')) {
      intent.parameters.area = 'exercise';
    } else if (lowerMessage.includes('alimentación') || lowerMessage.includes('comida') || lowerMessage.includes('dieta')) {
      intent.parameters.area = 'nutrition';
    } else if (lowerMessage.includes('hábito') || lowerMessage.includes('costumbre')) {
      intent.parameters.area = 'habits';
    }
  }

  // Check for user data provision intent
  else if (
    (lowerMessage.includes('mi peso es') || lowerMessage.includes('peso') || lowerMessage.includes('mido') ||
     lowerMessage.includes('altura') || lowerMessage.includes('edad') || lowerMessage.includes('años') ||
     lowerMessage.includes('objetivo') || lowerMessage.includes('meta'))
  ) {
    intent.type = INTENT_TYPES.PROVIDE_USER_DATA;
    intent.confidence = 0.7;

    // Extract weight
    const weightMatch = lowerMessage.match(/(?:peso|peso:)\s*(\d+(?:\.\d+)?)\s*(?:kg|kilos)/i);
    if (weightMatch) {
      intent.parameters.weight = parseFloat(weightMatch[1]);
    }

    // Extract height
    const heightMatch = lowerMessage.match(/(?:mido|altura|altura:)\s*(\d+(?:\.\d+)?)\s*(?:cm|metros|m)/i);
    if (heightMatch) {
      intent.parameters.height = parseFloat(heightMatch[1]);
      // Convert to cm if in meters
      if (lowerMessage.includes('metro') && intent.parameters.height < 3) {
        intent.parameters.height *= 100;
      }
    }

    // Extract age
    const ageMatch = lowerMessage.match(/(?:tengo|edad|edad:)\s*(\d+)\s*(?:años)/i);
    if (ageMatch) {
      intent.parameters.age = parseInt(ageMatch[1]);
    }

    // Extract goals
    if (lowerMessage.includes('perder peso') || lowerMessage.includes('adelgazar')) {
      intent.parameters.goal = 'weight_loss';
    } else if (lowerMessage.includes('ganar músculo') || lowerMessage.includes('aumentar masa')) {
      intent.parameters.goal = 'muscle_gain';
    } else if (lowerMessage.includes('tonificar') || lowerMessage.includes('definir')) {
      intent.parameters.goal = 'toning';
    } else if (lowerMessage.includes('resistencia') || lowerMessage.includes('cardio')) {
      intent.parameters.goal = 'endurance';
    } else if (lowerMessage.includes('salud') || lowerMessage.includes('bienestar')) {
      intent.parameters.goal = 'health';
    }
  }

  // Check for greeting intent
  else if (
    lowerMessage.includes('hola') || lowerMessage.includes('buenos días') ||
    lowerMessage.includes('buenas tardes') || lowerMessage.includes('buenas noches') ||
    lowerMessage.includes('saludos') || lowerMessage === 'hi' || lowerMessage === 'hello'
  ) {
    intent.type = INTENT_TYPES.GREETING;
    intent.confidence = 0.9;
  }

  // Default to general advice
  else {
    intent.type = INTENT_TYPES.GENERAL_ADVICE;
    intent.confidence = 0.5;
  }

  logger.info(`${logPrefix} 🌟 INTENT RECOGNIZED: ${intent.type} (confidence: ${intent.confidence})`, {
    intent_type: intent.type,
    confidence: intent.confidence,
    parameters: intent.parameters
  });

  // Store the intent in the database for future reference
  try {
    await db.query(
      'INSERT INTO ai_intents (intent_name, description, required_parameters) VALUES (?, ?, ?)',
      [intent.type, 'Recognized from user message', JSON.stringify(intent.parameters)]
    );
  } catch (error) {
    // Just log the error but don't fail the intent recognition
    logger.error('Error storing intent in database', error);
  }

  return intent;
}

module.exports = {
  INTENT_TYPES,
  recognizeIntent
};

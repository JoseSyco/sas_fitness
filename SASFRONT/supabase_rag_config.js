/**
 * Configuración para la integración del agente RAG con Supabase
 * Este archivo contiene las funciones y configuraciones necesarias para
 * conectar el agente RAG con la base de datos Supabase
 */

// Configuración de Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'your-supabase-key';

// Configuración del modelo de embeddings
const EMBEDDING_MODEL = 'text-embedding-ada-002'; // Modelo de OpenAI para embeddings
const EMBEDDING_DIMENSION = 1536; // Dimensión de los embeddings para el modelo especificado

// Configuración del agente RAG
const RAG_CONFIG = {
  // Configuración general
  maxTokens: 1000,
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
  
  // Configuración de búsqueda de conocimiento
  knowledgeSearchTopK: 3,
  knowledgeSearchThreshold: 0.7,
  
  // Configuración de historial de conversación
  maxConversationHistory: 10,
  conversationExpiryHours: 24,
  
  // Configuración de generación de planes
  workoutPlanSessionsPerWeek: {
    beginner: 3,
    intermediate: 4,
    advanced: 5
  },
  nutritionPlanMealsPerDay: {
    default: 3,
    withSnacks: 5
  }
};

/**
 * Inicializa el cliente de Supabase
 * @returns {Object} Cliente de Supabase inicializado
 */
function initSupabase() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(SUPABASE_URL, SUPABASE_KEY);
}

/**
 * Obtiene información del perfil del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
async function getUserData(userId) {
  const supabase = initSupabase();
  
  // Obtener datos básicos del usuario
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (userError) throw new Error(`Error obteniendo datos de usuario: ${userError.message}`);
  
  // Obtener perfil del usuario
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (profileError) throw new Error(`Error obteniendo perfil de usuario: ${profileError.message}`);
  
  // Obtener preferencias del usuario
  const { data: preferencesData, error: preferencesError } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (preferencesError) throw new Error(`Error obteniendo preferencias de usuario: ${preferencesError.message}`);
  
  // Obtener objetivos del usuario
  const { data: goalsData, error: goalsError } = await supabase
    .from('fitness_goals')
    .select('*')
    .eq('user_id', userId);
  
  if (goalsError) throw new Error(`Error obteniendo objetivos de usuario: ${goalsError.message}`);
  
  // Combinar todos los datos
  return {
    ...userData,
    profile: profileData,
    preferences: preferencesData,
    goals: goalsData
  };
}

/**
 * Obtiene los planes de entrenamiento del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Planes de entrenamiento
 */
async function getWorkoutPlans(userId) {
  const supabase = initSupabase();
  
  // Obtener planes de entrenamiento
  const { data: plansData, error: plansError } = await supabase
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId);
  
  if (plansError) throw new Error(`Error obteniendo planes de entrenamiento: ${plansError.message}`);
  
  // Para cada plan, obtener sus sesiones
  const plansWithSessions = await Promise.all(plansData.map(async (plan) => {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('plan_id', plan.id);
    
    if (sessionsError) throw new Error(`Error obteniendo sesiones: ${sessionsError.message}`);
    
    // Para cada sesión, obtener sus ejercicios
    const sessionsWithExercises = await Promise.all(sessionsData.map(async (session) => {
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('session_id', session.id);
      
      if (exercisesError) throw new Error(`Error obteniendo ejercicios: ${exercisesError.message}`);
      
      // Obtener datos de cumplimiento
      const { data: completionData, error: completionError } = await supabase
        .from('session_completion')
        .select('*')
        .eq('session_id', session.id)
        .eq('user_id', userId);
      
      if (completionError) throw new Error(`Error obteniendo datos de cumplimiento: ${completionError.message}`);
      
      return {
        ...session,
        exercises: exercisesData.map(e => ({
          ...e,
          name: e.exercise.name,
          description: e.exercise.description,
          muscle_group: e.exercise.muscle_group,
          equipment_needed: e.exercise.equipment_needed,
          difficulty_level: e.exercise.difficulty_level
        })),
        completion_tracking: completionData
      };
    }));
    
    return {
      ...plan,
      sessions: sessionsWithExercises
    };
  }));
  
  return plansWithSessions;
}

/**
 * Obtiene los planes de nutrición del usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} Planes de nutrición
 */
async function getNutritionPlans(userId) {
  const supabase = initSupabase();
  
  // Obtener planes de nutrición
  const { data: plansData, error: plansError } = await supabase
    .from('nutrition_plans')
    .select('*')
    .eq('user_id', userId);
  
  if (plansError) throw new Error(`Error obteniendo planes de nutrición: ${plansError.message}`);
  
  // Para cada plan, obtener sus comidas
  const plansWithMeals = await Promise.all(plansData.map(async (plan) => {
    const { data: mealsData, error: mealsError } = await supabase
      .from('meals')
      .select('*')
      .eq('nutrition_plan_id', plan.id);
    
    if (mealsError) throw new Error(`Error obteniendo comidas: ${mealsError.message}`);
    
    // Para cada comida, obtener sus alimentos
    const mealsWithFoods = await Promise.all(mealsData.map(async (meal) => {
      const { data: foodsData, error: foodsError } = await supabase
        .from('foods')
        .select('*')
        .eq('meal_id', meal.id);
      
      if (foodsError) throw new Error(`Error obteniendo alimentos: ${foodsError.message}`);
      
      // Obtener datos de cumplimiento
      const { data: completionData, error: completionError } = await supabase
        .from('meal_completion')
        .select('*')
        .eq('meal_id', meal.id)
        .eq('user_id', userId);
      
      if (completionError) throw new Error(`Error obteniendo datos de cumplimiento: ${completionError.message}`);
      
      return {
        ...meal,
        foods: foodsData,
        completion_tracking: completionData
      };
    }));
    
    return {
      ...plan,
      meals: mealsWithFoods
    };
  }));
  
  return plansWithMeals;
}

/**
 * Obtiene ejercicios filtrados
 * @param {Object} filters - Filtros para los ejercicios
 * @returns {Promise<Array>} Ejercicios filtrados
 */
async function getExercises(filters = {}) {
  const supabase = initSupabase();
  
  let query = supabase
    .from('exercises')
    .select('*');
  
  // Aplicar filtros si existen
  if (filters.muscle_group) {
    query = query.eq('muscle_group', filters.muscle_group);
  }
  
  if (filters.difficulty_level) {
    query = query.eq('difficulty_level', filters.difficulty_level);
  }
  
  if (filters.equipment_needed) {
    query = query.eq('equipment_needed', filters.equipment_needed);
  }
  
  // Ejecutar consulta
  const { data, error } = await query;
  
  if (error) throw new Error(`Error obteniendo ejercicios: ${error.message}`);
  
  return data;
}

/**
 * Obtiene datos de progreso del usuario
 * @param {string} userId - ID del usuario
 * @param {Object} timeRange - Rango de tiempo para filtrar
 * @returns {Promise<Object>} Datos de progreso
 */
async function getProgress(userId, timeRange = {}) {
  const supabase = initSupabase();
  
  // Construir consultas con filtros de tiempo si existen
  let progressQuery = supabase
    .from('progress_tracking')
    .select('*')
    .eq('user_id', userId)
    .order('tracking_date', { ascending: false });
  
  let workoutLogsQuery = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('workout_date', { ascending: false });
  
  let nutritionLogsQuery = supabase
    .from('nutrition_logs')
    .select('*')
    .eq('user_id', userId)
    .order('tracking_date', { ascending: false });
  
  // Aplicar filtros de tiempo si existen
  if (timeRange.startDate) {
    progressQuery = progressQuery.gte('tracking_date', timeRange.startDate);
    workoutLogsQuery = workoutLogsQuery.gte('workout_date', timeRange.startDate);
    nutritionLogsQuery = nutritionLogsQuery.gte('tracking_date', timeRange.startDate);
  }
  
  if (timeRange.endDate) {
    progressQuery = progressQuery.lte('tracking_date', timeRange.endDate);
    workoutLogsQuery = workoutLogsQuery.lte('workout_date', timeRange.endDate);
    nutritionLogsQuery = nutritionLogsQuery.lte('tracking_date', timeRange.endDate);
  }
  
  // Limitar resultados si se especifica
  if (timeRange.limit) {
    progressQuery = progressQuery.limit(timeRange.limit);
    workoutLogsQuery = workoutLogsQuery.limit(timeRange.limit);
    nutritionLogsQuery = nutritionLogsQuery.limit(timeRange.limit);
  }
  
  // Ejecutar consultas
  const [progressResult, workoutLogsResult, nutritionLogsResult] = await Promise.all([
    progressQuery,
    workoutLogsQuery,
    nutritionLogsQuery
  ]);
  
  if (progressResult.error) throw new Error(`Error obteniendo datos de progreso: ${progressResult.error.message}`);
  if (workoutLogsResult.error) throw new Error(`Error obteniendo registros de entrenamiento: ${workoutLogsResult.error.message}`);
  if (nutritionLogsResult.error) throw new Error(`Error obteniendo registros de nutrición: ${nutritionLogsResult.error.message}`);
  
  return {
    progress: progressResult.data,
    workout_logs: workoutLogsResult.data,
    nutrition_logs: nutritionLogsResult.data
  };
}

/**
 * Crea un nuevo plan de entrenamiento
 * @param {string} userId - ID del usuario
 * @param {Object} planData - Datos del plan de entrenamiento
 * @returns {Promise<Object>} Plan de entrenamiento creado
 */
async function createWorkoutPlan(userId, planData) {
  const supabase = initSupabase();
  
  // Crear plan de entrenamiento
  const { data: planResult, error: planError } = await supabase
    .from('workout_plans')
    .insert([{
      user_id: userId,
      plan_name: planData.planName,
      description: planData.description,
      is_ai_generated: true
    }])
    .select()
    .single();
  
  if (planError) throw new Error(`Error creando plan de entrenamiento: ${planError.message}`);
  
  // Crear sesiones
  const sessionsToInsert = planData.sessions.map(session => ({
    plan_id: planResult.id,
    day_of_week: session.dayOfWeek,
    focus_area: session.focusArea,
    duration_minutes: session.durationMinutes,
    scheduled_time: session.scheduledTime
  }));
  
  const { data: sessionsResult, error: sessionsError } = await supabase
    .from('workout_sessions')
    .insert(sessionsToInsert)
    .select();
  
  if (sessionsError) throw new Error(`Error creando sesiones: ${sessionsError.message}`);
  
  // Crear ejercicios para cada sesión
  const exercisesToInsert = [];
  
  planData.sessions.forEach((session, sessionIndex) => {
    session.exercises.forEach(exercise => {
      exercisesToInsert.push({
        session_id: sessionsResult[sessionIndex].id,
        exercise_id: exercise.exerciseId,
        sets: exercise.sets,
        reps: exercise.reps,
        duration_seconds: exercise.durationSeconds,
        rest_seconds: exercise.restSeconds,
        notes: exercise.notes
      });
    });
  });
  
  if (exercisesToInsert.length > 0) {
    const { error: exercisesError } = await supabase
      .from('workout_exercises')
      .insert(exercisesToInsert);
    
    if (exercisesError) throw new Error(`Error creando ejercicios: ${exercisesError.message}`);
  }
  
  // Obtener el plan completo con sesiones y ejercicios
  return getWorkoutPlans(userId).then(plans => 
    plans.find(plan => plan.id === planResult.id)
  );
}

/**
 * Crea un nuevo plan de nutrición
 * @param {string} userId - ID del usuario
 * @param {Object} planData - Datos del plan de nutrición
 * @returns {Promise<Object>} Plan de nutrición creado
 */
async function createNutritionPlan(userId, planData) {
  const supabase = initSupabase();
  
  // Crear plan de nutrición
  const { data: planResult, error: planError } = await supabase
    .from('nutrition_plans')
    .insert([{
      user_id: userId,
      plan_name: planData.planName,
      description: planData.description,
      daily_calories: planData.dailyCalories,
      protein_grams: planData.proteinGrams,
      carbs_grams: planData.carbsGrams,
      fat_grams: planData.fatGrams,
      is_ai_generated: true
    }])
    .select()
    .single();
  
  if (planError) throw new Error(`Error creando plan de nutrición: ${planError.message}`);
  
  // Crear comidas
  const mealsToInsert = planData.meals.map(meal => ({
    nutrition_plan_id: planResult.id,
    meal_name: meal.mealName,
    scheduled_time: meal.scheduledTime,
    description: meal.description,
    calories: meal.calories,
    protein_grams: meal.proteinGrams,
    carbs_grams: meal.carbsGrams,
    fat_grams: meal.fatGrams
  }));
  
  const { data: mealsResult, error: mealsError } = await supabase
    .from('meals')
    .insert(mealsToInsert)
    .select();
  
  if (mealsError) throw new Error(`Error creando comidas: ${mealsError.message}`);
  
  // Crear alimentos para cada comida
  const foodsToInsert = [];
  
  planData.meals.forEach((meal, mealIndex) => {
    meal.foods.forEach(food => {
      foodsToInsert.push({
        meal_id: mealsResult[mealIndex].id,
        food_name: food.foodName,
        portion: food.portion,
        calories: food.calories,
        protein_grams: food.proteinGrams,
        carbs_grams: food.carbsGrams,
        fat_grams: food.fatGrams
      });
    });
  });
  
  if (foodsToInsert.length > 0) {
    const { error: foodsError } = await supabase
      .from('foods')
      .insert(foodsToInsert);
    
    if (foodsError) throw new Error(`Error creando alimentos: ${foodsError.message}`);
  }
  
  // Obtener el plan completo con comidas y alimentos
  return getNutritionPlans(userId).then(plans => 
    plans.find(plan => plan.id === planResult.id)
  );
}

/**
 * Registra la finalización de una sesión de entrenamiento
 * @param {string} sessionId - ID de la sesión
 * @param {Object} completionData - Datos de finalización
 * @returns {Promise<void>}
 */
async function logWorkoutCompletion(sessionId, completionData) {
  const supabase = initSupabase();
  
  // Obtener información de la sesión para saber el usuario
  const { data: sessionData, error: sessionError } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      plan:workout_plans(user_id)
    `)
    .eq('id', sessionId)
    .single();
  
  if (sessionError) throw new Error(`Error obteniendo información de sesión: ${sessionError.message}`);
  
  // Registrar finalización
  const { error: completionError } = await supabase
    .from('session_completion')
    .insert([{
      session_id: sessionId,
      user_id: sessionData.plan.user_id,
      completion_date: completionData.date || new Date().toISOString().split('T')[0],
      completed: completionData.completed !== undefined ? completionData.completed : true,
      completion_time: completionData.time,
      notes: completionData.notes
    }]);
  
  if (completionError) throw new Error(`Error registrando finalización: ${completionError.message}`);
}

/**
 * Registra la finalización de una comida
 * @param {string} mealId - ID de la comida
 * @param {Object} completionData - Datos de finalización
 * @returns {Promise<void>}
 */
async function logMealCompletion(mealId, completionData) {
  const supabase = initSupabase();
  
  // Obtener información de la comida para saber el usuario
  const { data: mealData, error: mealError } = await supabase
    .from('meals')
    .select(`
      *,
      plan:nutrition_plans(user_id)
    `)
    .eq('id', mealId)
    .single();
  
  if (mealError) throw new Error(`Error obteniendo información de comida: ${mealError.message}`);
  
  // Registrar finalización
  const { error: completionError } = await supabase
    .from('meal_completion')
    .insert([{
      meal_id: mealId,
      user_id: mealData.plan.user_id,
      completion_date: completionData.date || new Date().toISOString().split('T')[0],
      completed: completionData.completed !== undefined ? completionData.completed : true,
      completion_time: completionData.time,
      notes: completionData.notes
    }]);
  
  if (completionError) throw new Error(`Error registrando finalización: ${completionError.message}`);
}

/**
 * Registra nuevos datos de progreso
 * @param {string} userId - ID del usuario
 * @param {Object} progressData - Datos de progreso
 * @returns {Promise<void>}
 */
async function logProgress(userId, progressData) {
  const supabase = initSupabase();
  
  // Registrar progreso
  const { error: progressError } = await supabase
    .from('progress_tracking')
    .insert([{
      user_id: userId,
      tracking_date: progressData.date || new Date().toISOString().split('T')[0],
      weight: progressData.weight,
      body_fat_percentage: progressData.bodyFatPercentage,
      measurements: progressData.measurements,
      notes: progressData.notes
    }]);
  
  if (progressError) throw new Error(`Error registrando progreso: ${progressError.message}`);
}

/**
 * Genera un embedding para una consulta de texto
 * @param {string} text - Texto para generar embedding
 * @returns {Promise<Array>} Vector de embedding
 */
async function generateEmbedding(text) {
  // Esta función requiere una API de embeddings (OpenAI, etc.)
  // Implementación de ejemplo usando OpenAI
  const { Configuration, OpenAIApi } = require('openai');
  
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  
  const response = await openai.createEmbedding({
    model: EMBEDDING_MODEL,
    input: text,
  });
  
  return response.data.data[0].embedding;
}

/**
 * Busca información relevante en la base de conocimiento
 * @param {string} query - Consulta de búsqueda
 * @param {number} topK - Número de resultados a devolver
 * @returns {Promise<Array>} Elementos de conocimiento relevantes
 */
async function getKnowledge(query, topK = 3) {
  const supabase = initSupabase();
  
  // Generar embedding para la consulta
  const embedding = await generateEmbedding(query);
  
  // Buscar en la base de conocimiento usando similitud de coseno
  const { data, error } = await supabase.rpc('match_knowledge', {
    query_embedding: embedding,
    match_threshold: RAG_CONFIG.knowledgeSearchThreshold,
    match_count: topK
  });
  
  if (error) throw new Error(`Error buscando conocimiento: ${error.message}`);
  
  return data;
}

/**
 * Guarda el contexto de la conversación en Supabase
 * @param {string} userId - ID del usuario
 * @param {Object} conversationData - Datos de la conversación
 * @returns {Promise<void>}
 */
async function saveConversation(userId, conversationData) {
  const supabase = initSupabase();
  
  // Guardar conversación
  const { error } = await supabase
    .from('agent_conversations')
    .insert([{
      user_id: userId,
      conversation_id: conversationData.conversationId,
      message: conversationData.message,
      response: conversationData.response,
      intent: conversationData.intent,
      entities: conversationData.entities,
      actions_taken: conversationData.actionsTaken,
      context: conversationData.context
    }]);
  
  if (error) throw new Error(`Error guardando conversación: ${error.message}`);
}

/**
 * Recupera el historial de conversación reciente
 * @param {string} userId - ID del usuario
 * @param {number} limit - Número máximo de mensajes a recuperar
 * @returns {Promise<Array>} Historial de conversación
 */
async function getConversationHistory(userId, limit = 10) {
  const supabase = initSupabase();
  
  // Recuperar historial de conversación
  const { data, error } = await supabase
    .from('agent_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw new Error(`Error recuperando historial de conversación: ${error.message}`);
  
  // Devolver en orden cronológico (más antiguo primero)
  return data.reverse();
}

// Exportar todas las funciones y configuraciones
module.exports = {
  // Configuración
  RAG_CONFIG,
  
  // Funciones de datos de usuario
  getUserData,
  getWorkoutPlans,
  getNutritionPlans,
  getExercises,
  getProgress,
  
  // Funciones de creación y actualización
  createWorkoutPlan,
  createNutritionPlan,
  logWorkoutCompletion,
  logMealCompletion,
  logProgress,
  
  // Funciones de RAG
  getKnowledge,
  saveConversation,
  getConversationHistory
};

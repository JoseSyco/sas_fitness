/**
 * Implementación del Agente RAG para SAS Fitness
 * Este archivo contiene la lógica principal del agente RAG que se integra con Supabase
 */

const { 
  RAG_CONFIG,
  getUserData,
  getWorkoutPlans,
  getNutritionPlans,
  getExercises,
  getProgress,
  createWorkoutPlan,
  createNutritionPlan,
  logWorkoutCompletion,
  logMealCompletion,
  logProgress,
  getKnowledge,
  saveConversation,
  getConversationHistory
} = require('./supabase_rag_config');

// Importar la librería para interactuar con DeepSeek
const { DeepSeekAPI } = require('./deepseek_api');

// Inicializar DeepSeek API
const deepseek = new DeepSeekAPI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  maxTokens: RAG_CONFIG.maxTokens,
  temperature: RAG_CONFIG.temperature,
  topP: RAG_CONFIG.topP,
  frequencyPenalty: RAG_CONFIG.frequencyPenalty,
  presencePenalty: RAG_CONFIG.presencePenalty
});

/**
 * Clase principal del Agente RAG
 */
class RAGAgent {
  constructor() {
    // Cargar el prompt del agente
    this.agentPrompt = require('fs').readFileSync('./rag_agent_prompt.md', 'utf8');
    
    // Inicializar mapa de conversaciones activas
    this.activeConversations = new Map();
  }
  
  /**
   * Procesa un mensaje del usuario y genera una respuesta
   * @param {string} userId - ID del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Object>} Respuesta del agente
   */
  async processMessage(userId, message) {
    try {
      // Obtener o crear ID de conversación
      const conversationId = this.getConversationId(userId);
      
      // Obtener contexto de la conversación
      const conversationContext = await this.buildConversationContext(userId, conversationId);
      
      // Analizar la intención del mensaje
      const intent = await this.analyzeIntent(message);
      
      // Obtener conocimiento relevante
      const relevantKnowledge = await getKnowledge(message, RAG_CONFIG.knowledgeSearchTopK);
      
      // Construir el prompt completo
      const fullPrompt = await this.buildPrompt(
        userId,
        message,
        conversationContext,
        intent,
        relevantKnowledge
      );
      
      // Generar respuesta con DeepSeek
      const response = await deepseek.generateResponse(fullPrompt);
      
      // Extraer y ejecutar acciones
      const actions = this.extractActions(response);
      const actionResults = await this.executeActions(userId, actions);
      
      // Construir respuesta final
      const finalResponse = this.buildFinalResponse(response, actionResults);
      
      // Guardar la conversación
      await this.saveConversationEntry(
        userId,
        conversationId,
        message,
        finalResponse,
        intent,
        actions,
        actionResults
      );
      
      return {
        response: finalResponse,
        conversationId,
        intent,
        actions: actionResults
      };
    } catch (error) {
      console.error('Error procesando mensaje:', error);
      return {
        response: "Lo siento, he tenido un problema procesando tu mensaje. Por favor, inténtalo de nuevo.",
        error: error.message
      };
    }
  }
  
  /**
   * Obtiene o crea un ID de conversación para un usuario
   * @param {string} userId - ID del usuario
   * @returns {string} ID de conversación
   */
  getConversationId(userId) {
    // Si ya existe una conversación activa, devolver su ID
    if (this.activeConversations.has(userId)) {
      const conversation = this.activeConversations.get(userId);
      
      // Verificar si la conversación ha expirado
      const now = new Date();
      const expiryTime = new Date(conversation.lastActivity);
      expiryTime.setHours(expiryTime.getHours() + RAG_CONFIG.conversationExpiryHours);
      
      if (now < expiryTime) {
        // Actualizar timestamp de última actividad
        conversation.lastActivity = now;
        this.activeConversations.set(userId, conversation);
        return conversation.id;
      }
    }
    
    // Crear nueva conversación
    const newConversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    this.activeConversations.set(userId, {
      id: newConversationId,
      lastActivity: new Date()
    });
    
    return newConversationId;
  }
  
  /**
   * Construye el contexto de la conversación
   * @param {string} userId - ID del usuario
   * @param {string} conversationId - ID de conversación
   * @returns {Promise<Object>} Contexto de la conversación
   */
  async buildConversationContext(userId, conversationId) {
    // Obtener historial de conversación
    const conversationHistory = await getConversationHistory(userId, RAG_CONFIG.maxConversationHistory);
    
    // Obtener datos del usuario
    const userData = await getUserData(userId);
    
    // Construir contexto
    return {
      user: {
        firstName: userData.first_name,
        lastName: userData.last_name,
        age: userData.profile.age,
        gender: userData.profile.gender,
        fitnessLevel: userData.profile.fitness_level,
        fitnessGoals: userData.profile.fitness_goals,
        preferredWorkoutDays: userData.profile.preferred_workout_days
      },
      conversation: {
        id: conversationId,
        history: conversationHistory.map(entry => ({
          message: entry.message,
          response: entry.response,
          timestamp: entry.created_at
        }))
      }
    };
  }
  
  /**
   * Analiza la intención del mensaje del usuario
   * @param {string} message - Mensaje del usuario
   * @returns {Promise<Object>} Intención y entidades detectadas
   */
  async analyzeIntent(message) {
    // Implementación simplificada - en producción se usaría un modelo NLU más sofisticado
    const intents = [
      { name: 'create_workout_plan', keywords: ['crear plan', 'nuevo plan', 'plan de entrenamiento', 'rutina'] },
      { name: 'create_nutrition_plan', keywords: ['plan de nutrición', 'dieta', 'alimentación', 'comida'] },
      { name: 'track_progress', keywords: ['progreso', 'seguimiento', 'peso', 'medidas'] },
      { name: 'log_workout', keywords: ['registrar entrenamiento', 'completé', 'terminé', 'hice ejercicio'] },
      { name: 'get_exercise_info', keywords: ['ejercicio', 'cómo hacer', 'técnica', 'músculos'] },
      { name: 'get_nutrition_info', keywords: ['calorías', 'proteínas', 'carbohidratos', 'grasas', 'nutrientes'] }
    ];
    
    // Detectar intención principal
    let mainIntent = 'general_query';
    let highestScore = 0;
    
    for (const intent of intents) {
      const score = intent.keywords.reduce((count, keyword) => {
        return count + (message.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (score > highestScore) {
        highestScore = score;
        mainIntent = intent.name;
      }
    }
    
    // Detectar entidades (implementación simplificada)
    const entities = {};
    
    // Detectar grupos musculares
    const muscleGroups = ['piernas', 'pecho', 'espalda', 'hombros', 'brazos', 'abdomen', 'core', 'cardio'];
    for (const muscle of muscleGroups) {
      if (message.toLowerCase().includes(muscle.toLowerCase())) {
        entities.muscle_group = muscle;
      }
    }
    
    // Detectar niveles de dificultad
    const difficultyLevels = ['principiante', 'intermedio', 'avanzado', 'beginner', 'intermediate', 'advanced'];
    for (const level of difficultyLevels) {
      if (message.toLowerCase().includes(level.toLowerCase())) {
        entities.difficulty_level = level;
      }
    }
    
    return {
      intent: mainIntent,
      confidence: highestScore > 0 ? highestScore / 3 : 0.5, // Normalizar confianza
      entities
    };
  }
  
  /**
   * Construye el prompt completo para el modelo
   * @param {string} userId - ID del usuario
   * @param {string} message - Mensaje del usuario
   * @param {Object} context - Contexto de la conversación
   * @param {Object} intent - Intención detectada
   * @param {Array} knowledge - Conocimiento relevante
   * @returns {Promise<string>} Prompt completo
   */
  async buildPrompt(userId, message, context, intent, knowledge) {
    // Construir sección de contexto del usuario
    const userContext = `
# Contexto del Usuario
- Nombre: ${context.user.firstName} ${context.user.lastName}
- Edad: ${context.user.age}
- Género: ${context.user.gender}
- Nivel de fitness: ${context.user.fitnessLevel}
- Objetivos: ${context.user.fitnessGoals.join(', ')}
- Días preferidos: ${context.user.preferredWorkoutDays.join(', ')}
    `;
    
    // Construir sección de historial de conversación
    let conversationHistory = '';
    if (context.conversation.history.length > 0) {
      conversationHistory = `
# Historial de Conversación Reciente
${context.conversation.history.map(entry => `
Usuario: ${entry.message}
FitCoach: ${entry.response}
`).join('\n')}
      `;
    }
    
    // Construir sección de conocimiento relevante
    let relevantKnowledge = '';
    if (knowledge.length > 0) {
      relevantKnowledge = `
# Conocimiento Relevante
${knowledge.map(item => `
Tema: ${item.topic} - ${item.subtopic}
${item.content}
`).join('\n')}
      `;
    }
    
    // Construir sección de intención detectada
    const intentSection = `
# Intención Detectada
- Intención principal: ${intent.intent}
- Confianza: ${intent.confidence}
- Entidades: ${Object.entries(intent.entities).map(([key, value]) => `${key}: ${value}`).join(', ')}
    `;
    
    // Combinar todo en el prompt final
    return `
${this.agentPrompt}

${userContext}

${conversationHistory}

${relevantKnowledge}

${intentSection}

# Mensaje Actual del Usuario
${message}

# Tu respuesta:
`;
  }
  
  /**
   * Extrae acciones de la respuesta del modelo
   * @param {string} response - Respuesta del modelo
   * @returns {Array} Acciones a ejecutar
   */
  extractActions(response) {
    // Implementación simplificada - en producción se usaría un parser más robusto
    const actions = [];
    
    // Buscar patrones de acción en la respuesta
    const actionPatterns = [
      {
        type: 'create_workout_plan',
        regex: /\[ACTION:CREATE_WORKOUT_PLAN\]([\s\S]*?)\[\/ACTION\]/g
      },
      {
        type: 'create_nutrition_plan',
        regex: /\[ACTION:CREATE_NUTRITION_PLAN\]([\s\S]*?)\[\/ACTION\]/g
      },
      {
        type: 'log_workout_completion',
        regex: /\[ACTION:LOG_WORKOUT_COMPLETION\]([\s\S]*?)\[\/ACTION\]/g
      },
      {
        type: 'log_meal_completion',
        regex: /\[ACTION:LOG_MEAL_COMPLETION\]([\s\S]*?)\[\/ACTION\]/g
      },
      {
        type: 'log_progress',
        regex: /\[ACTION:LOG_PROGRESS\]([\s\S]*?)\[\/ACTION\]/g
      }
    ];
    
    // Extraer acciones
    for (const pattern of actionPatterns) {
      const matches = [...response.matchAll(pattern.regex)];
      for (const match of matches) {
        try {
          const actionData = JSON.parse(match[1]);
          actions.push({
            type: pattern.type,
            data: actionData
          });
        } catch (error) {
          console.error(`Error parsing action data: ${error.message}`);
        }
      }
    }
    
    return actions;
  }
  
  /**
   * Ejecuta las acciones extraídas
   * @param {string} userId - ID del usuario
   * @param {Array} actions - Acciones a ejecutar
   * @returns {Promise<Array>} Resultados de las acciones
   */
  async executeActions(userId, actions) {
    const results = [];
    
    for (const action of actions) {
      try {
        let result;
        
        switch (action.type) {
          case 'create_workout_plan':
            result = await createWorkoutPlan(userId, action.data);
            break;
            
          case 'create_nutrition_plan':
            result = await createNutritionPlan(userId, action.data);
            break;
            
          case 'log_workout_completion':
            await logWorkoutCompletion(action.data.sessionId, action.data.completion);
            result = { success: true, message: 'Entrenamiento registrado con éxito' };
            break;
            
          case 'log_meal_completion':
            await logMealCompletion(action.data.mealId, action.data.completion);
            result = { success: true, message: 'Comida registrada con éxito' };
            break;
            
          case 'log_progress':
            await logProgress(userId, action.data);
            result = { success: true, message: 'Progreso registrado con éxito' };
            break;
            
          default:
            result = { success: false, message: `Tipo de acción desconocido: ${action.type}` };
        }
        
        results.push({
          type: action.type,
          success: true,
          result
        });
      } catch (error) {
        results.push({
          type: action.type,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  /**
   * Construye la respuesta final basada en la respuesta del modelo y los resultados de las acciones
   * @param {string} response - Respuesta del modelo
   * @param {Array} actionResults - Resultados de las acciones
   * @returns {string} Respuesta final
   */
  buildFinalResponse(response, actionResults) {
    // Eliminar marcadores de acción
    let finalResponse = response;
    
    const actionPatterns = [
      /\[ACTION:CREATE_WORKOUT_PLAN\]([\s\S]*?)\[\/ACTION\]/g,
      /\[ACTION:CREATE_NUTRITION_PLAN\]([\s\S]*?)\[\/ACTION\]/g,
      /\[ACTION:LOG_WORKOUT_COMPLETION\]([\s\S]*?)\[\/ACTION\]/g,
      /\[ACTION:LOG_MEAL_COMPLETION\]([\s\S]*?)\[\/ACTION\]/g,
      /\[ACTION:LOG_PROGRESS\]([\s\S]*?)\[\/ACTION\]/g
    ];
    
    for (const pattern of actionPatterns) {
      finalResponse = finalResponse.replace(pattern, '');
    }
    
    // Reemplazar referencias a acciones con resultados reales
    for (const result of actionResults) {
      if (!result.success) {
        finalResponse += `\n\nHubo un problema al ${this.getActionDescription(result.type)}: ${result.error}`;
      }
    }
    
    return finalResponse.trim();
  }
  
  /**
   * Obtiene una descripción legible de un tipo de acción
   * @param {string} actionType - Tipo de acción
   * @returns {string} Descripción de la acción
   */
  getActionDescription(actionType) {
    const descriptions = {
      'create_workout_plan': 'crear el plan de entrenamiento',
      'create_nutrition_plan': 'crear el plan de nutrición',
      'log_workout_completion': 'registrar el entrenamiento',
      'log_meal_completion': 'registrar la comida',
      'log_progress': 'registrar el progreso'
    };
    
    return descriptions[actionType] || actionType;
  }
  
  /**
   * Guarda una entrada de conversación en Supabase
   * @param {string} userId - ID del usuario
   * @param {string} conversationId - ID de conversación
   * @param {string} message - Mensaje del usuario
   * @param {string} response - Respuesta del agente
   * @param {Object} intent - Intención detectada
   * @param {Array} actions - Acciones extraídas
   * @param {Array} actionResults - Resultados de las acciones
   * @returns {Promise<void>}
   */
  async saveConversationEntry(userId, conversationId, message, response, intent, actions, actionResults) {
    await saveConversation(userId, {
      conversationId,
      message,
      response,
      intent: intent.intent,
      entities: intent.entities,
      actionsTaken: {
        actions,
        results: actionResults
      },
      context: {
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Exportar la clase del agente
module.exports = {
  RAGAgent
};

/**
 * Middleware para conectar el frontend con el agente RAG
 * Este archivo se utiliza en el servidor de desarrollo para simular la API del agente RAG
 */

const { RAGAgent } = require('../../rag_agent');

// Inicializar el agente RAG
const ragAgent = new RAGAgent();

/**
 * Middleware para Express que maneja las solicitudes al agente RAG
 * @param {Object} req - Objeto de solicitud de Express
 * @param {Object} res - Objeto de respuesta de Express
 * @param {Function} next - Función next de Express
 */
const ragAgentMiddleware = async (req, res, next) => {
  // Solo procesar rutas específicas
  if (!req.path.startsWith('/api/ai-coach')) {
    return next();
  }
  
  try {
    // Manejar diferentes endpoints
    if (req.method === 'POST' && req.path === '/api/ai-coach') {
      // Procesar mensaje
      const { message, userId } = req.body;
      
      if (!message || !userId) {
        return res.status(400).json({ 
          error: 'Se requieren los campos message y userId' 
        });
      }
      
      console.log(`[RAG Agent] Processing message from user ${userId}: ${message}`);
      
      // Procesar mensaje con el agente RAG
      const response = await ragAgent.processMessage(userId, message);
      
      console.log(`[RAG Agent] Response: ${response.response.substring(0, 100)}...`);
      
      return res.json(response);
    } 
    else if (req.method === 'GET' && req.path === '/api/ai-coach/history') {
      // Obtener historial de conversación
      const { userId, limit } = req.query;
      
      if (!userId) {
        return res.status(400).json({ 
          error: 'Se requiere el campo userId' 
        });
      }
      
      console.log(`[RAG Agent] Getting conversation history for user ${userId}`);
      
      // Obtener historial de conversación
      const history = await ragAgent.getConversationHistory(userId, parseInt(limit) || 10);
      
      return res.json({ history });
    }
    else {
      // Ruta no soportada
      return res.status(404).json({ 
        error: 'Endpoint no encontrado' 
      });
    }
  } catch (error) {
    console.error('[RAG Agent] Error:', error);
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
};

module.exports = ragAgentMiddleware;

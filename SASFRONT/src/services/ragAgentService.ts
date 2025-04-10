/**
 * Servicio para interactuar con el agente RAG
 * Este servicio se integra con el sistema de API existente
 */
import { aiService } from './api';
import logger from '../utils/logger';

// Interfaz para la respuesta del agente RAG
export interface RAGResponse {
  response: string;
  conversationId: string;
  intent?: string;
  actions?: any[];
}

// Servicio para el agente RAG
const ragAgentService = {
  /**
   * Envía un mensaje al agente RAG
   * @param message Mensaje del usuario
   * @param userId ID del usuario (opcional, por defecto '00000000-0000-0000-0000-000000000001')
   * @returns Respuesta del agente RAG
   */
  sendMessage: async (message: string, userId: string = '00000000-0000-0000-0000-000000000001'): Promise<RAGResponse> => {
    try {
      logger.info('[RAGAgentService] Sending message to agent', { messageLength: message.length });
      console.log('[RAGAgentService] Sending message:', message);
      
      // Utilizar el servicio de AI existente para enviar el mensaje
      // Esto aprovecha la lógica de fallback existente
      const response = await aiService.sendChatMessage(message);
      
      logger.info('[RAGAgentService] Received response from agent', { 
        responseLength: response.data.message?.length || 0 
      });
      console.log('[RAGAgentService] Received response:', response.data);
      
      // Transformar la respuesta al formato esperado por el agente RAG
      const ragResponse: RAGResponse = {
        response: response.data.message || "Lo siento, no pude procesar tu mensaje.",
        conversationId: response.data.conversation_id || `conv_${Date.now()}`,
        intent: response.data.intent,
        actions: response.data.action ? [response.data.action] : []
      };
      
      return ragResponse;
    } catch (error) {
      logger.error('[RAGAgentService] Error sending message to agent', { error });
      console.error('[RAGAgentService] Error:', error);
      
      // Devolver una respuesta de error
      return {
        response: "Lo siento, tuve un problema al procesar tu mensaje. Por favor, inténtalo de nuevo.",
        conversationId: `conv_error_${Date.now()}`
      };
    }
  },
  
  /**
   * Obtiene el historial de conversación
   * @param userId ID del usuario (opcional, por defecto '00000000-0000-0000-0000-000000000001')
   * @param limit Número máximo de mensajes a recuperar (opcional, por defecto 10)
   * @returns Historial de conversación
   */
  getConversationHistory: async (userId: string = '00000000-0000-0000-0000-000000000001', limit: number = 10): Promise<any[]> => {
    try {
      logger.info('[RAGAgentService] Getting conversation history', { userId, limit });
      
      // En una implementación real, esto llamaría a un endpoint específico
      // Por ahora, devolvemos un array vacío
      return [];
    } catch (error) {
      logger.error('[RAGAgentService] Error getting conversation history', { error });
      console.error('[RAGAgentService] Error:', error);
      return [];
    }
  }
};

export default ragAgentService;

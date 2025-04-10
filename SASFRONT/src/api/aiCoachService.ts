import axios from 'axios';
import { api } from '../services/api';
import ragAgentService from '../services/ragAgentService';

/**
 * Interfaz para la respuesta del agente RAG
 */
export interface RAGResponse {
  response: string;
  conversationId: string;
  intent?: string;
  actions?: any[];
}

/**
 * Servicio para interactuar con el agente RAG
 */
const aiCoachService = {
  /**
   * Envía un mensaje al agente RAG
   * @param message Mensaje del usuario
   * @param userId ID del usuario
   * @returns Respuesta del agente RAG
   */
  sendMessage: async (message: string, userId: string): Promise<RAGResponse> => {
    try {
      console.log('[AICoachService] Sending message to RAG agent:', message);

      // Intentar usar la API primero
      try {
        const response = await api.post('/ai-coach', {
          message,
          userId
        });

        console.log('[AICoachService] Response from API:', response.data);

        return response.data;
      } catch (apiError) {
        console.warn('[AICoachService] API error, falling back to ragAgentService:', apiError);

        // Fallback a ragAgentService
        const response = await ragAgentService.sendMessage(message, userId);

        console.log('[AICoachService] Response from ragAgentService:', response);

        return response;
      }
    } catch (error) {
      console.error('[AICoachService] Error sending message to RAG agent:', error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de conversación
   * @param userId ID del usuario
   * @param limit Número máximo de mensajes a recuperar
   * @returns Historial de conversación
   */
  getConversationHistory: async (userId: string, limit: number = 10): Promise<any[]> => {
    try {
      console.log('[AICoachService] Getting conversation history for user:', userId);

      // Intentar usar la API primero
      try {
        const response = await api.get(`/ai-coach/history?userId=${userId}&limit=${limit}`);

        console.log('[AICoachService] Conversation history from API:', response.data);

        return response.data.history;
      } catch (apiError) {
        console.warn('[AICoachService] API error, falling back to ragAgentService:', apiError);

        // Fallback a ragAgentService
        const history = await ragAgentService.getConversationHistory(userId, limit);

        console.log('[AICoachService] Conversation history from ragAgentService:', history);

        return history;
      }
    } catch (error) {
      console.error('[AICoachService] Error getting conversation history:', error);
      throw error;
    }
  }
};

export default aiCoachService;

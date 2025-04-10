/**
 * Cliente para la API de DeepSeek
 * Este archivo contiene la implementación para interactuar con la API de DeepSeek
 */

const axios = require('axios');

/**
 * Clase para interactuar con la API de DeepSeek
 */
class DeepSeekAPI {
  /**
   * Constructor
   * @param {Object} config - Configuración para la API
   * @param {string} config.apiKey - Clave de API de DeepSeek
   * @param {number} config.maxTokens - Número máximo de tokens a generar
   * @param {number} config.temperature - Temperatura para la generación
   * @param {number} config.topP - Valor de top-p para la generación
   * @param {number} config.frequencyPenalty - Penalización de frecuencia
   * @param {number} config.presencePenalty - Penalización de presencia
   */
  constructor(config) {
    this.apiKey = config.apiKey;
    this.maxTokens = config.maxTokens || 1000;
    this.temperature = config.temperature || 0.7;
    this.topP = config.topP || 0.9;
    this.frequencyPenalty = config.frequencyPenalty || 0.0;
    this.presencePenalty = config.presencePenalty || 0.0;
    
    // URL base de la API de DeepSeek
    this.apiUrl = 'https://api.deepseek.com/v1';
    
    // Modelo a utilizar
    this.model = 'deepseek-chat';
  }
  
  /**
   * Genera una respuesta utilizando la API de DeepSeek
   * @param {string} prompt - Prompt para generar la respuesta
   * @returns {Promise<string>} Respuesta generada
   */
  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'You are FitCoach, a virtual fitness coach and nutritionist.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          top_p: this.topP,
          frequency_penalty: this.frequencyPenalty,
          presence_penalty: this.presencePenalty
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      // Extraer y devolver la respuesta
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error generando respuesta con DeepSeek:', error);
      
      // Si hay un error específico de la API, devolverlo
      if (error.response && error.response.data) {
        throw new Error(`Error de DeepSeek: ${error.response.data.error.message}`);
      }
      
      // Si es otro tipo de error, devolverlo genérico
      throw new Error(`Error al comunicarse con DeepSeek: ${error.message}`);
    }
  }
  
  /**
   * Genera embeddings para un texto utilizando la API de DeepSeek
   * @param {string} text - Texto para generar embeddings
   * @returns {Promise<Array>} Vector de embeddings
   */
  async generateEmbeddings(text) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/embeddings`,
        {
          model: 'deepseek-embedding',
          input: text
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );
      
      // Extraer y devolver los embeddings
      return response.data.data[0].embedding;
    } catch (error) {
      console.error('Error generando embeddings con DeepSeek:', error);
      
      // Si hay un error específico de la API, devolverlo
      if (error.response && error.response.data) {
        throw new Error(`Error de DeepSeek: ${error.response.data.error.message}`);
      }
      
      // Si es otro tipo de error, devolverlo genérico
      throw new Error(`Error al comunicarse con DeepSeek: ${error.message}`);
    }
  }
}

// Exportar la clase
module.exports = {
  DeepSeekAPI
};

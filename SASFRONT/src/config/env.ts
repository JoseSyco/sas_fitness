/**
 * Configuración de variables de entorno
 * Este archivo centraliza el acceso a las variables de entorno
 */

// URL del webhook de n8n
export const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.synapticalhub.com/webhook/sas';

// API key de DeepSeek
export const DEEPSEEK_API_KEY = 'sk-f4295cbdcc284d45b6a1752c5e998b5b';

// URL de la API de DeepSeek
export const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1';

// Configuración de la aplicación
export const DEFAULT_USER_ID = 1;
export const ENABLE_WORKOUT_COMPLETION_TRACKING = true;
export const ENABLE_DAILY_WORKOUT_REMINDERS = true;

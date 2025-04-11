import axios from 'axios';
import logger from '../utils/logger';
import {
  authService as mockAuthService,
  userService as mockUserService,
  workoutService as mockWorkoutService,
  nutritionService as mockNutritionService,
  aiService as mockAiService,
  progressService as mockProgressService,
  exerciseService as mockExerciseService
} from './mockApi';
// ApiStatusContext removed
import localStorageService from './localStorageService';
import n8nService from './n8nService';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add token to requests if available and log requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log the request
  logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`, {
    baseURL: config.baseURL,
    headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer [REDACTED]' : undefined },
    params: config.params,
    data: config.data
  });

  return config;
});

// Log responses
api.interceptors.response.use(
  response => {
    logger.debug(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  error => {
    if (error.response) {
      logger.error(`API Error: ${error.response.status} ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    } else if (error.request) {
      logger.error('API Error: No response received', {
        request: error.request
      });
    } else {
      logger.error('API Error: Request setup error', {
        message: error.message
      });
    }
    return Promise.reject(error);
  }
);

// Real API services
const realAuthService = {
  login: async (email: string, password: string) => {
    return api.post('/auth/login', { email, password });
  },
  register: async (email: string, password: string, first_name: string, last_name: string) => {
    return api.post('/auth/register', { email, password, first_name, last_name });
  }
};

const realUserService = {
  getProfile: async (userId: number) => {
    return api.get(`/users/${userId}/profile`);
  },
  updateProfile: async (userId: number, profileData: any) => {
    return api.put(`/users/${userId}/profile`, profileData);
  },
  getGoals: async (userId: number) => {
    return api.get(`/users/${userId}/goals`);
  },
  createGoal: async (userId: number, goalData: any) => {
    return api.post(`/users/${userId}/goals`, goalData);
  },
  updateGoal: async (userId: number, goalId: number, goalData: any) => {
    return api.put(`/users/${userId}/goals/${goalId}`, goalData);
  },
  getProgress: async (userId: number) => {
    return api.get(`/users/${userId}/progress`);
  },
  addProgressEntry: async (userId: number, progressData: any) => {
    return api.post(`/users/${userId}/progress`, progressData);
  }
};

const realWorkoutService = {
  getPlans: async (userId: number) => {
    const response = await api.get(`/workouts/plans?user_id=${userId}`);
    console.log('Raw workout plans response:', response);
    return response;
  },
  getPlan: async (planId: number) => {
    return api.get(`/workouts/plans/${planId}`);
  },
  createPlan: async (planData: any) => {
    return api.post('/workouts/plans', planData);
  },
  updatePlan: async (planId: number, planData: any) => {
    return api.put(`/workouts/plans/${planId}`, planData);
  },
  deletePlan: async (planId: number) => {
    return api.delete(`/workouts/plans/${planId}`);
  },
  getWorkoutLogs: async (userId: number) => {
    return api.get(`/workouts/logs?user_id=${userId}`);
  },
  logWorkout: async (logData: any) => {
    return api.post('/workouts/logs', logData);
  }
};

const realNutritionService = {
  getPlans: async (userId: number) => {
    return api.get(`/nutrition/plans?user_id=${userId}`);
  },
  getPlan: async (planId: number) => {
    return api.get(`/nutrition/plans/${planId}`);
  },
  createPlan: async (planData: any) => {
    return api.post('/nutrition/plans', planData);
  },
  updatePlan: async (planId: number, planData: any) => {
    return api.put(`/nutrition/plans/${planId}`, planData);
  },
  deletePlan: async (planId: number) => {
    return api.delete(`/nutrition/plans/${planId}`);
  }
};

const realProgressService = {
  getProgress: async (userId: number) => {
    return api.get(`/progress?user_id=${userId}`);
  },
  logProgress: async (progressData: any) => {
    return api.post('/progress', progressData);
  },
  updateProgress: async (progressId: number, progressData: any) => {
    return api.put(`/progress/${progressId}`, progressData);
  },
  deleteProgress: async (progressId: number) => {
    return api.delete(`/progress/${progressId}`);
  }
};

const realExerciseService = {
  getExercises: async (filters?: any) => {
    return api.get('/exercises', { params: filters });
  },
  getExercise: async (exerciseId: number) => {
    return api.get(`/exercises/${exerciseId}`);
  },
  suggestExercise: async (exerciseData: any) => {
    return api.post('/exercises/suggest', exerciseData);
  },
  createExercise: async (exerciseData: any) => {
    return api.post('/exercises', exerciseData);
  },
  updateExercise: async (exerciseId: number, exerciseData: any) => {
    return api.put(`/exercises/${exerciseId}`, exerciseData);
  },
  deleteExercise: async (exerciseId: number) => {
    return api.delete(`/exercises/${exerciseId}`);
  }
};

const realAiService = {
  generateWorkoutPlan: async (userData: any) => {
    return api.post('/ai/generate-workout', userData);
  },
  generateNutritionPlan: async (userData: any) => {
    return api.post('/ai/generate-nutrition', userData);
  },
  getAdvice: async (query: string) => {
    return api.post('/ai/advice', { query });
  },
  sendChatMessage: async (message: string) => {
    // Usar exclusivamente n8n para el chat
    console.log('[API] Enviando mensaje a n8n service:', message);

    try {
      // Usar un nombre de usuario fijo para pruebas
      const n8nResponse = await n8nService.sendUserMessage('usuario_test', message);
      console.log('[API] Respuesta recibida de n8n:', n8nResponse);

      // Convertir la respuesta de n8n al formato esperado por la aplicación
      return {
        data: {
          message: n8nResponse.mensaje_agente || 'No se recibió respuesta del agente',
          data: n8nResponse.data || {},
          action: n8nResponse.action || null
        }
      };
    } catch (error) {
      console.error('[API] Error al comunicarse con n8n:', error);

      // Devolver un mensaje de error para mostrar al usuario
      return {
        data: {
          message: 'Lo siento, ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.',
          data: {},
          action: null
        }
      };
    }
  }
};

// API Status Context removed

// Create fallback service wrappers
const createFallbackService = (realService: any, mockService: any, serviceName: string) => {
  return new Proxy({}, {
    get: (target, prop) => {
      return async (...args: any[]) => {
        try {
          // Always use mock data for now since backend is not required
          throw new Error('Using mock data by default');

          console.log(`[API] Calling ${serviceName}.${String(prop)} with args:`, args);

          const result = await realService[prop](...args);
          // Backend status tracking removed

          console.log(`[API] Response from ${serviceName}.${String(prop)}:`, result);

          // If this is a successful create/update operation, also save to localStorage
          if (serviceName === 'workoutService' && prop === 'createPlan') {
            localStorageService.saveWorkoutPlan(args[0]);
            console.log(`[API] Saved workout plan to localStorage:`, args[0]);
          } else if (serviceName === 'nutritionService' && prop === 'createPlan') {
            localStorageService.saveNutritionPlan(args[0]);
            console.log(`[API] Saved nutrition plan to localStorage:`, args[0]);
          }

          return result;
        } catch (error) {
          logger.warn(`API call failed, using mock data for ${serviceName}.${String(prop)}`, {});
          console.error(`API call error details:`, error);
          // Backend status tracking removed

          // Save the request to localStorage for later sync
          const pendingRequest = {
            service: serviceName,
            method: prop,
            args,
          };

          console.log(`[API] Adding pending request for later sync:`, pendingRequest);
          localStorageService.addPendingRequest(pendingRequest);

          // For specific operations, save data to localStorage
          if (serviceName === 'workoutService') {
            if (prop === 'createPlan') {
              localStorageService.saveWorkoutPlan(args[0]);
            } else if (prop === 'getPlans') {
              const plans = localStorageService.getWorkoutPlans();
              return { data: { plans } };
            }
          } else if (serviceName === 'nutritionService') {
            if (prop === 'createPlan') {
              localStorageService.saveNutritionPlan(args[0]);
            } else if (prop === 'getPlans') {
              const plans = localStorageService.getNutritionPlans();
              return { data: { plans } };
            }
          }

          // Use mock service as fallback
          return mockService[prop](...args);
        }
      };
    }
  });
};

// Use fallback services
export const authService = createFallbackService(realAuthService, mockAuthService, 'authService');
export const userService = createFallbackService(realUserService, mockUserService, 'userService');
export const workoutService = createFallbackService(realWorkoutService, mockWorkoutService, 'workoutService');
export const nutritionService = createFallbackService(realNutritionService, mockNutritionService, 'nutritionService');
export const progressService = createFallbackService(realProgressService, mockProgressService, 'progressService');
export const exerciseService = createFallbackService(realExerciseService, mockExerciseService, 'exerciseService');
export const aiService = createFallbackService(realAiService, mockAiService, 'aiService');

export default api;

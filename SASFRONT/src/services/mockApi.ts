import {
  mockUser,
  mockProfile,
  mockGoals,
  mockProgress,
  mockWorkoutPlans,
  mockWorkoutSessions,
  mockWorkoutLogs,
  mockNutritionPlans,
  mockMeals,
  mockExercises
} from './mockData';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth services
export const authService = {
  login: async (email: string, password: string) => {
    await delay(500);
    // Simulate successful login
    if (email && password) {
      return {
        data: {
          token: 'mock-jwt-token',
          user: mockUser
        }
      };
    }
    // Simulate failed login
    throw { response: { data: { message: 'Invalid email or password' } } };
  },
  register: async (email: string, password: string, first_name: string, last_name: string) => {
    await delay(500);
    // Simulate successful registration
    if (email && password && first_name && last_name) {
      return {
        data: {
          token: 'mock-jwt-token',
          user: {
            ...mockUser,
            email,
            first_name,
            last_name
          }
        }
      };
    }
    // Simulate failed registration
    throw { response: { data: { message: 'Registration failed' } } };
  },
};

// User services
export const userService = {
  getProfile: async () => {
    await delay(300);
    return {
      data: {
        user: mockUser,
        profile: mockProfile
      }
    };
  },
  updateProfile: async (profileData: any) => {
    await delay(500);
    return {
      data: {
        message: 'Profile updated successfully',
        profile: {
          ...mockProfile,
          ...profileData,
          updated_at: new Date().toISOString()
        }
      }
    };
  },
  getGoals: async () => {
    await delay(300);
    return {
      data: {
        goals: mockGoals
      }
    };
  },
  createGoal: async (goalData: any) => {
    await delay(500);
    const newGoal = {
      goal_id: mockGoals.length + 1,
      user_id: mockUser.user_id,
      ...goalData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Goal created successfully',
        goal: newGoal
      }
    };
  },
  updateGoal: async (goalId: number, goalData: any) => {
    await delay(500);
    return {
      data: {
        message: 'Goal updated successfully',
        goal: {
          ...mockGoals.find(g => g.goal_id === goalId),
          ...goalData,
          updated_at: new Date().toISOString()
        }
      }
    };
  },
  trackProgress: async (progressData: any) => {
    await delay(500);
    const newProgress = {
      progress_id: mockProgress.length + 1,
      user_id: mockUser.user_id,
      ...progressData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Progress tracked successfully',
        progress: newProgress
      }
    };
  },
  getProgressHistory: async () => {
    await delay(300);
    return {
      data: {
        progress: mockProgress
      }
    };
  },
};

// Workout services
export const workoutService = {
  getWorkoutPlans: async () => {
    await delay(300);
    return {
      data: {
        plans: mockWorkoutPlans
      }
    };
  },
  getWorkoutPlan: async (planId: number) => {
    await delay(300);
    const plan = mockWorkoutPlans.find(p => p.plan_id === planId);
    const sessions = mockWorkoutSessions[planId as keyof typeof mockWorkoutSessions] || [];
    return {
      data: {
        plan,
        sessions
      }
    };
  },
  createWorkoutPlan: async (planData: any) => {
    await delay(500);
    const newPlan = {
      plan_id: mockWorkoutPlans.length + 1,
      user_id: mockUser.user_id,
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Workout plan created successfully',
        plan: newPlan
      }
    };
  },
  logWorkout: async (logData: any) => {
    await delay(500);
    const newLog = {
      log_id: mockWorkoutLogs.length + 1,
      user_id: mockUser.user_id,
      ...logData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Workout logged successfully',
        log: newLog
      }
    };
  },
  getWorkoutLogs: async (startDate?: string, endDate?: string) => {
    await delay(300);
    let logs = [...mockWorkoutLogs];

    if (startDate) {
      logs = logs.filter(log => log.workout_date >= startDate);
    }

    if (endDate) {
      logs = logs.filter(log => log.workout_date <= endDate);
    }

    return {
      data: {
        logs
      }
    };
  },
  getExercises: async (muscleGroup?: string, difficultyLevel?: string) => {
    await delay(300);
    let exercises = [...mockExercises];

    if (muscleGroup) {
      exercises = exercises.filter(ex => ex.muscle_group === muscleGroup);
    }

    if (difficultyLevel) {
      exercises = exercises.filter(ex => ex.difficulty_level === difficultyLevel);
    }

    return {
      data: {
        exercises
      }
    };
  },
};

// Nutrition services
export const nutritionService = {
  getNutritionPlans: async () => {
    await delay(300);
    return {
      data: {
        plans: mockNutritionPlans
      }
    };
  },
  getNutritionPlan: async (planId: number) => {
    await delay(300);
    const plan = mockNutritionPlans.find(p => p.nutrition_plan_id === planId);
    const meals = mockMeals[planId as keyof typeof mockMeals] || [];
    return {
      data: {
        plan,
        meals
      }
    };
  },
  createNutritionPlan: async (planData: any) => {
    await delay(500);
    const newPlan = {
      nutrition_plan_id: mockNutritionPlans.length + 1,
      user_id: mockUser.user_id,
      ...planData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Nutrition plan created successfully',
        plan: newPlan
      }
    };
  },
  updateNutritionPlan: async (planId: number, planData: any) => {
    await delay(500);
    return {
      data: {
        message: 'Nutrition plan updated successfully',
        plan: {
          ...mockNutritionPlans.find(p => p.nutrition_plan_id === planId),
          ...planData,
          updated_at: new Date().toISOString()
        }
      }
    };
  },
};

// AI services
export const aiService = {
  generateWorkoutPlan: async (data: any) => {
    await delay(1500);
    // Simulate AI-generated workout plan
    const workoutPlan = {
      plan_name: `Plan de ${data.goal === 'weight_loss' ? 'Pérdida de Peso' : 'Ganancia Muscular'} Personalizado`,
      description: `Un plan de entrenamiento personalizado para ${data.goal === 'weight_loss' ? 'pérdida de peso' : 'ganancia muscular'} con nivel de dificultad ${data.fitness_level}.`,
      is_ai_generated: true,
      sessions: [
        {
          day_of_week: 'Monday',
          focus_area: data.goal === 'weight_loss' ? 'Cardio y Core' : 'Pecho y Tríceps',
          duration_minutes: data.duration_minutes || 60,
          exercises: [
            {
              name: data.goal === 'weight_loss' ? 'Carrera en cinta' : 'Press de banca',
              sets: 3,
              reps: data.goal === 'weight_loss' ? null : 10,
              duration_seconds: data.goal === 'weight_loss' ? 1200 : null,
              rest_seconds: 60,
              notes: 'Mantén un ritmo constante'
            },
            {
              name: data.goal === 'weight_loss' ? 'Plancha' : 'Fondos en paralelas',
              sets: 3,
              reps: data.goal === 'weight_loss' ? null : 12,
              duration_seconds: data.goal === 'weight_loss' ? 60 : null,
              rest_seconds: 45,
              notes: 'Mantén la forma correcta'
            }
          ]
        },
        {
          day_of_week: 'Wednesday',
          focus_area: data.goal === 'weight_loss' ? 'Piernas y Glúteos' : 'Espalda y Bíceps',
          duration_minutes: data.duration_minutes || 60,
          exercises: [
            {
              name: data.goal === 'weight_loss' ? 'Sentadillas' : 'Dominadas',
              sets: 3,
              reps: 12,
              duration_seconds: null,
              rest_seconds: 60,
              notes: 'Mantén la forma correcta'
            },
            {
              name: data.goal === 'weight_loss' ? 'Estocadas' : 'Remo con barra',
              sets: 3,
              reps: 10,
              duration_seconds: null,
              rest_seconds: 60,
              notes: 'Mantén la espalda recta'
            }
          ]
        },
        {
          day_of_week: 'Friday',
          focus_area: data.goal === 'weight_loss' ? 'Cuerpo Completo' : 'Piernas y Hombros',
          duration_minutes: data.duration_minutes || 60,
          exercises: [
            {
              name: data.goal === 'weight_loss' ? 'Burpees' : 'Sentadillas con barra',
              sets: 3,
              reps: data.goal === 'weight_loss' ? 15 : 10,
              duration_seconds: null,
              rest_seconds: 60,
              notes: 'Mantén un ritmo constante'
            },
            {
              name: data.goal === 'weight_loss' ? 'Mountain climbers' : 'Press militar',
              sets: 3,
              reps: null,
              duration_seconds: data.goal === 'weight_loss' ? 45 : null,
              rest_seconds: 45,
              notes: 'Mantén la forma correcta'
            }
          ]
        }
      ]
    };

    return {
      data: {
        message: 'Workout plan generated successfully',
        workout_plan: workoutPlan
      }
    };
  },
  generateNutritionPlan: async (data: any) => {
    await delay(1500);
    // Simulate AI-generated nutrition plan
    const nutritionPlan = {
      plan_name: `Plan de Nutrición para ${data.goal === 'weight_loss' ? 'Pérdida de Peso' : 'Ganancia Muscular'} Personalizado`,
      daily_calories: data.goal === 'weight_loss' ? 2000 : 2500,
      protein_grams: data.goal === 'weight_loss' ? 150 : 200,
      carbs_grams: data.goal === 'weight_loss' ? 200 : 250,
      fat_grams: data.goal === 'weight_loss' ? 67 : 83,
      is_ai_generated: true,
      meals: [
        {
          meal_name: 'Desayuno',
          description: data.goal === 'weight_loss'
            ? 'Tostadas de pan integral con aguacate y huevos revueltos'
            : 'Batido de proteínas con plátano, avena y mantequilla de maní',
          calories: data.goal === 'weight_loss' ? 450 : 600,
          protein_grams: data.goal === 'weight_loss' ? 25 : 40,
          carbs_grams: data.goal === 'weight_loss' ? 40 : 60,
          fat_grams: data.goal === 'weight_loss' ? 20 : 20
        },
        {
          meal_name: 'Almuerzo',
          description: data.goal === 'weight_loss'
            ? 'Ensalada de pollo con verduras y quinoa'
            : 'Pechuga de pollo con arroz integral y brócoli',
          calories: data.goal === 'weight_loss' ? 650 : 700,
          protein_grams: data.goal === 'weight_loss' ? 45 : 50,
          carbs_grams: data.goal === 'weight_loss' ? 60 : 70,
          fat_grams: data.goal === 'weight_loss' ? 20 : 15
        },
        {
          meal_name: 'Cena',
          description: data.goal === 'weight_loss'
            ? 'Salmón al horno con espárragos y batata'
            : 'Filete de ternera con patatas y ensalada',
          calories: data.goal === 'weight_loss' ? 550 : 750,
          protein_grams: data.goal === 'weight_loss' ? 40 : 60,
          carbs_grams: data.goal === 'weight_loss' ? 45 : 60,
          fat_grams: data.goal === 'weight_loss' ? 20 : 30
        },
        {
          meal_name: 'Snack',
          description: data.goal === 'weight_loss'
            ? 'Yogur griego con frutas y nueces'
            : 'Batido de proteínas con avena y plátano',
          calories: data.goal === 'weight_loss' ? 350 : 450,
          protein_grams: data.goal === 'weight_loss' ? 20 : 30,
          carbs_grams: data.goal === 'weight_loss' ? 30 : 50,
          fat_grams: data.goal === 'weight_loss' ? 15 : 10
        }
      ]
    };

    return {
      data: {
        message: 'Nutrition plan generated successfully',
        nutrition_plan: nutritionPlan
      }
    };
  },
  getAdvice: async (query: string) => {
    await delay(1000);
    // Simulate AI-generated response based on user query
    let message = '';
    let action = null;

    // Process different types of queries
    if (query.toLowerCase().includes('rutina') || query.toLowerCase().includes('entrenamiento')) {
      message = 'He creado una nueva rutina de entrenamiento para ti. Puedes verla en la sección de RUTINAS. La rutina incluye 4 días de entrenamiento por semana, enfocados en diferentes grupos musculares. ¿Necesitas que ajuste algo específico?';
      action = {
        type: 'CREATED_WORKOUT_PLAN',
        planId: 1
      };
    }
    else if (query.toLowerCase().includes('dieta') || query.toLowerCase().includes('nutrición') || query.toLowerCase().includes('comida')) {
      message = 'He actualizado tu plan de nutrición basado en tus objetivos actuales. Puedes ver los detalles en la sección de NUTRICIÓN. El plan incluye 4 comidas diarias con un total de 2200 calorías. ¿Te gustaría hacer algún ajuste?';
      action = {
        type: 'CREATED_NUTRITION_PLAN',
        planId: 1
      };
    }
    else if (query.toLowerCase().includes('peso') || query.toLowerCase().includes('registra')) {
      message = 'He registrado tu nuevo peso de 75 kg en tu historial de progreso. Puedes ver la evolución de tu peso en la sección de PROGRESO. ¡Felicidades! Has perdido 2 kg desde tu último registro.';
      action = {
        type: 'LOGGED_PROGRESS',
        progressId: 1
      };
    }
    else if (query.toLowerCase().includes('ejercicio') || query.toLowerCase().includes('cómo hacer')) {
      message = 'He añadido información detallada sobre ese ejercicio en la sección de EJERCICIOS. Recuerda mantener la técnica correcta: espalda recta, respiración controlada y movimientos completos. ¿Necesitas más detalles sobre la ejecución?';
      action = {
        type: 'PROVIDED_EXERCISE_INFO',
        exerciseName: 'sentadilla'
      };
    }
    else if (query.toLowerCase().includes('consejo') || query.toLowerCase().includes('recomendación')) {
      message = 'Mi recomendación es que aumentes gradualmente la intensidad de tus entrenamientos. Podrías añadir una serie adicional a tus ejercicios principales o incrementar ligeramente el peso. Recuerda que el progreso sostenible es mejor que los cambios drásticos.';
      action = {
        type: 'PROVIDED_GENERAL_ADVICE'
      };
    }
    else {
      message = 'Entiendo tu consulta. Para ayudarte mejor, ¿podrías especificar si está relacionada con tu entrenamiento, nutrición o seguimiento de progreso? Así podré darte información más precisa y útil para tus objetivos.';
    }

    return {
      data: {
        message,
        action
      }
    };
  },
  sendChatMessage: async (message: string) => {
    // Reuse the same logic as getAdvice for mock implementation
    return await aiService.getAdvice(message);
  }
};

// Progress services
export const progressService = {
  getProgress: async () => {
    await delay(300);
    return {
      data: {
        progress: mockProgress
      }
    };
  },
  logProgress: async (progressData: any) => {
    await delay(500);
    const newProgress = {
      progress_id: mockProgress.length + 1,
      user_id: mockUser.user_id,
      ...progressData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Progress logged successfully',
        progress: newProgress
      }
    };
  },
  updateProgress: async (progressId: number, progressData: any) => {
    await delay(500);
    return {
      data: {
        message: 'Progress updated successfully',
        progress: {
          ...mockProgress.find(p => p.progress_id === progressId),
          ...progressData,
          updated_at: new Date().toISOString()
        }
      }
    };
  },
  deleteProgress: async (progressId: number) => {
    await delay(500);
    return {
      data: {
        message: 'Progress deleted successfully'
      }
    };
  }
};

// Exercise services
export const exerciseService = {
  getExercises: async (filters?: any) => {
    await delay(300);
    let exercises = [...mockExercises];

    // Apply filters if provided
    if (filters) {
      if (filters.muscle_group) {
        exercises = exercises.filter(ex => ex.muscle_group === filters.muscle_group);
      }
      if (filters.difficulty) {
        exercises = exercises.filter(ex => ex.difficulty === filters.difficulty);
      }
    }

    return {
      data: {
        exercises
      }
    };
  },
  getExercise: async (exerciseId: number) => {
    await delay(300);
    const exercise = mockExercises.find(ex => ex.exercise_id === exerciseId);
    return {
      data: {
        exercise
      }
    };
  },
  suggestExercise: async (exerciseData: any) => {
    await delay(500);
    const newExercise = {
      exercise_id: mockExercises.length + 1,
      ...exerciseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Exercise suggested successfully',
        exercise: newExercise
      }
    };
  },
  createExercise: async (exerciseData: any) => {
    await delay(500);
    const newExercise = {
      exercise_id: mockExercises.length + 1,
      ...exerciseData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    return {
      data: {
        message: 'Exercise created successfully',
        exercise: newExercise
      }
    };
  },
  updateExercise: async (exerciseId: number, exerciseData: any) => {
    await delay(500);
    return {
      data: {
        message: 'Exercise updated successfully',
        exercise: {
          ...mockExercises.find(ex => ex.exercise_id === exerciseId),
          ...exerciseData,
          updated_at: new Date().toISOString()
        }
      }
    };
  },
  deleteExercise: async (exerciseId: number) => {
    await delay(500);
    return {
      data: {
        message: 'Exercise deleted successfully'
      }
    };
  }
};

export default {
  authService,
  userService,
  workoutService,
  nutritionService,
  progressService,
  exerciseService,
  aiService
};

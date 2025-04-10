/**
 * Servicio para cargar y utilizar datos JSON locales
 * Este servicio se utiliza como fallback cuando no hay conexión con el backend
 */

import logger from '../utils/logger';

// Datos de ejemplo (en lugar de importar archivos JSON)
const workoutPlansData = {
  "workout_plans": [
    {
      "plan_id": 1,
      "user_id": 1,
      "plan_name": "Plan de Pérdida de Peso",
      "description": "Un plan de entrenamiento diseñado para ayudarte a perder peso de manera saludable.",
      "is_ai_generated": true,
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z",
      "sessions": [
        {
          "session_id": 1,
          "plan_id": 1,
          "day_of_week": "Monday",
          "focus_area": "Cardio y Core",
          "duration_minutes": 45,
          "scheduled_time": "18:00",
          "created_at": "2025-04-01T10:00:00Z",
          "updated_at": "2025-04-01T10:00:00Z",
          "exercises": [
            {
              "workout_exercise_id": 1,
              "session_id": 1,
              "exercise_id": 1,
              "sets": 1,
              "reps": null,
              "duration_seconds": 1200,
              "rest_seconds": 60,
              "notes": "Mantener ritmo moderado"
            },
            {
              "workout_exercise_id": 2,
              "session_id": 1,
              "exercise_id": 2,
              "sets": 3,
              "reps": null,
              "duration_seconds": 60,
              "rest_seconds": 30,
              "notes": "Mantener posición correcta"
            }
          ],
          "completion_tracking": [
            {
              "date": "2025-04-01",
              "completed": true,
              "completion_time": "18:45",
              "notes": "Completado según lo planeado"
            }
          ]
        },
        {
          "session_id": 2,
          "plan_id": 1,
          "day_of_week": "Wednesday",
          "focus_area": "Fuerza - Tren Inferior",
          "duration_minutes": 50,
          "scheduled_time": "18:00",
          "created_at": "2025-04-01T10:00:00Z",
          "updated_at": "2025-04-01T10:00:00Z",
          "exercises": [
            {
              "workout_exercise_id": 3,
              "session_id": 2,
              "exercise_id": 4,
              "sets": 3,
              "reps": 15,
              "duration_seconds": null,
              "rest_seconds": 60,
              "notes": "Mantener buena forma"
            }
          ],
          "completion_tracking": []
        }
      ]
    }
  ]
};

const nutritionPlansData = {
  "nutrition_plans": [
    {
      "nutrition_plan_id": 1,
      "user_id": 1,
      "plan_name": "Plan de Nutrición para Pérdida de Peso",
      "description": "Plan nutricional equilibrado para apoyar la pérdida de peso saludable",
      "daily_calories": 2000,
      "protein_grams": 150,
      "carbs_grams": 200,
      "fat_grams": 67,
      "is_ai_generated": true,
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z",
      "meals": [
        {
          "meal_id": 1,
          "nutrition_plan_id": 1,
          "meal_name": "Desayuno",
          "scheduled_time": "07:30",
          "description": "Tostadas de pan integral con aguacate y huevos revueltos",
          "calories": 450,
          "protein_grams": 25,
          "carbs_grams": 40,
          "fat_grams": 20,
          "created_at": "2025-04-01T10:00:00Z",
          "updated_at": "2025-04-01T10:00:00Z",
          "foods": [
            {
              "food_id": 1,
              "meal_id": 1,
              "food_name": "Pan integral",
              "portion": "2 rebanadas",
              "calories": 160,
              "protein_grams": 8,
              "carbs_grams": 30,
              "fat_grams": 2
            },
            {
              "food_id": 2,
              "meal_id": 1,
              "food_name": "Aguacate",
              "portion": "1/2 unidad",
              "calories": 120,
              "protein_grams": 2,
              "carbs_grams": 6,
              "fat_grams": 10
            }
          ],
          "completion_tracking": []
        }
      ]
    }
  ]
};

const exercisesData = {
  "exercises": [
    {
      "exercise_id": 1,
      "name": "Carrera en cinta",
      "description": "Correr a ritmo moderado en cinta.",
      "muscle_group": "Cardio",
      "equipment_needed": "Cinta de correr",
      "difficulty_level": "intermediate",
      "calories_per_minute": 10,
      "video_url": "https://example.com/videos/treadmill-run",
      "image_url": "https://example.com/images/treadmill-run.jpg",
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z"
    },
    {
      "exercise_id": 2,
      "name": "Plancha",
      "description": "Mantén la posición de plancha con el cuerpo recto.",
      "muscle_group": "Core",
      "equipment_needed": "Ninguno",
      "difficulty_level": "intermediate",
      "calories_per_minute": 5,
      "video_url": "https://example.com/videos/plank",
      "image_url": "https://example.com/images/plank.jpg",
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z"
    }
  ]
};

const progressData = {
  "progress": [
    {
      "progress_id": 1,
      "user_id": 1,
      "tracking_date": "2025-04-01",
      "weight": 75,
      "body_fat_percentage": 18,
      "measurements": {
        "chest": 95,
        "waist": 85,
        "hips": 98,
        "biceps": 32,
        "thighs": 55
      },
      "notes": "Punto de partida",
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z"
    },
    {
      "progress_id": 2,
      "user_id": 1,
      "tracking_date": "2025-04-08",
      "weight": 74.2,
      "body_fat_percentage": 17.5,
      "measurements": {
        "chest": 95,
        "waist": 84,
        "hips": 97.5,
        "biceps": 32.5,
        "thighs": 55
      },
      "notes": "Buen progreso esta semana",
      "created_at": "2025-04-08T10:00:00Z",
      "updated_at": "2025-04-08T10:00:00Z"
    }
  ],
  "workout_logs": [],
  "nutrition_logs": []
};

const usersData = {
  "users": [
    {
      "user_id": 1,
      "email": "usuario@ejemplo.com",
      "first_name": "Juan",
      "last_name": "Pérez",
      "created_at": "2025-04-01T10:00:00Z",
      "updated_at": "2025-04-01T10:00:00Z",
      "profile": {
        "profile_id": 1,
        "user_id": 1,
        "age": 30,
        "gender": "male",
        "height": 175,
        "weight": 75,
        "activity_level": "moderate",
        "fitness_level": "intermediate",
        "fitness_goals": ["weight_loss", "muscle_tone"],
        "health_conditions": [],
        "dietary_restrictions": [],
        "preferred_workout_days": ["Monday", "Wednesday", "Friday"],
        "preferred_workout_times": ["18:00", "19:00"],
        "created_at": "2025-04-01T10:00:00Z",
        "updated_at": "2025-04-01T10:00:00Z"
      },
      "preferences": {
        "notifications_enabled": true,
        "email_notifications": true,
        "push_notifications": true,
        "workout_reminders": true,
        "nutrition_reminders": true,
        "dark_mode": false,
        "language": "es",
        "units": "metric",
        "created_at": "2025-04-01T10:00:00Z",
        "updated_at": "2025-04-01T10:00:00Z"
      },
      "goals": []
    }
  ]
};

// Interfaces para los datos
interface WorkoutPlan {
  plan_id: number;
  user_id: number;
  plan_name: string;
  description: string;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  sessions: WorkoutSession[];
}

interface WorkoutSession {
  session_id: number;
  plan_id: number;
  day_of_week: string;
  focus_area: string;
  duration_minutes: number;
  scheduled_time: string;
  created_at: string;
  updated_at: string;
  exercises: WorkoutExercise[];
  completion_tracking: CompletionRecord[];
}

interface WorkoutExercise {
  workout_exercise_id: number;
  session_id: number;
  exercise_id: number;
  sets: number;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
  notes: string;
}

interface CompletionRecord {
  date: string;
  completed: boolean;
  completion_time: string | null;
  notes: string;
}

interface NutritionPlan {
  nutrition_plan_id: number;
  user_id: number;
  plan_name: string;
  description: string;
  daily_calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
  meals: Meal[];
}

interface Meal {
  meal_id: number;
  nutrition_plan_id: number;
  meal_name: string;
  scheduled_time: string;
  description: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  created_at: string;
  updated_at: string;
  foods: Food[];
  completion_tracking: CompletionRecord[];
}

interface Food {
  food_id: number;
  meal_id: number;
  food_name: string;
  portion: string;
  calories: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
}

interface Exercise {
  exercise_id: number;
  name: string;
  description: string;
  muscle_group: string;
  equipment_needed: string;
  difficulty_level: string;
  calories_per_minute: number;
  video_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface Progress {
  progress_id: number;
  user_id: number;
  tracking_date: string;
  weight: number;
  body_fat_percentage: number;
  measurements: {
    chest: number;
    waist: number;
    hips: number;
    biceps: number;
    thighs: number;
  };
  notes: string;
  created_at: string;
  updated_at: string;
}

interface WorkoutLog {
  log_id: number;
  user_id: number;
  workout_date: string;
  plan_id: number;
  session_id: number;
  duration_minutes: number;
  calories_burned: number;
  rating: number;
  perceived_effort: number;
  mood_before: string;
  mood_after: string;
  notes: string;
  exercises_completed: any[];
  created_at: string;
  updated_at: string;
}

interface NutritionLog {
  log_id: number;
  user_id: number;
  tracking_date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  water_intake: number;
  adherence_rating: number;
  notes: string;
  meals_logged: any[];
  created_at: string;
  updated_at: string;
}

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
  profile: any;
  preferences: any;
  goals: any[];
}

// Servicio para acceder a los datos JSON
const jsonDataService = {
  // Función para cargar datos JSON desde archivos
  loadJsonFile: async (filename: string): Promise<any> => {
    try {
      const response = await fetch(`/${filename}.json`);
      if (!response.ok) {
        throw new Error(`Error loading ${filename}.json: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error loading ${filename}.json:`, error);
      return null;
    }
  },
  // Planes de entrenamiento
  getWorkoutPlans: async (): Promise<WorkoutPlan[]> => {
    logger.info('Getting workout plans from JSON data');
    try {
      const data = await jsonDataService.loadJsonFile('workout_plans');
      console.log('Workout plans data loaded from file:', data);
      return data?.workout_plans || [];
    } catch (error) {
      console.error('Error getting workout plans:', error);
      return workoutPlansData.workout_plans || [];
    }
  },

  getWorkoutPlanById: async (planId: number): Promise<WorkoutPlan | undefined> => {
    logger.info('Getting workout plan by ID from JSON data', { planId });
    try {
      const data = await jsonDataService.loadJsonFile('workout_plans');
      return data?.workout_plans?.find((plan: WorkoutPlan) => plan.plan_id === planId);
    } catch (error) {
      console.error('Error getting workout plan by ID:', error);
      return workoutPlansData.workout_plans?.find(plan => plan.plan_id === planId);
    }
  },

  // Planes de nutrición
  getNutritionPlans: async (): Promise<NutritionPlan[]> => {
    logger.info('Getting nutrition plans from JSON data');
    try {
      const data = await jsonDataService.loadJsonFile('nutrition_plans');
      console.log('Nutrition plans data loaded from file:', data);
      return data?.nutrition_plans || [];
    } catch (error) {
      console.error('Error getting nutrition plans:', error);
      return nutritionPlansData.nutrition_plans || [];
    }
  },

  getNutritionPlanById: (planId: number): NutritionPlan | undefined => {
    logger.info('Getting nutrition plan by ID from JSON data', { planId });
    return nutritionPlansData.nutrition_plans?.find(plan => plan.nutrition_plan_id === planId);
  },

  // Ejercicios
  getExercises: async (): Promise<Exercise[]> => {
    logger.info('Getting exercises from JSON data');
    try {
      const data = await jsonDataService.loadJsonFile('exercises');
      console.log('Exercises data loaded from file:', data);
      return data?.exercises || [];
    } catch (error) {
      console.error('Error getting exercises:', error);
      return exercisesData.exercises || [];
    }
  },

  getExerciseById: (exerciseId: number): Exercise | undefined => {
    logger.info('Getting exercise by ID from JSON data', { exerciseId });
    return exercisesData.exercises?.find(exercise => exercise.exercise_id === exerciseId);
  },

  getExercisesByMuscleGroup: (muscleGroup: string): Exercise[] => {
    logger.info('Getting exercises by muscle group from JSON data', { muscleGroup });
    return exercisesData.exercises?.filter(exercise => exercise.muscle_group === muscleGroup) || [];
  },

  // Progreso
  getProgress: async (): Promise<Progress[]> => {
    logger.info('Getting progress data from JSON data');
    try {
      const data = await jsonDataService.loadJsonFile('progress');
      console.log('Progress data loaded from file:', data);
      return data?.progress || [];
    } catch (error) {
      console.error('Error getting progress data:', error);
      return progressData.progress || [];
    }
  },

  getWorkoutLogs: (): WorkoutLog[] => {
    logger.info('Getting workout logs from JSON data');
    return progressData.workout_logs || [];
  },

  getNutritionLogs: (): NutritionLog[] => {
    logger.info('Getting nutrition logs from JSON data');
    return progressData.nutrition_logs || [];
  },

  // Usuarios
  getUsers: (): User[] => {
    logger.info('Getting users from JSON data');
    return usersData.users || [];
  },

  getUserById: (userId: number): User | undefined => {
    logger.info('Getting user by ID from JSON data', { userId });
    return usersData.users?.find(user => user.user_id === userId);
  },

  // Simulación de respuestas de IA
  simulateAIResponse: (message: string): { message: string, data?: any, action?: any } => {
    logger.info('Simulating AI response for message', { messageLength: message.length });

    // Palabras clave para detectar intenciones
    const keywords = {
      workout: ['entrenamiento', 'ejercicio', 'rutina', 'plan', 'workout'],
      nutrition: ['nutrición', 'comida', 'dieta', 'alimentación', 'comer', 'nutrition'],
      progress: ['progreso', 'peso', 'medidas', 'avance', 'progress'],
      exercise: ['ejercicio', 'músculo', 'técnica', 'series', 'repeticiones', 'exercise']
    };

    // Detectar intención basada en palabras clave
    let intent = 'general';
    let confidence = 0;

    for (const [key, words] of Object.entries(keywords)) {
      const matches = words.filter(word => message.toLowerCase().includes(word.toLowerCase())).length;
      if (matches > confidence) {
        confidence = matches;
        intent = key;
      }
    }

    // Generar respuesta basada en la intención
    switch (intent) {
      case 'workout':
        // Mostrar información sobre planes de entrenamiento
        const workoutPlans = workoutPlansData.workout_plans;
        const randomPlan = workoutPlans[Math.floor(Math.random() * workoutPlans.length)];

        return {
          message: `Tengo un plan de entrenamiento que podría interesarte: "${randomPlan.plan_name}". Este plan está diseñado para ${randomPlan.description.toLowerCase()} y consta de ${randomPlan.sessions.length} sesiones semanales. ¿Te gustaría ver más detalles?`,
          data: {
            type: 'workout_plan',
            plan_id: randomPlan.plan_id,
            plan_name: randomPlan.plan_name,
            description: randomPlan.description,
            sessions_count: randomPlan.sessions.length
          },
          action: {
            type: 'SHOW_WORKOUT_PLAN',
            planId: randomPlan.plan_id
          }
        };

      case 'nutrition':
        // Mostrar información sobre planes de nutrición
        const nutritionPlans = nutritionPlansData.nutrition_plans;
        const randomNutritionPlan = nutritionPlans[Math.floor(Math.random() * nutritionPlans.length)];

        return {
          message: `Tengo un plan de nutrición que podría ayudarte: "${randomNutritionPlan.plan_name}". Este plan proporciona aproximadamente ${randomNutritionPlan.daily_calories} calorías diarias, con ${randomNutritionPlan.protein_grams}g de proteína, ${randomNutritionPlan.carbs_grams}g de carbohidratos y ${randomNutritionPlan.fat_grams}g de grasas. ¿Te gustaría ver más detalles?`,
          data: {
            type: 'nutrition_plan',
            plan_id: randomNutritionPlan.nutrition_plan_id,
            plan_name: randomNutritionPlan.plan_name,
            daily_calories: randomNutritionPlan.daily_calories,
            protein_grams: randomNutritionPlan.protein_grams,
            carbs_grams: randomNutritionPlan.carbs_grams,
            fat_grams: randomNutritionPlan.fat_grams
          },
          action: {
            type: 'SHOW_NUTRITION_PLAN',
            planId: randomNutritionPlan.nutrition_plan_id
          }
        };

      case 'progress':
        // Mostrar información sobre progreso
        const progressEntries = progressData.progress;

        if (progressEntries.length >= 2) {
          const latestEntry = progressEntries[progressEntries.length - 1];
          const previousEntry = progressEntries[progressEntries.length - 2];

          const weightDiff = latestEntry.weight - previousEntry.weight;
          const weightDiffText = weightDiff < 0
            ? `Has perdido ${Math.abs(weightDiff).toFixed(1)}kg`
            : weightDiff > 0
              ? `Has ganado ${weightDiff.toFixed(1)}kg`
              : "Tu peso se ha mantenido estable";

          return {
            message: `Según tus datos de progreso, actualmente pesas ${latestEntry.weight}kg con un porcentaje de grasa corporal del ${latestEntry.body_fat_percentage}%. Comparado con tu medición anterior del ${previousEntry.tracking_date}, ${weightDiffText}. ¿Te gustaría ver más detalles sobre tu progreso?`,
            data: {
              type: 'progress_tracking',
              current_weight: latestEntry.weight,
              current_body_fat: latestEntry.body_fat_percentage,
              weight_change: weightDiff,
              tracking_date: latestEntry.tracking_date
            },
            action: {
              type: 'SHOW_PROGRESS',
              section: 'weight'
            }
          };
        } else {
          return {
            message: "No tengo suficientes datos de progreso para mostrarte una comparación. ¿Te gustaría registrar tus medidas actuales?",
            action: {
              type: 'SHOW_PROGRESS',
              section: 'new_entry'
            }
          };
        }

      case 'exercise':
        // Mostrar información sobre ejercicios
        const exercises = exercisesData.exercises;
        const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];

        return {
          message: `El ejercicio "${randomExercise.name}" es excelente para trabajar el grupo muscular ${randomExercise.muscle_group}. ${randomExercise.description} Este ejercicio tiene un nivel de dificultad ${randomExercise.difficulty_level} y quema aproximadamente ${randomExercise.calories_per_minute} calorías por minuto. ¿Te gustaría ver más ejercicios similares?`,
          data: {
            type: 'exercise_guidance',
            exercise_id: randomExercise.exercise_id,
            exercise_name: randomExercise.name,
            muscle_group: randomExercise.muscle_group,
            difficulty: randomExercise.difficulty_level
          },
          action: {
            type: 'SHOW_EXERCISE',
            exerciseId: randomExercise.exercise_id
          }
        };

      default:
        // Respuesta general
        const generalResponses = [
          "¿En qué puedo ayudarte hoy? Puedo darte información sobre planes de entrenamiento, nutrición, ejercicios específicos o tu progreso.",
          "Estoy aquí para ayudarte con tu fitness. ¿Te gustaría hablar sobre entrenamiento, nutrición o ver tu progreso?",
          "¿Qué aspecto de tu fitness te gustaría mejorar hoy? Puedo ayudarte con rutinas de ejercicio, planes de alimentación o seguimiento de tu progreso.",
          "¿Tienes alguna meta específica de fitness? Puedo ayudarte a crear un plan personalizado para alcanzarla.",
          "¿Necesitas motivación o consejos para tu entrenamiento de hoy? Estoy aquí para ayudarte."
        ];

        return {
          message: generalResponses[Math.floor(Math.random() * generalResponses.length)]
        };
    }
  }
};

export default jsonDataService;

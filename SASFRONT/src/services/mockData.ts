// Mock data for testing the frontend without a backend

// User data
export const mockUser = {
  user_id: 1,
  email: 'usuario@ejemplo.com',
  first_name: 'Juan',
  last_name: 'Pérez',
  username: 'juanperez',
  created_at: '2025-04-01T10:00:00Z'
};

// User profile data
export const mockProfile = {
  profile_id: 1,
  user_id: 1,
  age: 30,
  gender: 'male',
  height: 175,
  weight: 75,
  activity_level: 'moderate',
  fitness_level: 'intermediate',
  fitness_goals: ['weight_loss', 'muscle_tone'],
  health_conditions: ['none'],
  dietary_restrictions: ['none'],
  created_at: '2025-04-01T10:00:00Z',
  updated_at: '2025-04-01T10:00:00Z'
};

// Fitness goals data
export const mockGoals = [
  {
    goal_id: 1,
    user_id: 1,
    goal_type: 'weight_loss',
    target_value: 70,
    start_date: '2025-04-01',
    target_date: '2025-06-01',
    status: 'active',
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z'
  },
  {
    goal_id: 2,
    user_id: 1,
    goal_type: 'muscle_gain',
    target_value: 5,
    start_date: '2025-04-01',
    target_date: '2025-07-01',
    status: 'active',
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z'
  }
];

// Progress tracking data
export const mockProgress = [
  {
    progress_id: 1,
    user_id: 1,
    tracking_date: '2025-04-01',
    weight: 75,
    body_fat_percentage: 18,
    notes: 'Starting point',
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z'
  },
  {
    progress_id: 2,
    user_id: 1,
    tracking_date: '2025-04-08',
    weight: 74.2,
    body_fat_percentage: 17.5,
    notes: 'Good progress this week',
    created_at: '2025-04-08T10:00:00Z',
    updated_at: '2025-04-08T10:00:00Z'
  },
  {
    progress_id: 3,
    user_id: 1,
    tracking_date: '2025-04-15',
    weight: 73.5,
    body_fat_percentage: 17.2,
    notes: 'Consistent progress',
    created_at: '2025-04-15T10:00:00Z',
    updated_at: '2025-04-15T10:00:00Z'
  }
];

// Workout plans data
export const mockWorkoutPlans = [
  {
    plan_id: 1,
    user_id: 1,
    plan_name: 'Plan de Pérdida de Peso',
    description: 'Un plan de entrenamiento diseñado para ayudarte a perder peso de manera saludable.',
    is_ai_generated: true,
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z'
  },
  {
    plan_id: 2,
    user_id: 1,
    plan_name: 'Plan de Ganancia Muscular',
    description: 'Un plan de entrenamiento diseñado para ayudarte a ganar masa muscular.',
    is_ai_generated: true,
    created_at: '2025-04-02T10:00:00Z',
    updated_at: '2025-04-02T10:00:00Z'
  }
];

// Workout sessions data
export const mockWorkoutSessions = {
  1: [
    {
      session_id: 1,
      plan_id: 1,
      day_of_week: 'Monday',
      focus_area: 'Cardio y Core',
      duration_minutes: 45,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 1,
          session_id: 1,
          exercise_id: 1,
          name: 'Carrera en cinta',
          description: 'Correr a ritmo moderado en cinta.',
          muscle_group: 'Cardio',
          equipment_needed: 'Cinta de correr',
          difficulty_level: 'intermediate',
          sets: 1,
          reps: null,
          duration_seconds: 1200,
          rest_seconds: 60,
          notes: 'Mantén un ritmo constante'
        },
        {
          workout_exercise_id: 2,
          session_id: 1,
          exercise_id: 2,
          name: 'Plancha',
          description: 'Mantén la posición de plancha con el cuerpo recto.',
          muscle_group: 'Core',
          equipment_needed: 'Ninguno',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: null,
          duration_seconds: 60,
          rest_seconds: 30,
          notes: 'Mantén la espalda recta'
        },
        {
          workout_exercise_id: 3,
          session_id: 1,
          exercise_id: 3,
          name: 'Crunches',
          description: 'Abdominales clásicos.',
          muscle_group: 'Core',
          equipment_needed: 'Ninguno',
          difficulty_level: 'beginner',
          sets: 3,
          reps: 15,
          duration_seconds: null,
          rest_seconds: 30,
          notes: 'Contrae el abdomen'
        }
      ]
    },
    {
      session_id: 2,
      plan_id: 1,
      day_of_week: 'Wednesday',
      focus_area: 'Piernas y Glúteos',
      duration_minutes: 50,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 4,
          session_id: 2,
          exercise_id: 4,
          name: 'Sentadillas',
          description: 'Sentadillas con peso corporal.',
          muscle_group: 'Piernas',
          equipment_needed: 'Ninguno',
          difficulty_level: 'beginner',
          sets: 3,
          reps: 15,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén la espalda recta'
        },
        {
          workout_exercise_id: 5,
          session_id: 2,
          exercise_id: 5,
          name: 'Estocadas',
          description: 'Estocadas alternando piernas.',
          muscle_group: 'Piernas',
          equipment_needed: 'Ninguno',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: 12,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Alterna las piernas'
        },
        {
          workout_exercise_id: 6,
          session_id: 2,
          exercise_id: 6,
          name: 'Elevaciones de cadera',
          description: 'Elevaciones de cadera para glúteos.',
          muscle_group: 'Glúteos',
          equipment_needed: 'Ninguno',
          difficulty_level: 'beginner',
          sets: 3,
          reps: 15,
          duration_seconds: null,
          rest_seconds: 45,
          notes: 'Contrae los glúteos en la parte superior'
        }
      ]
    },
    {
      session_id: 3,
      plan_id: 1,
      day_of_week: 'Friday',
      focus_area: 'Cuerpo Completo',
      duration_minutes: 60,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 7,
          session_id: 3,
          exercise_id: 7,
          name: 'Burpees',
          description: 'Ejercicio de cuerpo completo.',
          muscle_group: 'Cuerpo completo',
          equipment_needed: 'Ninguno',
          difficulty_level: 'advanced',
          sets: 3,
          reps: 10,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén un ritmo constante'
        },
        {
          workout_exercise_id: 8,
          session_id: 3,
          exercise_id: 8,
          name: 'Mountain climbers',
          description: 'Ejercicio de cardio y core.',
          muscle_group: 'Core',
          equipment_needed: 'Ninguno',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: null,
          duration_seconds: 45,
          rest_seconds: 30,
          notes: 'Mantén un ritmo rápido'
        },
        {
          workout_exercise_id: 9,
          session_id: 3,
          exercise_id: 9,
          name: 'Jumping jacks',
          description: 'Ejercicio de cardio.',
          muscle_group: 'Cardio',
          equipment_needed: 'Ninguno',
          difficulty_level: 'beginner',
          sets: 3,
          reps: null,
          duration_seconds: 60,
          rest_seconds: 30,
          notes: 'Mantén un ritmo constante'
        }
      ]
    }
  ],
  2: [
    {
      session_id: 4,
      plan_id: 2,
      day_of_week: 'Monday',
      focus_area: 'Pecho y Tríceps',
      duration_minutes: 60,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 10,
          session_id: 4,
          exercise_id: 10,
          name: 'Press de banca',
          description: 'Ejercicio para pecho con barra.',
          muscle_group: 'Pecho',
          equipment_needed: 'Barra y banco',
          difficulty_level: 'intermediate',
          sets: 4,
          reps: 8,
          duration_seconds: null,
          rest_seconds: 90,
          notes: 'Mantén los codos a 45 grados'
        },
        {
          workout_exercise_id: 11,
          session_id: 4,
          exercise_id: 11,
          name: 'Fondos en paralelas',
          description: 'Ejercicio para tríceps.',
          muscle_group: 'Tríceps',
          equipment_needed: 'Barras paralelas',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: 10,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén los codos cerca del cuerpo'
        },
        {
          workout_exercise_id: 12,
          session_id: 4,
          exercise_id: 12,
          name: 'Aperturas con mancuernas',
          description: 'Ejercicio para pecho con mancuernas.',
          muscle_group: 'Pecho',
          equipment_needed: 'Mancuernas',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: 12,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén una ligera flexión en los codos'
        }
      ]
    },
    {
      session_id: 5,
      plan_id: 2,
      day_of_week: 'Wednesday',
      focus_area: 'Espalda y Bíceps',
      duration_minutes: 60,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 13,
          session_id: 5,
          exercise_id: 13,
          name: 'Dominadas',
          description: 'Ejercicio para espalda.',
          muscle_group: 'Espalda',
          equipment_needed: 'Barra de dominadas',
          difficulty_level: 'advanced',
          sets: 4,
          reps: 8,
          duration_seconds: null,
          rest_seconds: 90,
          notes: 'Agarre prono'
        },
        {
          workout_exercise_id: 14,
          session_id: 5,
          exercise_id: 14,
          name: 'Remo con barra',
          description: 'Ejercicio para espalda con barra.',
          muscle_group: 'Espalda',
          equipment_needed: 'Barra',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: 10,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén la espalda recta'
        },
        {
          workout_exercise_id: 15,
          session_id: 5,
          exercise_id: 15,
          name: 'Curl de bíceps',
          description: 'Ejercicio para bíceps con mancuernas.',
          muscle_group: 'Bíceps',
          equipment_needed: 'Mancuernas',
          difficulty_level: 'beginner',
          sets: 3,
          reps: 12,
          duration_seconds: null,
          rest_seconds: 60,
          notes: 'Mantén los codos fijos'
        }
      ]
    },
    {
      session_id: 6,
      plan_id: 2,
      day_of_week: 'Friday',
      focus_area: 'Piernas y Hombros',
      duration_minutes: 70,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z',
      exercises: [
        {
          workout_exercise_id: 16,
          session_id: 6,
          exercise_id: 16,
          name: 'Sentadillas con barra',
          description: 'Ejercicio para piernas con barra.',
          muscle_group: 'Piernas',
          equipment_needed: 'Barra',
          difficulty_level: 'intermediate',
          sets: 4,
          reps: 8,
          duration_seconds: null,
          rest_seconds: 120,
          notes: 'Mantén la espalda recta'
        },
        {
          workout_exercise_id: 17,
          session_id: 6,
          exercise_id: 17,
          name: 'Peso muerto',
          description: 'Ejercicio para espalda baja y piernas.',
          muscle_group: 'Espalda baja',
          equipment_needed: 'Barra',
          difficulty_level: 'advanced',
          sets: 4,
          reps: 6,
          duration_seconds: null,
          rest_seconds: 120,
          notes: 'Mantén la espalda recta'
        },
        {
          workout_exercise_id: 18,
          session_id: 6,
          exercise_id: 18,
          name: 'Press militar',
          description: 'Ejercicio para hombros con barra.',
          muscle_group: 'Hombros',
          equipment_needed: 'Barra',
          difficulty_level: 'intermediate',
          sets: 3,
          reps: 10,
          duration_seconds: null,
          rest_seconds: 90,
          notes: 'Mantén el core estable'
        }
      ]
    }
  ]
};

// Workout logs data
export const mockWorkoutLogs = [
  {
    log_id: 1,
    user_id: 1,
    workout_date: '2025-04-01',
    plan_id: 1,
    session_id: 1,
    duration_minutes: 45,
    calories_burned: 350,
    rating: 4,
    notes: 'Buen entrenamiento, me sentí con energía',
    created_at: '2025-04-01T11:00:00Z',
    updated_at: '2025-04-01T11:00:00Z'
  },
  {
    log_id: 2,
    user_id: 1,
    workout_date: '2025-04-03',
    plan_id: 1,
    session_id: 2,
    duration_minutes: 50,
    calories_burned: 400,
    rating: 5,
    notes: 'Excelente entrenamiento, me sentí muy fuerte',
    created_at: '2025-04-03T11:00:00Z',
    updated_at: '2025-04-03T11:00:00Z'
  },
  {
    log_id: 3,
    user_id: 1,
    workout_date: '2025-04-05',
    plan_id: 1,
    session_id: 3,
    duration_minutes: 60,
    calories_burned: 500,
    rating: 3,
    notes: 'Entrenamiento difícil, me sentí cansado',
    created_at: '2025-04-05T11:00:00Z',
    updated_at: '2025-04-05T11:00:00Z'
  }
];

// Nutrition plans data
export const mockNutritionPlans = [
  {
    nutrition_plan_id: 1,
    user_id: 1,
    plan_name: 'Plan de Nutrición para Pérdida de Peso',
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 200,
    fat_grams: 67,
    is_ai_generated: true,
    created_at: '2025-04-01T10:00:00Z',
    updated_at: '2025-04-01T10:00:00Z'
  },
  {
    nutrition_plan_id: 2,
    user_id: 1,
    plan_name: 'Plan de Nutrición para Ganancia Muscular',
    daily_calories: 2500,
    protein_grams: 200,
    carbs_grams: 250,
    fat_grams: 83,
    is_ai_generated: true,
    created_at: '2025-04-02T10:00:00Z',
    updated_at: '2025-04-02T10:00:00Z'
  }
];

// Meals data
export const mockMeals = {
  1: [
    {
      meal_id: 1,
      nutrition_plan_id: 1,
      meal_name: 'Desayuno',
      description: 'Tostadas de pan integral con aguacate y huevos revueltos',
      calories: 450,
      protein_grams: 25,
      carbs_grams: 40,
      fat_grams: 20,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z'
    },
    {
      meal_id: 2,
      nutrition_plan_id: 1,
      meal_name: 'Almuerzo',
      description: 'Ensalada de pollo con verduras y quinoa',
      calories: 650,
      protein_grams: 45,
      carbs_grams: 60,
      fat_grams: 20,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z'
    },
    {
      meal_id: 3,
      nutrition_plan_id: 1,
      meal_name: 'Cena',
      description: 'Salmón al horno con espárragos y batata',
      calories: 550,
      protein_grams: 40,
      carbs_grams: 45,
      fat_grams: 20,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z'
    },
    {
      meal_id: 4,
      nutrition_plan_id: 1,
      meal_name: 'Snack',
      description: 'Yogur griego con frutas y nueces',
      calories: 350,
      protein_grams: 20,
      carbs_grams: 30,
      fat_grams: 15,
      created_at: '2025-04-01T10:00:00Z',
      updated_at: '2025-04-01T10:00:00Z'
    }
  ],
  2: [
    {
      meal_id: 5,
      nutrition_plan_id: 2,
      meal_name: 'Desayuno',
      description: 'Batido de proteínas con plátano, avena y mantequilla de maní',
      calories: 600,
      protein_grams: 40,
      carbs_grams: 60,
      fat_grams: 20,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z'
    },
    {
      meal_id: 6,
      nutrition_plan_id: 2,
      meal_name: 'Almuerzo',
      description: 'Pechuga de pollo con arroz integral y brócoli',
      calories: 700,
      protein_grams: 50,
      carbs_grams: 70,
      fat_grams: 15,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z'
    },
    {
      meal_id: 7,
      nutrition_plan_id: 2,
      meal_name: 'Cena',
      description: 'Filete de ternera con patatas y ensalada',
      calories: 750,
      protein_grams: 60,
      carbs_grams: 60,
      fat_grams: 30,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z'
    },
    {
      meal_id: 8,
      nutrition_plan_id: 2,
      meal_name: 'Snack',
      description: 'Batido de proteínas con avena y plátano',
      calories: 450,
      protein_grams: 30,
      carbs_grams: 50,
      fat_grams: 10,
      created_at: '2025-04-02T10:00:00Z',
      updated_at: '2025-04-02T10:00:00Z'
    }
  ]
};

// Exercises data
export const mockExercises = [
  {
    exercise_id: 1,
    name: 'Carrera en cinta',
    description: 'Correr a ritmo moderado en cinta.',
    muscle_group: 'Cardio',
    equipment_needed: 'Cinta de correr',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 2,
    name: 'Plancha',
    description: 'Mantén la posición de plancha con el cuerpo recto.',
    muscle_group: 'Core',
    equipment_needed: 'Ninguno',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 3,
    name: 'Crunches',
    description: 'Abdominales clásicos.',
    muscle_group: 'Core',
    equipment_needed: 'Ninguno',
    difficulty_level: 'beginner'
  },
  {
    exercise_id: 4,
    name: 'Sentadillas',
    description: 'Sentadillas con peso corporal.',
    muscle_group: 'Piernas',
    equipment_needed: 'Ninguno',
    difficulty_level: 'beginner'
  },
  {
    exercise_id: 5,
    name: 'Estocadas',
    description: 'Estocadas alternando piernas.',
    muscle_group: 'Piernas',
    equipment_needed: 'Ninguno',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 6,
    name: 'Elevaciones de cadera',
    description: 'Elevaciones de cadera para glúteos.',
    muscle_group: 'Glúteos',
    equipment_needed: 'Ninguno',
    difficulty_level: 'beginner'
  },
  {
    exercise_id: 7,
    name: 'Burpees',
    description: 'Ejercicio de cuerpo completo.',
    muscle_group: 'Cuerpo completo',
    equipment_needed: 'Ninguno',
    difficulty_level: 'advanced'
  },
  {
    exercise_id: 8,
    name: 'Mountain climbers',
    description: 'Ejercicio de cardio y core.',
    muscle_group: 'Core',
    equipment_needed: 'Ninguno',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 9,
    name: 'Jumping jacks',
    description: 'Ejercicio de cardio.',
    muscle_group: 'Cardio',
    equipment_needed: 'Ninguno',
    difficulty_level: 'beginner'
  },
  {
    exercise_id: 10,
    name: 'Press de banca',
    description: 'Ejercicio para pecho con barra.',
    muscle_group: 'Pecho',
    equipment_needed: 'Barra y banco',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 11,
    name: 'Fondos en paralelas',
    description: 'Ejercicio para tríceps.',
    muscle_group: 'Tríceps',
    equipment_needed: 'Barras paralelas',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 12,
    name: 'Aperturas con mancuernas',
    description: 'Ejercicio para pecho con mancuernas.',
    muscle_group: 'Pecho',
    equipment_needed: 'Mancuernas',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 13,
    name: 'Dominadas',
    description: 'Ejercicio para espalda.',
    muscle_group: 'Espalda',
    equipment_needed: 'Barra de dominadas',
    difficulty_level: 'advanced'
  },
  {
    exercise_id: 14,
    name: 'Remo con barra',
    description: 'Ejercicio para espalda con barra.',
    muscle_group: 'Espalda',
    equipment_needed: 'Barra',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 15,
    name: 'Curl de bíceps',
    description: 'Ejercicio para bíceps con mancuernas.',
    muscle_group: 'Bíceps',
    equipment_needed: 'Mancuernas',
    difficulty_level: 'beginner'
  },
  {
    exercise_id: 16,
    name: 'Sentadillas con barra',
    description: 'Ejercicio para piernas con barra.',
    muscle_group: 'Piernas',
    equipment_needed: 'Barra',
    difficulty_level: 'intermediate'
  },
  {
    exercise_id: 17,
    name: 'Peso muerto',
    description: 'Ejercicio para espalda baja y piernas.',
    muscle_group: 'Espalda baja',
    equipment_needed: 'Barra',
    difficulty_level: 'advanced'
  },
  {
    exercise_id: 18,
    name: 'Press militar',
    description: 'Ejercicio para hombros con barra.',
    muscle_group: 'Hombros',
    equipment_needed: 'Barra',
    difficulty_level: 'intermediate'
  }
];

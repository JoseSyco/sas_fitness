-- Esquema de base de datos para Supabase optimizado para SAS Fitness
-- Este esquema está diseñado para funcionar con el frontend y el agente RAG

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender TEXT,
    height DECIMAL(5,2), -- en cm
    weight DECIMAL(5,2), -- en kg
    activity_level TEXT, -- sedentary, light, moderate, active, very active
    fitness_level TEXT, -- beginner, intermediate, advanced
    fitness_goals JSONB, -- Array de objetivos: ["weight_loss", "muscle_tone", etc.]
    health_conditions JSONB, -- Array de condiciones: ["diabetes", "hypertension", etc.]
    dietary_restrictions JSONB, -- Array de restricciones: ["vegetarian", "gluten_free", etc.]
    preferred_workout_days JSONB, -- Array de días: ["Monday", "Wednesday", "Friday"]
    preferred_workout_times JSONB, -- Array de horas: ["18:00", "19:00"]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    workout_reminders BOOLEAN DEFAULT TRUE,
    nutrition_reminders BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'es',
    units TEXT DEFAULT 'metric', -- metric, imperial
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de objetivos de fitness
CREATE TABLE IF NOT EXISTS fitness_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- weight_loss, muscle_gain, endurance, etc.
    target_value DECIMAL(5,2), -- target weight, etc.
    start_date DATE NOT NULL,
    target_date DATE,
    status TEXT DEFAULT 'active', -- active, completed, abandoned
    progress INTEGER DEFAULT 0, -- porcentaje de progreso (0-100)
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de planes de entrenamiento
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    description TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones de entrenamiento
CREATE TABLE IF NOT EXISTS workout_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_of_week TEXT NOT NULL, -- Monday, Tuesday, etc.
    focus_area TEXT NOT NULL, -- Chest, Back, Legs, etc.
    duration_minutes INTEGER NOT NULL,
    scheduled_time TIME, -- Hora programada para la sesión
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    muscle_group TEXT NOT NULL,
    equipment_needed TEXT,
    difficulty_level TEXT, -- beginner, intermediate, advanced
    calories_per_minute INTEGER, -- Calorías quemadas por minuto (estimado)
    video_url TEXT, -- URL a video demostrativo
    image_url TEXT, -- URL a imagen del ejercicio
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de ejercicios de entrenamiento (junction table)
CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    sets INTEGER NOT NULL,
    reps INTEGER,
    duration_seconds INTEGER,
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de seguimiento de cumplimiento de sesiones
CREATE TABLE IF NOT EXISTS session_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES workout_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_time TIME, -- Hora en que se completó
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de planes de nutrición
CREATE TABLE IF NOT EXISTS nutrition_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_name TEXT NOT NULL,
    description TEXT,
    daily_calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de comidas
CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nutrition_plan_id UUID REFERENCES nutrition_plans(id) ON DELETE CASCADE,
    meal_name TEXT NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    scheduled_time TIME, -- Hora programada para la comida
    description TEXT,
    calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alimentos
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    portion TEXT,
    calories INTEGER,
    protein_grams INTEGER,
    carbs_grams INTEGER,
    fat_grams INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de seguimiento de cumplimiento de comidas
CREATE TABLE IF NOT EXISTS meal_completion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meal_id UUID REFERENCES meals(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_time TIME, -- Hora en que se completó
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de seguimiento de progreso
CREATE TABLE IF NOT EXISTS progress_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL,
    weight DECIMAL(5,2), -- en kg
    body_fat_percentage DECIMAL(5,2),
    measurements JSONB, -- {chest: 95, waist: 85, hips: 98, biceps: 32, thighs: 55}
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de registros de entrenamiento
CREATE TABLE IF NOT EXISTS workout_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    plan_id UUID REFERENCES workout_plans(id),
    session_id UUID REFERENCES workout_sessions(id),
    duration_minutes INTEGER,
    calories_burned INTEGER,
    rating INTEGER, -- 1-5 rating of workout
    perceived_effort INTEGER, -- 1-10 rating of effort
    mood_before TEXT, -- Mood before workout
    mood_after TEXT, -- Mood after workout
    notes TEXT,
    exercises_completed JSONB, -- Array de ejercicios completados con detalles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de registros de nutrición
CREATE TABLE IF NOT EXISTS nutrition_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL,
    total_calories INTEGER,
    total_protein INTEGER,
    total_carbs INTEGER,
    total_fat INTEGER,
    water_intake INTEGER, -- en ml
    adherence_rating INTEGER, -- 1-10 rating of adherence to plan
    notes TEXT,
    meals_logged JSONB, -- Array de comidas registradas con detalles
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para el historial de conversaciones del agente RAG
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent TEXT, -- Intención detectada: create_workout, nutrition_advice, etc.
    entities JSONB, -- Entidades detectadas: {exercise: "push-ups", reps: 10, etc.}
    actions_taken JSONB, -- Acciones realizadas: {type: "create_workout", id: "uuid", etc.}
    context JSONB, -- Contexto de la conversación
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla para el conocimiento del agente RAG
CREATE TABLE IF NOT EXISTS agent_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic TEXT NOT NULL,
    subtopic TEXT,
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- Para búsqueda semántica (ajustar dimensiones según el modelo)
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_topic ON agent_knowledge(topic);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_subtopic ON agent_knowledge(subtopic);

-- Función para actualizar el timestamp 'updated_at'
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a todas las tablas
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    LOOP
        EXECUTE format('
            CREATE TRIGGER update_updated_at_trigger
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        ', t);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Insertar datos de ejemplo para el usuario por defecto
INSERT INTO users (id, email, first_name, last_name)
VALUES ('00000000-0000-0000-0000-000000000001', 'usuario@ejemplo.com', 'Juan', 'Pérez')
ON CONFLICT (email) DO NOTHING;

-- Insertar perfil de usuario por defecto
INSERT INTO user_profiles (user_id, age, gender, height, weight, activity_level, fitness_level, 
                          fitness_goals, preferred_workout_days, preferred_workout_times)
VALUES ('00000000-0000-0000-0000-000000000001', 30, 'male', 175, 75, 'moderate', 'intermediate', 
       '["weight_loss", "muscle_tone"]', '["Monday", "Wednesday", "Friday"]', '["18:00", "19:00"]')
ON CONFLICT (user_id) DO NOTHING;

-- Insertar preferencias de usuario por defecto
INSERT INTO user_preferences (user_id, notifications_enabled, email_notifications, 
                             push_notifications, workout_reminders, nutrition_reminders, dark_mode)
VALUES ('00000000-0000-0000-0000-000000000001', TRUE, TRUE, TRUE, TRUE, TRUE, FALSE)
ON CONFLICT (user_id) DO NOTHING;

-- Insertar ejercicios básicos
INSERT INTO exercises (name, description, muscle_group, equipment_needed, difficulty_level, calories_per_minute)
VALUES 
('Carrera en cinta', 'Correr a ritmo moderado en cinta.', 'Cardio', 'Cinta de correr', 'intermediate', 10),
('Plancha', 'Mantén la posición de plancha con el cuerpo recto.', 'Core', 'Ninguno', 'intermediate', 5),
('Crunches', 'Abdominales clásicos.', 'Core', 'Ninguno', 'beginner', 4),
('Sentadillas', 'Sentadillas con peso corporal.', 'Piernas', 'Ninguno', 'beginner', 8),
('Zancadas', 'Zancadas alternando piernas.', 'Piernas', 'Ninguno', 'beginner', 7),
('Burpees', 'Ejercicio de cuerpo completo.', 'Cuerpo Completo', 'Ninguno', 'advanced', 12),
('Mountain Climbers', 'Ejercicio de cardio y core.', 'Cuerpo Completo', 'Ninguno', 'intermediate', 10),
('Press de banca', 'Ejercicio para pecho con barra.', 'Pecho', 'Barra y banco', 'intermediate', 6),
('Fondos en paralelas', 'Ejercicio para tríceps.', 'Tríceps', 'Barras paralelas', 'intermediate', 7),
('Dominadas', 'Ejercicio para espalda.', 'Espalda', 'Barra de dominadas', 'intermediate', 8)
ON CONFLICT DO NOTHING;

-- Insertar conocimiento básico para el agente RAG
INSERT INTO agent_knowledge (topic, subtopic, content, metadata)
VALUES 
('ejercicio', 'cardio', 'El cardio es fundamental para mejorar la salud cardiovascular y quemar calorías. Se recomienda realizar al menos 150 minutos de cardio moderado a la semana.', '{"source": "general_knowledge", "confidence": 0.95}'),
('ejercicio', 'fuerza', 'El entrenamiento de fuerza ayuda a construir músculo, aumentar el metabolismo y mejorar la densidad ósea. Se recomienda entrenar cada grupo muscular 2-3 veces por semana.', '{"source": "general_knowledge", "confidence": 0.95}'),
('nutrición', 'proteínas', 'Las proteínas son esenciales para la recuperación muscular. Se recomienda consumir entre 1.6 y 2.2 gramos por kilogramo de peso corporal para personas activas.', '{"source": "general_knowledge", "confidence": 0.95}'),
('nutrición', 'carbohidratos', 'Los carbohidratos son la principal fuente de energía para el entrenamiento. Se recomienda consumir entre 3-5 gramos por kilogramo de peso corporal para personas activas.', '{"source": "general_knowledge", "confidence": 0.95}'),
('nutrición', 'grasas', 'Las grasas saludables son importantes para la salud hormonal. Se recomienda que constituyan entre el 20-35% de la ingesta calórica diaria.', '{"source": "general_knowledge", "confidence": 0.95}'),
('progreso', 'seguimiento', 'El seguimiento regular del progreso es clave para alcanzar objetivos. Se recomienda registrar peso, medidas y rendimiento en ejercicios al menos una vez por semana.', '{"source": "general_knowledge", "confidence": 0.95}')
ON CONFLICT DO NOTHING;

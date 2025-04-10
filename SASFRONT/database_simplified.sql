-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sas2;
USE sas2;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    age INT,
    gender VARCHAR(20),
    height DECIMAL(5,2), -- en cm
    weight DECIMAL(5,2), -- en kg
    activity_level VARCHAR(50), -- sedentary, light, moderate, active, very active
    fitness_level VARCHAR(50), -- beginner, intermediate, advanced
    fitness_goals JSON, -- Array de objetivos: ["weight_loss", "muscle_tone", etc.]
    health_conditions JSON, -- Array de condiciones: ["diabetes", "hypertension", etc.]
    dietary_restrictions JSON, -- Array de restricciones: ["vegetarian", "gluten_free", etc.]
    preferred_workout_days JSON, -- Array de días: ["Monday", "Wednesday", "Friday"]
    preferred_workout_times JSON, -- Array de horas: ["18:00", "19:00"]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de preferencias de usuario
CREATE TABLE IF NOT EXISTS user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    notifications_enabled BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    workout_reminders BOOLEAN DEFAULT TRUE,
    nutrition_reminders BOOLEAN DEFAULT TRUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) DEFAULT 'es',
    units VARCHAR(10) DEFAULT 'metric', -- metric, imperial
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de objetivos de fitness
CREATE TABLE IF NOT EXISTS fitness_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    goal_type VARCHAR(50) NOT NULL, -- weight_loss, muscle_gain, endurance, etc.
    target_value DECIMAL(5,2), -- target weight, etc.
    start_date DATE NOT NULL,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    progress INT DEFAULT 0, -- porcentaje de progreso (0-100)
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de planes de entrenamiento
CREATE TABLE IF NOT EXISTS workout_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de sesiones de entrenamiento
CREATE TABLE IF NOT EXISTS workout_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT,
    day_of_week VARCHAR(10) NOT NULL, -- Monday, Tuesday, etc.
    focus_area VARCHAR(50) NOT NULL, -- Chest, Back, Legs, etc.
    duration_minutes INT NOT NULL,
    scheduled_time TIME, -- Hora programada para la sesión
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE CASCADE
);

-- Tabla de ejercicios
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50) NOT NULL,
    equipment_needed VARCHAR(100),
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    calories_per_minute INT, -- Calorías quemadas por minuto (estimado)
    video_url VARCHAR(255), -- URL a video demostrativo
    image_url VARCHAR(255), -- URL a imagen del ejercicio
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de ejercicios de entrenamiento (junction table)
CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    exercise_id INT,
    sets INT NOT NULL,
    reps INT,
    duration_seconds INT,
    rest_seconds INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE
);

-- Tabla de seguimiento de cumplimiento de sesiones
CREATE TABLE IF NOT EXISTS session_completion (
    completion_id INT AUTO_INCREMENT PRIMARY KEY,
    session_id INT,
    user_id INT,
    completion_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_time TIME, -- Hora en que se completó
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES workout_sessions(session_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de planes de nutrición
CREATE TABLE IF NOT EXISTS nutrition_plans (
    nutrition_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    daily_calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de comidas
CREATE TABLE IF NOT EXISTS meals (
    meal_id INT AUTO_INCREMENT PRIMARY KEY,
    nutrition_plan_id INT,
    meal_name VARCHAR(50) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    scheduled_time TIME, -- Hora programada para la comida
    description TEXT,
    calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nutrition_plan_id) REFERENCES nutrition_plans(nutrition_plan_id) ON DELETE CASCADE
);

-- Tabla de alimentos
CREATE TABLE IF NOT EXISTS foods (
    food_id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT,
    food_name VARCHAR(100) NOT NULL,
    portion VARCHAR(50),
    calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_id) REFERENCES meals(meal_id) ON DELETE CASCADE
);

-- Tabla de seguimiento de cumplimiento de comidas
CREATE TABLE IF NOT EXISTS meal_completion (
    completion_id INT AUTO_INCREMENT PRIMARY KEY,
    meal_id INT,
    user_id INT,
    completion_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_time TIME, -- Hora en que se completó
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (meal_id) REFERENCES meals(meal_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de seguimiento de progreso
CREATE TABLE IF NOT EXISTS progress_tracking (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tracking_date DATE NOT NULL,
    weight DECIMAL(5,2), -- en kg
    body_fat_percentage DECIMAL(5,2),
    measurements JSON, -- {chest: 95, waist: 85, hips: 98, biceps: 32, thighs: 55}
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabla de registros de entrenamiento
CREATE TABLE IF NOT EXISTS workout_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    workout_date DATE NOT NULL,
    plan_id INT,
    session_id INT,
    duration_minutes INT,
    calories_burned INT,
    rating INT, -- 1-5 rating of workout
    perceived_effort INT, -- 1-10 rating of effort
    mood_before VARCHAR(50), -- Mood before workout
    mood_after VARCHAR(50), -- Mood after workout
    notes TEXT,
    exercises_completed JSON, -- Array de ejercicios completados con detalles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id),
    FOREIGN KEY (session_id) REFERENCES workout_sessions(session_id)
);

-- Tabla de registros de nutrición
CREATE TABLE IF NOT EXISTS nutrition_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tracking_date DATE NOT NULL,
    total_calories INT,
    total_protein INT,
    total_carbs INT,
    total_fat INT,
    water_intake INT, -- en ml
    adherence_rating INT, -- 1-10 rating of adherence to plan
    notes TEXT,
    meals_logged JSON, -- Array de comidas registradas con detalles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insertar usuario de prueba
INSERT INTO users (user_id, email, first_name, last_name)
VALUES (1, 'usuario@ejemplo.com', 'Juan', 'Pérez')
ON DUPLICATE KEY UPDATE email = email;

-- Insertar perfil de usuario de prueba
INSERT INTO user_profiles (user_id, age, gender, height, weight, activity_level, fitness_level, 
                          fitness_goals, preferred_workout_days, preferred_workout_times)
VALUES (1, 30, 'male', 175, 75, 'moderate', 'intermediate', 
       '["weight_loss", "muscle_tone"]', '["Monday", "Wednesday", "Friday"]', '["18:00", "19:00"]')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Insertar preferencias de usuario de prueba
INSERT INTO user_preferences (user_id, notifications_enabled, email_notifications, 
                             push_notifications, workout_reminders, nutrition_reminders, dark_mode)
VALUES (1, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE)
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Insertar objetivos de fitness de prueba
INSERT INTO fitness_goals (user_id, goal_type, target_value, start_date, target_date, status, progress, notes)
VALUES (1, 'weight_loss', 70, '2025-04-01', '2025-06-01', 'active', 10, 'Perder 5kg en 2 meses')
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO fitness_goals (user_id, goal_type, target_value, start_date, target_date, status, progress, notes)
VALUES (1, 'muscle_gain', 5, '2025-04-01', '2025-07-01', 'active', 5, 'Ganar 5kg de masa muscular en 3 meses')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Insertar ejercicios de muestra
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
('Dominadas', 'Ejercicio para espalda.', 'Espalda', 'Barra de dominadas', 'intermediate', 8),
('Curl de bíceps', 'Ejercicio para bíceps.', 'Bíceps', 'Mancuernas', 'beginner', 4),
('Sentadillas con barra', 'Ejercicio para piernas con barra.', 'Piernas', 'Barra', 'intermediate', 10),
('Press militar', 'Ejercicio para hombros.', 'Hombros', 'Barra', 'intermediate', 6),
('Peso muerto', 'Ejercicio compuesto para espalda baja y piernas.', 'Espalda', 'Barra', 'advanced', 9),
('Remo con barra', 'Ejercicio para espalda media.', 'Espalda', 'Barra', 'intermediate', 7)
ON DUPLICATE KEY UPDATE name = name;

-- Database: sas2

CREATE DATABASE IF NOT EXISTS sas2;

USE sas2;

-- Users Table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Profiles Table
CREATE TABLE user_profiles (
    profile_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    age INT,
    gender VARCHAR(20),
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    activity_level VARCHAR(50), -- sedentary, light, moderate, active, very active
    fitness_level VARCHAR(50), -- beginner, intermediate, advanced
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Fitness Goals Table
CREATE TABLE fitness_goals (
    goal_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    goal_type VARCHAR(50) NOT NULL, -- weight loss, muscle gain, endurance, etc.
    target_value DECIMAL(5,2), -- target weight, etc.
    start_date DATE NOT NULL,
    target_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, completed, abandoned
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Workout Plans Table
CREATE TABLE workout_plans (
    plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    plan_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Workout Sessions Table
CREATE TABLE workout_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    plan_id INT,
    day_of_week VARCHAR(10) NOT NULL, -- Monday, Tuesday, etc.
    focus_area VARCHAR(50) NOT NULL, -- Chest, Back, Legs, etc.
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id) ON DELETE CASCADE
);

-- Exercises Table
CREATE TABLE exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    muscle_group VARCHAR(50) NOT NULL,
    equipment_needed VARCHAR(100),
    difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workout Exercises Junction Table
CREATE TABLE workout_exercises (
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

-- Nutrition Plans Table
CREATE TABLE nutrition_plans (
    nutrition_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    plan_name VARCHAR(100) NOT NULL,
    daily_calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Meals Table
CREATE TABLE meals (
    meal_id INT AUTO_INCREMENT PRIMARY KEY,
    nutrition_plan_id INT,
    meal_name VARCHAR(50) NOT NULL, -- Breakfast, Lunch, Dinner, Snack
    description TEXT,
    calories INT,
    protein_grams INT,
    carbs_grams INT,
    fat_grams INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nutrition_plan_id) REFERENCES nutrition_plans(nutrition_plan_id) ON DELETE CASCADE
);

-- Progress Tracking Table
CREATE TABLE progress_tracking (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tracking_date DATE NOT NULL,
    weight DECIMAL(5,2), -- in kg
    body_fat_percentage DECIMAL(5,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Workout Logs Table
CREATE TABLE workout_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    workout_date DATE NOT NULL,
    plan_id INT,
    session_id INT,
    duration_minutes INT,
    calories_burned INT,
    rating INT, -- 1-5 rating of workout
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES workout_plans(plan_id),
    FOREIGN KEY (session_id) REFERENCES workout_sessions(session_id)
);

-- AI Interaction Logs Table
CREATE TABLE ai_interaction_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    interaction_type VARCHAR(50) NOT NULL, -- workout_generation, nutrition_advice, etc.
    prompt_data JSON, -- data sent to AI
    response_data JSON, -- data received from AI
    action_taken JSON, -- actions performed based on AI response
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Chat History Table
CREATE TABLE user_chat_history (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    message_text TEXT NOT NULL,
    is_user_message BOOLEAN NOT NULL, -- TRUE if from user, FALSE if from AI
    related_action_type VARCHAR(50), -- workout_creation, nutrition_plan, progress_update, etc.
    related_entity_id INT, -- ID of the entity created/modified (if applicable)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- AI Intent Recognition Table
CREATE TABLE ai_intents (
    intent_id INT AUTO_INCREMENT PRIMARY KEY,
    intent_name VARCHAR(100) NOT NULL, -- create_workout, update_nutrition, log_progress, etc.
    description TEXT,
    required_parameters JSON, -- parameters needed for this intent
    handler_function VARCHAR(100), -- function name to handle this intent
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Preferences Table
CREATE TABLE user_preferences (
    preference_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Suggested Exercises Table
CREATE TABLE suggested_exercises (
    suggestion_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    exercise_id INT,
    sets INT,
    reps INT,
    duration_seconds INT,
    rest_seconds INT,
    notes TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    suggested_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE
);

-- Insert sample user for development
INSERT INTO users (user_id, email, password, first_name, last_name)
VALUES (1, 'demo@example.com', '$2b$10$XdULVQH8X2jXUWe/lBUKVOFPKXQMJGfPqZPDCsV0xvIGI0sTHdwJi', 'Juan', 'Pérez')
ON DUPLICATE KEY UPDATE email = email;

-- Insert sample user profile
INSERT INTO user_profiles (user_id, age, gender, height, weight, activity_level, fitness_level)
VALUES (1, 30, 'male', 175.0, 80.0, 'moderate', 'intermediate')
ON DUPLICATE KEY UPDATE user_id = user_id;

-- Insert sample exercises
INSERT INTO exercises (name, description, muscle_group, equipment_needed, difficulty_level)
VALUES
('Press de banca', 'Ejercicio para pecho con barra', 'Pecho', 'Barra y banco', 'intermediate'),
('Fondos en paralelas', 'Ejercicio para tríceps', 'Tríceps', 'Barras paralelas', 'intermediate'),
('Dominadas', 'Ejercicio para espalda', 'Espalda', 'Barra de dominadas', 'intermediate'),
('Sentadillas', 'Ejercicio para piernas', 'Piernas', 'Barra', 'intermediate'),
('Press militar', 'Ejercicio para hombros', 'Hombros', 'Barra', 'intermediate'),
('Curl de bíceps', 'Ejercicio para bíceps', 'Bíceps', 'Mancuernas', 'beginner'),
('Extensiones de tríceps', 'Ejercicio para tríceps', 'Tríceps', 'Mancuernas', 'beginner'),
('Peso muerto', 'Ejercicio para espalda baja', 'Espalda', 'Barra', 'advanced'),
('Zancadas', 'Ejercicio para piernas', 'Piernas', 'Mancuernas', 'intermediate'),
('Abdominales', 'Ejercicio para abdomen', 'Abdomen', 'Ninguno', 'beginner')
ON DUPLICATE KEY UPDATE name = name;

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

async function initializeDatabase() {
  // Create connection without database specified
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  });

  try {
    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS sas2');
    
    // Use the database
    await connection.query('USE sas2');
    
    console.log('Database created and selected');

    // Create tables without foreign key constraints
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert default user
    await connection.query(`
      INSERT INTO users (user_id, email, password, first_name, last_name)
      VALUES (1, 'demo@example.com', 'password', 'Demo', 'User')
      ON DUPLICATE KEY UPDATE email = email
    `);

    // Create workout_plans table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_plans (
        plan_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        plan_name VARCHAR(100) NOT NULL,
        description TEXT,
        is_ai_generated BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create workout_sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        session_id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT,
        day_of_week VARCHAR(10) NOT NULL,
        focus_area VARCHAR(50) NOT NULL,
        duration_minutes INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create exercises table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        exercise_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        muscle_group VARCHAR(50) NOT NULL,
        equipment_needed VARCHAR(100),
        difficulty_level VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert sample exercises
    await connection.query(`
      INSERT INTO exercises (name, description, muscle_group, equipment_needed, difficulty_level)
      VALUES
      ('Press de banca', 'Ejercicio para pecho con barra', 'Pecho', 'Barra y banco', 'intermediate'),
      ('Fondos en paralelas', 'Ejercicio para tríceps', 'Tríceps', 'Barras paralelas', 'intermediate'),
      ('Dominadas', 'Ejercicio para espalda', 'Espalda', 'Barra de dominadas', 'intermediate'),
      ('Sentadillas', 'Ejercicio para piernas', 'Piernas', 'Barra', 'intermediate'),
      ('Press militar', 'Ejercicio para hombros', 'Hombros', 'Barra', 'intermediate')
      ON DUPLICATE KEY UPDATE name = name
    `);

    // Create workout_exercises table
    await connection.query(`
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Insert sample workout plan
    await connection.query(`
      INSERT INTO workout_plans (plan_id, user_id, plan_name, description)
      VALUES (1, 1, 'Plan de entrenamiento personalizado', 'Rutina de 4 días enfocada en fuerza y resistencia')
      ON DUPLICATE KEY UPDATE plan_name = plan_name
    `);

    // Insert sample workout session
    await connection.query(`
      INSERT INTO workout_sessions (session_id, plan_id, day_of_week, focus_area, duration_minutes)
      VALUES (1, 1, 'Lunes', 'Pecho y Tríceps', 60)
      ON DUPLICATE KEY UPDATE day_of_week = day_of_week
    `);

    // Insert sample workout exercises
    await connection.query(`
      INSERT INTO workout_exercises (session_id, exercise_id, sets, reps)
      VALUES (1, 1, 3, 12), (1, 2, 3, 10)
      ON DUPLICATE KEY UPDATE sets = sets
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initializeDatabase();

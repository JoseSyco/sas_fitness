const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const logger = require('./utils/logger');
const { requestLogger } = require('./middleware/logger.middleware');
const { requestDetailLogger } = require('./middleware/requestDetailLogger.middleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(requestDetailLogger);

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sas2',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection and create database if it doesn't exist
async function testConnection() {
  try {
    // Try to create the database if it doesn't exist
    await pool.query('CREATE DATABASE IF NOT EXISTS sas2');

    // Use the database
    await pool.query('USE sas2');

    // Test connection
    const [rows] = await pool.query('SELECT NOW() as now');
    logger.info('Database connected successfully at:', rows[0].now);

    // Check if users table exists, if not, initialize the database
    try {
      const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
      if (tables.length === 0) {
        logger.info('Initializing database with default schema...');
        // Read the SQL file
        const fs = require('fs');
        const path = require('path');
        const sqlFile = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');

        // Split the SQL file into individual statements
        const statements = sqlFile.split(';').filter(stmt => stmt.trim() !== '');

        // Execute each statement
        for (const stmt of statements) {
          if (stmt.trim().toUpperCase().startsWith('CREATE DATABASE') ||
              stmt.trim().toUpperCase().startsWith('USE')) {
            // Skip CREATE DATABASE and USE statements
            continue;
          }
          await pool.query(stmt);
        }

        logger.info('Database initialized successfully!');
      }
    } catch (tableErr) {
      logger.error('Error checking or creating tables:', tableErr);
    }
  } catch (err) {
    logger.error('Error connecting to the database:', err);
  }
}

testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SAS2 Fitness API' });
});

// API status route
app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'API is running',
    database: {
      connected: false,
      error: 'Database connection error. Using mock data.'
    },
    version: '1.0.0'
  });
});

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const workoutRoutes = require('./routes/workout.routes');
const nutritionRoutes = require('./routes/nutrition.routes');
const aiRoutes = require('./routes/ai.routes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;

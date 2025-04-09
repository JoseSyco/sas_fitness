const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all workout plans for a user
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const plansResult = await db.query(
      'SELECT * FROM workout_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({
      plans: plansResult.rows
    });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ message: 'Server error while fetching workout plans' });
  }
});

// Get a specific workout plan with sessions and exercises
router.get('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const planId = req.params.planId;

    // Get plan details
    const planResult = await db.query(
      'SELECT * FROM workout_plans WHERE plan_id = $1 AND user_id = $2',
      [planId, userId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ message: 'Workout plan not found or unauthorized' });
    }

    // Get sessions for this plan
    const sessionsResult = await db.query(
      'SELECT * FROM workout_sessions WHERE plan_id = $1 ORDER BY day_of_week',
      [planId]
    );

    // For each session, get the exercises
    const sessions = await Promise.all(
      sessionsResult.rows.map(async (session) => {
        const exercisesResult = await db.query(
          `SELECT we.*, e.name, e.description, e.muscle_group, e.equipment_needed, e.difficulty_level 
           FROM workout_exercises we
           JOIN exercises e ON we.exercise_id = e.exercise_id
           WHERE we.session_id = $1
           ORDER BY we.workout_exercise_id`,
          [session.session_id]
        );

        return {
          ...session,
          exercises: exercisesResult.rows
        };
      })
    );

    res.status(200).json({
      plan: planResult.rows[0],
      sessions
    });
  } catch (error) {
    console.error('Error fetching workout plan details:', error);
    res.status(500).json({ message: 'Server error while fetching workout plan details' });
  }
});

// Create a new workout plan
router.post('/plans', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const userId = req.user.user_id;
    const { plan_name, description, is_ai_generated, sessions } = req.body;

    await client.query('BEGIN');

    // Create the workout plan
    const planResult = await client.query(
      'INSERT INTO workout_plans (user_id, plan_name, description, is_ai_generated) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, plan_name, description, is_ai_generated || true]
    );

    const planId = planResult.rows[0].plan_id;

    // Create sessions for this plan
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const { day_of_week, focus_area, duration_minutes, exercises } = session;

        // Create session
        const sessionResult = await client.query(
          'INSERT INTO workout_sessions (plan_id, day_of_week, focus_area, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING *',
          [planId, day_of_week, focus_area, duration_minutes]
        );

        const sessionId = sessionResult.rows[0].session_id;

        // Add exercises to the session
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const { exercise_id, sets, reps, duration_seconds, rest_seconds, notes } = exercise;

            await client.query(
              'INSERT INTO workout_exercises (session_id, exercise_id, sets, reps, duration_seconds, rest_seconds, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)',
              [sessionId, exercise_id, sets, reps, duration_seconds, rest_seconds, notes]
            );
          }
        }
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Workout plan created successfully',
      plan: planResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating workout plan:', error);
    res.status(500).json({ message: 'Server error while creating workout plan' });
  } finally {
    client.release();
  }
});

// Log a completed workout
router.post('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes } = req.body;

    const logResult = await db.query(
      'INSERT INTO workout_logs (user_id, workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [userId, workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes]
    );

    res.status(201).json({
      message: 'Workout logged successfully',
      log: logResult.rows[0]
    });
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ message: 'Server error while logging workout' });
  }
});

// Get workout logs for a user
router.get('/logs', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM workout_logs WHERE user_id = $1';
    const queryParams = [userId];

    if (start_date) {
      query += ' AND workout_date >= $2';
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ` AND workout_date <= $${queryParams.length + 1}`;
      queryParams.push(end_date);
    }

    query += ' ORDER BY workout_date DESC';

    const logsResult = await db.query(query, queryParams);

    res.status(200).json({
      logs: logsResult.rows
    });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ message: 'Server error while fetching workout logs' });
  }
});

// Get all exercises
router.get('/exercises', authenticateToken, async (req, res) => {
  try {
    const { muscle_group, difficulty_level } = req.query;
    
    let query = 'SELECT * FROM exercises';
    const queryParams = [];
    
    if (muscle_group || difficulty_level) {
      query += ' WHERE';
      
      if (muscle_group) {
        query += ' muscle_group = $1';
        queryParams.push(muscle_group);
      }
      
      if (difficulty_level) {
        if (queryParams.length > 0) {
          query += ' AND';
        }
        query += ` difficulty_level = $${queryParams.length + 1}`;
        queryParams.push(difficulty_level);
      }
    }
    
    query += ' ORDER BY name';
    
    const exercisesResult = await db.query(query, queryParams);
    
    res.status(200).json({
      exercises: exercisesResult.rows
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Server error while fetching exercises' });
  }
});

module.exports = router;

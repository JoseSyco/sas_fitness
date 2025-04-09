const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all workout plans for a user
router.get('/plans', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user_id 1 if not provided

    const plansResult = await db.query(
      'SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    console.log('Workout plans fetched successfully:', plansResult);

    res.status(200).json({
      plans: plansResult
    });
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    res.status(500).json({ message: 'Server error while fetching workout plans' });
  }
});

// Get a specific workout plan with sessions and exercises
router.get('/plans/:planId', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user_id 1 if not provided
    const planId = req.params.planId;

    // Get plan details
    const planResult = await db.query(
      'SELECT * FROM workout_plans WHERE plan_id = ? AND user_id = ?',
      [planId, userId]
    );

    if (!planResult || planResult.length === 0) {
      return res.status(404).json({ message: 'Workout plan not found or unauthorized' });
    }

    // Get sessions for this plan
    const sessionsResult = await db.query(
      'SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY day_of_week',
      [planId]
    );

    // For each session, get the exercises
    const sessions = [];
    if (sessionsResult && sessionsResult.length > 0) {
      for (const session of sessionsResult) {
        const exercisesResult = await db.query(
          `SELECT we.*, e.name, e.description, e.muscle_group, e.equipment_needed, e.difficulty_level
           FROM workout_exercises we
           JOIN exercises e ON we.exercise_id = e.exercise_id
           WHERE we.session_id = ?
           ORDER BY we.workout_exercise_id`,
          [session.session_id]
        );

        sessions.push({
          ...session,
          exercises: exercisesResult || []
        });
      }
    }

    res.status(200).json({
      plan: planResult[0],
      sessions
    });
  } catch (error) {
    console.error('Error fetching workout plan details:', error);
    res.status(500).json({ message: 'Server error while fetching workout plan details' });
  }
});

// Create a new workout plan
router.post('/plans', async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const userId = req.body.user_id || 1; // Default to user_id 1 if not provided
    const { plan_name, description, is_ai_generated, sessions } = req.body;

    // Create the workout plan
    const [planResult] = await connection.query(
      'INSERT INTO workout_plans (user_id, plan_name, description, is_ai_generated) VALUES (?, ?, ?, ?)',
      [userId, plan_name, description, is_ai_generated || true]
    );

    const planId = planResult.insertId;

    // Create sessions for this plan
    if (sessions && sessions.length > 0) {
      for (const session of sessions) {
        const { day_of_week, focus_area, duration_minutes, exercises } = session;

        // Create session
        const [sessionResult] = await connection.query(
          'INSERT INTO workout_sessions (plan_id, day_of_week, focus_area, duration_minutes) VALUES (?, ?, ?, ?)',
          [planId, day_of_week, focus_area, duration_minutes]
        );

        const sessionId = sessionResult.insertId;

        // Add exercises to the session
        if (exercises && exercises.length > 0) {
          for (const exercise of exercises) {
            const { exercise_id, sets, reps, duration_seconds, rest_seconds, notes } = exercise;

            await connection.query(
              'INSERT INTO workout_exercises (session_id, exercise_id, sets, reps, duration_seconds, rest_seconds, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [sessionId, exercise_id, sets, reps, duration_seconds, rest_seconds, notes]
            );
          }
        }
      }
    }

    await connection.commit();

    // Get the created plan
    const [createdPlan] = await connection.query(
      'SELECT * FROM workout_plans WHERE plan_id = ?',
      [planId]
    );

    res.status(201).json({
      message: 'Workout plan created successfully',
      plan: createdPlan[0]
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating workout plan:', error);
    res.status(500).json({ message: 'Server error while creating workout plan' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

// Log a completed workout
router.post('/logs', async (req, res) => {
  try {
    const userId = req.body.user_id || 1; // Default to user_id 1 if not provided
    const { workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes } = req.body;

    const [logResult] = await db.query(
      'INSERT INTO workout_logs (user_id, workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, workout_date, plan_id, session_id, duration_minutes, calories_burned, rating, notes]
    );

    const logId = logResult.insertId;

    // Get the created log
    const [createdLog] = await db.query(
      'SELECT * FROM workout_logs WHERE log_id = ?',
      [logId]
    );

    res.status(201).json({
      message: 'Workout logged successfully',
      log: createdLog[0]
    });
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ message: 'Server error while logging workout' });
  }
});

// Get workout logs for a user
router.get('/logs', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // Default to user_id 1 if not provided
    const { start_date, end_date } = req.query;

    let query = 'SELECT * FROM workout_logs WHERE user_id = ?';
    const queryParams = [userId];

    if (start_date) {
      query += ' AND workout_date >= ?';
      queryParams.push(start_date);
    }

    if (end_date) {
      query += ' AND workout_date <= ?';
      queryParams.push(end_date);
    }

    query += ' ORDER BY workout_date DESC';

    const logsResult = await db.query(query, queryParams);

    res.status(200).json({
      logs: logsResult
    });
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ message: 'Server error while fetching workout logs' });
  }
});

// Get all exercises
router.get('/exercises', async (req, res) => {
  try {
    const { muscle_group, difficulty_level } = req.query;

    let query = 'SELECT * FROM exercises';
    const queryParams = [];

    if (muscle_group || difficulty_level) {
      query += ' WHERE';

      if (muscle_group) {
        query += ' muscle_group = ?';
        queryParams.push(muscle_group);
      }

      if (difficulty_level) {
        if (queryParams.length > 0) {
          query += ' AND';
        }
        query += ' difficulty_level = ?';
        queryParams.push(difficulty_level);
      }
    }

    query += ' ORDER BY name';

    const exercisesResult = await db.query(query, queryParams);

    res.status(200).json({
      exercises: exercisesResult
    });
  } catch (error) {
    console.error('Error fetching exercises:', error);
    res.status(500).json({ message: 'Server error while fetching exercises' });
  }
});

module.exports = router;

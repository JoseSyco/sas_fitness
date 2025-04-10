const express = require('express');
const router = express.Router();
const db = require('../db');
const logger = require('../utils/logger');
const { authMiddleware } = require('../middleware/auth.middleware');

// Obtener todos los planes de entrenamiento de un usuario
router.get('/plans', async (req, res) => {
  try {
    const userId = req.query.user_id || 1; // En modo desarrollo, usar user_id=1 por defecto

    logger.info('Fetching workout plans', { userId });

    const [plans] = await db.query(
      `SELECT * FROM workout_plans WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    // Para cada plan, obtener sus sesiones
    for (const plan of plans) {
      const [sessions] = await db.query(
        `SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY day_of_week`,
        [plan.plan_id]
      );

      // Para cada sesión, obtener sus ejercicios
      for (const session of sessions) {
        const [exercises] = await db.query(
          `SELECT we.*, e.name as exercise_name, e.description as exercise_description, e.muscle_group, e.difficulty_level
           FROM workout_exercises we
           JOIN exercises e ON we.exercise_id = e.exercise_id
           WHERE we.session_id = ?
           ORDER BY we.exercise_order`,
          [session.session_id]
        );

        session.exercises = exercises;
      }

      plan.sessions = sessions;
    }

    // Devolver solo los datos necesarios, sin metadatos de MySQL
    logger.info('Sending workout plans response', { plansCount: plans.length });
    console.log('Plans data:', JSON.stringify(plans, null, 2));
    res.status(200).json({ plans: plans });
  } catch (error) {
    logger.error('Error fetching workout plans', error);
    res.status(500).json({ message: 'Error al obtener planes de entrenamiento', error: error.message });
  }
});

// Obtener un plan de entrenamiento específico
router.get('/plans/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    logger.info('Fetching workout plan', { planId });

    const [plans] = await db.query(
      `SELECT * FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan de entrenamiento no encontrado' });
    }

    const plan = plans[0];

    // Obtener sesiones del plan
    const [sessions] = await db.query(
      `SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY day_of_week`,
      [planId]
    );

    // Para cada sesión, obtener sus ejercicios
    for (const session of sessions) {
      const [exercises] = await db.query(
        `SELECT we.*, e.name as exercise_name, e.description as exercise_description, e.muscle_group, e.difficulty_level
         FROM workout_exercises we
         JOIN exercises e ON we.exercise_id = e.exercise_id
         WHERE we.session_id = ?
         ORDER BY we.exercise_order`,
        [session.session_id]
      );

      session.exercises = exercises;
    }

    plan.sessions = sessions;

    res.status(200).json(plan);
  } catch (error) {
    logger.error('Error fetching workout plan', error);
    res.status(500).json({ message: 'Error al obtener plan de entrenamiento', error: error.message });
  }
});

// Crear un nuevo plan de entrenamiento
router.post('/plans', async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { user_id, plan_name, description, is_ai_generated, sessions } = req.body;

    if (!plan_name) {
      return res.status(400).json({ message: 'El nombre del plan es obligatorio' });
    }

    logger.info('Creating workout plan', { user_id, plan_name });

    // Insertar plan
    const [planResult] = await connection.query(
      `INSERT INTO workout_plans (user_id, plan_name, description, is_ai_generated)
       VALUES (?, ?, ?, ?)`,
      [user_id || 1, plan_name, description || '', is_ai_generated || false]
    );

    const planId = planResult.insertId;

    // Si hay sesiones, insertarlas
    if (sessions && Array.isArray(sessions)) {
      for (const [sessionIndex, session] of sessions.entries()) {
        const { day_of_week, focus_area, duration_minutes, exercises } = session;

        // Insertar sesión
        const [sessionResult] = await connection.query(
          `INSERT INTO workout_sessions (plan_id, day_of_week, focus_area, duration_minutes)
           VALUES (?, ?, ?, ?)`,
          [planId, day_of_week || `Día ${sessionIndex + 1}`, focus_area || 'General', duration_minutes || 60]
        );

        const sessionId = sessionResult.insertId;

        // Si hay ejercicios, insertarlos
        if (exercises && Array.isArray(exercises)) {
          for (const [exerciseIndex, exercise] of exercises.entries()) {
            const { exercise_id, name, sets, reps, rest_seconds, notes } = exercise;

            let exerciseId = exercise_id;

            // Si no se proporciona un ID de ejercicio, buscar por nombre o crear uno nuevo
            if (!exerciseId && name) {
              // Buscar ejercicio por nombre
              const [existingExercises] = await connection.query(
                `SELECT exercise_id FROM exercises WHERE name = ?`,
                [name]
              );

              if (existingExercises.length > 0) {
                exerciseId = existingExercises[0].exercise_id;
              } else {
                // Crear nuevo ejercicio
                const [newExerciseResult] = await connection.query(
                  `INSERT INTO exercises (name, description, muscle_group, difficulty_level)
                   VALUES (?, ?, ?, ?)`,
                  [name, exercise.description || '', focus_area || 'General', exercise.difficulty_level || 'intermediate']
                );

                exerciseId = newExerciseResult.insertId;
              }
            }

            if (!exerciseId) {
              logger.warn('No exercise ID or name provided, skipping', { sessionId, exerciseIndex });
              continue;
            }

            // Insertar ejercicio en la sesión
            await connection.query(
              `INSERT INTO workout_exercises (session_id, exercise_id, exercise_order, sets, reps, rest_seconds, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [sessionId, exerciseId, exerciseIndex + 1, sets || 3, reps || 10, rest_seconds || 60, notes || '']
            );
          }
        }
      }
    }

    await connection.commit();

    // Obtener el plan completo para devolverlo
    const [plans] = await connection.query(
      `SELECT * FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    const plan = plans[0];

    // Obtener sesiones del plan
    const [sessions_result] = await connection.query(
      `SELECT * FROM workout_sessions WHERE plan_id = ? ORDER BY day_of_week`,
      [planId]
    );

    // Para cada sesión, obtener sus ejercicios
    for (const session of sessions_result) {
      const [exercises] = await connection.query(
        `SELECT we.*, e.name as exercise_name, e.description as exercise_description, e.muscle_group, e.difficulty_level
         FROM workout_exercises we
         JOIN exercises e ON we.exercise_id = e.exercise_id
         WHERE we.session_id = ?
         ORDER BY we.exercise_order`,
        [session.session_id]
      );

      session.exercises = exercises;
    }

    plan.sessions = sessions_result;

    res.status(201).json(plan);
  } catch (error) {
    await connection.rollback();
    logger.error('Error creating workout plan', error);
    res.status(500).json({ message: 'Error al crear plan de entrenamiento', error: error.message });
  } finally {
    connection.release();
  }
});

// Actualizar un plan de entrenamiento
router.put('/plans/:planId', async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { planId } = req.params;
    const { plan_name, description } = req.body;

    logger.info('Updating workout plan', { planId });

    // Verificar que el plan existe
    const [plans] = await connection.query(
      `SELECT * FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan de entrenamiento no encontrado' });
    }

    // Actualizar plan
    await connection.query(
      `UPDATE workout_plans SET plan_name = ?, description = ?, updated_at = CURRENT_TIMESTAMP
       WHERE plan_id = ?`,
      [plan_name || plans[0].plan_name, description || plans[0].description, planId]
    );

    await connection.commit();

    // Obtener el plan actualizado
    const [updatedPlans] = await connection.query(
      `SELECT * FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    res.status(200).json(updatedPlans[0]);
  } catch (error) {
    await connection.rollback();
    logger.error('Error updating workout plan', error);
    res.status(500).json({ message: 'Error al actualizar plan de entrenamiento', error: error.message });
  } finally {
    connection.release();
  }
});

// Eliminar un plan de entrenamiento
router.delete('/plans/:planId', async (req, res) => {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const { planId } = req.params;

    logger.info('Deleting workout plan', { planId });

    // Verificar que el plan existe
    const [plans] = await connection.query(
      `SELECT * FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    if (plans.length === 0) {
      return res.status(404).json({ message: 'Plan de entrenamiento no encontrado' });
    }

    // Obtener sesiones del plan
    const [sessions] = await connection.query(
      `SELECT session_id FROM workout_sessions WHERE plan_id = ?`,
      [planId]
    );

    // Eliminar ejercicios de cada sesión
    for (const session of sessions) {
      await connection.query(
        `DELETE FROM workout_exercises WHERE session_id = ?`,
        [session.session_id]
      );
    }

    // Eliminar sesiones
    await connection.query(
      `DELETE FROM workout_sessions WHERE plan_id = ?`,
      [planId]
    );

    // Eliminar plan
    await connection.query(
      `DELETE FROM workout_plans WHERE plan_id = ?`,
      [planId]
    );

    await connection.commit();

    res.status(200).json({ message: 'Plan de entrenamiento eliminado correctamente' });
  } catch (error) {
    await connection.rollback();
    logger.error('Error deleting workout plan', error);
    res.status(500).json({ message: 'Error al eliminar plan de entrenamiento', error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;

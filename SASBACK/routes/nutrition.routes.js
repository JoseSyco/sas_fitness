const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get all nutrition plans for a user
router.get('/plans', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const plansResult = await db.query(
      'SELECT * FROM nutrition_plans WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({
      plans: plansResult.rows
    });
  } catch (error) {
    console.error('Error fetching nutrition plans:', error);
    res.status(500).json({ message: 'Server error while fetching nutrition plans' });
  }
});

// Get a specific nutrition plan with meals
router.get('/plans/:planId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const planId = req.params.planId;

    // Get plan details
    const planResult = await db.query(
      'SELECT * FROM nutrition_plans WHERE nutrition_plan_id = $1 AND user_id = $2',
      [planId, userId]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ message: 'Nutrition plan not found or unauthorized' });
    }

    // Get meals for this plan
    const mealsResult = await db.query(
      'SELECT * FROM meals WHERE nutrition_plan_id = $1 ORDER BY meal_name',
      [planId]
    );

    res.status(200).json({
      plan: planResult.rows[0],
      meals: mealsResult.rows
    });
  } catch (error) {
    console.error('Error fetching nutrition plan details:', error);
    res.status(500).json({ message: 'Server error while fetching nutrition plan details' });
  }
});

// Create a new nutrition plan
router.post('/plans', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const userId = req.user.user_id;
    const { plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, is_ai_generated, meals } = req.body;

    await client.query('BEGIN');

    // Create the nutrition plan
    const planResult = await client.query(
      'INSERT INTO nutrition_plans (user_id, plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, is_ai_generated) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, is_ai_generated || true]
    );

    const planId = planResult.rows[0].nutrition_plan_id;

    // Create meals for this plan
    if (meals && meals.length > 0) {
      for (const meal of meals) {
        const { meal_name, description, calories, protein_grams, carbs_grams, fat_grams } = meal;

        await client.query(
          'INSERT INTO meals (nutrition_plan_id, meal_name, description, calories, protein_grams, carbs_grams, fat_grams) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [planId, meal_name, description, calories, protein_grams, carbs_grams, fat_grams]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Nutrition plan created successfully',
      plan: planResult.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating nutrition plan:', error);
    res.status(500).json({ message: 'Server error while creating nutrition plan' });
  } finally {
    client.release();
  }
});

// Update a nutrition plan
router.put('/plans/:planId', authenticateToken, async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    const userId = req.user.user_id;
    const planId = req.params.planId;
    const { plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, meals } = req.body;

    await client.query('BEGIN');

    // Check if plan exists and belongs to user
    const planCheck = await client.query(
      'SELECT * FROM nutrition_plans WHERE nutrition_plan_id = $1 AND user_id = $2',
      [planId, userId]
    );

    if (planCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Nutrition plan not found or unauthorized' });
    }

    // Update the nutrition plan
    await client.query(
      'UPDATE nutrition_plans SET plan_name = $1, daily_calories = $2, protein_grams = $3, carbs_grams = $4, fat_grams = $5, updated_at = CURRENT_TIMESTAMP WHERE nutrition_plan_id = $6',
      [plan_name, daily_calories, protein_grams, carbs_grams, fat_grams, planId]
    );

    // If meals are provided, delete existing meals and add new ones
    if (meals) {
      // Delete existing meals
      await client.query('DELETE FROM meals WHERE nutrition_plan_id = $1', [planId]);

      // Add new meals
      for (const meal of meals) {
        const { meal_name, description, calories, protein_grams, carbs_grams, fat_grams } = meal;

        await client.query(
          'INSERT INTO meals (nutrition_plan_id, meal_name, description, calories, protein_grams, carbs_grams, fat_grams) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [planId, meal_name, description, calories, protein_grams, carbs_grams, fat_grams]
        );
      }
    }

    await client.query('COMMIT');

    // Get updated plan
    const updatedPlan = await db.query(
      'SELECT * FROM nutrition_plans WHERE nutrition_plan_id = $1',
      [planId]
    );

    res.status(200).json({
      message: 'Nutrition plan updated successfully',
      plan: updatedPlan.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating nutrition plan:', error);
    res.status(500).json({ message: 'Server error while updating nutrition plan' });
  } finally {
    client.release();
  }
});

module.exports = router;

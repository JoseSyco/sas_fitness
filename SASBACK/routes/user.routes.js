const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth.middleware');

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Get user data
    const userResult = await db.query(
      'SELECT user_id, email, first_name, last_name, created_at FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user profile data
    const profileResult = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    const profile = profileResult.rows.length > 0 ? profileResult.rows[0] : null;

    res.status(200).json({
      user: userResult.rows[0],
      profile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { age, gender, height, weight, activity_level, fitness_level } = req.body;

    // Check if profile exists
    const profileCheck = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileCheck.rows.length === 0) {
      // Create profile if it doesn't exist
      await db.query(
        'INSERT INTO user_profiles (user_id, age, gender, height, weight, activity_level, fitness_level) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [userId, age, gender, height, weight, activity_level, fitness_level]
      );
    } else {
      // Update existing profile
      await db.query(
        'UPDATE user_profiles SET age = $1, gender = $2, height = $3, weight = $4, activity_level = $5, fitness_level = $6, updated_at = CURRENT_TIMESTAMP WHERE user_id = $7',
        [age, gender, height, weight, activity_level, fitness_level, userId]
      );
    }

    // Get updated profile
    const updatedProfile = await db.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [userId]
    );

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updatedProfile.rows[0]
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
});

// Get user fitness goals
router.get('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const goalsResult = await db.query(
      'SELECT * FROM fitness_goals WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    res.status(200).json({
      goals: goalsResult.rows
    });
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(500).json({ message: 'Server error while fetching goals' });
  }
});

// Create new fitness goal
router.post('/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { goal_type, target_value, start_date, target_date } = req.body;

    const newGoal = await db.query(
      'INSERT INTO fitness_goals (user_id, goal_type, target_value, start_date, target_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, goal_type, target_value, start_date, target_date]
    );

    res.status(201).json({
      message: 'Goal created successfully',
      goal: newGoal.rows[0]
    });
  } catch (error) {
    console.error('Error creating fitness goal:', error);
    res.status(500).json({ message: 'Server error while creating goal' });
  }
});

// Update fitness goal
router.put('/goals/:goalId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const goalId = req.params.goalId;
    const { goal_type, target_value, start_date, target_date, status } = req.body;

    // Check if goal exists and belongs to user
    const goalCheck = await db.query(
      'SELECT * FROM fitness_goals WHERE goal_id = $1 AND user_id = $2',
      [goalId, userId]
    );

    if (goalCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Goal not found or unauthorized' });
    }

    // Update goal
    const updatedGoal = await db.query(
      'UPDATE fitness_goals SET goal_type = $1, target_value = $2, start_date = $3, target_date = $4, status = $5, updated_at = CURRENT_TIMESTAMP WHERE goal_id = $6 AND user_id = $7 RETURNING *',
      [goal_type, target_value, start_date, target_date, status, goalId, userId]
    );

    res.status(200).json({
      message: 'Goal updated successfully',
      goal: updatedGoal.rows[0]
    });
  } catch (error) {
    console.error('Error updating fitness goal:', error);
    res.status(500).json({ message: 'Server error while updating goal' });
  }
});

// Track progress
router.post('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { tracking_date, weight, body_fat_percentage, notes } = req.body;

    const newProgress = await db.query(
      'INSERT INTO progress_tracking (user_id, tracking_date, weight, body_fat_percentage, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId, tracking_date, weight, body_fat_percentage, notes]
    );

    res.status(201).json({
      message: 'Progress tracked successfully',
      progress: newProgress.rows[0]
    });
  } catch (error) {
    console.error('Error tracking progress:', error);
    res.status(500).json({ message: 'Server error while tracking progress' });
  }
});

// Get progress history
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;

    const progressResult = await db.query(
      'SELECT * FROM progress_tracking WHERE user_id = $1 ORDER BY tracking_date DESC',
      [userId]
    );

    res.status(200).json({
      progress: progressResult.rows
    });
  } catch (error) {
    console.error('Error fetching progress history:', error);
    res.status(500).json({ message: 'Server error while fetching progress' });
  }
});

// Get user preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    console.log('[Backend] GET /preferences - User ID:', userId);

    // Get user preferences
    console.log('[Backend] Querying user preferences from database');
    const preferencesResult = await db.query(
      'SELECT preference_key, preference_value FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    console.log('[Backend] Found preferences:', preferencesResult.rows);

    // Convert to object
    const preferences = {};
    preferencesResult.rows.forEach(pref => {
      preferences[pref.preference_key] = pref.preference_value;
    });

    console.log('[Backend] Returning preferences:', preferences);
    res.status(200).json({
      preferences
    });
  } catch (error) {
    console.error('[Backend] Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error while fetching preferences' });
  }
});

// Update user preferences
router.post('/preferences', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { receive_notifications, dark_mode } = req.body;

    console.log('[Backend] POST /preferences - User ID:', userId);
    console.log('[Backend] Received preferences:', { receive_notifications, dark_mode });

    // Update or insert preferences
    if (receive_notifications !== undefined) {
      console.log('[Backend] Updating notifications preference:', receive_notifications);
      try {
        await db.query(
          'INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES ($1, $2, $3) ' +
          'ON DUPLICATE KEY UPDATE preference_value = $3',
          [userId, 'receive_notifications', receive_notifications.toString()]
        );
        console.log('[Backend] Notifications preference updated successfully');
      } catch (err) {
        console.error('[Backend] Error updating notifications preference:', err);
        // Continue execution to try updating other preferences
      }
    }

    if (dark_mode !== undefined) {
      console.log('[Backend] Updating dark mode preference:', dark_mode);
      try {
        await db.query(
          'INSERT INTO user_preferences (user_id, preference_key, preference_value) VALUES ($1, $2, $3) ' +
          'ON DUPLICATE KEY UPDATE preference_value = $3',
          [userId, 'dark_mode', dark_mode.toString()]
        );
        console.log('[Backend] Dark mode preference updated successfully');
      } catch (err) {
        console.error('[Backend] Error updating dark mode preference:', err);
        // Continue execution to return response
      }
    }

    const responseData = {
      message: 'Preferences updated successfully',
      preferences: {
        receive_notifications: receive_notifications !== undefined ? receive_notifications : undefined,
        dark_mode: dark_mode !== undefined ? dark_mode : undefined
      }
    };

    console.log('[Backend] Returning response:', responseData);
    res.status(200).json(responseData);
  } catch (error) {
    console.error('[Backend] Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Check if user already exists
    const [userCheck] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (userCheck.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, first_name, last_name]
    );

    const userId = result.insertId;

    // Get the inserted user
    const [newUser] = await db.query(
      'SELECT user_id, email, first_name, last_name FROM users WHERE user_id = ?',
      [userId]
    );

    // Create empty profile for the user
    await db.query(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userId]
    );

    // Generate JWT token
    const token = jwt.sign(
      { user_id: newUser[0].user_id, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: newUser[0].user_id,
        email: newUser[0].email,
        first_name: newUser[0].first_name,
        last_name: newUser[0].last_name
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const [userResult] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (userResult.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = userResult[0];

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;

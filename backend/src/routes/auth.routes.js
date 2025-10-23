import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }

  // Check if user exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (existingUser.rows.length > 0) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const result = await query(`
    INSERT INTO users (email, password_hash, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, created_at
  `, [email.toLowerCase(), passwordHash, firstName, lastName]);

  const user = result.rows[0];

  // Generate token
  const token = generateToken(user.id, user.email);

  logger.info(`New user registered: ${user.email}`);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token
    }
  });
}));

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  // Find user
  const result = await query(
    'SELECT * FROM users WHERE email = $1 AND is_active = true',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const user = result.rows[0];

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  await query(
    'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate token
  const token = generateToken(user.id, user.email);

  logger.info(`User logged in: ${user.email}`);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        lastLogin: user.last_login
      },
      token
    }
  });
}));

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires auth)
 */
router.post('/change-password', asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }

  if (newPassword.length < 8) {
    res.status(400);
    throw new Error('New password must be at least 8 characters');
  }

  // Get user
  const result = await query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  const user = result.rows[0];

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // Update password
  await query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [passwordHash, userId]
  );

  logger.info(`Password changed for user: ${req.user.email}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

export default router;

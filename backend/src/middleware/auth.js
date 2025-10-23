import jwt from 'jsonwebtoken';
import { asyncHandler } from './errorHandler.js';
import { logger } from '../utils/logger.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    logger.debug(`User authenticated: ${decoded.email}`);
    next();
  } catch (error) {
    logger.error('Token verification failed:', error.message);
    res.status(401);
    throw new Error('Not authorized, token failed');
  }
});

// Generate JWT token
export const generateToken = (userId, email) => {
  return jwt.sign(
    { id: userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

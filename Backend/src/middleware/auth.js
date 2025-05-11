// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { createLogger } = require('../utils/logger');
const User = require('../models/User');

const logger = createLogger('authMiddleware');

/**
 * Middleware to protect routes
 * Verifies JWT token and adds user to request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in different headers
    // 1. Check Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      logger.info('Token found in Authorization header');
    } 
    // 2. Check x-auth-token header (direct token)
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      logger.info('Token found in x-auth-token header');
    }
    // 3. Check cookie (if your app uses cookies)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      logger.info('Token found in cookie');
    }

    // Check if token exists
    if (!token) {
      logger.warn('No authentication token found in request');
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      logger.info(`Token verified for user: ${decoded.id}`);

      // Get user from database
      const user = await User.findById(decoded.id);

      // Check if user exists
      if (!user) {
        logger.warn(`User not found for token with ID: ${decoded.id}`);
        return res.status(401).json({
          status: 'error',
          message: 'User with this token no longer exists'
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      logger.error('JWT verification error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    next(error);
  }
};

/**
 * Middleware to restrict access to certain roles
 * @param {...string} roles - Roles allowed to access the route
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      logger.warn(`Access denied: Role '${req.user.role}' attempted to access restricted route`);
      return res.status(403).json({
        status: 'error',
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};
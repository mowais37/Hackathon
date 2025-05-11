// src/middleware/validate.js
const { validationResult } = require('express-validator');
const { createLogger } = require('../utils/logger');

const logger = createLogger('middleware:validate');

/**
 * Middleware to validate request using express-validator
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validate = (req, res, next) => {
  // Check for validation errors
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    logger.warn('Validation error:', {
      path: req.path,
      method: req.method,
      errors: errors.array()
    });
    
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Custom validator for JSON objects
 * @param {string} value - JSON string to validate
 * @param {Object} options - Validation options
 * @returns {boolean|string} - True if valid, error message if invalid
 */
const isValidJson = (value, { allowEmpty = false } = {}) => {
  if (!value && allowEmpty) return true;
  
  try {
    JSON.parse(value);
    return true;
  } catch (error) {
    return 'Invalid JSON format';
  }
};

/**
 * Custom validator for MongoDB ObjectIDs
 * @param {string} value - ID to validate
 * @returns {boolean|string} - True if valid, error message if invalid
 */
const isMongoId = (value) => {
  return /^[0-9a-fA-F]{24}$/.test(value) || 'Invalid MongoDB ObjectID format';
};

/**
 * Custom validator for URL/endpoint format
 * @param {string} value - URL to validate
 * @returns {boolean|string} - True if valid, error message if invalid
 */
const isValidEndpoint = (value) => {
  try {
    new URL(value);
    return true;
  } catch (error) {
    return 'Invalid URL format';
  }
};

/**
 * Custom validator for agent capabilities array
 * @param {Array} value - Capabilities array to validate
 * @returns {boolean|string} - True if valid, error message if invalid
 */
const isValidCapabilities = (value) => {
  if (!Array.isArray(value)) {
    return 'Capabilities must be an array';
  }
  
  if (value.some(item => typeof item !== 'string')) {
    return 'Capabilities must be an array of strings';
  }
  
  return true;
};

/**
 * Custom validator for tool parameters array
 * @param {Array} value - Parameters array to validate
 * @returns {boolean|string} - True if valid, error message if invalid
 */
const isValidParameters = (value) => {
  if (!Array.isArray(value)) {
    return 'Parameters must be an array';
  }
  
  for (const param of value) {
    if (!param.name || typeof param.name !== 'string') {
      return 'Each parameter must have a name property';
    }
    
    if (!param.type || !['string', 'number', 'boolean', 'object', 'array'].includes(param.type)) {
      return 'Each parameter must have a valid type property';
    }
    
    if (param.required !== undefined && typeof param.required !== 'boolean') {
      return 'Parameter required property must be a boolean';
    }
  }
  
  return true;
};

module.exports = {
  validate,
  isValidJson,
  isMongoId,
  isValidEndpoint,
  isValidCapabilities,
  isValidParameters
};
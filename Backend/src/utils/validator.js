// src/utils/validator.js
/**
 * Utility functions for data validation
 */

/**
 * Check if value is undefined or null
 * @param {*} value - Value to check
 * @returns {boolean} - True if value is undefined or null
 */
const isNil = (value) => {
    return value === undefined || value === null;
  };
  
  /**
   * Check if value is empty (empty string, array, or object)
   * @param {*} value - Value to check
   * @returns {boolean} - True if value is empty
   */
  const isEmpty = (value) => {
    if (isNil(value)) return true;
    
    if (typeof value === 'string') return value.trim() === '';
    
    if (Array.isArray(value)) return value.length === 0;
    
    if (typeof value === 'object') return Object.keys(value).length === 0;
    
    return false;
  };
  
  /**
   * Check if value is a valid email
   * @param {string} value - Email to check
   * @returns {boolean} - True if valid email
   */
  const isEmail = (value) => {
    if (typeof value !== 'string') return false;
    
    // Basic email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(value);
  };
  
  /**
   * Check if value is a valid URL
   * @param {string} value - URL to check
   * @returns {boolean} - True if valid URL
   */
  const isUrl = (value) => {
    if (typeof value !== 'string') return false;
    
    try {
      new URL(value);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Check if value is a valid MongoDB ObjectID
   * @param {string} value - ID to check
   * @returns {boolean} - True if valid ObjectID
   */
  const isObjectId = (value) => {
    if (typeof value !== 'string') return false;
    
    return /^[0-9a-fA-F]{24}$/.test(value);
  };
  
  /**
   * Check if value is a valid JSON string
   * @param {string} value - JSON string to check
   * @returns {boolean} - True if valid JSON
   */
  const isValidJson = (value) => {
    if (typeof value !== 'string') return false;
    
    try {
      JSON.parse(value);
      return true;
    } catch (error) {
      return false;
    }
  };
  
  /**
   * Check if object has all required properties
   * @param {Object} obj - Object to check
   * @param {Array} props - Required property names
   * @returns {boolean} - True if all properties exist
   */
  const hasRequiredProps = (obj, props) => {
    if (!obj || typeof obj !== 'object') return false;
    
    return props.every(prop => !isNil(obj[prop]));
  };
  
  /**
   * Validate object against schema
   * @param {Object} obj - Object to validate
   * @param {Object} schema - Validation schema
   * @returns {Object} - Validation result {isValid, errors}
   */
  const validateSchema = (obj, schema) => {
    const errors = {};
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = obj[field];
      
      // Check required
      if (rules.required && isNil(value)) {
        errors[field] = `${field} is required`;
        continue;
      }
      
      // Skip validation if not required and nil
      if (isNil(value)) continue;
      
      // Check type
      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} must be a ${rules.type}`;
        continue;
      }
      
      // Check min length
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${field} must be at least ${rules.minLength} characters`;
        continue;
      }
      
      // Check max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors[field] = `${field} cannot exceed ${rules.maxLength} characters`;
        continue;
      }
      
      // Check min value
      if (rules.min && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
        continue;
      }
      
      // Check max value
      if (rules.max && value > rules.max) {
        errors[field] = `${field} cannot exceed ${rules.max}`;
        continue;
      }
      
      // Check enum values
      if (rules.enum && !rules.enum.includes(value)) {
        errors[field] = `${field} must be one of: ${rules.enum.join(', ')}`;
        continue;
      }
      
      // Check regex pattern
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.message || `${field} has an invalid format`;
        continue;
      }
      
      // Check custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        const validationResult = rules.validator(value);
        if (validationResult !== true) {
          errors[field] = validationResult || `${field} is invalid`;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  module.exports = {
    isNil,
    isEmpty,
    isEmail,
    isUrl,
    isObjectId,
    isValidJson,
    hasRequiredProps,
    validateSchema
  };
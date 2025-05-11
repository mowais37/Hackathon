// src/utils/safeUtils.js

/**
 * Safely access a property that might be undefined
 * @param {Object} obj - The object to access
 * @param {string} path - The path to the property (e.g., 'user.profile.name')
 * @param {*} defaultValue - The default value to return if the property doesn't exist
 * @returns {*} - The property value or default value
 */
export const safeAccess = (obj, path, defaultValue = null) => {
    if (!obj || !path) return defaultValue;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      if (result === null || result === undefined || typeof result !== 'object') {
        return defaultValue;
      }
      result = result[key];
    }
    
    return result !== undefined ? result : defaultValue;
  };
  
  /**
   * Safely call toLowerCase() on a string that might be undefined
   * @param {string} str - The string to convert to lowercase
   * @param {string} defaultValue - The default value to return if str is not a string
   * @returns {string} - The lowercase string or default value
   */
  export const safeLowerCase = (str, defaultValue = '') => {
    if (typeof str !== 'string') return defaultValue;
    return str.toLowerCase();
  };
  
  /**
   * Check if a value is an array and has items
   * @param {Array} arr - The array to check
   * @returns {boolean} - True if the value is a non-empty array
   */
  export const isNonEmptyArray = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
  };
  
  /**
   * Ensure a value is an array
   * @param {*} value - The value to check
   * @returns {Array} - The value if it's an array, a new array containing the value if it's not null/undefined, or an empty array
   */
  export const ensureArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === null || value === undefined) return [];
    return [value];
  };
  
  /**
   * Truncate a string if it's longer than maxLength
   * @param {string} str - The string to truncate
   * @param {number} maxLength - Maximum string length
   * @param {string} suffix - What to add at the end of truncated string
   * @returns {string} - The truncated string or original if shorter than maxLength
   */
  export const truncate = (str, maxLength = 100, suffix = '...') => {
    if (typeof str !== 'string') return '';
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + suffix;
  };
  
  export default {
    safeAccess,
    safeLowerCase,
    isNonEmptyArray,
    ensureArray,
    truncate
  };
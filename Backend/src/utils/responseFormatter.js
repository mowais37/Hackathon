// src/utils/responseFormatter.js
/**
 * Format a success response
 * @param {Object|Array} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} - Formatted response object
 */
const formatSuccess = (data, message = 'Success', statusCode = 200) => {
    return {
      status: 'success',
      message,
      data,
      statusCode
    };
  };
  
  /**
   * Format an error response
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object|Array} errors - Detailed errors
   * @returns {Object} - Formatted error response object
   */
  const formatError = (message = 'An error occurred', statusCode = 500, errors = null) => {
    const errorResponse = {
      status: 'error',
      message,
      statusCode
    };
    
    if (errors) {
      errorResponse.errors = errors;
    }
    
    return errorResponse;
  };
  
  /**
   * Format a response with pagination
   * @param {Object|Array} data - Response data
   * @param {number} total - Total number of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {string} message - Success message
   * @returns {Object} - Formatted response with pagination
   */
  const formatPaginated = (data, total, page, limit, message = 'Success') => {
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return {
      status: 'success',
      message,
      data,
      pagination: {
        total,
        count: data.length,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    };
  };
  
  /**
   * Send a success response
   * @param {Object} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {string} message - Success message
   * @param {number} statusCode - HTTP status code
   */
  const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json(formatSuccess(data, message, statusCode));
  };
  
  /**
   * Send an error response
   * @param {Object} res - Express response object
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {Object|Array} errors - Detailed errors
   */
  const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
    res.status(statusCode).json(formatError(message, statusCode, errors));
  };
  
  /**
   * Send a paginated response
   * @param {Object} res - Express response object
   * @param {Object|Array} data - Response data
   * @param {number} total - Total number of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {string} message - Success message
   */
  const sendPaginated = (res, data, total, page, limit, message = 'Success') => {
    res.status(200).json(formatPaginated(data, total, page, limit, message));
  };
  
  module.exports = {
    formatSuccess,
    formatError,
    formatPaginated,
    sendSuccess,
    sendError,
    sendPaginated
  };
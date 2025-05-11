// src/services/logService.js
const Log = require('../models/Log');
const { createLogger } = require('../utils/logger');

const logger = createLogger('logService');

/**
 * Service for log-related operations
 */
class LogService {
  /**
   * Get logs with filtering and pagination
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - List of logs
   */
  async getLogs(filters = {}, options = {}) {
    try {
      const query = Log.find(filters);
      
      // Populate references
      query.populate([
        { path: 'agentId', select: 'name type' },
        { path: 'toolId', select: 'name type' },
        { path: 'userId', select: 'name email' }
      ]);
      
      // Apply pagination
      if (options.page && options.limit) {
        const page = parseInt(options.page, 10);
        const limit = parseInt(options.limit, 10);
        const skip = (page - 1) * limit;
        
        query.skip(skip).limit(limit);
      }
      
      // Apply sorting
      if (options.sort) {
        query.sort(options.sort);
      } else {
        query.sort('-timestamp');
      }
      
      // Apply field selection
      if (options.select) {
        query.select(options.select);
      }
      
      return await query;
    } catch (error) {
      logger.error('Error getting logs:', error);
      throw error;
    }
  }
  
  /**
   * Get a single log by ID
   * @param {string} id - Log ID
   * @returns {Promise<Object>} - Log document
   */
  async getLogById(id) {
    try {
      const log = await Log.findById(id).populate([
        { path: 'agentId', select: 'name type' },
        { path: 'toolId', select: 'name type' },
        { path: 'userId', select: 'name email' }
      ]);
      
      if (!log) {
        throw new Error(`Log with ID ${id} not found`);
      }
      
      return log;
    } catch (error) {
      logger.error(`Error getting log ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get logs for a specific agent
   * @param {string} agentId - Agent ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of logs
   */
  async getAgentLogs(agentId, options = {}) {
    try {
      const query = Log.find({ agentId });
      
      // Populate references
      query.populate([
        { path: 'agentId', select: 'name type' },
        { path: 'toolId', select: 'name type' },
        { path: 'userId', select: 'name email' }
      ]);
      
      // Apply sorting
      query.sort('-timestamp');
      
      // Apply limit
      if (options.limit) {
        query.limit(parseInt(options.limit, 10));
      }
      
      return await query;
    } catch (error) {
      logger.error(`Error getting logs for agent ${agentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get logs for a specific tool
   * @param {string} toolId - Tool ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} - List of logs
   */
  async getToolLogs(toolId, options = {}) {
    try {
      const query = Log.find({ toolId });
      
      // Populate references
      query.populate([
        { path: 'agentId', select: 'name type' },
        { path: 'toolId', select: 'name type' },
        { path: 'userId', select: 'name email' }
      ]);
      
      // Apply sorting
      query.sort('-timestamp');
      
      // Apply limit
      if (options.limit) {
        query.limit(parseInt(options.limit, 10));
      }
      
      return await query;
    } catch (error) {
      logger.error(`Error getting logs for tool ${toolId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new log entry
   * @param {Object} logData - Log data
   * @returns {Promise<Object>} - Created log
   */
  async createLog(logData) {
    try {
      const log = await Log.create(logData);
      return log;
    } catch (error) {
      logger.error('Error creating log:', error);
      throw error;
    }
  }
  
  /**
   * Update a log entry
   * @param {string} id - Log ID
   * @param {Object} logData - Updated log data
   * @returns {Promise<Object>} - Updated log
   */
  async updateLog(id, logData) {
    try {
      const log = await Log.findByIdAndUpdate(id, logData, {
        new: true,
        runValidators: true
      });
      
      if (!log) {
        throw new Error(`Log with ID ${id} not found`);
      }
      
      return log;
    } catch (error) {
      logger.error(`Error updating log ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a log entry
   * @param {string} id - Log ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteLog(id) {
    try {
      const log = await Log.findById(id);
      
      if (!log) {
        throw new Error(`Log with ID ${id} not found`);
      }
      
      await log.deleteOne();
      
      logger.info(`Log deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting log ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Clear all logs
   * @returns {Promise<Object>} - Deletion result
   */
  async clearLogs() {
    try {
      const result = await Log.deleteMany({});
      
      logger.info(`Cleared all logs (${result.deletedCount} items)`);
      return result;
    } catch (error) {
      logger.error('Error clearing logs:', error);
      throw error;
    }
  }
  
  /**
   * Count logs with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} - Count of logs
   */
  async countLogs(filters = {}) {
    try {
      return await Log.countDocuments(filters);
    } catch (error) {
      logger.error('Error counting logs:', error);
      throw error;
    }
  }
  
  /**
   * Get logs statistics
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} - Stats object
   */
  async getLogStats(filters = {}) {
    try {
      const pipeline = [
        { $match: filters },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failureCount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            avgDuration: { $avg: '$duration' }
          }
        }
      ];
      
      const stats = await Log.aggregate(pipeline);
      
      if (stats.length === 0) {
        return {
          total: 0,
          successCount: 0,
          failureCount: 0,
          successRate: 0,
          avgDuration: 0
        };
      }
      
      const result = stats[0];
      const successRate = result.total > 0 
        ? (result.successCount / result.total) * 100 
        : 0;
      
      return {
        total: result.total,
        successCount: result.successCount,
        failureCount: result.failureCount,
        successRate,
        avgDuration: result.avgDuration || 0
      };
    } catch (error) {
      logger.error('Error getting log stats:', error);
      throw error;
    }
  }
}

module.exports = new LogService();
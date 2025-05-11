// src/services/toolService.js
const Tool = require('../models/Tool');
const mcpServer = require('../mcp/server');
const { createLogger } = require('../utils/logger');

const logger = createLogger('toolService');

/**
 * Service for tool-related operations
 */
class ToolService {
  /**
   * Get all tools
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - List of tools
   */
  async getTools(filters = {}, options = {}) {
    try {
      const query = Tool.find(filters);
      
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
        query.sort('-createdAt');
      }
      
      // Apply field selection
      if (options.select) {
        query.select(options.select);
      }
      
      return await query;
    } catch (error) {
      logger.error('Error getting tools:', error);
      throw error;
    }
  }
  
  /**
   * Get tool by ID
   * @param {string} id - Tool ID
   * @returns {Promise<Object>} - Tool document
   */
  async getToolById(id) {
    try {
      const tool = await Tool.findById(id);
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      return tool;
    } catch (error) {
      logger.error(`Error getting tool ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new tool
   * @param {Object} toolData - Tool data
   * @returns {Promise<Object>} - Created tool
   */
  async createTool(toolData) {
    try {
      const tool = await Tool.create(toolData);
      logger.info(`Tool created: ${tool._id}`);
      return tool;
    } catch (error) {
      logger.error('Error creating tool:', error);
      throw error;
    }
  }
  
  /**
   * Update a tool
   * @param {string} id - Tool ID
   * @param {Object} toolData - Updated tool data
   * @returns {Promise<Object>} - Updated tool
   */
  async updateTool(id, toolData) {
    try {
      const tool = await Tool.findByIdAndUpdate(id, toolData, {
        new: true,
        runValidators: true
      });
      
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      
      // If tool is active, update it in MCP server
      if (tool.isActive) {
        // Deregister first to ensure clean state
        mcpServer.deregisterTool(id);
        
        // Register with updated config
        await this.loadAndRegisterTool(tool);
      }
      
      logger.info(`Tool updated: ${id}`);
      return tool;
    } catch (error) {
      logger.error(`Error updating tool ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a tool
   * @param {string} id - Tool ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteTool(id) {
    try {
      const tool = await Tool.findById(id);
      
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      
      // Deregister from MCP server first
      mcpServer.deregisterTool(id);
      
      // Remove from database
      await tool.deleteOne();
      
      logger.info(`Tool deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting tool ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Register (activate) a tool
   * @param {string} id - Tool ID
   * @returns {Promise<Object>} - Updated tool
   */
  async registerTool(id) {
    try {
      const tool = await Tool.findById(id);
      
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      
      // Register tool in MCP server
      const success = await this.loadAndRegisterTool(tool);
      
      if (!success) {
        throw new Error(`Failed to register tool ${id} in MCP server`);
      }
      
      // Update tool status
      tool.isActive = true;
      await tool.save();
      
      logger.info(`Tool registered: ${id}`);
      return tool;
    } catch (error) {
      logger.error(`Error registering tool ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Deregister (deactivate) a tool
   * @param {string} id - Tool ID
   * @returns {Promise<Object>} - Updated tool
   */
  async deregisterTool(id) {
    try {
      const tool = await Tool.findById(id);
      
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      
      // Deregister tool from MCP server
      const success = mcpServer.deregisterTool(id);
      
      if (!success) {
        throw new Error(`Failed to deregister tool ${id} from MCP server`);
      }
      
      // Update tool status
      tool.isActive = false;
      await tool.save();
      
      logger.info(`Tool deregistered: ${id}`);
      return tool;
    } catch (error) {
      logger.error(`Error deregistering tool ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Execute a tool action
   * @param {string} id - Tool ID
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - Action result
   */
  async executeTool(id, action, params = {}, userId) {
    try {
      // Check if tool exists and is active
      const tool = await Tool.findById(id);
      
      if (!tool) {
        throw new Error(`Tool with ID ${id} not found`);
      }
      
      if (!tool.isActive) {
        throw new Error(`Tool ${id} is not active`);
      }
      
      // Execute tool action using MCP server
      const result = await mcpServer.executeTool(id, action, params, userId);
      
      logger.info(`Tool ${id} executed action: ${action}`);
      return result;
    } catch (error) {
      logger.error(`Error executing tool ${id} action ${action}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to load tool implementation and register it
   * @param {Object} toolDoc - Tool document from database
   * @returns {Promise<boolean>} - Success status
   */
  async loadAndRegisterTool(toolDoc) {
    try {
      // Get tool type
      const toolType = toolDoc.type;
      
      // Try to load tool class
      let ToolClass;
      try {
        ToolClass = require(`../mcp/tools/${toolType}Tool`);
      } catch (error) {
        logger.warn(`Tool type ${toolType} not found, using base tool`);
        ToolClass = require('../mcp/tools/baseTool');
      }
      
      // Create tool instance
      const tool = new ToolClass(toolDoc.name, {
        ...toolDoc.toObject(),
        description: toolDoc.description,
        endpoint: toolDoc.endpoint,
        authType: toolDoc.authType,
        authConfig: toolDoc.authConfig
      });
      
      // Register tool
      mcpServer.registerTool(toolDoc._id.toString(), tool);
      
      return true;
    } catch (error) {
      logger.error(`Failed to load and register tool ${toolDoc.name}:`, error);
      return false;
    }
  }
  
  /**
   * Count tools with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} - Count of tools
   */
  async countTools(filters = {}) {
    try {
      return await Tool.countDocuments(filters);
    } catch (error) {
      logger.error('Error counting tools:', error);
      throw error;
    }
  }
}

module.exports = new ToolService();
// src/services/agentService.js
const Agent = require('../models/Agent');
const mcpServer = require('../mcp/server');
const { createLogger } = require('../utils/logger');

const logger = createLogger('agentService');

/**
 * Service for agent-related operations
 */
class AgentService {
  /**
   * Get all agents
   * @param {Object} filters - Query filters
   * @param {Object} options - Query options (pagination, sorting)
   * @returns {Promise<Array>} - List of agents
   */
  async getAgents(filters = {}, options = {}) {
    try {
      const query = Agent.find(filters);
      
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
      logger.error('Error getting agents:', error);
      throw error;
    }
  }
  
  /**
   * Get agent by ID
   * @param {string} id - Agent ID
   * @returns {Promise<Object>} - Agent document
   */
  async getAgentById(id) {
    try {
      const agent = await Agent.findById(id);
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      return agent;
    } catch (error) {
      logger.error(`Error getting agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new agent
   * @param {Object} agentData - Agent data
   * @returns {Promise<Object>} - Created agent
   */
  async createAgent(agentData) {
    try {
      const agent = await Agent.create(agentData);
      logger.info(`Agent created: ${agent._id}`);
      return agent;
    } catch (error) {
      logger.error('Error creating agent:', error);
      throw error;
    }
  }
  
  /**
   * Update an agent
   * @param {string} id - Agent ID
   * @param {Object} agentData - Updated agent data
   * @returns {Promise<Object>} - Updated agent
   */
  async updateAgent(id, agentData) {
    try {
      const agent = await Agent.findByIdAndUpdate(id, agentData, {
        new: true,
        runValidators: true
      });
      
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      
      // If agent is active, update it in MCP server
      if (agent.isActive) {
        // Deregister first to ensure clean state
        mcpServer.deregisterAgent(id);
        
        // Register with updated config
        await mcpServer.registerAgentFromDocument(agent);
      }
      
      logger.info(`Agent updated: ${id}`);
      return agent;
    } catch (error) {
      logger.error(`Error updating agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an agent
   * @param {string} id - Agent ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteAgent(id) {
    try {
      const agent = await Agent.findById(id);
      
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      
      // Deregister from MCP server first
      mcpServer.deregisterAgent(id);
      
      // Remove from database
      await agent.deleteOne();
      
      logger.info(`Agent deleted: ${id}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Register (activate) an agent
   * @param {string} id - Agent ID
   * @returns {Promise<Object>} - Updated agent
   */
  async registerAgent(id) {
    try {
      const agent = await Agent.findById(id);
      
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      
      // Register agent in MCP server
      const success = await mcpServer.registerAgentFromDocument(agent);
      
      if (!success) {
        throw new Error(`Failed to register agent ${id} in MCP server`);
      }
      
      // Update agent status
      agent.isActive = true;
      await agent.save();
      
      logger.info(`Agent registered: ${id}`);
      return agent;
    } catch (error) {
      logger.error(`Error registering agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Deregister (deactivate) an agent
   * @param {string} id - Agent ID
   * @returns {Promise<Object>} - Updated agent
   */
  async deregisterAgent(id) {
    try {
      const agent = await Agent.findById(id);
      
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      
      // Deregister agent from MCP server
      const success = mcpServer.deregisterAgent(id);
      
      if (!success) {
        throw new Error(`Failed to deregister agent ${id} from MCP server`);
      }
      
      // Update agent status
      agent.isActive = false;
      await agent.save();
      
      logger.info(`Agent deregistered: ${id}`);
      return agent;
    } catch (error) {
      logger.error(`Error deregistering agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Process a query with an agent
   * @param {string} id - Agent ID
   * @param {string} userId - User ID
   * @param {string} query - Query text
   * @param {Object} toolParams - Tool parameters
   * @returns {Promise<Object>} - Query result
   */
  async processQuery(id, userId, query, toolParams = {}) {
    try {
      // Check if agent exists and is active
      const agent = await Agent.findById(id);
      
      if (!agent) {
        throw new Error(`Agent with ID ${id} not found`);
      }
      
      if (!agent.isActive) {
        throw new Error(`Agent ${id} is not active`);
      }
      
      // Process query using MCP server
      const result = await mcpServer.processQuery(id, userId, query, toolParams);
      
      logger.info(`Query processed by agent ${id}: ${query.substring(0, 50)}...`);
      return result;
    } catch (error) {
      logger.error(`Error processing query with agent ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Count agents with filters
   * @param {Object} filters - Query filters
   * @returns {Promise<number>} - Count of agents
   */
  async countAgents(filters = {}) {
    try {
      return await Agent.countDocuments(filters);
    } catch (error) {
      logger.error('Error counting agents:', error);
      throw error;
    }
  }
}

module.exports = new AgentService();
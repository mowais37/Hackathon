// src/mcp/tools/slackTool.js
const { WebClient } = require('@slack/web-api');
const BaseTool = require('./baseTool');
const { createLogger } = require('../../utils/logger');

class SlackTool extends BaseTool {
  constructor(name, config) {
    super(name, config);
    
    this.logger = createLogger(`Tool:${name}`);
    
    // Initialize Slack client
    this.slackToken = config.authConfig?.token || process.env.SLACK_BOT_TOKEN;
    this.client = new WebClient(this.slackToken);
    
    // Default channel for messages
    this.defaultChannel = config.defaultChannel || 'general';
    
    this.logger.info(`Slack tool initialized with token: ${this.slackToken ? '✓' : '✗'}`);
  }

  /**
   * Get available actions for this tool
   * @returns {Array} - Array of action objects
   */
  getAvailableActions() {
    return [
      {
        name: 'info',
        description: 'Get information about this tool',
        parameters: {}
      },
      {
        name: 'sendMessage',
        description: 'Send a message to a Slack channel',
        parameters: {
          channel: {
            type: 'string',
            description: 'Channel name or ID',
            required: true
          },
          text: {
            type: 'string',
            description: 'Message text',
            required: true
          },
          blocks: {
            type: 'array',
            description: 'Message blocks (formatted content)',
            required: false
          }
        }
      },
      {
        name: 'getChannels',
        description: 'List all accessible channels',
        parameters: {
          limit: {
            type: 'number',
            description: 'Maximum number of channels to return',
            required: false
          }
        }
      },
      {
        name: 'getChannelHistory',
        description: 'Get message history for a channel',
        parameters: {
          channel: {
            type: 'string',
            description: 'Channel name or ID',
            required: true
          },
          limit: {
            type: 'number',
            description: 'Maximum number of messages to return',
            required: false
          }
        }
      },
      {
        name: 'findUser',
        description: 'Find a user by email or name',
        parameters: {
          query: {
            type: 'string',
            description: 'Email or display name to search for',
            required: true
          }
        }
      },
      {
        name: 'createChannel',
        description: 'Create a new Slack channel',
        parameters: {
          name: {
            type: 'string',
            description: 'Channel name',
            required: true
          },
          isPrivate: {
            type: 'boolean',
            description: 'Whether the channel should be private',
            required: false
          },
          description: {
            type: 'string',
            description: 'Channel description',
            required: false
          }
        }
      }
    ];
  }

  /**
   * Execute a tool action
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Result of the action
   */
  async execute(action, params = {}) {
    // Find the action
    const actionObj = this.actions.find(a => a.name === action);
    if (!actionObj) {
      throw new Error(`Action '${action}' not found for Slack tool`);
    }
    
    // Validate parameters
    this.validateParams(action, params, actionObj.parameters);
    
    // Execute appropriate method based on action
    switch (action) {
      case 'info':
        return this.getInfo();
      case 'sendMessage':
        return this.sendMessage(params);
      case 'getChannels':
        return this.getChannels(params);
      case 'getChannelHistory':
        return this.getChannelHistory(params);
      case 'findUser':
        return this.findUser(params);
      case 'createChannel':
        return this.createChannel(params);
      default:
        throw new Error(`Action '${action}' not implemented for Slack tool`);
    }
  }

  /**
   * Send a message to a Slack channel
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Message result
   */
  async sendMessage(params) {
    try {
      const { channel = this.defaultChannel, text, blocks } = params;
      
      const messageParams = {
        channel,
        text
      };
      
      // Add blocks if provided
      if (blocks) {
        messageParams.blocks = blocks;
      }
      
      const result = await this.client.chat.postMessage(messageParams);
      
      return {
        success: true,
        data: {
          channel: result.channel,
          ts: result.ts,
          message: {
            text: result.message.text
          }
        }
      };
    } catch (error) {
      this.logger.error('Error sending Slack message:', error);
      throw new Error(`Failed to send Slack message: ${error.message}`);
    }
  }

  /**
   * Get a list of Slack channels
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Channels list
   */
  async getChannels(params) {
    try {
      const { limit = 100 } = params;
      
      // Get public channels
      const result = await this.client.conversations.list({
        limit,
        exclude_archived: true
      });
      
      return {
        success: true,
        data: result.channels.map(channel => ({
          id: channel.id,
          name: channel.name,
          isPrivate: channel.is_private,
          numMembers: channel.num_members,
          topic: channel.topic.value,
          purpose: channel.purpose.value
        }))
      };
    } catch (error) {
      this.logger.error('Error getting Slack channels:', error);
      throw new Error(`Failed to get Slack channels: ${error.message}`);
    }
  }

  /**
   * Get message history for a channel
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - Channel history
   */
  async getChannelHistory(params) {
    try {
      const { channel, limit = 20 } = params;
      
      const result = await this.client.conversations.history({
        channel,
        limit
      });
      
      return {
        success: true,
        data: {
          messages: result.messages.map(msg => ({
            text: msg.text,
            user: msg.user,
            ts: msg.ts,
            threadReplies: msg.reply_count || 0,
            reactions: msg.reactions || []
          })),
          hasMore: result.has_more
        }
      };
    } catch (error) {
      this.logger.error('Error getting channel history:', error);
      throw new Error(`Failed to get channel history: ${error.message}`);
    }
  }

  /**
   * Find a user by email or name
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - User search results
   */
  async findUser(params) {
    try {
      const { query } = params;
      
      // Try to find by email first
      let user;
      if (query.includes('@')) {
        try {
          const result = await this.client.users.lookupByEmail({
            email: query
          });
          user = result.user;
        } catch (error) {
          // Email not found, continue to search by name
          this.logger.info(`User not found by email '${query}', trying name search`);
        }
      }
      
      // If not found by email, search by name
      if (!user) {
        const result = await this.client.users.list();
        user = result.members.find(member => 
          member.name.toLowerCase().includes(query.toLowerCase()) || 
          (member.profile.real_name && member.profile.real_name.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      if (!user) {
        return {
          success: false,
          data: {
            message: `No user found matching '${query}'`
          }
        };
      }
      
      return {
        success: true,
        data: {
          id: user.id,
          name: user.name,
          realName: user.profile.real_name,
          email: user.profile.email,
          avatar: user.profile.image_72,
          isBot: user.is_bot
        }
      };
    } catch (error) {
      this.logger.error('Error finding Slack user:', error);
      throw new Error(`Failed to find Slack user: ${error.message}`);
    }
  }

  /**
   * Create a new Slack channel
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} - New channel result
   */
  async createChannel(params) {
    try {
      const { name, isPrivate = false, description = '' } = params;
      
      // Slack channel names must be lowercase, without spaces/periods, and shorter than 80 chars
      const formattedName = name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').substring(0, 79);
      
      const result = await this.client.conversations.create({
        name: formattedName,
        is_private: isPrivate
      });
      
      // Set channel topic/description if provided
      if (description) {
        await this.client.conversations.setTopic({
          channel: result.channel.id,
          topic: description
        });
      }
      
      return {
        success: true,
        data: {
          id: result.channel.id,
          name: result.channel.name,
          isPrivate: result.channel.is_private,
          creator: result.channel.creator
        }
      };
    } catch (error) {
      this.logger.error('Error creating Slack channel:', error);
      throw new Error(`Failed to create Slack channel: ${error.message}`);
    }
  }
}

module.exports = SlackTool;
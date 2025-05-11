// src/mcp/agents/slackAgent.js
const { WebClient } = require('@slack/web-api');
const BaseAgent = require('./baseAgent');

class SlackAgent extends BaseAgent {
  constructor(name, config) {
    super(name, config);
    
    // Initialize Slack client
    this.slackToken = config.slackToken || process.env.SLACK_BOT_TOKEN;
    this.client = new WebClient(this.slackToken);
    
    // Default channel for messages
    this.defaultChannel = config.defaultChannel || 'general';
    
    this.logger.info(`Slack agent initialized for default channel: ${this.defaultChannel}`);
  }

  /**
   * Override generate completion to add Slack-specific context
   */
  async generateCompletion(query, toolParams = {}) {
    try {
      // Get Slack context
      const slackContext = await this.getSlackContext();
      
      // Get available tools as context
      const toolsContext = this.getToolsContext();
      
      // Construct the prompt with Slack context
      const prompt = `
      You are ${this.name}, a Slack assistant that helps users manage communication, channels, and messages.
      
      Slack context:
      ${slackContext}
      
      Available tools:
      ${toolsContext}
      
      User query: ${query}
      
      Instructions:
      1. Analyze the Slack-related query
      2. Use Slack information to provide a helpful response
      3. If tools are needed, include [TOOL_ACTION:tool_name:action:parameters] in your response
      4. Provide a helpful and informative response about Slack
      
      Your response:
      `;
      
      // Call Groq API with Slack-specific prompt
      const completion = await this.groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama3-70b-8192',
        temperature: 0.3,
        max_tokens: 1024
      });
      
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Error generating Slack completion', error);
      throw new Error(`Failed to generate Slack response: ${error.message}`);
    }
  }

  /**
   * Get Slack context information
   */
  async getSlackContext() {
    try {
      let context = "Slack Information:\n";
      
      // Get channels
      try {
        const channelsResult = await this.client.conversations.list({
          limit: 10,
          exclude_archived: true
        });
        
        context += `\nChannels (${channelsResult.channels.length}):\n`;
        channelsResult.channels.forEach(channel => {
          context += `- #${channel.name}${channel.is_private ? ' (private)' : ''}\n`;
        });
      } catch (error) {
        context += "\nCouldn't retrieve channels.\n";
      }
      
      // Get recent messages from default channel
      try {
        const historyResult = await this.client.conversations.history({
          channel: this.defaultChannel,
          limit: 5
        });
        
        context += `\nRecent messages in #${this.defaultChannel} (${historyResult.messages.length}):\n`;
        historyResult.messages.forEach(msg => {
          context += `- ${msg.text.substring(0, 50)}${msg.text.length > 50 ? '...' : ''}\n`;
        });
      } catch (error) {
        context += `\nCouldn't retrieve messages from #${this.defaultChannel}.\n`;
      }
      
      return context;
    } catch (error) {
      this.logger.error('Error getting Slack context', error);
      return 'Failed to get Slack context.';
    }
  }

  /**
   * Send a message to a Slack channel
   */
  async sendMessage(channel, text, blocks = null) {
    try {
      const messageParams = {
        channel,
        text
      };
      
      // Add blocks if provided
      if (blocks) {
        messageParams.blocks = blocks;
      }
      
      const result = await this.client.chat.postMessage(messageParams);
      
      this.logger.info(`Message sent to channel ${channel}`);
      return result;
    } catch (error) {
      this.logger.error(`Error sending message to channel ${channel}`, error);
      throw error;
    }
  }

  /**
   * Process a query specifically for Slack operations
   */
  async processSlackQuery(query) {
    // Common Slack-related patterns
    const sendMessagePattern = /send (?:a )?message to (?:channel )?(?:#)?(\w+) saying (.+)/i;
    const getChannelInfoPattern = /(?:get|show|tell me about) (?:channel|conversation) (?:#)?(\w+)/i;
    const createChannelPattern = /create (?:a )?(?:new )?channel (?:called )?(?:#)?(\w+)/i;
    
    let result = null;
    
    // Check for send message pattern
    const sendMessageMatch = query.match(sendMessagePattern);
    if (sendMessageMatch) {
      const channel = sendMessageMatch[1];
      const message = sendMessageMatch[2];
      
      result = await this.sendMessage(channel, message);
      return `Message sent to #${channel}: "${message}"`;
    }
    
    // Check for channel info pattern
    const channelInfoMatch = query.match(getChannelInfoPattern);
    if (channelInfoMatch) {
      const channel = channelInfoMatch[1];
      
      // Get channel info and history
      try {
        const channelInfo = await this.client.conversations.info({
          channel
        });
        
        const history = await this.client.conversations.history({
          channel,
          limit: 5
        });
        
        return `Channel #${channelInfo.channel.name} has ${channelInfo.channel.num_members} members. Recent messages: ${history.messages.length} in the last ${history.messages.length > 0 ? 'period' : 'day'}.`;
      } catch (error) {
        throw new Error(`Couldn't get information for channel #${channel}: ${error.message}`);
      }
    }
    
    // Check for create channel pattern
    const createChannelMatch = query.match(createChannelPattern);
    if (createChannelMatch) {
      const channelName = createChannelMatch[1].toLowerCase();
      
      try {
        const result = await this.client.conversations.create({
          name: channelName
        });
        
        return `Channel #${result.channel.name} has been created successfully!`;
      } catch (error) {
        throw new Error(`Failed to create channel #${channelName}: ${error.message}`);
      }
    }
    
    // If no pattern matches, use the LLM
    return null;
  }

  /**
   * Override process query to handle Slack-specific logic first
   */
  async processQuery(query, toolParams = {}) {
    try {
      this.logger.info(`Processing Slack query: ${query}`);
      
      // First, try to handle common Slack patterns directly
      const directResult = await this.processSlackQuery(query);
      if (directResult) {
        return {
          response: directResult,
          toolResults: {}
        };
      }
      
      // If no direct handling, use the standard LLM approach
      return await super.processQuery(query, toolParams);
    } catch (error) {
      this.logger.error('Error processing Slack query', error);
      throw error;
    }
  }
}

module.exports = SlackAgent;
// src/config/groq.js
const { createLogger } = require('../utils/logger');

const logger = createLogger('config:groq');

/**
 * Groq LLM configuration
 */
const groqConfig = {
  // Default model to use for completions
  defaultModel: 'llama3-70b-8192',
  
  // Alternative models that can be used
  availableModels: [
    'llama3-70b-8192',  // High capability model
    'llama3-8b-8192',   // Faster, more efficient model
  ],
  
  // Default parameters for completions
  defaultParams: {
    temperature: 0.5,
    max_tokens: 1024,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0
  },
  
  // Task-specific optimized parameters
  taskParams: {
    // Parameters optimized for creative text generation
    creative: {
      temperature: 0.8,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0.6,
      presence_penalty: 0.6
    },
    
    // Parameters optimized for factual responses
    factual: {
      temperature: 0.2,
      max_tokens: 1024,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    
    // Parameters optimized for code generation
    code: {
      temperature: 0.2,
      max_tokens: 2048,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    },
    
    // Parameters optimized for summarization
    summary: {
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.95,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    }
  },
  
  // System prompts for different agent types
  systemPrompts: {
    github: 'You are a GitHub assistant that helps users manage repositories, pull requests, and issues. You can summarize code, explain changes, and provide helpful insights about GitHub activities.',
    slack: 'You are a Slack assistant that helps users manage communication, channels, and messages. You can send messages, create channels, and facilitate team collaboration.',
    jira: 'You are a Jira assistant that helps users manage projects, tickets, and workflows. You can create, update, and search for issues, as well as provide project status updates.',
    shopify: 'You are a Shopify assistant that helps users manage their online store, products, and orders. You can update inventory, process orders, and provide sales analytics.',
    custom: 'You are a helpful AI assistant that can use tools to accomplish tasks. You provide concise, accurate responses and can use various APIs to fulfill user requests.'
  },
  
  /**
   * Get parameters for a specific task
   * @param {string} task - Task type
   * @returns {Object} - Parameters for the task
   */
  getParamsForTask(task) {
    return this.taskParams[task] || this.defaultParams;
  },
  
  /**
   * Get system prompt for an agent type
   * @param {string} agentType - Agent type
   * @returns {string} - System prompt
   */
  getSystemPrompt(agentType) {
    return this.systemPrompts[agentType] || this.systemPrompts.custom;
  }
};

// Log configuration
logger.info(`Groq config initialized with default model: ${groqConfig.defaultModel}`);

module.exports = groqConfig;
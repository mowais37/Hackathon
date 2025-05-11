// src/config/env.js
const dotenv = require('dotenv');
const { createLogger } = require('../utils/logger');

const logger = createLogger('config:env');

// Load environment variables from .env file
dotenv.config();

/**
 * Check if required environment variables are set
 * @param {Array} requiredVars - List of required variable names
 */
const checkRequiredVars = (requiredVars) => {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(message);
    throw new Error(message);
  }
};

// Define required environment variables
const requiredVars = [
  'PORT',
  'NODE_ENV',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRE',
  'GROQ_API_KEY'
];

// Check required variables on startup
try {
  checkRequiredVars(requiredVars);
  logger.info('Environment variables validated successfully');
} catch (error) {
  // Log error but don't exit - allow application to decide how to handle
  logger.error('Environment validation failed');
}

// Export environment variables with defaults
module.exports = {
  // Server config
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // MongoDB config
  MONGODB_URI: process.env.MONGODB_URI,
  
  // JWT config
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // Groq API config
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  
  // CORS config
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // Tool API keys and configs
  GITHUB_API_TOKEN: process.env.GITHUB_API_TOKEN,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  JIRA_HOST: process.env.JIRA_HOST,
  JIRA_USERNAME: process.env.JIRA_USERNAME,
  JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
  SHOPIFY_SHOP_NAME: process.env.SHOPIFY_SHOP_NAME,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY,
  SHOPIFY_PASSWORD: process.env.SHOPIFY_PASSWORD,
  SPEECH_API_KEY: process.env.SPEECH_API_KEY,
  
  // Check if running in production
  isProd: process.env.NODE_ENV === 'production',
  
  // Check if running in development
  isDev: process.env.NODE_ENV === 'development',
  
  // Check if running in test
  isTest: process.env.NODE_ENV === 'test'
};
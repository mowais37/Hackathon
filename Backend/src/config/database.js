// src/config/database.js
const mongoose = require('mongoose');
const { createLogger } = require('../utils/logger');

const logger = createLogger('database');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increase timeout to 15 seconds
      connectTimeoutMS: 15000,
      socketTimeoutMS: 30000
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};
module.exports = connectDB;
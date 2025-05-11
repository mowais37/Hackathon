// src/services/authService.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { createLogger } = require('../utils/logger');

const logger = createLogger('authService');

/**
 * Service for authentication-related operations
 */
class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - User object and token
   */
  async register(userData) {
    try {
      const { name, email, password } = userData;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      // Create user
      const user = await User.create({
        name,
        email,
        password
      });
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      logger.info(`User registered: ${user._id}`);
      
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }
  
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - User object and token
   */
  async login(email, password) {
    try {
      // Check if user exists
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }
      
      // Generate JWT token
      const token = this.generateToken(user);
      
      logger.info(`User logged in: ${user._id}`);
      
      return {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      };
    } catch (error) {
      logger.error('Error logging in user:', error);
      throw error;
    }
  }
  
  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Promise<Object>} - User object
   */
  async getUserById(id) {
    try {
      const user = await User.findById(id);
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    } catch (error) {
      logger.error(`Error getting user ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update user details
   * @param {string} id - User ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated user
   */
  async updateUserDetails(id, updateData) {
    try {
      // Create update object with only allowed fields
      const updateFields = {};
      if (updateData.name) updateFields.name = updateData.name;
      if (updateData.email) updateFields.email = updateData.email;
      if (updateData.preferences) {
        updateFields.preferences = updateData.preferences;
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        id,
        updateFields,
        {
          new: true,
          runValidators: true
        }
      );
      
      if (!user) {
        throw new Error('User not found');
      }
      
      logger.info(`User details updated: ${id}`);
      
      return user;
    } catch (error) {
      logger.error(`Error updating user ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Update user password
   * @param {string} id - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<string>} - New token
   */
  async updatePassword(id, currentPassword, newPassword) {
    try {
      // Get user with password
      const user = await User.findById(id).select('+password');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      // Check current password
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        throw new Error('Current password is incorrect');
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      // Generate new token
      const token = this.generateToken(user);
      
      logger.info(`Password updated for user: ${id}`);
      
      return token;
    } catch (error) {
      logger.error(`Error updating password for user ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Generate JWT token
   * @param {Object} user - User object
   * @returns {string} - JWT token
   */
  generateToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
  
  /**
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} - Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      logger.error('Error verifying token:', error);
      throw new Error('Invalid token');
    }
  }
  
  /**
   * Check if user has required role
   * @param {Object} user - User object
   * @param {Array|string} roles - Required roles
   * @returns {boolean} - Has required role
   */
  hasRole(user, roles) {
    if (!user || !user.role) {
      return false;
    }
    
    // Convert single role to array
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    return requiredRoles.includes(user.role);
  }
}

module.exports = new AuthService();
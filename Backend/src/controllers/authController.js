// src/controllers/authController.js
const { validationResult } = require("express-validator");
const User = require("../models/User");
const { createLogger } = require("../utils/logger");
const { sendSuccess, sendError } = require("../utils/responseFormatter");

const logger = createLogger("authController");

/**
 * @desc    Register user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation errors", 400, errors.array());
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return sendError(res, "User already exists", 400);
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
    });

    // Generate JWT token
    const token = user.getSignedJwtToken();

    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "User registered successfully",
      201
    );
  } catch (error) {
    logger.error("Registration error:", error);
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation errors", 400, errors.array());
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, "Invalid credentials", 401);
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();
    console.log("Generated token:", token);
    // localStorage.setItem("token", token);
    sendSuccess(
      res,
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      "Login successful"
    );
  } catch (error) {
    logger.error("Login error:", error);
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    // User is already available in req due to protect middleware
    sendSuccess(
      res,
      {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt,
      },
      "User data retrieved successfully"
    );
  } catch (error) {
    logger.error("Error getting user profile:", error);
    next(error);
  }
};

/**
 * @desc    Update user details
 * @route   PUT /api/auth/updatedetails
 * @access  Private
 */
exports.updateDetails = async (req, res, next) => {
  try {
    const { name, email, preferences } = req.body;

    // Create update object with only provided fields
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (preferences)
      updateFields.preferences = { ...req.user.preferences, ...preferences };

    // Update user
    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    sendSuccess(
      res,
      {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        preferences: user.preferences,
      },
      "User details updated"
    );
  } catch (error) {
    logger.error("Error updating user details:", error);
    next(error);
  }
};

/**
 * @desc    Update password
 * @route   PUT /api/auth/updatepassword
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, "Validation errors", 400, errors.array());
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, "Current password is incorrect", 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new token
    const token = user.getSignedJwtToken();

    sendSuccess(res, { token }, "Password updated successfully");
  } catch (error) {
    logger.error("Error updating password:", error);
    next(error);
  }
};

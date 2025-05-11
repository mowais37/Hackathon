// src/services/socketService.js
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { createLogger } = require('../utils/logger');

const logger = createLogger('socketService');

/**
 * Service for handling socket.io connections and events
 */
class SocketService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket IDs
    this.agentRooms = new Map(); // agentId -> Set of socket IDs
    
    logger.info('Socket service created');
  }
  
  /**
   * Initialize socket.io server
   * @param {Object} server - HTTP server instance
   */
  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });
    
    this.io.use(this.authenticateSocket);
    this.setupEventHandlers();
    
    logger.info('Socket.io server initialized');
  }
  
  /**
   * Socket authentication middleware
   * @param {Object} socket - Socket connection
   * @param {Function} next - Next function
   */
  authenticateSocket = async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user data to socket
      socket.user = {
        id: decoded.id,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  };
  
  /**
   * Set up socket event handlers
   */
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`New socket connection: ${socket.id}, User: ${socket.user.id}`);
      
      // Register user socket
      this.registerUserSocket(socket.user.id, socket.id);
      
      // Join agent room
      socket.on('join', ({ agentId }) => {
        this.joinAgentRoom(agentId, socket.id);
        logger.info(`Socket ${socket.id} joined agent room: ${agentId}`);
      });
      
      // Leave agent room
      socket.on('leave', ({ agentId }) => {
        this.leaveAgentRoom(agentId, socket.id);
        logger.info(`Socket ${socket.id} left agent room: ${agentId}`);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        this.handleDisconnection(socket.id, socket.user.id);
        logger.info(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  
  /**
   * Register a user's socket
   * @param {string} userId - User ID
   * @param {string} socketId - Socket ID
   */
  registerUserSocket(userId, socketId) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    
    this.userSockets.get(userId).add(socketId);
  }
  
  /**
   * Join an agent room
   * @param {string} agentId - Agent ID
   * @param {string} socketId - Socket ID
   */
  joinAgentRoom(agentId, socketId) {
    if (!this.agentRooms.has(agentId)) {
      this.agentRooms.set(agentId, new Set());
    }
    
    this.agentRooms.get(agentId).add(socketId);
    
    // Join socket.io room
    this.io.sockets.sockets.get(socketId)?.join(`agent:${agentId}`);
  }
  
  /**
   * Leave an agent room
   * @param {string} agentId - Agent ID
   * @param {string} socketId - Socket ID
   */
  leaveAgentRoom(agentId, socketId) {
    if (this.agentRooms.has(agentId)) {
      this.agentRooms.get(agentId).delete(socketId);
      
      // Clean up empty rooms
      if (this.agentRooms.get(agentId).size === 0) {
        this.agentRooms.delete(agentId);
      }
    }
    
    // Leave socket.io room
    this.io.sockets.sockets.get(socketId)?.leave(`agent:${agentId}`);
  }
  
  /**
   * Handle socket disconnection
   * @param {string} socketId - Socket ID
   * @param {string} userId - User ID
   */
  handleDisconnection(socketId, userId) {
    // Remove from user sockets
    if (this.userSockets.has(userId)) {
      this.userSockets.get(userId).delete(socketId);
      
      // Clean up empty user entries
      if (this.userSockets.get(userId).size === 0) {
        this.userSockets.delete(userId);
      }
    }
    
    // Remove from all agent rooms
    for (const [agentId, sockets] of this.agentRooms.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);
        
        // Clean up empty rooms
        if (sockets.size === 0) {
          this.agentRooms.delete(agentId);
        }
      }
    }
  }
  
  /**
   * Send a message to all sockets in an agent room
   * @param {string} agentId - Agent ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToAgentRoom(agentId, event, data) {
    this.io.to(`agent:${agentId}`).emit(event, data);
    logger.info(`Emitted '${event}' to agent room: ${agentId}`);
  }
  
  /**
   * Send an agent message to all sockets in an agent room
   * @param {string} agentId - Agent ID
   * @param {Object} message - Message data
   */
  sendAgentMessage(agentId, message) {
    this.emitToAgentRoom(agentId, 'agent:message', message);
  }
  
  /**
   * Send an error message to all sockets in an agent room
   * @param {string} agentId - Agent ID
   * @param {Object} error - Error data
   */
  sendAgentError(agentId, error) {
    this.emitToAgentRoom(agentId, 'agent:error', error);
  }
  
  /**
   * Send a message to a specific user across all their sockets
   * @param {string} userId - User ID
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      
      for (const socketId of sockets) {
        this.io.to(socketId).emit(event, data);
      }
      
      logger.info(`Emitted '${event}' to user: ${userId}`);
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  broadcast(event, data) {
    this.io.emit(event, data);
    logger.info(`Broadcasted '${event}' to all clients`);
  }
}

// Export singleton instance
module.exports = new SocketService();
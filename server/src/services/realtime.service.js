const { Server } = require('socket.io');
const { prisma } = require('./database.service');
const { logger } = require('../utils/logger.util');
const jwt = require('jsonwebtoken');
//const { pubsub } = require('../pubsub'); // Assuming you have a pubsub setup

class RealtimeService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket ids
    this.channels = new Map(); // channelName -> Set of userIds
    this.chatSockets = new Map(); // userId -> Set of chat socket ids
    this.chatRooms = new Map(); // chatId -> Set of userIds
    this.lastSeenTimestamps = new Map(); // userId -> timestamp
    this.statusUpdateInterval = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true
      },
      path: '/socket.io'
    });

    // Create notifications namespace
    const notificationsNamespace = this.io.of('/notifications');

    // Create chat namespace
    const chatNamespace = this.io.of('/chat');

    // Middleware to handle authentication for notifications namespace
    notificationsNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          logger.warn('Socket connection attempt without token');
          return next(new Error('Authentication token required'));
        }

        const user = await this.verifyToken(token);
        if (!user) {
          logger.warn('Socket connection attempt with invalid token');
          return next(new Error('Invalid authentication token'));
        }

        // Attach user to socket
        socket.user = user;
        logger.debug(`Socket authenticated for user ${user.id}`);
        next();
      } catch (error) {
        logger.error('Socket middleware authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    // Middleware to handle authentication for chat namespace
    chatNamespace.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          logger.warn('Chat socket connection attempt without token');
          return next(new Error('Authentication token required'));
        }

        const user = await this.verifyToken(token);
        if (!user) {
          logger.warn('Chat socket connection attempt with invalid token');
          return next(new Error('Invalid authentication token'));
        }

        // Attach user to socket
        socket.user = user;
        logger.debug(`Chat socket authenticated for user ${user.id}`);
        next();
      } catch (error) {
        logger.error('Chat socket middleware authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    notificationsNamespace.on('connection', (socket) => {
      logger.info(`Socket connected for user ${socket.user.id}`);
      
      // Store socket mapping
      if (!this.userSockets.has(socket.user.id)) {
        this.userSockets.set(socket.user.id, new Set());
      }
      this.userSockets.get(socket.user.id).add(socket.id);

      // Join user's room
      socket.join(`user:${socket.user.id}`);
      
      // Send authentication success
      socket.emit('authenticated');

      // Send initial unread count
      this.getUnreadCount(socket.user.id)
        .then(count => socket.emit('unread_count', count))
        .catch(error => logger.error('Failed to get unread count:', error));

      // Handle channel subscriptions
      socket.on('subscribe', (channelName) => {
        this.subscribeToChannel(socket.user.id, channelName);
        socket.join(`channel:${channelName}`);
        logger.debug(`User ${socket.user.id} subscribed to channel ${channelName}`);
      });

      socket.on('unsubscribe', (channelName) => {
        this.unsubscribeFromChannel(socket.user.id, channelName);
        socket.leave(`channel:${channelName}`);
        logger.debug(`User ${socket.user.id} unsubscribed from channel ${channelName}`);
      });

      socket.on('disconnect', () => {
        if (this.userSockets.has(socket.user.id)) {
          this.userSockets.get(socket.user.id).delete(socket.id);
          if (this.userSockets.get(socket.user.id).size === 0) {
            this.userSockets.delete(socket.user.id);
            // Clean up channel subscriptions
            this.channels.forEach((subscribers, channel) => {
              subscribers.delete(socket.user.id);
              if (subscribers.size === 0) {
                this.channels.delete(channel);
              }
            });
          }
          logger.debug(`Socket disconnected for user ${socket.user.id}`);
        }
      });

      socket.on('mark_read', async (notificationId) => {
        await this.markAsRead(socket.user.id, notificationId);
      });

      socket.on('mark_all_read', async () => {
        await this.markAllAsRead(socket.user.id);
      });
    });

    // Handle chat namespace connections
    chatNamespace.on('connection', (socket) => {
      logger.info(`Chat socket connected for user ${socket.user.id}`);
      
      // Store chat socket mapping
      if (!this.chatSockets.has(socket.user.id)) {
        this.chatSockets.set(socket.user.id, new Set());
      }
      this.chatSockets.get(socket.user.id).add(socket.id);

      // Join user's chat room
      socket.join(`user:${socket.user.id}`);
      
      // Send authentication success
      socket.emit('authenticated');
      
      // Update and broadcast user's online status
      this.updateUserStatus(socket.user.id, true);
      
      // Start periodic status updates if not already started
      this.startPeriodicStatusUpdates();

      // Handle chat room subscriptions
      socket.on('join_chat', (chatId) => {
        this.joinChatRoom(socket.user.id, chatId);
        socket.join(`chat:${chatId}`);
        logger.debug(`User ${socket.user.id} joined chat room ${chatId}`);
      });

      socket.on('leave_chat', (chatId) => {
        this.leaveChatRoom(socket.user.id, chatId);
        socket.leave(`chat:${chatId}`);
        logger.debug(`User ${socket.user.id} left chat room ${chatId}`);
      });
      
      // Handle typing events
      socket.on('typing_start', (data) => {
        const { chatId } = data;
        if (!chatId) {
          logger.warn(`Invalid typing_start event from user ${socket.user.id}: Missing chatId`);
          return;
        }
        
        logger.debug(`User ${socket.user.id} started typing in chat ${chatId}`);
        
        // Emit to the chat room
        this.emitToChatRoom(chatId, 'user_typing', {
          chatId,
          userId: socket.user.id,
          timestamp: new Date()
        });
      });
      
      socket.on('typing_stop', (data) => {
        const { chatId } = data;
        if (!chatId) {
          logger.warn(`Invalid typing_stop event from user ${socket.user.id}: Missing chatId`);
          return;
        }
        
        logger.debug(`User ${socket.user.id} stopped typing in chat ${chatId}`);
        
        // Emit to the chat room
        this.emitToChatRoom(chatId, 'user_stopped_typing', {
          chatId,
          userId: socket.user.id,
          timestamp: new Date()
        });
      });
      
      // Handle user status request
      socket.on('request_user_status', (data) => {
        const { userId } = data;
        const status = this.getUserStatus(userId);
        socket.emit('user_status_response', status);
      });

      // Handle batch status request
      socket.on('request_users_status', (userIds) => {
        const statuses = userIds.map(userId => this.getUserStatus(userId));
        socket.emit('users_status_response', statuses);
      });

      socket.on('disconnect', () => {
        if (this.chatSockets.has(socket.user.id)) {
          this.chatSockets.get(socket.user.id).delete(socket.id);
          
          // If this was the last socket for this user, they're offline
          if (this.chatSockets.get(socket.user.id).size === 0) {
            this.chatSockets.delete(socket.user.id);
            
            // Clean up chat room subscriptions
            this.chatRooms.forEach((users, chatId) => {
              users.delete(socket.user.id);
              if (users.size === 0) {
                this.chatRooms.delete(chatId);
              }
            });
            
            // Update and broadcast user's offline status
            this.updateUserStatus(socket.user.id, false);
          }
          
          logger.debug(`Chat socket disconnected for user ${socket.user.id}`);
        }
      });
    });

    // Store the namespace references
    this.notificationsNamespace = notificationsNamespace;
    this.chatNamespace = chatNamespace;

    logger.info('Realtime service initialized with Socket.io');
  }

  // Chat room methods
  joinChatRoom(userId, chatId) {
    if (!this.chatRooms.has(chatId)) {
      this.chatRooms.set(chatId, new Set());
    }
    this.chatRooms.get(chatId).add(userId);
  }

  leaveChatRoom(userId, chatId) {
    if (this.chatRooms.has(chatId)) {
      this.chatRooms.get(chatId).delete(userId);
      if (this.chatRooms.get(chatId).size === 0) {
        this.chatRooms.delete(chatId);
      }
    }
  }

  // Check if a user is online
  isUserOnline(userId) {
    return this.chatSockets.has(userId) && this.chatSockets.get(userId).size > 0;
  }

  // Broadcast user status to all connected clients
  broadcastUserStatus(userId, isOnline) {
    this.chatNamespace.emit('user_status', {
      userId,
      isOnline
    });
  }

  // Emit an event to a specific chat room
  emitToChatRoom(chatId, event, data) {
    this.chatNamespace.to(`chat:${chatId}`).emit(event, data);
    return true;
  }

  // Emit a chat event to a specific user via the chat namespace
  emitChatEventToUser(userId, event, data) {
    if (this.chatSockets.has(userId)) {
      const socketIds = this.chatSockets.get(userId);
      socketIds.forEach(socketId => {
        this.chatNamespace.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  // Emit a chat message to all participants
  emitChatMessage(chatId, message) {
    // Emit to the chat room
    this.emitToChatRoom(chatId, 'new_message', {
      chatId,
      message
    });
    
    // Also emit to individual users who might not be in the room yet
    return true;
  }

  // Emit a message update to all participants
  emitMessageUpdate(chatId, message) {
    return this.emitToChatRoom(chatId, 'message_updated', {
      chatId,
      message
    });
  }

  // Emit a message deletion to all participants
  emitMessageDeletion(chatId, messageId) {
    return this.emitToChatRoom(chatId, 'message_deleted', {
      chatId,
      messageId
    });
  }

  handleConnection(socket) {
    logger.debug('New socket connection attempt');

    socket.on('auth', async (token) => {
      try {
        // Verify token and get user
        const user = await this.verifyToken(token);
        if (!user) {
          logger.warn('Socket auth failed: Invalid token');
          socket.emit('auth_error', 'Invalid token');
          return;
        }

        // Store socket mapping
        if (!this.userSockets.has(user.id)) {
          this.userSockets.set(user.id, new Set());
        }
        this.userSockets.get(user.id).add(socket.id);

        // Join user's room
        socket.join(`user:${user.id}`);
        
        // Send authentication success
        socket.emit('authenticated');
        logger.debug(`Socket authenticated for user ${user.id}`);
        
        // Send unread notifications count
        const unreadCount = await this.getUnreadCount(user.id);
        socket.emit('unread_count', unreadCount);

        // Handle channel subscriptions
        socket.on('subscribe', (channelName) => {
          this.subscribeToChannel(user.id, channelName);
          socket.join(`channel:${channelName}`);
          logger.debug(`User ${user.id} subscribed to channel ${channelName}`);
        });

        socket.on('unsubscribe', (channelName) => {
          this.unsubscribeFromChannel(user.id, channelName);
          socket.leave(`channel:${channelName}`);
          logger.debug(`User ${user.id} unsubscribed from channel ${channelName}`);
        });

        socket.on('disconnect', () => {
          if (this.userSockets.has(user.id)) {
            this.userSockets.get(user.id).delete(socket.id);
            if (this.userSockets.get(user.id).size === 0) {
              this.userSockets.delete(user.id);
              // Clean up channel subscriptions
              this.channels.forEach((subscribers, channel) => {
                subscribers.delete(user.id);
                if (subscribers.size === 0) {
                  this.channels.delete(channel);
                }
              });
            }
            logger.debug(`Socket disconnected for user ${user.id}`);
          }
        });

        socket.on('mark_read', async (notificationId) => {
          await this.markAsRead(user.id, notificationId);
        });

        socket.on('mark_all_read', async () => {
          await this.markAllAsRead(user.id);
        });

      } catch (error) {
        logger.error('Socket authentication error:', error);
        socket.emit('auth_error', 'Authentication failed');
      }
    });
  }

  subscribeToChannel(userId, channelName) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Set());
    }
    this.channels.get(channelName).add(userId);
  }

  unsubscribeFromChannel(userId, channelName) {
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).delete(userId);
      if (this.channels.get(channelName).size === 0) {
        this.channels.delete(channelName);
      }
    }
  }

  async broadcastToChannel(channelName, notification) {
    try {
      logger.debug(`Broadcasting to channel ${channelName}:`, notification);
      
      if (!this.channels.has(channelName)) {
        logger.warn(`No subscribers for channel ${channelName}`);
        return [];
      }

      const subscribers = Array.from(this.channels.get(channelName));
      logger.debug(`Channel ${channelName} subscribers:`, subscribers);

      const notifications = await Promise.all(
        subscribers.map(userId =>
          this.createNotification({
            ...notification,
            userId,
            metadata: {
              ...notification.metadata,
              channel: channelName
            }
          })
        )
      );

      // Emit to channel room using the namespace
      logger.debug(`Emitting channel notification to channel:${channelName}`);
      this.notificationsNamespace.to(`channel:${channelName}`).emit('channel_notification', {
        channel: channelName,
        notification
      });

      return notifications;
    } catch (error) {
      logger.error(`Failed to broadcast to channel ${channelName}:`, error);
      throw error;
    }
  }

  async verifyToken(token) {
    try {
      if (!token) return null;
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, roles: true }
      });
    } catch (error) {
      logger.error('Token verification failed:', error);
      return null;
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: {
          userId,
          isRead: false
        }
      });
      return count;
    } catch (error) {
      logger.error(`Failed to get unread count for user ${userId}:`, error);
      return 0;
    }
  }

  async markAsRead(userId, notificationId) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true
        }
      });
      
      // Send updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      this.emitToUser(userId, 'unread_count', unreadCount);
      
      return true;
    } catch (error) {
      logger.error(`Failed to mark notification ${notificationId} as read:`, error);
      return false;
    }
  }

  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
      
      // Send updated unread count (should be 0)
      this.emitToUser(userId, 'unread_count', 0);
      
      return true;
    } catch (error) {
      logger.error(`Failed to mark all notifications as read for user ${userId}:`, error);
      return false;
    }
  }

  // Emit an event to a specific user
  emitToUser(userId, event, data) {
    if (this.userSockets.has(userId)) {
      const socketIds = this.userSockets.get(userId);
      socketIds.forEach(socketId => {
        this.notificationsNamespace.to(socketId).emit(event, data);
      });
      return true;
    }
    return false;
  }

  // Create and emit a notification
  async createNotification(notification) {
    try {
      // Create the notification in the database
      const createdNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          metadata: notification.metadata || {},
          isRead: false
        }
      });
      
      // Emit to the user
      this.emitToUser(notification.userId, 'notification', createdNotification);
      
      // Update unread count
      const unreadCount = await this.getUnreadCount(notification.userId);
      this.emitToUser(notification.userId, 'unread_count', unreadCount);
      
      return createdNotification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Get user's notifications with pagination
  async getUserNotifications(userId, { page = 1, limit = 10, unreadOnly = false }) {
    try {
      const where = { userId };
      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.notification.count({ where })
      ]);
      
      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Failed to get user notifications:', error);
      throw error;
    }
  }

  // Helper method to broadcast to specific roles
  async broadcastToRoles(roles, notification) {
    try {
      const users = await prisma.user.findMany({
        where: {
          roles: {
            hasSome: roles
          }
        },
        select: { id: true }
      });

      const notifications = await Promise.all(
        users.map(user => this.createNotification({
          ...notification,
          userId: user.id
        }))
      );

      return notifications;
    } catch (error) {
      logger.error('Failed to broadcast to roles:', error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(userId, notificationId) {
    try {
      const notification = await prisma.notification.delete({
        where: {
          id: notificationId,
          userId // Ensure user owns the notification
        }
      });

      // Emit delete event to user's room
      this.emitToUser(userId, 'notification_deleted', notificationId);

      // Update unread count
      const unreadCount = await this.getUnreadCount(userId);
      this.emitToUser(userId, 'unread_count', unreadCount);

      return notification;
    } catch (error) {
      logger.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Update user status and broadcast changes
  updateUserStatus(userId, isOnline) {
    const timestamp = new Date().toISOString();
    
    if (!isOnline) {
      this.lastSeenTimestamps.set(userId, timestamp);
    } else {
      this.lastSeenTimestamps.delete(userId);
    }
    
    // Broadcast the status update
    this.chatNamespace.emit('user_status_update', {
      userId,
      isOnline,
      timestamp,
      lastSeen: isOnline ? null : timestamp
    });
  }

  // Get user status including last seen
  getUserStatus(userId) {
    const isOnline = this.isUserOnline(userId);
    const lastSeen = this.lastSeenTimestamps.get(userId);
    
    return {
      userId,
      isOnline,
      lastSeen
    };
  }

  // Start periodic status updates
  startPeriodicStatusUpdates() {
    if (this.statusUpdateInterval) return;
    
    this.statusUpdateInterval = setInterval(() => {
      const onlineUsers = Array.from(this.chatSockets.keys());
      
      // Broadcast batch status update
      this.chatNamespace.emit('users_status_batch', {
        onlineUsers,
        timestamp: new Date().toISOString()
      });
      
    }, 30000); // Update every 30 seconds
  }

  // Stop periodic status updates
  stopPeriodicStatusUpdates() {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  // Clean up on server shutdown
  cleanup() {
    this.stopPeriodicStatusUpdates();
  }
}

// Create a singleton instance
const realtimeService = new RealtimeService();

module.exports = realtimeService;
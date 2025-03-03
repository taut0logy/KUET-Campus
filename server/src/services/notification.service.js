const { Server } = require('socket.io');
const { prisma } = require('./database.service');
const { logger } = require('../utils/logger.util');
const jwt = require('jsonwebtoken');

class NotificationService {
  constructor() {
    this.io = null;
    this.userSockets = new Map(); // userId -> Set of socket ids
    this.channels = new Map(); // channelName -> Set of userIds
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

    // Middleware to handle authentication
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

    // Store the namespace reference
    this.notificationsNamespace = notificationsNamespace;

    logger.info('Notification service initialized with Socket.io');
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

  async createNotification({ userId, title, message, type = 'INFO', metadata = {} }) {
    try {
      logger.debug(`Creating notification for user ${userId}:`, { title, message, type });
      
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          //metadata
        }
      });

      logger.debug(`Notification created successfully:`, notification);

      // Check if user has any active sockets
      const userSockets = this.userSockets.get(userId);
      logger.debug(`Active sockets for user ${userId}:`, userSockets ? Array.from(userSockets) : 'none');

      // Emit to user's room using the namespace
      logger.debug(`Emitting notification to user:${userId}`);
      this.notificationsNamespace.to(`user:${userId}`).emit('notification', notification);

      // Get updated unread count
      const unreadCount = await this.getUnreadCount(userId);
      logger.debug(`Emitting unread count ${unreadCount} to user:${userId}`);
      this.notificationsNamespace.to(`user:${userId}`).emit('unread_count', unreadCount);

      return notification;
    } catch (error) {
      logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });
  }

  async markAsRead(userId, notificationId) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId // Ensure user owns the notification
        },
        data: {
          isRead: true
        }
      });

      const unreadCount = await this.getUnreadCount(userId);
      this.notificationsNamespace.to(`user:${userId}`).emit('unread_count', unreadCount);
    } catch (error) {
      logger.error('Failed to mark notification as read:', error);
      throw error;
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

      this.notificationsNamespace.to(`user:${userId}`).emit('unread_count', 0);
    } catch (error) {
      logger.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

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
}

const notificationService = new NotificationService();
module.exports = notificationService; 
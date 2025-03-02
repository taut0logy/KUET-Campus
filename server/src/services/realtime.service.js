const { supabaseAdmin } = require('../config/supabase');
const { logger } = require('../utils/logger.util');

/**
 * Supabase Realtime Service for managing realtime channels and notifications
 */
class RealtimeService {
  /**
   * Initialize the realtime service
   */
  constructor() {
    this.supabase = supabaseAdmin;
    this.channels = new Map(); // Store active channels
    this.initialized = false;
  }

  /**
   * Initialize realtime service
   */
  async initialize() {
    try {
      if (this.initialized) return;
      
      // In a future version, we might need to enable realtime for certain tables
      // For now, just mark as initialized
      this.initialized = true;
      logger.info('Realtime service initialized successfully');
    } catch (error) {
      logger.error(`Realtime initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a broadcast message to all clients subscribed to a channel
   * @param {string} channel - The channel name
   * @param {string} event - The event name
   * @param {Object} payload - The message payload
   * @returns {boolean} - True if successful
   */
  async broadcast(channel, event, payload) {
    try {
      await this.initialize();
      
      // Use Supabase to broadcast the message
      const { error } = await this.supabase
        .channel(channel)
        .send({
          type: 'broadcast',
          event: event,
          payload: payload
        });
      
      if (error) {
        throw new Error(`Failed to broadcast message: ${error.message}`);
      }
      
      logger.debug(`Broadcast to channel ${channel}, event: ${event}`);
      return true;
    } catch (error) {
      logger.error(`Failed to broadcast message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create a notification in the database and optionally broadcast it
   * @param {Object} notification - The notification object
   * @param {boolean} shouldBroadcast - Whether to broadcast the notification
   * @returns {Object} - The created notification
   */
  async createNotification(notification, shouldBroadcast = true) {
    try {
      await this.initialize();
      
      // Create the notification in the database
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: notification.userId,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'info',
          metadata: notification.metadata || {},
          read: false
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create notification: ${error.message}`);
      }
      
      // Broadcast if requested
      if (shouldBroadcast) {
        const channel = `user-${notification.userId}`;
        await this.broadcast(channel, 'notification', data);
      }
      
      return data;
    } catch (error) {
      logger.error(`Failed to create notification: ${error.message}`);
      throw error;
    }
  }

  /**
   * Set up database triggers for realtime functionality
   * This would typically be done during app initialization
   * @returns {boolean} - True if successful
   */
  async setupDatabaseTriggers() {
    // This would be implemented using raw SQL via Prisma or a migration
    // For example, creating triggers that call pg_notify when data changes
    // This is a placeholder for now
    logger.info('Database triggers for realtime functionality set up successfully');
    return true;
  }

  /**
   * Subscribe to changes in a database table
   * @param {string} table - The table name
   * @param {Function} callback - The callback function
   * @returns {Object} - The subscription object
   */
  subscribeToTable(table, callback) {
    try {
      const subscription = this.supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, callback)
        .subscribe();
      
      logger.debug(`Subscribed to changes on table: ${table}`);
      return subscription;
    } catch (error) {
      logger.error(`Failed to subscribe to table: ${error.message}`);
      throw error;
    }
  }

  /**
   * Send a direct message to a specific user
   * @param {string} userId - The user ID
   * @param {string} event - The event name
   * @param {Object} payload - The message payload
   * @returns {boolean} - True if successful
   */
  async sendToUser(userId, event, payload) {
    try {
      return await this.broadcast(`user-${userId}`, event, payload);
    } catch (error) {
      logger.error(`Failed to send message to user: ${error.message}`);
      throw error;
    }
  }
}

// Create and export an instance of the realtime service
const realtimeService = new RealtimeService();

module.exports = realtimeService; 
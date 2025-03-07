const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const notificationService = require('../services/notification.service');
const { logger } = require('../utils/logger.util');

// Get user's notifications with pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === 'true'
    });
    res.json(result);
  } catch (error) {
    logger.error('Failed to get notifications:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// Delete a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete notification:', error);
    res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// Get unread notifications count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (error) {
    logger.error('Failed to get unread count:', error);
    res.status(500).json({ message: 'Failed to get unread count' });
  }
});

// Mark a notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    await notificationService.markAsRead(req.user.id, req.params.id);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Failed to mark notification as read:', error);
    res.status(500).json({ message: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/read/all', authenticate, async (req, res) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    logger.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark all notifications as read' });
  }
});

// Create notification (Admin only)
router.post('/', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { userId, title, message, type, metadata } = req.body;
    const notification = await notificationService.createNotification({
      userId,
      title,
      message,
      type,
      metadata
    });
    res.status(201).json(notification);
  } catch (error) {
    logger.error('Failed to create notification:', error);
    res.status(500).json({ message: 'Failed to create notification' });
  }
});

// Broadcast to roles (Admin only)
router.post('/broadcast', authenticate, authorize(['ADMIN']), async (req, res) => {
  try {
    const { roles, title, message, type, metadata } = req.body;
    const notifications = await notificationService.broadcastToRoles(roles, {
      title,
      message,
      type,
      metadata
    });
    res.status(201).json(notifications);
  } catch (error) {
    logger.error('Failed to broadcast notification:', error);
    res.status(500).json({ message: 'Failed to broadcast notification' });
  }
});

// Test notification endpoint
router.post('/test', authenticate, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    const notification = await notificationService.createNotification({
      userId: req.user.id,
      title,
      message,
      type,
      metadata: {
        source: 'test'
      }
    });
    res.json(notification);
  } catch (error) {
    console.error('Error in test notification:', error);
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Test endpoint for sending channel notifications
router.post('/test/channel', authenticate, async (req, res) => {
  try {
    const { channelName, title, message, type } = req.body;
    
    // First subscribe the user to the channel if not already subscribed
    await notificationService.subscribeToChannel(req.user.id, channelName);
    
    // Then broadcast to the channel
    const notifications = await notificationService.broadcastToChannel(channelName, {
      title,
      message,
      type,
      metadata: {
        source: 'test',
        channel: channelName
      }
    });
    
    res.json(notifications);
  } catch (error) {
    console.error('Error in channel notification:', error);
    res.status(500).json({ error: 'Failed to send channel notification' });
  }
});

// Subscribe to a channel
router.post('/channels/:channelName/subscribe', authenticate, async (req, res) => {
  try {
    await notificationService.subscribeToChannel(req.user.id, req.params.channelName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    res.status(500).json({ error: 'Failed to subscribe to channel' });
  }
});

// Unsubscribe from a channel
router.post('/channels/:channelName/unsubscribe', authenticate, async (req, res) => {
  try {
    await notificationService.unsubscribeFromChannel(req.user.id, req.params.channelName);
    res.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
    res.status(500).json({ error: 'Failed to unsubscribe from channel' });
  }
});

module.exports = router; 

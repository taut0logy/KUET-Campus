const { prisma } = require('../services/database.service');
const notificationService = require('../services/notification.service');
const eventService = require('../services/event.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');

// Create a new event
const createEvent = async (req, res) => {
  const { name, description, startTime, endTime, clubId } = req.body;
  try {
    const event = await prisma.event.create({
      data: {
        name,
        description,
        startTime,
        endTime,
        clubId
      }
    });

    // Broadcast notification to followers of the club
    await notificationService.broadcastToChannel(`club:${clubId}`, {
      message: `New event created: ${event.name}`,
      eventId: event.id,
      eventSlug: event.slug
    });

    res.status(201).json(event);
  } catch (error) {
    logger.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Update an existing event
const updateEvent = async (req, res) => {
  const { id } = req.params;
  const { name, description, startTime, endTime } = req.body;
  try {
    const event = await prisma.event.update({
      where: { id: parseInt(id) },
      data: { name, description, startTime, endTime }
    });

    // Broadcast notification to followers of the club
    await notificationService.broadcastToChannel(`club:${event.clubId}`, {
      message: `Event updated: ${event.name}`,
      eventId: event.id
    });

    res.json(event);
  } catch (error) {
    logger.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Follow an event
const followEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    const follow = await eventService.followEvent(userId, eventId);
    // Send notification to the user
    await notificationService.broadcastToChannel(`user:${userId}`, {
      message: `You are now following the event.`,
      eventId
    });
    return sendSuccess(res, { follow }, 'Successfully followed the event');
  } catch (error) {
    logger.error('Error following event:', error);
    return sendError(res, error);
  }
};

// Unfollow an event
const unfollowEvent = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    await eventService.unfollowEvent(userId, eventId);
    // Send notification to the user
    await notificationService.broadcastToChannel(`user:${userId}`, {
      message: `You have unfollowed the event.`,
      eventId
    });
    return sendSuccess(res, null, 'Successfully unfollowed the event');
  } catch (error) {
    logger.error('Error unfollowing event:', error);
    return sendError(res, error);
  }
};

// Log a user's visit to an event page
const logUserVisit = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.id;
  try {
    await eventService.logUserVisit(userId, eventId);
    return sendSuccess(res, null, 'User visit logged successfully');
  } catch (error) {
    logger.error('Error logging user visit:', error);
    return sendError(res, error);
  }
};

// Get concise info of an event
const getEventInfo = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      select: {
        id: true,
        name: true,
        startTime: true,
        endTime: true,
        club: { select: { name: true } }
      }
    });
    return sendSuccess(res, { event }, 'Event info retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event info:', error);
    return sendError(res, error);
  }
};

// Get detailed info of an event
const getEventDetails = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        club: true,
        followers: true
      }
    });
    return sendSuccess(res, { event }, 'Event details retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event details:', error);
    return sendError(res, error);
  }
};

// Get analytics data for an event
const getEventAnalytics = async (req, res) => {
  const { eventId } = req.params;
  try {
    const totalFollowers = await prisma.event.followers.count({
      where: { id: parseInt(eventId) }
    });

    const followUnfollowLogs = await prisma.followUnfollowLog.findMany({
      where: { eventId: parseInt(eventId) }
    });

    const followRate = followUnfollowLogs.filter(log => log.action === 'follow').length;
    const unfollowRate = followUnfollowLogs.filter(log => log.action === 'unfollow').length;

    return sendSuccess(res, {
      totalFollowers,
      followRate,
      unfollowRate
    }, 'Event analytics retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event analytics:', error);
    return sendError(res, error);
  }
};

// Search for events
const searchEvents = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  const { query, page = 1, limit = 10, sort } = req.query;
  try {
    const events = await eventService.searchEvents({ query, page, limit, sort });
    return sendSuccess(res, { events }, 'Events retrieved successfully');
  } catch (error) {
    logger.error('Error searching events:', error);
    return sendError(res, error);
  }
};

module.exports = {
  createEvent,
  updateEvent,
  followEvent,
  unfollowEvent,
  logUserVisit,
  getEventInfo,
  getEventDetails,
  getEventAnalytics
}; 
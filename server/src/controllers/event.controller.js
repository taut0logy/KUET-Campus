const { validationResult } = require('express-validator');
const eventService = require('../services/event.service');
const clubService = require('../services/club.service');
const realtimeService = require('../services/realtime.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError, ForbiddenError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');
const slugify = require('../utils/slugify.util');

/**
 * Create a new event
 */
const createEvent = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const eventData = {
      ...req.body,
      slug: slugify(req.body.name)
    };
    const { clubId } = eventData;
    
    // Check if user is authorized to create events for this club
    const club = await clubService.getClubById(clubId);
    
    if (club.moderatorId !== req.user.id && !req.user.roles.includes('ADMIN')) {
      // Check if user is a manager of the club
      const userClubs = await clubService.getUserManagedClubs(req.user.id);
      const isManager = userClubs.clubs.some(c => c.id === parseInt(clubId) && c.userRole === 'MANAGER');
      
      if (!isManager) {
        throw new ForbiddenError('You are not authorized to create events for this club');
      }
    }
    
    const event = await eventService.createEvent(eventData);
    
    // Notify club followers about the new event
    try {
      await realtimeService.notifyClubFollowers({
        clubId,
        title: 'New Event',
        message: `${club.name} has created a new event: ${event.name}`,
        type: 'EVENT_CREATE',
        metadata: { eventId: event.id, clubId, eventName: event.name, clubName: club.name },
        excludeUserIds: [req.user.id] // Don't notify the creator
      });
    } catch (notifError) {
      logger.warn('Failed to notify club followers about new event:', notifError);
    }
    
    return sendSuccess(res, { event }, 'Event created successfully', 201);
  } catch (error) {
    logger.error('Error creating event:', error);
    next(error);
  }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeCounts = req.query.stats === 'true';
    const event = await eventService.getEventById(id, includeCounts);
    
    // Log visit if user is authenticated
    if (req.user) {
      try {
        await eventService.logUserVisit(req.user.id, id);
      } catch (visitError) {
        // Don't fail the request if visit logging fails
        logger.warn(`Failed to log visit for user ${req.user.id} to event ${id}:`, visitError);
      }
    }
    
    return sendSuccess(res, { event }, 'Event retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving event with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get event by slug
 */
const getEventBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const includeCounts = req.query.stats === 'true';
    const event = await eventService.getEventBySlug(slug, includeCounts);
    
    // Log visit if user is authenticated
    if (req.user) {
      try {
        await eventService.logUserVisit(req.user.id, event.id);
      } catch (visitError) {
        // Don't fail the request if visit logging fails
        logger.warn(`Failed to log visit for user ${req.user.id} to event ${event.id}:`, visitError);
      }
    }
    
    return sendSuccess(res, { event }, 'Event retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving event with slug ${req.params.slug}:`, error);
    next(error);
  }
};

/**
 * Update an event
 */
const updateEvent = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const eventData = req.body;
    
    // Update slug if name is being changed
    if (eventData.name) {
      eventData.slug = slugify(eventData.name);
    }
    
    // Check if user is authorized to update this event
    const event = await eventService.getEventById(id);
    const club = await clubService.getClubById(event.clubId);
    
    if (club.moderatorId !== req.user.id && !req.user.roles.includes('ADMIN')) {
      // Check if user is a manager of the club
      const userClubs = await clubService.getUserManagedClubs(req.user.id);
      const isManager = userClubs.clubs.some(c => c.id === parseInt(event.clubId) && c.userRole === 'MANAGER');
      
      if (!isManager) {
        throw new ForbiddenError('You are not authorized to update events for this club');
      }
    }
    
    const updatedEvent = await eventService.updateEvent(id, eventData);
    
    // Notify event followers about the update
    try {
      await realtimeService.notifyEventFollowers({
        eventId: id,
        title: 'Event Updated',
        message: `The event "${updatedEvent.name}" has been updated`,
        type: 'EVENT_UPDATE',
        metadata: { eventId: id, eventName: updatedEvent.name },
        excludeUserIds: [req.user.id] // Don't notify the updater
      });
    } catch (notifError) {
      logger.warn('Failed to notify event followers about update:', notifError);
    }
    
    return sendSuccess(res, { event: updatedEvent }, 'Event updated successfully');
  } catch (error) {
    logger.error(`Error updating event with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete an event
 */
const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if user is authorized to delete this event
    const event = await eventService.getEventById(id);
    const club = await clubService.getClubById(event.clubId);
    
    if (club.moderatorId !== req.user.id && !req.user.roles.includes('ADMIN')) {
      // Check if user is a manager of the club
      const userClubs = await clubService.getUserManagedClubs(req.user.id);
      const isManager = userClubs.clubs.some(c => c.id === parseInt(event.clubId) && c.userRole === 'MANAGER');
      
      if (!isManager) {
        throw new ForbiddenError('You are not authorized to delete events for this club');
      }
    }
    
    // Send notifications to followers before deletion
    try {
      if (event.followers && event.followers.length > 0) {
        const followerIds = event.followers.map(f => f.id).filter(id => id !== req.user.id);
        
        if (followerIds.length > 0) {
          await realtimeService.createNotificationForUsers({
            userIds: followerIds,
            title: 'Event Cancelled',
            message: `The event "${event.name}" has been cancelled`,
            type: 'EVENT_CANCELLED',
            metadata: { eventName: event.name, clubId: event.clubId }
          });
        }
      }
    } catch (notifError) {
      logger.warn('Failed to send event cancellation notifications:', notifError);
    }
    
    await eventService.deleteEvent(id);
    return sendSuccess(res, null, 'Event deleted successfully');
  } catch (error) {
    logger.error(`Error deleting event with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Follow an event
 */
const followEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await eventService.followEvent(userId, id);
    
    // Send notification to the user
    try {
      await realtimeService.createNotification({
        userId,
        title: 'Event Followed',
        message: `You are now following the event "${result.event.name}"`,
        type: 'EVENT_FOLLOW',
        metadata: { eventId: id }
      });
    } catch (notifError) {
      logger.warn(`Failed to create notification for user ${userId} following event ${id}:`, notifError);
    }
    
    return sendSuccess(res, result, 'Event followed successfully');
  } catch (error) {
    logger.error(`Error following event ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Unfollow an event
 */
const unfollowEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await eventService.unfollowEvent(userId, id);
    
    return sendSuccess(res, null, 'Event unfollowed successfully');
  } catch (error) {
    logger.error(`Error unfollowing event ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Log user visit to an event
 */
const logUserVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await eventService.logUserVisit(userId, id);
    
    return sendSuccess(res, null, 'Visit logged successfully');
  } catch (error) {
    logger.error(`Error logging visit to event ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get event analytics
 */
const getEventAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // Check if user is authorized to view analytics
    const event = await eventService.getEventById(id);
    const club = await clubService.getClubById(event.club.id);
    
    // Allow club moderator, managers, and admins to view analytics
    if (club.moderatorId !== req.user.id && !req.user.roles.includes('ADMIN')) {
      // Check if user is a manager of the club
      const userClubs = await clubService.getUserManagedClubs(req.user.id);
      const isManager = userClubs.clubs.some(c => c.id === parseInt(event.club.id) && c.userRole === 'MANAGER');
      
      if (!isManager) {
        throw new ForbiddenError('You are not authorized to view analytics for this event');
      }
    }
    
    const analytics = await eventService.getEventAnalytics(id, {
      startDate,
      endDate
    });
    
    return sendSuccess(res, { analytics }, 'Event analytics retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving analytics for event ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get all event tags
 */
const getAllEventTags = async (req, res, next) => {
  try {
    const tags = await eventService.getAllEventTags();
    return sendSuccess(res, { tags }, 'Event tags retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving event tags:', error);
    next(error);
  }
};

/**
 * Get all events with pagination and filters
 */
const getAllEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, tag, sort, clubId } = req.query;
    
    const result = await eventService.getAllEvents({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      tag,
      sort,
      clubId
    });
    
    return sendSuccess(res, result, 'Events retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving events:', error);
    next(error);
  }
};

/**
 * Get events by tag
 */
const getEventsByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await eventService.getEventsByTag(tagId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, result, 'Events by tag retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving events by tag ${req.params.tagId}:`, error);
    next(error);
  }
};

/**
 * Get events followed by current user
 */
const getUserFollowedEvents = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await eventService.getUserFollowedEvents(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, result, 'Followed events retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving followed events for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get upcoming events
 */
const getUpcomingEvents = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    
    const events = await eventService.getUpcomingEvents({
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, { events }, 'Upcoming events retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving upcoming events:', error);
    next(error);
  }
};

/**
 * Search events
 */
const searchEvents = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10, sort = 'relevance' } = req.query;
    
    const result = await eventService.searchEvents({
      query,
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    
    return sendSuccess(res, result, 'Events search results');
  } catch (error) {
    logger.error(`Error searching events with query '${req.query.query}':`, error);
    next(error);
  }
};

/**
 * Get concise info of an event
 */
const getEventInfo = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventInfo(eventId);
    return sendSuccess(res, { event }, 'Event info retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving event info for event ${req.params.eventId}:`, error);
    next(error);
  }
}

/**
 * Get detailed info of an event
 */
const getEventDetails = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventDetails(eventId);
    return sendSuccess(res, { event }, 'Event details retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving event details for event ${req.params.eventId}:`, error);
    next(error);
  }
}

/**
 * Get short details of an event
 */
const getEventShortDetails = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventShortDetails(eventId);
    return sendSuccess(res, { event }, 'Event short details retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving short details for event ${req.params.eventId}:`, error);
    next(error);
  }
}

/**
 * Get paginated and sortable list of events
 */
const getPaginatedEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = 'recent' } = req.query;
    const events = await eventService.getPaginatedEvents({
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    return sendSuccess(res, { events }, 'Paginated events retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving paginated events:', error);
    next(error);
  }
}

module.exports = {
  createEvent, //
  updateEvent,
  followEvent,
  unfollowEvent,
  logUserVisit,
  getEventInfo,
  getEventDetails,
  getEventAnalytics,
  searchEvents,
  getEventShortDetails,
  getPaginatedEvents,
  getEventById, //
  getEventBySlug, //
  deleteEvent,
  getAllEventTags, //
  getAllEvents,
  getEventsByTag,
  getUserFollowedEvents,
  getUpcomingEvents
};
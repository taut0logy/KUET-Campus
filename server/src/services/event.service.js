const { prisma } = require('./database.service');
const { NotFoundError, ForbiddenError, ConflictError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');
const slugify = require('../utils/slugify.util');
const realtimeService = require('./realtime.service');

/**
 * Generate a unique slug for an event
 */
const generateUniqueEventSlug = async (name) => {
  let slug = slugify(name);
  let exists = true;
  let counter = 0;
  let uniqueSlug = slug;
  
  // Keep checking until we find a unique slug
  while (exists) {
    const existingEvent = await prisma.event.findUnique({
      where: { slug: uniqueSlug }
    });
    
    if (!existingEvent) {
      exists = false;
    } else {
      counter++;
      uniqueSlug = `${slug}-${counter}`;
    }
  }
  
  return uniqueSlug;
};

/**
 * Create a new event
 */
const createEvent = async (eventData) => {
  try {
    const { name, description, startTime, endTime, clubId, coverPhoto, eventLinks = [], tags = [] } = eventData;
    
    // Check if club exists
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) }
    });
    
    if (!club) {
      throw new NotFoundError(`Club with ID ${clubId} not found`);
    }
    
    // Generate slug from name
    const slug = await generateUniqueEventSlug(name);
    
    // Convert tags if needed
    let connectTags = [];
    if (Array.isArray(tags) && tags.length > 0) {
      connectTags = tags.map(tagId => ({ id: parseInt(tagId) }));
    }
    
    // Create event
    const event = await prisma.event.create({
      data: {
        name,
        slug,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clubId: parseInt(clubId),
        coverPhoto,
        eventLinks: eventLinks.length ? JSON.stringify(eventLinks) : '[]',
        tags: {
          connect: connectTags
        }
      },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: true
      }
    });
    
    logger.info(`Event created: ${event.id} - ${event.name} for club ${clubId}`);
    
    // Send notifications to club followers
    try {
      // Get club followers
      const followers = await prisma.club.findUnique({
        where: { id: parseInt(clubId) },
        include: {
          followers: {
            select: {
              id: true
            }
          }
        }
      });
      
      if (followers && followers.followers.length > 0) {
        // Create notifications for followers
        const notificationPromises = followers.followers.map(follower => 
          realtimeService.createNotification({
            userId: follower.id,
            title: `New Event: ${event.name}`,
            message: `${club.name} has created a new event: ${event.name}`,
            type: 'EVENT',
            metadata: {
              eventId: event.id,
              eventName: event.name,
              eventSlug: event.slug,
              clubId: club.id,
              clubName: club.name,
              clubSlug: club.slug
            }
          })
        );
        
        await Promise.all(notificationPromises);
        logger.info(`Sent event notifications to ${followers.followers.length} followers of club ${clubId}`);
      }
    } catch (notifError) {
      // Log but don't fail the event creation
      logger.error('Error sending event notifications:', notifError);
    }
    
    return event;
  } catch (error) {
    logger.error('Error creating event:', error);
    throw error;
  }
};

/**
 * Get event by ID
 */
const getEventById = async (id, includeCounts = false) => {
  const eventQuery = {
    where: { id: parseInt(id) },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          slug: true,
          coverPhoto: true,
          moderator: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      tags: true,
      followers: {
        select: {
          id: true,
          name: true
        }
      }
    }
  };
  
  if (includeCounts) {
    eventQuery.include._count = {
      select: {
        followers: true,
        eventVisits: true
      }
    };
  }
  
  const event = await prisma.event.findUnique(eventQuery);
  
  if (!event) {
    throw new NotFoundError(`Event with ID ${id} not found`);
  }
  
  return event;
};

/**
 * Get event by slug
 */
const getEventBySlug = async (slug, includeCounts = false) => {
  const eventQuery = {
    where: { slug },
    include: {
      club: {
        select: {
          id: true,
          name: true,
          slug: true,
          coverPhoto: true,
          moderator: {
            select: {
              id: true,
              name: true
            }
          }
        }
      },
      tags: true,
      followers: {
        select: {
          id: true,
          name: true
        }
      }
    }
  };
  
  if (includeCounts) {
    eventQuery.include._count = {
      select: {
        followers: true,
        eventVisits: true
      }
    };
  }
  
  const event = await prisma.event.findUnique(eventQuery);
  
  if (!event) {
    throw new NotFoundError(`Event with slug ${slug} not found`);
  }
  
  return event;
};

/**
 * Update event
 */
const updateEvent = async (id, eventData) => {
  try {
    const { name, description, startTime, endTime, coverPhoto, eventLinks, tags } = eventData;
    
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!existingEvent) {
      throw new NotFoundError(`Event with ID ${id} not found`);
    }
    
    // Generate new slug if name changed
    let slug = existingEvent.slug;
    if (name && name !== existingEvent.name) {
      slug = await generateUniqueEventSlug(name);
    }
    
    // Build update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (coverPhoto) updateData.coverPhoto = coverPhoto;
    if (startTime) updateData.startTime = new Date(startTime);
    if (endTime) updateData.endTime = new Date(endTime);
    
    if (eventLinks) updateData.eventLinks = JSON.stringify(eventLinks);
    
    // Handle tag connections/disconnections if provided
    if (tags) {
      updateData.tags = {
        set: [], // Clear existing connections
        connect: tags.map(tagId => ({ id: parseInt(tagId) }))
      };
    }
    
    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        tags: true
      }
    });
    
    logger.info(`Event updated: ${updatedEvent.id} - ${updatedEvent.name}`);
    
    // Notify followers about the update
    try {
      const followers = await prisma.event.findUnique({
        where: { id: parseInt(id) },
        select: {
          followers: {
            select: {
              id: true
            }
          }
        }
      });
      
      if (followers && followers.followers.length > 0) {
        const notificationPromises = followers.followers.map(follower =>
          realtimeService.createNotification({
            userId: follower.id,
            title: `Event Updated: ${updatedEvent.name}`,
            message: `An event you're following has been updated: ${updatedEvent.name}`,
            type: 'EVENT_UPDATE',
            metadata: {
              eventId: updatedEvent.id,
              eventName: updatedEvent.name,
              eventSlug: updatedEvent.slug,
              clubId: updatedEvent.club.id,
              clubName: updatedEvent.club.name
            }
          })
        );
        
        await Promise.all(notificationPromises);
      }
    } catch (notifError) {
      logger.error('Error sending event update notifications:', notifError);
    }
    
    return updatedEvent;
  } catch (error) {
    logger.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete event
 */
const deleteEvent = async (id) => {
  try {
    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        followers: {
          select: {
            id: true
          }
        }
      }
    });
    
    if (!existingEvent) {
      throw new NotFoundError(`Event with ID ${id} not found`);
    }
    
    // Notify followers about deletion
    try {
      if (existingEvent.followers && existingEvent.followers.length > 0) {
        const notificationPromises = existingEvent.followers.map(follower =>
          realtimeService.createNotification({
            userId: follower.id,
            title: `Event Cancelled: ${existingEvent.name}`,
            message: `An event you were following has been cancelled: ${existingEvent.name}`,
            type: 'EVENT_CANCELLATION',
            metadata: {
              eventId: existingEvent.id,
              eventName: existingEvent.name
            }
          })
        );
        
        await Promise.all(notificationPromises);
      }
    } catch (notifError) {
      logger.error('Error sending event cancellation notifications:', notifError);
    }
    
    // Delete event
    await prisma.event.delete({
      where: { id: parseInt(id) }
    });
    
    logger.info(`Event deleted: ${id} - ${existingEvent.name}`);
    
    return true;
  } catch (error) {
    logger.error(`Error deleting event with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Follow an event
 */
const followEvent = async (userId, eventId) => {
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });
    
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    
    // Check if already following
    const existingFollow = await prisma.event.findFirst({
      where: {
        id: parseInt(eventId),
        followers: {
          some: {
            id: userId
          }
        }
      }
    });
    
    if (existingFollow) {
      throw new ConflictError('User is already following this event');
    }
    
    // Add user as follower
    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        followers: {
          connect: { id: userId }
        }
      }
    });
    
    // Log the follow action
    await prisma.eventFollowUnfollowLog.create({
      data: {
        userId,
        eventId: parseInt(eventId),
        action: 'follow'
      }
    });
    
    logger.info(`User ${userId} followed event ${eventId}`);
    
    return { userId, eventId: parseInt(eventId), followed: true };
  } catch (error) {
    logger.error(`Error following event ${eventId} by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Unfollow an event
 */
const unfollowEvent = async (userId, eventId) => {
  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });
    
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    
    // Check if actually following
    const existingFollow = await prisma.event.findFirst({
      where: {
        id: parseInt(eventId),
        followers: {
          some: {
            id: userId
          }
        }
      }
    });
    
    if (!existingFollow) {
      throw new ConflictError('User is not following this event');
    }
    
    // Remove user as follower
    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: {
        followers: {
          disconnect: { id: userId }
        }
      }
    });
    
    // Log the unfollow action
    await prisma.eventFollowUnfollowLog.create({
      data: {
        userId,
        eventId: parseInt(eventId),
        action: 'unfollow'
      }
    });
    
    logger.info(`User ${userId} unfollowed event ${eventId}`);
    
    return true;
  } catch (error) {
    logger.error(`Error unfollowing event ${eventId} by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Log user visit to an event
 */
const logUserVisit = async (userId, eventId) => {
  try {
    await prisma.eventVisit.create({
      data: {
        userId,
        eventId: parseInt(eventId),
        visitedAt: new Date()
      }
    });
    
    return true;
  } catch (error) {
    logger.error(`Error logging user ${userId} visit to event ${eventId}:`, error);
    // Do not throw error - just log and continue
    return false;
  }
};

/**
 * Get event analytics
 */
const getEventAnalytics = async (eventId, { startDate, endDate }) => {
  try {
    // Parse date filters
    const dateFilter = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }
    
    const visitDateFilter = Object.keys(dateFilter).length ? { visitedAt: dateFilter } : {};
    const actionDateFilter = Object.keys(dateFilter).length ? { actionAt: dateFilter } : {};
    
    // Get event with basic stats
    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            followers: true
          }
        }
      }
    });
    
    if (!event) {
      throw new NotFoundError(`Event with ID ${eventId} not found`);
    }
    
    // Get visit analytics
    const visitCount = await prisma.eventVisit.count({
      where: {
        eventId: parseInt(eventId),
        ...visitDateFilter
      }
    });
    
    // Get unique visitors
    const uniqueVisitors = await prisma.eventVisit.groupBy({
      by: ['userId'],
      where: {
        eventId: parseInt(eventId),
        ...visitDateFilter
      }
    });
    
    // Get follow/unfollow activity
    const followUnfollowLogs = await prisma.eventFollowUnfollowLog.findMany({
      where: {
        eventId: parseInt(eventId),
        ...actionDateFilter
      },
      orderBy: { actionAt: 'desc' },
      take: 100
    });
    
    const follows = followUnfollowLogs.filter(log => log.action === 'follow').length;
    const unfollows = followUnfollowLogs.filter(log => log.action === 'unfollow').length;
    
    // Calculate time to event
    const now = new Date();
    const timeToEvent = event.startTime > now 
      ? Math.floor((event.startTime - now) / (1000 * 60 * 60 * 24)) 
      : null;
    
    // Calculate event duration in hours
    const durationHours = (event.endTime - event.startTime) / (1000 * 60 * 60);
    
    return {
      basicInfo: {
        id: event.id,
        name: event.name,
        startTime: event.startTime,
        endTime: event.endTime,
        clubName: event.club.name,
        daysToEvent: timeToEvent,
        duration: durationHours.toFixed(1) + ' hours',
        followers: event._count.followers
      },
      visitAnalytics: {
        totalVisits: visitCount,
        uniqueVisitors: uniqueVisitors.length
      },
      followActivity: {
        follows,
        unfollows,
        netGrowth: follows - unfollows
      }
    };
  } catch (error) {
    logger.error(`Error getting analytics for event ${eventId}:`, error);
    throw error;
  }
};

/**
 * Get all event tags
 */
const getAllEventTags = async () => {
  try {
    const tags = await prisma.eventTag.findMany();
    return tags;
  } catch (error) {
    logger.error('Error getting event tags:', error);
    throw error;
  }
};

/**
 * Get all events with filters and pagination
 */
const getAllEvents = async ({ page = 1, limit = 10, search, tag, sort = 'upcoming', clubId = null }) => {
  try {
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (tag) {
      where.tags = {
        some: {
          id: parseInt(tag)
        }
      };
    }
    
    if (clubId) {
      where.clubId = parseInt(clubId);
    }
    
    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'upcoming':
        // Only show future events, sorted by start time
        where.startTime = { gte: new Date() };
        orderBy = { startTime: 'asc' };
        break;
      case 'past':
        // Only show past events, sorted by start time descending
        where.endTime = { lt: new Date() };
        orderBy = { startTime: 'desc' };
        break;
      case 'recent':
      default:
        orderBy = { startTime: 'desc' };
        break;
    }
    
    // Get events
    const events = await prisma.event.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: true,
        _count: {
          select: {
            followers: true,
            eventVisits: true
          }
        }
      }
    });
    
    // Get total count
    const totalCount = await prisma.event.count({ where });
    
    return {
      events,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    logger.error('Error getting events:', error);
    throw error;
  }
};

/**
 * Get events by tags
 */
const getEventsByTag = async (tagId, { page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;
    
    const events = await prisma.event.findMany({
      where: {
        tags: {
          some: {
            id: parseInt(tagId)
          }
        }
      },
      skip,
      take: limit,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: true,
        _count: {
          select: {
            followers: true
          }
        }
      }
    });
    
    const totalCount = await prisma.event.count({
      where: {
        tags: {
          some: {
            id: parseInt(tagId)
          }
        }
      }
    });
    
    return {
      events,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting events by tag ${tagId}:`, error);
    throw error;
  }
};

/**
 * Get events followed by a user
 */
const getUserFollowedEvents = async (userId, { page = 1, limit = 10 }) => {
  try {
    const skip = (page - 1) * limit;
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        eventFollowers: {
          skip,
          take: limit,
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            },
            tags: true,
            _count: {
              select: {
                followers: true
              }
            }
          }
        },
        _count: {
          select: {
            eventFollowers: true
          }
        }
      }
    });
    
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }
    
    return {
      events: user.eventFollowers,
      meta: {
        total: user._count.eventFollowers,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user._count.eventFollowers / limit)
      }
    };
  } catch (error) {
    logger.error(`Error getting events followed by user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get upcoming events
 */
const getUpcomingEvents = async ({ limit = 5 }) => {
  try {
    const now = new Date();
    
    const events = await prisma.event.findMany({
      where: {
        startTime: { gte: now }
      },
      orderBy: {
        startTime: 'asc'
      },
      take: limit,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: true,
        _count: {
          select: {
            followers: true
          }
        }
      }
    });
    
    return events;
  } catch (error) {
    logger.error('Error getting upcoming events:', error);
    throw error;
  }
};

/**
 * Search events
 */
const searchEvents = async ({ query, page = 1, limit = 10, sort = 'relevance' }) => {
  try {
    if (!query || query.trim() === '') {
      return await getAllEvents({ page, limit, sort });
    }
    
    const skip = (page - 1) * limit;
    
    // Build search query
    const searchQuery = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ]
    };
    
    // Determine sort order
    let orderBy = {};
    switch (sort) {
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
      case 'upcoming':
        // Only show future events, sorted by start time
        searchQuery.startTime = { gte: new Date() };
        orderBy = { startTime: 'asc' };
        break;
      case 'past':
        // Only show past events, sorted by start time descending
        searchQuery.endTime = { lt: new Date() };
        orderBy = { startTime: 'desc' };
        break;
      case 'relevance':
      default:
        // For relevance, we might need to do some post-processing
        orderBy = { startTime: 'asc' };
        break;
    }
    
    // Get events
    const events = await prisma.event.findMany({
      where: searchQuery,
      skip,
      take: limit,
      orderBy,
      include: {
        club: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        tags: true,
        _count: {
          select: {
            followers: true
          }
        }
      }
    });
    
    // Get total count
    const totalCount = await prisma.event.count({ where: searchQuery });
    
    // For 'relevance' sorting, we might want to post-process results
    if (sort === 'relevance') {
      // Simple relevance algorithm: exact name match > name contains > description contains
      events.sort((a, b) => {
        const aNameExact = a.name.toLowerCase() === query.toLowerCase();
        const bNameExact = b.name.toLowerCase() === query.toLowerCase();
        
        if (aNameExact && !bNameExact) return -1;
        if (!aNameExact && bNameExact) return 1;
        
        const aNameContains = a.name.toLowerCase().includes(query.toLowerCase());
        const bNameContains = b.name.toLowerCase().includes(query.toLowerCase());
        
        if (aNameContains && !bNameContains) return -1;
        if (!aNameContains && bNameContains) return 1;
        
        return 0;
      });
    }
    
    return {
      events,
      meta: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
        query
      }
    };
  } catch (error) {
    logger.error(`Error searching events with query '${query}':`, error);
    throw error;
  }
};

module.exports = {
  createEvent,
  getEventById,
  getEventBySlug,
  updateEvent,
  deleteEvent,
  followEvent,
  unfollowEvent,
  logUserVisit,
  getEventAnalytics,
  getAllEventTags,
  getAllEvents,
  getEventsByTag,
  getUserFollowedEvents,
  getUpcomingEvents,
  searchEvents
};
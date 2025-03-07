const { validationResult } = require('express-validator');
const clubService = require('../services/club.service');
const eventService = require('../services/event.service');
const notificationService = require('../services/notification.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError, ForbiddenError, NotFoundError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');
const slugify = require('../utils/slugify.util');

/**
 * Create a new club
 */
const createClub = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const clubData = {
      ...req.body,
      moderatorId: req.body.moderatorId || req.user.id,
      slug: slugify(req.body.name)
    };
    
    const club = await clubService.createClub(clubData);
    
    // Notify the moderator about club creation (if different from creator)
    if (req.user.id !== clubData.moderatorId) {
      try {
        await notificationService.createNotification({
          userId: clubData.moderatorId,
          title: 'You are now a club moderator',
          message: `You have been assigned as moderator of ${club.name}`,
          type: 'CLUB_ROLE',
          metadata: { clubId: club.id, clubName: club.name, role: 'MODERATOR' }
        });
      } catch (notifError) {
        logger.warn('Failed to send moderator notification:', notifError);
      }
    }
    
    return sendSuccess(res, { club }, 'Club created successfully', 201);
  } catch (error) {
    logger.error('Error creating club:', error);
    next(error);
  }
};

/**
 * Get club by ID
 */
const getClubById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeCounts = req.query.stats === 'true';
    const club = await clubService.getClubById(id, includeCounts);
    
    return sendSuccess(res, { club }, 'Club retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving club with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get club by slug
 */
const getClubBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const includeCounts = req.query.stats === 'true';
    const club = await clubService.getClubBySlug(slug, includeCounts);
    
    return sendSuccess(res, { club }, 'Club retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving club with slug ${req.params.slug}:`, error);
    next(error);
  }
};

/**
 * Update a club
 */
const updateClub = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
      logger.debug('Validation errors:', errors.array());
      throw new ValidationError(`Validation failed: ${errorMessages}`, errors.array());
    }
    
    const { id } = req.params;
    const clubData = req.body;
    
    // Update slug if name is being changed
    if (clubData.name) {
      clubData.slug = slugify(clubData.name);
    }
    
    // Check if transferring moderator role
    const existingClub = await clubService.getClubById(id);
    if (clubData.moderatorId && clubData.moderatorId !== existingClub.moderatorId) {
      try {
        // Notify the new moderator
        await notificationService.createNotification({
          userId: clubData.moderatorId,
          title: 'Club Moderator Assignment',
          message: `You have been assigned as moderator of ${existingClub.name}`,
          type: 'CLUB_ROLE',
          metadata: { clubId: id, clubName: existingClub.name, role: 'MODERATOR' }
        });
      } catch (notifError) {
        logger.warn('Failed to send moderator notification:', notifError);
      }
    }
    
    const club = await clubService.updateClub(id, clubData);
    
    // Notify club followers about the update
    try {
      await notificationService.notifyClubFollowers({
        clubId: id,
        title: 'Club Updated',
        message: `${club.name} has been updated`,
        type: 'CLUB_UPDATE',
        metadata: { clubId: id, clubName: club.name },
        excludeUserIds: [req.user.id] // Don't notify the user who made the update
      });
    } catch (notifError) {
      logger.warn('Failed to notify club followers:', notifError);
    }
    
    return sendSuccess(res, { club }, 'Club updated successfully');
  } catch (error) {
    logger.error(`Error updating club with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Delete a club
 */
const deleteClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get club details before deletion for notifications
    const club = await clubService.getClubById(id);
    
    await clubService.deleteClub(id);
    
    // Notify club moderator and followers
    try {
      const userIds = [club.moderatorId, ...club.followers.map(f => f.id)].filter(uid => uid !== req.user.id);
      
      if (userIds.length > 0) {
        await notificationService.createNotificationForUsers({
          userIds,
          title: 'Club Deleted',
          message: `The club "${club.name}" has been deleted by an administrator`,
          type: 'CLUB_DELETE',
          metadata: { clubName: club.name }
        });
      }
    } catch (notifError) {
      logger.warn('Failed to send club deletion notifications:', notifError);
    }
    
    return sendSuccess(res, null, 'Club deleted successfully');
  } catch (error) {
    logger.error(`Error deleting club with ID ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Follow a club
 */
const followClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const result = await clubService.followClub(userId, id);
    
    // Send notification to the club moderator
    try {
      const club = await clubService.getClubById(id, false);
      await notificationService.createNotification({
        userId: club.moderatorId,
        title: 'New Club Follower',
        message: `${req.user.name} is now following your club`,
        type: 'CLUB_FOLLOW',
        metadata: { clubId: id, followerName: req.user.name, followerId: userId }
      });
    } catch (notifError) {
      logger.warn(`Failed to send moderator notification for club ${id} follow:`, notifError);
    }
    
    return sendSuccess(res, result, 'Club followed successfully');
  } catch (error) {
    logger.error(`Error following club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Unfollow a club
 */
const unfollowClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await clubService.unfollowClub(userId, id);
    
    return sendSuccess(res, null, 'Club unfollowed successfully');
  } catch (error) {
    logger.error(`Error unfollowing club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Add user to a club
 */
const addUserToClub = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role = 'MEMBER' } = req.body;
    
    const result = await clubService.addUserToClub(userId, id, role);
    
    // Send notification to the user
    try {
      const club = await clubService.getClubById(id, false);
      await notificationService.createNotification({
        userId,
        title: 'Club Membership',
        message: `You have been added to ${club.name} as a ${role.toLowerCase()}`,
        type: 'CLUB_MEMBERSHIP',
        metadata: { clubId: id, clubName: club.name, role }
      });
    } catch (notifError) {
      logger.warn(`Failed to send notification for adding user ${userId} to club ${id}:`, notifError);
    }
    
    return sendSuccess(res, result, 'User added to club successfully');
  } catch (error) {
    logger.error(`Error adding user to club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Remove user from club
 */
const removeUserFromClub = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    
    // Get club name for notification
    const club = await clubService.getClubById(id, false);
    
    await clubService.removeUserFromClub(userId, id);
    
    // Send notification to the user
    try {
      await notificationService.createNotification({
        userId,
        title: 'Club Membership Removed',
        message: `You have been removed from ${club.name}`,
        type: 'CLUB_MEMBERSHIP_REMOVED',
        metadata: { clubId: id, clubName: club.name }
      });
    } catch (notifError) {
      logger.warn(`Failed to send notification for removing user ${userId} from club ${id}:`, notifError);
    }
    
    return sendSuccess(res, null, 'User removed from club successfully');
  } catch (error) {
    logger.error(`Error removing user ${req.params.userId} from club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Change user role in club
 */
const changeUserRoleInClub = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    
    const result = await clubService.changeUserRoleInClub(userId, id, role);
    
    // Get club name for notification
    const club = await clubService.getClubById(id, false);
    
    // Send notification to the user
    try {
      await notificationService.createNotification({
        userId,
        title: 'Club Role Updated',
        message: `Your role in ${club.name} has been changed to ${role.toLowerCase()}`,
        type: 'CLUB_ROLE_CHANGE',
        metadata: { clubId: id, clubName: club.name, role }
      });
    } catch (notifError) {
      logger.warn(`Failed to send notification for role change of user ${userId} in club ${id}:`, notifError);
    }
    
    return sendSuccess(res, result, 'User role in club updated successfully');
  } catch (error) {
    logger.error(`Error changing user ${req.params.userId} role in club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Change user status in club
 */
const changeUserStatusInClub = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const { status } = req.body;
    
    const result = await clubService.changeUserStatusInClub(userId, id, status);
    
    // Get club name for notification
    const club = await clubService.getClubById(id, false);
    
    // Send notification to the user
    try {
      await notificationService.createNotification({
        userId,
        title: 'Club Membership Status Updated',
        message: `Your status in ${club.name} has been changed to ${status.toLowerCase()}`,
        type: 'CLUB_STATUS_CHANGE',
        metadata: { clubId: id, clubName: club.name, status }
      });
    } catch (notifError) {
      logger.warn(`Failed to send notification for status change of user ${userId} in club ${id}:`, notifError);
    }
    
    return sendSuccess(res, result, 'User status in club updated successfully');
  } catch (error) {
    logger.error(`Error changing user ${req.params.userId} status in club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Log a visit to a club
 */
const logUserVisit = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await clubService.logUserVisit(userId, id);
    
    return sendSuccess(res, null, 'Visit logged successfully');
  } catch (error) {
    logger.error(`Error logging visit to club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get club analytics
 */
const getClubAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    const analytics = await clubService.getClubAnalytics(id, {
      startDate,
      endDate
    });
    
    return sendSuccess(res, { analytics }, 'Club analytics retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving analytics for club ${req.params.id}:`, error);
    next(error);
  }
};

/**
 * Get all club tags
 */
const getAllClubTags = async (req, res, next) => {
  try {
    const tags = await clubService.getAllClubTags();
    return sendSuccess(res, { tags }, 'Club tags retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving club tags:', error);
    next(error);
  }
};

/**
 * Get all clubs with pagination and filters
 */
const getAllClubs = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, tag, sort } = req.query;
    
    const result = await clubService.getAllClubs({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      tag,
      sort
    });
    
    return sendSuccess(res, result, 'Clubs retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving clubs:', error);
    next(error);
  }
};

/**
 * Get clubs by tag
 */
const getClubsByTag = async (req, res, next) => {
  try {
    const { tagId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await clubService.getClubsByTag(tagId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, result, 'Clubs by tag retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving clubs by tag ${req.params.tagId}:`, error);
    next(error);
  }
};

/**
 * Get clubs where user is a member
 */
const getUserMemberClubs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await clubService.getUserMemberClubs(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, result, 'Member clubs retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving member clubs for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get clubs where user is a manager
 */
const getUserManagedClubs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await clubService.getUserManagedClubs(userId);
    
    return sendSuccess(res, result, 'Managed clubs retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving managed clubs for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Get clubs followed by current user
 */
const getUserFollowedClubs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await clubService.getUserFollowedClubs(userId, {
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    return sendSuccess(res, result, 'Followed clubs retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving followed clubs for user ${req.user.id}:`, error);
    next(error);
  }
};

/**
 * Search clubs
 */
const searchClubs = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 10, sort = 'relevance' } = req.query;
    
    const result = await clubService.searchClubs({
      query,
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    
    return sendSuccess(res, result, 'Clubs search results');
  } catch (error) {
    logger.error(`Error searching clubs with query '${req.query.query}':`, error);
    next(error);
  }
};

/**
 * Get events for a club
 */
const getClubEvents = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, sort = 'upcoming' } = req.query;
    
    const result = await eventService.getEventsByClub(id, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort
    });
    
    return sendSuccess(res, result, 'Club events retrieved successfully');
  } catch (error) {
    logger.error(`Error retrieving events for club ${req.params.id}:`, error);
    next(error);
  }
};

module.exports = {
  createClub,
  updateClub,
  deleteClub,
  followClub,
  unfollowClub,
  addUserToClub,
  removeUserFromClub,
  changeUserRoleInClub,
  changeUserStatusInClub,
  logUserVisit,
  getClubAnalytics,
  getAllClubTags,
  getAllClubs,
  getClubsByTag,
  getUserMemberClubs,
  getUserManagedClubs,
  getUserFollowedClubs,
  searchClubs,
  getClubById,
  getClubBySlug,
  getClubEvents
};
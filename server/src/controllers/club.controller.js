const { validationResult } = require('express-validator');
const clubService = require('../services/club.service');
const { sendSuccess, sendError } = require('../utils/response.util');
const { ValidationError } = require('../middleware/error.middleware');
const { logger } = require('../utils/logger.util');
const notificationService = require('../services/notification.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create a new club
const createClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const club = await clubService.createClub(req.body);
    return sendSuccess(res, { club }, 'Club created successfully');
  } catch (error) {
    logger.error('Error creating club:', error);
    return sendError(res, error);
  }
};

// Update an existing club
const updateClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const club = await clubService.updateClub(req.params.id, req.body);
    return sendSuccess(res, { club }, 'Club updated successfully');
  } catch (error) {
    logger.error('Error updating club:', error);
    return sendError(res, error);
  }
};

// Delete a club
const deleteClub = async (req, res) => {
  try {
    await clubService.deleteClub(req.params.id);
    return sendSuccess(res, null, 'Club deleted successfully');
  } catch (error) {
    logger.error('Error deleting club:', error);
    return sendError(res, error);
  }
};

// Follow a club
const followClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const follow = await clubService.followClub(req.user.id, req.params.clubId);
    return sendSuccess(res, { follow }, 'Successfully followed the club');
  } catch (error) {
    logger.error('Error following club:', error);
    return sendError(res, error);
  }
};

// Unfollow a club
const unfollowClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    await clubService.unfollowClub(req.user.id, req.params.clubId);
    return sendSuccess(res, null, 'Successfully unfollowed the club');
  } catch (error) {
    logger.error('Error unfollowing club:', error);
    return sendError(res, error);
  }
};

// Add album photo
const addAlbumPhoto = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const photo = req.file; // Assuming file upload middleware is used
    const albumPhoto = await clubService.addAlbumPhoto(req.params.clubId, photo);
    return sendSuccess(res, { albumPhoto }, 'Album photo added successfully');
  } catch (error) {
    logger.error('Error adding album photo:', error);
    return sendError(res, error);
  }
};

// Remove album photo
const removeAlbumPhoto = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    await clubService.removeAlbumPhoto(req.params.photoId);
    return sendSuccess(res, null, 'Album photo removed successfully');
  } catch (error) {
    logger.error('Error removing album photo:', error);
    return sendError(res, error);
  }
};

// Add a user to a club
const addUserToClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const { userId, role } = req.body;
    const clubId = req.params.clubId;
    const userClub = await clubService.addUserToClub(userId, clubId, role);
    // Send notification to the user
    await notificationService.broadcastToChannel(`user:${userId}`, {
      message: `You have been added to the club ${userClub.club.name} as ${role}.`,
      clubId
    });
    return sendSuccess(res, { userClub }, 'User added to club successfully');
  } catch (error) {
    logger.error('Error adding user to club:', error);
    return sendError(res, error);
  }
};

// Remove a user from a club
const removeUserFromClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const userId = req.params.userId;
    const clubId = req.params.clubId;
    await clubService.removeUserFromClub(userId, clubId);
    // Send notification to the user
    await notificationService.broadcastToChannel(`user:${userId}`, {
      message: `You have been removed from the club ${clubId}.`,
      clubId
    });
    return sendSuccess(res, null, 'User removed from club successfully');
  } catch (error) {
    logger.error('Error removing user from club:', error);
    return sendError(res, error);
  }
};

// Change a user's role in a club
const changeUserRoleInClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const userId = req.params.userId;
    const clubId = req.params.clubId;
    const { newRole } = req.body;
    await clubService.changeUserRoleInClub(userId, clubId, newRole);
    // Send notification to the user
    await notificationService.broadcastToChannel(`user:${userId}`, {
      message: `Your role in the club has been changed to ${newRole}.`,
      clubId
    });
    return sendSuccess(res, null, 'User role changed successfully');
  } catch (error) {
    logger.error('Error changing user role in club:', error);
    return sendError(res, error);
  }
};

// Change a user's status in a club
const changeUserStatusInClub = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  try {
    const userId = req.params.userId;
    const clubId = req.params.clubId;
    const { newStatus } = req.body;
    await clubService.changeUserStatusInClub(userId, clubId, newStatus);
    return sendSuccess(res, null, 'User status changed successfully');
  } catch (error) {
    logger.error('Error changing user status in club:', error);
    return sendError(res, error);
  }
};

// Get concise info of a club
const getClubInfo = async (req, res) => {
  const { clubId } = req.params;
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
      select: {
        id: true,
        name: true,
        coverPhoto: true,
        followerCount: {
          select: { _count: true }
        }
      }
    });
    return sendSuccess(res, { club }, 'Club info retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving club info:', error);
    return sendError(res, error);
  }
};

// Get detailed info of a club
const getClubDetails = async (req, res) => {
  const { clubId } = req.params;
  try {
    const club = await prisma.club.findUnique({
      where: { id: parseInt(clubId) },
      include: {
        members: {
          select: { userId, role }
        },
        followers: true,
        moderator: true,
        events: true
      }
    });
    return sendSuccess(res, { club }, 'Club details retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving club details:', error);
    return sendError(res, error);
  }
};

// Get events of a club
const getClubEvents = async (req, res) => {
  const { clubId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  try {
    const events = await prisma.event.findMany({
      where: { clubId: parseInt(clubId) },
      skip: (page - 1) * limit,
      take: limit
    });
    const totalCount = await prisma.event.count({ where: { clubId: parseInt(clubId) } });
    return sendSuccess(res, { events, totalCount }, 'Club events retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving club events:', error);
    return sendError(res, error);
  }
};

// Get analytics data for a club
const getClubAnalytics = async (req, res) => {
  const { clubId } = req.params;
  try {
    const totalMembers = await prisma.userClub.count({
      where: { clubId: parseInt(clubId) }
    });

    const totalFollowers = await prisma.club.followers.count({
      where: { id: parseInt(clubId) }
    });

    const totalEvents = await prisma.event.count({
      where: { clubId: parseInt(clubId) }
    });

    const totalVisits = await prisma.userVisit.count({
      where: { clubId: parseInt(clubId) }
    });

    const followUnfollowLogs = await prisma.followUnfollowLog.findMany({
      where: { clubId: parseInt(clubId) }
    });

    const followRate = followUnfollowLogs.filter(log => log.action === 'follow').length;
    const unfollowRate = followUnfollowLogs.filter(log => log.action === 'unfollow').length;

    const membersRoles = await prisma.userClub.groupBy({
      by: ['role'],
      where: { clubId: parseInt(clubId) },
      _count: {
        role: true
      }
    });

    return sendSuccess(res, {
      totalMembers,
      totalFollowers,
      totalEvents,
      totalVisits,
      followRate,
      unfollowRate,
      membersRoles
    }, 'Club analytics retrieved successfully');
  } catch (error) {
    logger.error('Error retrieving club analytics:', error);
    return sendError(res, error);
  }
};

// Log a user's visit to a club page
const logUserVisit = async (req, res) => {
  const { clubId } = req.params;
  const userId = req.user.id;
  try {
    await clubService.logUserVisit(userId, clubId);
    return sendSuccess(res, null, 'User visit logged successfully');
  } catch (error) {
    logger.error('Error logging user visit:', error);
    return sendError(res, error);
  }
};

// Search for clubs
const searchClubs = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, new ValidationError(errors.array()));
  }
  const { query, page = 1, limit = 10, sort } = req.query;
  try {
    const clubs = await clubService.searchClubs({ query, page, limit, sort });
    return sendSuccess(res, { clubs }, 'Clubs retrieved successfully');
  } catch (error) {
    logger.error('Error searching clubs:', error);
    return sendError(res, error);
  }
};

module.exports = {
  createClub,
  updateClub,
  deleteClub,
  followClub,
  unfollowClub,
  addAlbumPhoto,
  removeAlbumPhoto,
  addUserToClub,
  removeUserFromClub,
  changeUserRoleInClub,
  changeUserStatusInClub,
  getClubInfo,
  getClubDetails,
  getClubEvents,
  getClubAnalytics,
  logUserVisit,
  searchClubs
}; 
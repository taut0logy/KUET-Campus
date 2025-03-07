const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/auth.middleware');
const { 
  validateCreateClub,
  validateUpdateClub,
  validateClubId,
  validateClubSlug,
  validateClubRoleChange,
  validateClubStatusChange,
  validateAddUserToClub,
  validateListClubs,
  validateClubAnalytics,
  validateFollowClub,
  validateUnfollowClub,
  validateVisitClub
} = require('../middleware/validators/club.validator');
const { validateListEvents } = require('../middleware/validators/event.validator');

/**
 * @route   POST /api/v1/clubs
 * @desc    Create a new club
 * @access  Private - Admins and faculty
 */
router.post(
  '/',
  authenticate,
  authorize(['ADMIN', 'FACULTY']),
  validateCreateClub,
  clubController.createClub
);

/**
 * @route   GET /api/v1/clubs
 * @desc    Get all clubs with pagination and filters
 * @access  Public
 */
router.get(
  '/',
  validateListClubs,
  clubController.getAllClubs
);

/**
 * @route   GET /api/v1/clubs/search
 * @desc    Search for clubs
 * @access  Public
 */
router.get(
  '/search',
  validateListClubs,
  clubController.searchClubs
);

/**
 * @route   GET /api/v1/clubs/tags
 * @desc    Get all club tags
 * @access  Public
 */
router.get(
  '/tags',
  clubController.getAllClubTags
);

/**
 * @route   GET /api/v1/clubs/tags/:tagId
 * @desc    Get clubs by tag
 * @access  Public
 */
router.get(
  '/tags/:tagId',
  validateListClubs,
  clubController.getClubsByTag
);

/**
 * @route   GET /api/v1/clubs/followed
 * @desc    Get clubs followed by current user
 * @access  Private
 */
router.get(
  '/followed',
  authenticate,
  validateListClubs,
  clubController.getUserFollowedClubs
);

/**
 * @route   GET /api/v1/clubs/member
 * @desc    Get clubs where current user is a member
 * @access  Private
 */
router.get(
  '/member',
  authenticate,
  validateListClubs,
  clubController.getUserMemberClubs
);

/**
 * @route   GET /api/v1/clubs/managed
 * @desc    Get clubs managed by current user
 * @access  Private
 */
router.get(
  '/managed',
  authenticate,
  clubController.getUserManagedClubs
);

/**
 * @route   GET /api/v1/clubs/:id
 * @desc    Get club by ID
 * @access  Public
 */
router.get(
  '/:id',
  validateClubId,
  //trackClubVisit(),
  clubController.getClubById
);

/**
 * @route   GET /api/v1/clubs/slug/:slug
 * @desc    Get club by slug
 * @access  Public
 */
router.get(
  '/slug/:slug',
  validateClubSlug,
  //trackClubVisit('slug'),
  clubController.getClubBySlug
);

/**
 * @route   PUT /api/v1/clubs/:id
 * @desc    Update a club
 * @access  Private - Club moderator or Admin
 */
router.put(
  '/:id',
  authenticate,
  validateClubId,
  validateUpdateClub,
  //authorize(['MODERATOR']),
  clubController.updateClub
);

/**
 * @route   DELETE /api/v1/clubs/:id
 * @desc    Delete a club
 * @access  Private - Admin only
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['ADMIN']),
  validateClubId,
  clubController.deleteClub
);

/**
 * @route   POST /api/v1/clubs/:id/follow
 * @desc    Follow a club
 * @access  Private
 */
router.post(
  '/:id/follow',
  authenticate,
  validateFollowClub,
  clubController.followClub
);

/**
 * @route   DELETE /api/v1/clubs/:id/follow
 * @desc    Unfollow a club
 * @access  Private
 */
router.delete(
  '/:id/follow',
  authenticate,
  validateUnfollowClub,
  clubController.unfollowClub
);

/**
 * @route   POST /api/v1/clubs/:id/members
 * @desc    Add a user to a club
 * @access  Private - Club moderator and managers
 */
router.post(
  '/:id/members',
  authenticate,
  validateClubId,
  validateAddUserToClub,
  authorize(['MODERATOR', 'MANAGER']),
  clubController.addUserToClub
);

/**
 * @route   DELETE /api/v1/clubs/:id/members/:userId
 * @desc    Remove a user from a club
 * @access  Private - Club moderator and managers
 */
router.delete(
  '/:id/members/:userId',
  authenticate,
  validateClubId,
  //authorize(['MODERATOR', 'MANAGER']),
  clubController.removeUserFromClub
);

/**
 * @route   PUT /api/v1/clubs/:id/members/:userId/role
 * @desc    Change a user's role in a club
 * @access  Private - Club moderator
 */
router.put(
  '/:id/members/:userId/role',
  authenticate,
  validateClubId,
  validateClubRoleChange,
  //authorize(['MODERATOR']),
  clubController.changeUserRoleInClub
);

/**
 * @route   PUT /api/v1/clubs/:id/members/:userId/status
 * @desc    Change a user's status in a club
 * @access  Private - Club moderator and managers
 */
router.put(
  '/:id/members/:userId/status',
  authenticate,
  validateClubId,
  validateClubStatusChange,
  //checkClubPermission(['MODERATOR', 'MANAGER']),
  clubController.changeUserStatusInClub
);

/**
 * @route   POST /api/v1/clubs/:id/visit
 * @desc    Log a visit to a club
 * @access  Private
 */
router.post(
  '/:id/visit',
  authenticate,
  validateVisitClub,
  clubController.logUserVisit
);

/**
 * @route   GET /api/v1/clubs/:id/analytics
 * @desc    Get club analytics
 * @access  Private - Club moderator and managers, Admins
 */
router.get(
  '/:id/analytics',
  authenticate,
  validateClubId,
  validateClubAnalytics,
  //checkClubPermission(['MODERATOR', 'MANAGER']),
  clubController.getClubAnalytics
);

/**
 * @route   GET /api/v1/clubs/:id/events
 * @desc    Get events for a specific club
 * @access  Public
 */
router.get(
  '/:id/events',
  validateClubId,
  validateListEvents,
  clubController.getClubEvents
);

module.exports = router;
const express = require('express');
const router = express.Router();
const clubController = require('../controllers/club.controller');
const { authenticate, authorizeAdmin, authorizeModeratorOrManager } = require('../middleware/auth.middleware');
const { 
  createClubValidation,
  updateClubValidation,
  followClubValidation,
  unfollowClubValidation,
  addAlbumPhotoValidation,
  removeAlbumPhotoValidation,
  addUserToClubValidation,
  changeUserRoleValidation,
  changeUserStatusValidation,
  searchClubsValidation
} = require('../middleware/validators/club.validator');

// Create a new club
router.post('/', authorizeAdmin, createClubValidation, clubController.createClub);

// Update an existing club
router.put('/:id', authorizeModeratorOrManager, updateClubValidation, clubController.updateClub);

// Delete a club
router.delete('/:id', authorizeAdmin, clubController.deleteClub);

// Follow a club
router.post('/:clubId/follow', followClubValidation, clubController.followClub);

// Unfollow a club
router.delete('/:clubId/unfollow', unfollowClubValidation, clubController.unfollowClub);

// Add album photo
router.post('/:clubId/album', addAlbumPhotoValidation, clubController.addAlbumPhoto);

// Remove album photo
router.delete('/album/:photoId', removeAlbumPhotoValidation, clubController.removeAlbumPhoto);

// Add a user to a club
router.post('/:clubId/users', authorizeModeratorOrManager, addUserToClubValidation, clubController.addUserToClub);

// Remove a user from a club
router.delete('/:clubId/users/:userId', authorizeModeratorOrManager, clubController.removeUserFromClub);

// Change a user's role in a club
router.put('/:clubId/users/:userId/role', authorizeModeratorOrManager, changeUserRoleValidation, clubController.changeUserRoleInClub);

// Change a user's status in a club
router.put('/:clubId/users/:userId/status', authorizeModeratorOrManager, changeUserStatusValidation, clubController.changeUserStatusInClub);

// Get concise info of a club
router.get('/:clubId/info', clubController.getClubInfo);

// Get detailed info of a club
router.get('/:clubId/details', clubController.getClubDetails);

// Get events of a club with pagination and filtering
router.get('/:clubId/events', clubController.getClubEvents);

// Get analytics data for a club
router.get('/:clubId/analytics', authenticate, authorizeModeratorOrManager, clubController.getClubAnalytics);

// Log a user's visit to a club page
router.post('/:clubId/visit', clubController.logUserVisit);

// Search for clubs
router.get('/search', searchClubsValidation, clubController.searchClubs);

module.exports = router; 
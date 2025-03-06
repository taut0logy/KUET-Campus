const { body, param, query } = require('express-validator');

// Validation for creating a club
const createClubValidation = [
  body('name').notEmpty().withMessage('Club name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('moderatorId').isInt().withMessage('Moderator ID must be an integer')
];

// Validation for updating a club
const updateClubValidation = [
  param('id').isInt().withMessage('Club ID must be an integer'),
  body('name').optional().notEmpty().withMessage('Club name cannot be empty'),
  body('description').optional().isString().withMessage('Description must be a string')
];

// Validation for following a club
const followClubValidation = [
  param('clubId').isInt().withMessage('Club ID must be an integer')
];

// Validation for unfollowing a club
const unfollowClubValidation = [
  param('clubId').isInt().withMessage('Club ID must be an integer')
];

// Validation for adding an album photo
const addAlbumPhotoValidation = [
  param('clubId').isInt().withMessage('Club ID must be an integer')
];

// Validation for removing an album photo
const removeAlbumPhotoValidation = [
  param('photoId').isInt().withMessage('Photo ID must be an integer')
];

// Validation for adding a user to a club
const addUserToClubValidation = [
  body('userId').isInt().withMessage('User ID must be an integer'),
  body('role').isString().withMessage('Role must be a string')
];

// Validation for changing a user's role in a club
const changeUserRoleValidation = [
  param('userId').isInt().withMessage('User ID must be an integer'),
  body('newRole').isString().withMessage('New role must be a string')
];

const changeUserStatusValidation = [
  param('userId').isInt().withMessage('User ID must be an integer'),
  body('newStatus').isString().withMessage('New status must be a string')
];

// Validation for searching clubs
const searchClubsValidation = [
  query('query').optional().isString().withMessage('Query must be a string'),
  query('page').optional().isInt().withMessage('Page must be an integer'),
  query('limit').optional().isInt().withMessage('Limit must be an integer'),
  query('sort').optional().isString().withMessage('Sort must be a string')
];

module.exports = {
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
}; 
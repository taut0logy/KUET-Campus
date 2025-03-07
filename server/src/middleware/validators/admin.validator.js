const { body } = require('express-validator');

// Validation for creating an announcement
const createAnnouncementValidator = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
];

module.exports = {
  createAnnouncementValidator,
}; 
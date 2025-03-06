const { param } = require('express-validator');

// Validation for fetching event info
const eventInfoValidation = [
  param('eventId').isInt().withMessage('Event ID must be an integer')
];

// Validation for fetching event details
const eventDetailsValidation = [
  param('eventId').isInt().withMessage('Event ID must be an integer')
];

// Validation for searching events
const searchEventsValidation = [
  query('query').optional().isString().withMessage('Query must be a string'),
  query('page').optional().isInt().withMessage('Page must be an integer'),
  query('limit').optional().isInt().withMessage('Limit must be an integer'),
  query('sort').optional().isString().withMessage('Sort must be a string')
];

module.exports = {
  eventInfoValidation,
  eventDetailsValidation,
  searchEventsValidation
}; 
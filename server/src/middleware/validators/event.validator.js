const { param, query } = require('express-validator');

// validation for following an event
const followEventValidation = [
  param('eventId').isInt().withMessage('Event ID must be an integer')
];

// validation for unfollowing an event
const unfollowEventValidation = [
  param('eventId').isInt().withMessage('Event ID must be an integer')
];

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
  followEventValidation,
  unfollowEventValidation,
  eventInfoValidation,
  eventDetailsValidation,
  searchEventsValidation
}; 
const { body, param, query } = require('express-validator');
const { prisma } = require('../../services/database.service');

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

/**
 * Validate event creation
 */
const validateCreateEvent = [
  body('name')
    .notEmpty()
    .withMessage('Event name is required')
    .isString()
    .withMessage('Event name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('startTime')
    .notEmpty()
    .withMessage('Start time is required')
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value, { req }) => {
      const startTime = new Date(value);
      const now = new Date();
      if (startTime < now) {
        throw new Error('Start time cannot be in the past');
      }
      return true;
    }),

  body('endTime')
    .notEmpty()
    .withMessage('End time is required')
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (!req.body.startTime) return true;
      
      const startTime = new Date(req.body.startTime);
      const endTime = new Date(value);
      
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      return true;
    }),

  body('clubId')
    .notEmpty()
    .withMessage('Club ID is required')
    .isInt()
    .withMessage('Club ID must be an integer')
    .custom(async (value) => {
      const club = await prisma.club.findUnique({
        where: { id: parseInt(value) }
      });
      if (!club) {
        throw new Error('Club not found');
      }
      return true;
    }),

  body('coverPhoto')
    .optional()
    .isURL()
    .withMessage('Cover photo must be a valid URL'),
    
  body('eventLinks')
    .optional()
    .isArray()
    .withMessage('Event links must be an array'),

  body('eventLinks.*.name')
    .optional()
    .isString()
    .withMessage('Link name must be a string'),

  body('eventLinks.*.url')
    .optional()
    .isURL()
    .withMessage('Link URL must be a valid URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom(async (value) => {
      if (value && value.length > 0) {
        // Convert all values to integers
        const tagIds = value.map(tag => parseInt(tag));
        
        // Check if all tags exist
        const existingTags = await prisma.eventTag.findMany({
          where: {
            id: { in: tagIds }
          }
        });
        
        if (existingTags.length !== tagIds.length) {
          throw new Error('One or more tags do not exist');
        }
      }
      return true;
    })
];

/**
 * Validate event update
 */
const validateUpdateEvent = [
  param('id')
    .isInt()
    .withMessage('Event ID must be an integer'),

  body('name')
    .optional()
    .isString()
    .withMessage('Event name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Event name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('startTime')
    .optional()
    .isISO8601()
    .withMessage('Start time must be a valid date')
    .custom((value, { req }) => {
      const startTime = new Date(value);
      const now = new Date();
      
      if (startTime < now) {
        throw new Error('Start time cannot be in the past');
      }
      
      if (req.body.endTime) {
        const endTime = new Date(req.body.endTime);
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }
      
      return true;
    }),

  body('endTime')
    .optional()
    .isISO8601()
    .withMessage('End time must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startTime) {
        const startTime = new Date(req.body.startTime);
        const endTime = new Date(value);
        
        if (endTime <= startTime) {
          throw new Error('End time must be after start time');
        }
      }
      return true;
    }),

  body('coverPhoto')
    .optional()
    .isURL()
    .withMessage('Cover photo must be a valid URL'),
    
  body('eventLinks')
    .optional()
    .isArray()
    .withMessage('Event links must be an array'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
    .custom(async (value) => {
      if (value && value.length > 0) {
        // Convert all values to integers
        const tagIds = value.map(tag => parseInt(tag));
        
        // Check if all tags exist
        const existingTags = await prisma.eventTag.findMany({
          where: {
            id: { in: tagIds }
          }
        });
        
        if (existingTags.length !== tagIds.length) {
          throw new Error('One or more tags do not exist');
        }
      }
      return true;
    })
];

/**
 * Validate event id parameter
 */
const validateEventId = [
  param('id')
    .isInt()
    .withMessage('Event ID must be an integer')
    .custom(async (value) => {
      const event = await prisma.event.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!event) {
        throw new Error('Event not found');
      }
      return true;
    })
];

/**
 * Validate event slug parameter
 */
const validateEventSlug = [
  param('slug')
    .isString()
    .withMessage('Event slug must be a string')
    .custom(async (value) => {
      const event = await prisma.event.findUnique({
        where: { slug: value }
      });
      
      if (!event) {
        throw new Error('Event not found');
      }
      return true;
    })
];

/**
 * Validate pagination and filtering parameters
 */
const validateListEvents = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
    
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
    
  query('tag')
    .optional()
    .isInt()
    .withMessage('Tag ID must be an integer')
    .custom(async (value) => {
      const tag = await prisma.eventTag.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!tag) {
        throw new Error('Tag not found');
      }
      return true;
    }),
    
  query('sort')
    .optional()
    .isIn(['alphabetical', 'upcoming', 'past', 'recent', 'relevance'])
    .withMessage('Sort must be one of: alphabetical, upcoming, past, recent, relevance'),
    
  query('clubId')
    .optional()
    .isInt()
    .withMessage('Club ID must be an integer')
    .custom(async (value) => {
      const club = await prisma.club.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!club) {
        throw new Error('Club not found');
      }
      return true;
    })
];

/**
 * Validate analytics parameters
 */
const validateEventAnalytics = [
  param('id')
    .isInt()
    .withMessage('Event ID must be an integer'),
    
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.startDate) {
        const startDate = new Date(req.query.startDate);
        const endDate = new Date(value);
        
        if (endDate <= startDate) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    })
];

module.exports = {
  followEventValidation,
  unfollowEventValidation,
  eventInfoValidation,
  eventDetailsValidation,
  searchEventsValidation,
  validateCreateEvent,
  validateUpdateEvent,
  validateEventId,
  validateEventSlug,
  validateListEvents,
  validateEventAnalytics
};
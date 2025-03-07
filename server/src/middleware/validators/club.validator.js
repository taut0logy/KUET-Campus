const { body, param, query } = require('express-validator');
const { prisma } = require('../../services/database.service');

/**
 * Validate club creation
 */
const validateCreateClub = [
  body('name')
    .notEmpty()
    .withMessage('Club name is required')
    .isString()
    .withMessage('Club name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('foundingDate')
    .notEmpty()
    .withMessage('Founding date is required')
    .isISO8601()
    .withMessage('Founding date must be a valid date'),

  body('moderatorId')
    .notEmpty()
    .withMessage('Moderator ID is required')
    .isInt()
    .withMessage('Moderator ID must be an integer')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),

  body('coverPhoto')
    .optional()
    .isURL()
    .withMessage('Cover photo must be a valid URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('clubTagId')
    .optional()
    .isInt()
    .withMessage('Club tag ID must be an integer')
    .custom(async (value) => {
      if (value) {
        const clubTag = await prisma.clubTag.findUnique({
          where: { id: parseInt(value) }
        });
        
        if (!clubTag) {
          throw new Error('Club tag not found');
        }
      }
      return true;
    })
];

/**
 * Validate club update
 */
const validateUpdateClub = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer'),

  body('name')
    .optional()
    .isString()
    .withMessage('Club name must be a string')
    .isLength({ min: 3, max: 100 })
    .withMessage('Club name must be between 3 and 100 characters'),

  body('description')
    .optional()
    .isString()
    .withMessage('Description must be a string')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('moderatorId')
    .optional()
    .isInt()
    .withMessage('Moderator ID must be an integer')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),

  body('coverPhoto')
    .optional()
    .isURL()
    .withMessage('Cover photo must be a valid URL'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),

  body('clubTagId')
    .optional()
    .isInt()
    .withMessage('Club tag ID must be an integer')
    .custom(async (value) => {
      if (value) {
        const clubTag = await prisma.clubTag.findUnique({
          where: { id: parseInt(value) }
        });
        
        if (!clubTag) {
          throw new Error('Club tag not found');
        }
      }
      return true;
    })
];

/**
 * Validate club id parameter
 */
const validateClubId = [
  param('id')
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
 * Validate club slug parameter
 */
const validateClubSlug = [
  param('slug')
    .isString()
    .withMessage('Club slug must be a string')
    .custom(async (value) => {
      const club = await prisma.club.findUnique({
        where: { slug: value }
      });
      
      if (!club) {
        throw new Error('Club not found');
      }
      return true;
    })
];

/**
 * Validate user club role
 */
const validateClubRoleChange = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer'),
    
  param('userId')
    .isInt()
    .withMessage('User ID must be an integer'),
    
  body('role')
    .isIn(['MEMBER', 'MANAGER'])
    .withMessage('Role must be one of: MEMBER, MANAGER'),
];

/**
 * Validate user club status
 */
const validateClubStatusChange = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer'),
    
  param('userId')
    .isInt()
    .withMessage('User ID must be an integer'),
    
  body('status')
    .isIn(['ACTIVE', 'INACTIVE', 'BANNED'])
    .withMessage('Status must be one of: ACTIVE, INACTIVE, BANNED'),
];

/**
 * Validate adding a user to club
 */
const validateAddUserToClub = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer'),
    
  body('userId')
    .isInt()
    .withMessage('User ID must be an integer')
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!user) {
        throw new Error('User not found');
      }
      return true;
    }),
    
  body('role')
    .optional()
    .isIn(['MEMBER', 'MANAGER'])
    .withMessage('Role must be one of: MEMBER, MANAGER')
];

/**
 * Validate pagination and filtering parameters
 */
const validateListClubs = [
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
      const tag = await prisma.clubTag.findUnique({
        where: { id: parseInt(value) }
      });
      
      if (!tag) {
        throw new Error('Tag not found');
      }
      return true;
    }),
    
  query('sort')
    .optional()
    .isIn(['alphabetical', 'followers', 'recent', 'relevance'])
    .withMessage('Sort must be one of: alphabetical, followers, recent, relevance')
];

/**
 * Validate analytics parameters
 */
const validateClubAnalytics = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer'),
    
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

/**
 * Validate following a club
 */
const validateFollowClub = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer')
];

/**
 * Validate unfollowing a club
 */
const validateUnfollowClub = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer')
];

/**
 * Validate visiting a club
 */
const validateVisitClub = [
  param('id')
    .isInt()
    .withMessage('Club ID must be an integer')
];

module.exports = {
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
};
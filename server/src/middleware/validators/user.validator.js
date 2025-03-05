const { body } = require('express-validator');

// Profile update validation
const profileUpdateValidator = [
  body('name')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Name must be between 2 and 255 characters'),
  
  body('phone')
    .optional()
    .isString()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format'),

  body('bio')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Bio cannot exceed 1000 characters')
];

// Password change validation
const passwordChangeValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required')
    .isLength({ min: 8 })
    .withMessage('Current password must be at least 8 characters'),
  
  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

module.exports = {
  profileUpdateValidator,
  passwordChangeValidator
}; 
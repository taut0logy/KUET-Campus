const { body, param } = require('express-validator');

const orderValidator = [
  body('items')
    .isArray()
    .withMessage('Items must be an array')
    .notEmpty()
    .withMessage('Items array cannot be empty'),
  body('items.*.mealId')
    .isInt()
    .withMessage('Each item must have a valid meal ID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item must have a valid quantity')
];


const orderStatusValidator = [
  param('id')
    .isInt()
    .withMessage('Order ID must be an integer'),
  body('status')
    .isIn(['pending_approval', 'placed', 'ready', 'picked_up', 'cancelled'])
    .withMessage('Invalid status value'),
  body('rejectionReason')
    .optional()
    .isString()
    .withMessage('Rejection reason must be a string'),
  body('pickupTime')
    .optional()
    .isISO8601()
    .withMessage('Pickup time must be a valid date-time string')
];


const orderVerificationValidator = [
  body('verificationData')
    .notEmpty()
    .withMessage('Verification data is required')
];

module.exports = { 
  orderValidator,
  orderStatusValidator,
  orderVerificationValidator
};
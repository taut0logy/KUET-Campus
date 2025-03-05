const { body } = require('express-validator');

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

module.exports = { orderValidator };
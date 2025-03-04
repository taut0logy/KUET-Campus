const { body } = require('express-validator');

const orderValidator = [
  body('menuMealId')
    .exists()
    .withMessage('Menu meal ID is required')
    .isInt()
    .withMessage('Menu meal ID must be an integer'),
  
  body('pickupTime')
    .exists()
    .withMessage('Pickup time is required')
    .isISO8601()
    .withMessage('Invalid pickup time format')
    .custom((value) => {
      const pickupTime = new Date(value);
      const now = new Date();
      if (pickupTime < now) {
        throw new Error('Pickup time must be in the future');
      }
      return true;
    })
];

module.exports = { orderValidator };
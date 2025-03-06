const { body } = require("express-validator");

const addToCartValidator = [
    body('mealId')
        .exists()
        .withMessage('Meal ID is required')
        .isInt()
        .withMessage('Meal ID must be an integer'),
];

module.exports = { addToCartValidator };

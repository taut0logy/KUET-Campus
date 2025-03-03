const { body, param, query } = require('express-validator');

/**
 * Validators for Meal endpoints
 */
const createMealValidator = [
    body('name')
        .notEmpty().withMessage('Name is required'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    body('nutrition')
        .optional()
        .isJSON().withMessage('Nutrition must be valid JSON'),
];

const updateMealValidator = [
    param('id')
        .isInt().withMessage('Meal id must be an integer'),
    body('name')
        .optional()
        .notEmpty().withMessage('Name cannot be empty'),
    body('description')
        .optional()
        .isString().withMessage('Description must be a string'),
    body('nutrition')
        .optional()
        .isJSON().withMessage('Nutrition must be valid JSON'),
];

const deleteMealValidator = [
    param('id')
        .isInt().withMessage('Meal id must be an integer'),
];

const getMealByIdValidator = [
    param('id')
        .isInt().withMessage('Meal id must be an integer'),
];

/**
 * Validators for Menu endpoints
 */
const createMenuValidator = [
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid ISO8601 date')
        .toDate(),
    body('meals')
        .optional()
        .isArray().withMessage('Meals must be an array'),
    body('meals.*.mealId')
        .isInt().withMessage('mealId must be an integer'),
    body('meals.*.price')
        .isDecimal().withMessage('Price must be a decimal'),
    body('meals.*.available')
        .optional()
        .isBoolean().withMessage('Available must be a boolean'),
];

const updateMenuValidator = [
    param('id')
        .isInt().withMessage('Menu id must be an integer'),
    body('date')
        .optional()
        .isISO8601().withMessage('Date must be a valid ISO8601 date')
        .toDate(),
    body('meals')
        .optional()
        .isArray().withMessage('Meals must be an array'),
    body('meals.*.mealId')
        .isInt().withMessage('mealId must be an integer'),
    body('meals.*.price')
        .isDecimal().withMessage('Price must be a decimal'),
    body('meals.*.available')
        .optional()
        .isBoolean().withMessage('Available must be a boolean'),
    body('removeOthers')
        .optional()
        .isBoolean().withMessage('removeOthers must be a boolean'),
];

const deleteMenuValidator = [
    param('id')
        .isInt().withMessage('Menu id must be an integer'),
];

const getMenuByIdValidator = [
    param('id')
        .isInt().withMessage('Menu id must be an integer'),
];

const getMenusValidator = [
    query('date')
        .optional()
        .isISO8601().withMessage('Date must be a valid ISO8601 date')
        .toDate(),
];

const toggleMealAvailabilityValidator = [
    param('id')
        .isInt().withMessage('Menu meal id must be an integer'),
    body('available')
        .isBoolean().withMessage('Available status must be a boolean'),
];

/**
 * Validators for Preorder endpoints
 */
const createPreorderValidator = [
    body('menuMealId')
        .notEmpty().withMessage('menuMealId is required')
        .isInt().withMessage('menuMealId must be an integer'),
];

const updatePreorderStatusValidator = [
    param('id')
        .isInt().withMessage('Preorder id must be an integer'),
    body('status')
        .notEmpty().withMessage('Status is required')
        .isIn(['placed', 'ready', 'picked_up', 'cancelled']).withMessage('Invalid status value'),
];

const cancelPreorderValidator = [
    param('id')
        .isInt().withMessage('Preorder id must be an integer'),
];

module.exports = {
    // Meal validators
    createMealValidator,
    updateMealValidator,
    deleteMealValidator,
    getMealByIdValidator,
    // Menu validators
    createMenuValidator,
    updateMenuValidator,
    deleteMenuValidator,
    getMenuByIdValidator,
    getMenusValidator,
    toggleMealAvailabilityValidator,
    // Preorder validators
    createPreorderValidator,
    updatePreorderStatusValidator,
    cancelPreorderValidator
};

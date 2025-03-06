const { body, param } = require('express-validator');

/**
 * Validators for Bus endpoints
 */
const createBusValidator = [
  body('busNumber')
    .notEmpty().withMessage('Bus number is required'),
  body('licensePlate')
    .optional()
    .isString().withMessage('License plate must be a string'),
  body('capacity')
    .isInt({ gt: 0 }).withMessage('Capacity must be a positive integer'),
  body('type')
    .optional()
    .isIn(['SHUTTLE', 'MINIBUS', 'ARTICULATED']).withMessage('Invalid bus type'),
];

const updateBusValidator = [
  param('id')
    .notEmpty().withMessage('Bus ID is required'),
  body('busNumber')
    .optional()
    .notEmpty().withMessage('Bus number cannot be empty'),
  body('licensePlate')
    .optional()
    .isString().withMessage('License plate must be a string'),
  body('capacity')
    .optional()
    .isInt({ gt: 0 }).withMessage('Capacity must be a positive integer'),
  body('type')
    .optional()
    .isIn(['SHUTTLE', 'MINIBUS', 'ARTICULATED']).withMessage('Invalid bus type'),
];

const deleteBusValidator = [
  param('id')
    .notEmpty().withMessage('Bus ID is required'),
];

const getBusByIdValidator = [
  param('id')
    .notEmpty().withMessage('Bus ID is required'),
];

const getBusesValidator = [
  // Add any query parameters validation if needed
];

module.exports = {
  createBusValidator,
  updateBusValidator,
  deleteBusValidator,
  getBusByIdValidator,
  getBusesValidator,
};

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

const createDriverValidator = [
  body('firstName')
    .notEmpty().withMessage('First name is required'),
  body('lastName')
    .notEmpty().withMessage('Last name is required'),
  body('licenseNumber')
    .notEmpty().withMessage('License number is required')
    .isString().withMessage('License number must be a string'),
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string'),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('IsAvailable must be a boolean'),
];

const updateDriverValidator = [
  param('id')
    .notEmpty().withMessage('Driver ID is required'),
  body('firstName')
    .optional()
    .notEmpty().withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty().withMessage('Last name cannot be empty'),
  body('licenseNumber')
    .optional()
    .isString().withMessage('License number must be a string'),
  body('phone')
    .optional()
    .isString().withMessage('Phone must be a string'),
  body('isAvailable')
    .optional()
    .isBoolean().withMessage('IsAvailable must be a boolean'),
];

const deleteDriverValidator = [
  param('id')
    .notEmpty().withMessage('Driver ID is required'),
];

module.exports = {
  createBusValidator,
  updateBusValidator,
  deleteBusValidator,
  getBusByIdValidator,
  getBusesValidator,
  createDriverValidator,
  updateDriverValidator,
  deleteDriverValidator,
};

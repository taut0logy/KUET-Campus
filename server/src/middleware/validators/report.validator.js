const { body } = require('express-validator');

/**
 * Validators for Report endpoints
 */
// Remove createReportValidator entirely
// const createReportValidator = [
//   body('title')
//     .notEmpty().withMessage('Title is required'),
//   body('reportType')
//     .notEmpty().withMessage('Report type is required'),
//   body('description')
//     .notEmpty().withMessage('Description is required'),
// ];

module.exports = {
  // Remove createReportValidator from exports
};

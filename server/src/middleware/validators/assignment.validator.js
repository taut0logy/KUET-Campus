const { body } = require('express-validator');

// Validation for creating an assignment
const createAssignmentValidator = [
  body('courseId').isString().notEmpty().withMessage('Course ID is required'),
  body('assignmentName').isString().notEmpty().withMessage('Assignment name is required'),
  body('assignmentContent').optional().isString(),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
];

// Validation for updating an assignment
const updateAssignmentValidator = [
  body('courseId').optional().isString(),
  body('assignmentName').optional().isString(),
  body('assignmentContent').optional().isString(),
  body('deadline').optional().isISO8601().withMessage('Valid deadline date is required'),
];

module.exports = {
  createAssignmentValidator,
  updateAssignmentValidator,
};
const { body } = require('express-validator');

// Validation for setting weekly schedule
const setWeeklyScheduleValidator = [
  body('weekday').isString().notEmpty().withMessage('Weekday is required'),
  body('period1').optional().isString(),
  body('period2').optional().isString(),
  body('period3').optional().isString(),
  body('period4').optional().isString(),
  body('period5').optional().isString(),
  body('period6').optional().isString(),
  body('period7').optional().isString(),
  body('period8').optional().isString(),
  body('period9').optional().isString(),
];

// Validation for adding a course
const addCourseValidator = [
  body('courseId').isString().notEmpty().withMessage('Course ID is required'),
  body('courseName').isString().notEmpty().withMessage('Course name is required'),
  body('classTest').isString().isIn(['class', 'test']).withMessage('Class/Test must be either "class" or "test"'),
];

module.exports = {
  setWeeklyScheduleValidator,
  addCourseValidator,
};
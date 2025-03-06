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

// Validation for adding a course (updated)
const addCourseValidator = [
  body('courseId').isString().notEmpty().withMessage('Course ID is required'),
  body('courseName').isString().notEmpty().withMessage('Course name is required'),
  body('courseType').isString().isIn(['theory', 'lab']).withMessage('Course type must be either "theory" or "lab"'),
];

// Validation for adding/updating an exam
const examValidator = [
  body('courseId').isString().notEmpty().withMessage('Course ID is required'),
  body('examType').isString().isIn(['class-test', 'term-final', 'lab-test']).withMessage('Exam type must be valid'),
  body('syllabus').optional().isString(),
  body('examDate').isISO8601().withMessage('Valid exam date is required'),
];

module.exports = {
  setWeeklyScheduleValidator,
  addCourseValidator,
  examValidator,
};
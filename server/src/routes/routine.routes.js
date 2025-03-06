const express = require('express');
const router = express.Router();

// Routine Controller
const routineController = require('../controllers/routine.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const {
  setWeeklyScheduleValidator,
  addCourseValidator,
  examValidator,
} = require('../middleware/validators/routine.validator');

// Protected routes

router.post('/set-schedule', authenticate, setWeeklyScheduleValidator, routineController.setWeeklySchedule);
router.post('/add-course', authenticate, addCourseValidator, routineController.addCourse);
router.get('/get-schedule', authenticate, routineController.getWeeklySchedule);
router.get('/get-courses', authenticate, routineController.getCourses);

// Exam routes
router.post('/add-exam', authenticate, examValidator, routineController.addExam);
router.put('/update-exam/:id', authenticate, examValidator, routineController.updateExam);
router.delete('/delete-exam/:id', authenticate, routineController.deleteExam);
router.get('/get-exams', authenticate, routineController.getExams);

// In routine.routes.js, add a test route
router.get('/test-routine', (req, res) => {
    res.json({ message: 'Routine routes working!' });
  });
module.exports = router;
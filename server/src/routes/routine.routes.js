const express = require('express');
const router = express.Router();

// Routine Controller
const routineController = require('../controllers/routine.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const {
  setWeeklyScheduleValidator,
  addCourseValidator,
} = require('../middleware/validators/routine.validator');

// Protected routes

router.post('/set-schedule', authenticate, setWeeklyScheduleValidator, routineController.setWeeklySchedule);
router.post('/add-course', authenticate, addCourseValidator, routineController.addCourse);
router.get('/get-schedule', authenticate, routineController.getWeeklySchedule);
router.get('/get-courses', authenticate, routineController.getCourses);

// In routine.routes.js, add a test route
router.get('/test-routine', (req, res) => {
    res.json({ message: 'Routine routes working!' });
  });
module.exports = router;
const express = require('express');
const router = express.Router();

// Assignment Controller
const assignmentController = require('../controllers/assignment.controller');

// Middleware
const { authenticate } = require('../middleware/auth.middleware');
const {
  createAssignmentValidator,
  updateAssignmentValidator,
} = require('../middleware/validators/assignment.validator');

// Protected routes
router.post('/create', authenticate, createAssignmentValidator, assignmentController.createAssignment);
router.get('/list', authenticate, assignmentController.getAssignments);
router.get('/:id', authenticate, assignmentController.getAssignmentById);
router.put('/:id', authenticate, updateAssignmentValidator, assignmentController.updateAssignment);
router.delete('/:id', authenticate, assignmentController.deleteAssignment);
// Add this new route to your existing assignment routes
router.post('/notify-deadline', authenticate, assignmentController.notifyDeadline);

module.exports = router;
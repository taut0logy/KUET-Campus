const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {  } = require('../middleware/rate-limit.middleware');
const {
  registerEmployeeValidator,
  registerStudentValidator,
  registerFacultyValidator,
  loginValidator,
  requestPasswordResetValidator,
  resetPasswordValidator
} = require('../middleware/validators/auth.validator');

// Public routes
router.post('/register/employee',  registerEmployeeValidator, authController.registerEmployee);
router.post('/register/student',  registerStudentValidator, authController.registerStudent);
router.post('/register/faculty',  registerFacultyValidator, authController.registerFaculty);
router.post('/login',  loginValidator, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password',  requestPasswordResetValidator, authController.requestPasswordReset);
router.post('/reset-password/:token',  resetPasswordValidator, authController.resetPassword);
router.post('/resend-verification',  requestPasswordResetValidator, authController.resendVerification);


// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 
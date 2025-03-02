const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rate-limit.middleware');
const {
  registerValidator,
  loginValidator,
  requestPasswordResetValidator,
  resetPasswordValidator
} = require('../middleware/validators/auth.validator');

// Public routes
router.post('/register', authLimiter, registerValidator, authController.register);
router.post('/login', authLimiter, loginValidator, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authLimiter, requestPasswordResetValidator, authController.requestPasswordReset);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, authController.resetPassword);
router.post('/resend-verification', authLimiter, requestPasswordResetValidator, authController.resendVerification);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router; 
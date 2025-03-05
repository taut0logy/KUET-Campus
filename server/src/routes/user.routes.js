const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { profileUpdateValidator, passwordChangeValidator } = require('../middleware/validators/user.validator');
const userController = require('../controllers/user.controller');

// Get user profile
router.get('/profile', authenticate, userController.getProfile);

// Update user profile
router.patch('/profile', authenticate, profileUpdateValidator, userController.updateProfile);

// Change password
router.patch('/password', authenticate, passwordChangeValidator, userController.changePassword);

module.exports = router; 
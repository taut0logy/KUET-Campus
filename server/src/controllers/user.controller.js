const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger.util');

class UserController {
  async getProfile(req, res) {
    try {
      const user = await userService.getUserProfile(req.user.id);
      res.json(user);
    } catch (error) {
      logger.error('Failed to get profile:', error);
      res.status(error.message === 'User not found' ? 404 : 500)
        .json({ message: error.message || 'Failed to get profile' });
    }
  }

  async updateProfile(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const user = await userService.updateProfile(req.user.id, req.body);
      res.json(user);
    } catch (error) {
      logger.error('Failed to update profile:', error);
      res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
  }

  async changePassword(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const result = await userService.changePassword(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      logger.error('Failed to change password:', error);
      res.status(error.message === 'Current password is incorrect' ? 400 : 500)
        .json({ message: error.message || 'Failed to change password' });
    }
  }
}

const userController = new UserController();
module.exports = userController; 
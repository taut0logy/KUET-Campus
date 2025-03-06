const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai-cafe-manager.controller');
const { auth } = require('../middleware/auth.middleware');
const { validateRole } = require('../middleware/role.middleware');

// AI assistant for cafe managers
router.post('/cafe-assistant', 
  auth, 
  validateRole(['CAFE_MANAGER']), 
  aiController.processCafeManagerQuery
);

module.exports = router;
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai-cafe-manager.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Public access endpoint - no authentication required
router.post('/cafe-assistant', aiController.processCafeManagerQuery);

// Authenticated endpoint (optional, for backward compatibility)
router.post('/assistant', authenticate, aiController.processCafeManagerQuery);

module.exports = router;
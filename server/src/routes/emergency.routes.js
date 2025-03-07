const { authenticate } = require('../middleware/auth.middleware');
const { triggerEmergencyAlert } = require('../controllers/emergency.controller');
const express = require('express');
const router = express.Router();


router.post('/alert', authenticate, triggerEmergencyAlert);

module.exports = router;
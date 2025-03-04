const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const cafeteriaRoutes = require('./cafeteria.routes');
const routineRoutes = require('./routine.routes');
const busRoutes = require('./bus.routes');
const { standardLimiter } = require('../middleware/rate-limit.middleware');
const notificationRoutes = require('./notification.routes');
const storageRoutes = require('./storage.routes');

// Apply standard rate limit to all routes
router.use(standardLimiter);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/cafeteria', cafeteriaRoutes);
router.use('/notifications', notificationRoutes);
router.use('/storage', storageRoutes);
router.use('/routine', routineRoutes);
router.use('/bus', busRoutes);  // This will make the routes available at /api/v1/bus/*

module.exports = router; 

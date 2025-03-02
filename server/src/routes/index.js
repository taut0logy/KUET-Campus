const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const { standardLimiter } = require('../middleware/rate-limit.middleware');

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

// Future route modules
// router.use('/users', userRoutes);
// router.use('/profiles', profileRoutes);
// etc.

// Catch-all 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = router; 
const express = require('express');
const router = express.Router();

//const { standardLimiter } = require('../middleware/rate-limit.middleware');

const authRoutes = require('./auth.routes');
const cafeteriaRoutes = require('./cafeteria.routes');
const routineRoutes = require('./routine.routes');
const assignmentRoutes = require('./assignment.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');
const storageRoutes = require('./storage.routes');
const departmentRoutes = require('./department.routes');
const eventRoutes = require('./event.routes');
const clubRoutes = require('./club.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const aiCafeManagerRoutes = require('./ai-cafe-manager.routes');
const busRoutes = require('./bus.routes');
const adminRoutes = require('./admin.routes');

// Apply standard rate limit to all routes
//router.use(standardLimiter);

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
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/storage', storageRoutes);
router.use('/cart', cartRoutes);
router.use('/order', orderRoutes);
router.use('/departments', departmentRoutes);
router.use('/routine', routineRoutes);
router.use('/bus', busRoutes);  // This will make the routes available at /api/v1/bus/*
router.use('/events', eventRoutes);
router.use('/clubs', clubRoutes);
router.use('/assignments', assignmentRoutes);router.use('/ai', aiCafeManagerRoutes); 
router.use('/admin', adminRoutes);

// Catch-all 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

module.exports = router; 

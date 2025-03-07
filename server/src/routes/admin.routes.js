const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth.middleware');
const adminController = require('../controllers/admin.controller');
const { createAnnouncementValidator } = require('../middleware/validators/admin.validator');

// Admin routes - all require authentication and ADMIN role
router.use(authenticate, authorize(['ADMIN']));

// Announcement routes
router.post('/announcements', createAnnouncementValidator, adminController.createAnnouncement);
router.get('/announcements', adminController.getAnnouncements);
router.get('/announcements/:id', adminController.getAnnouncementById);
router.delete('/announcements/:id', adminController.deleteAnnouncement);

module.exports = router; 
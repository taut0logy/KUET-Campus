const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const eventController = require('../controllers/event.controller');
const { authorizeModeratorOrManager } = require('../middleware/auth.middleware');
const { followEventValidation, unfollowEventValidation, eventInfoValidation, eventDetailsValidation, searchEventsValidation } = require('../middleware/validators/event.validation');

// Create a new event
router.post('/', authenticate, eventController.createEvent);

// Update an existing event
router.put('/:id', authenticate, eventController.updateEvent);

// Follow an event
router.post('/:eventId/follow', authenticate, followEventValidation, eventController.followEvent);

// Unfollow an event
router.delete('/:eventId/unfollow', authenticate, unfollowEventValidation, eventController.unfollowEvent);

// Log a user's visit to an event page
router.post('/:eventId/visit', authenticate, eventController.logUserVisit);

// Get concise info of an event
router.get('/:eventId/info', eventInfoValidation, eventController.getEventInfo);

// Get detailed info of an event
router.get('/:eventId/details', eventDetailsValidation, eventController.getEventDetails);

// Get analytics data for an event
router.get('/:eventId/analytics', authenticate, authorizeModeratorOrManager, eventController.getEventAnalytics);

// Search for events
router.get('/search', searchEventsValidation, eventController.searchEvents);

module.exports = router; 
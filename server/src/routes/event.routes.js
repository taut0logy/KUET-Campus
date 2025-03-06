const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const eventController = require('../controllers/event.controller');
const { authorizeModeratorOrManager } = require('../middleware/auth.middleware');
const { followEventValidation, unfollowEventValidation, eventInfoValidation, eventDetailsValidation, searchEventsValidation } = require('../middleware/validators/event.validator');

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
router.get('/:eventId/info', authenticate, eventInfoValidation, eventController.getEventInfo);

// Get detailed info of an event
router.get('/:eventId/details', authenticate, eventDetailsValidation, eventController.getEventDetails);

// Get analytics data for an event
router.get('/:eventId/analytics', authenticate, authorizeModeratorOrManager, eventController.getEventAnalytics);

// Search for events
router.get('/search', searchEventsValidation, eventController.searchEvents);

// Get short details of an event
router.get('/:eventId/short', eventController.getEventShortDetails);

// Get paginated and sortable list of events
router.get('/list', eventController.getPaginatedEvents);

module.exports = router;
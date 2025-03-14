const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const chatValidator = require('../middleware/validators/chat.validator');
const { authenticate } = require('../middleware/auth.middleware');

// Search faculty members
router.get('/faculty/search', authenticate, chatValidator.validateFacultySearch, chatController.searchFaculty);

// Request a chat
router.post('/request', authenticate, chatValidator.validateChatRequest, chatController.requestChat);

// Approve a chat request
router.post('/approve/:chatId', authenticate, chatController.approveChatRequest);

// Reject a chat request
router.post('/reject/:chatId', authenticate, chatValidator.validateRejectChatRequest, chatController.rejectChatRequest);

// Get pending chat requests for faculty
router.get('/requests/pending', authenticate, chatValidator.validatePendingRequests, chatController.getPendingRequests);

// Send a message
router.post('/message/send', authenticate, chatValidator.validateSendMessage, chatController.sendMessage);

// Edit a message
router.put('/message/edit/:messageId', authenticate, chatValidator.validateEditMessage, chatController.editMessage);

// Delete a message
router.delete('/message/delete/:messageId', authenticate, chatValidator.validateDeleteMessage, chatController.deleteMessage);

// Get chat details
router.get('/chat/:chatId', authenticate, chatValidator.validateGetChatDetails, chatController.getChatDetails);

// List all chats for a user
router.get('/chats', authenticate, chatController.listChats);

// Load previous n messages before a specific message
router.get('/load-more/:chatId/:messageId/:n', authenticate, chatValidator.validateLoadMoreMessages, chatController.loadMoreMessages);

// Search messages in chats
router.get('/search', authenticate, chatValidator.validateSearchMessages, chatController.searchMessages);

// Get messages up to a specific message
router.get('/messages/up-to/:messageId', authenticate, chatValidator.validateGetMessagesUpTo, chatController.getMessagesUpTo);

// Load the last n messages from a chat
router.get('/messages/last/:chatId/:n', authenticate, chatValidator.validateLoadLastNMessages, chatController.loadLastNMessages);

// Get user online status
router.get('/user/:userId/status', authenticate, chatController.getUserOnlineStatus);

// Mark messages as seen
router.post('/messages/seen/:chatId', authenticate, chatController.markMessagesSeen);

module.exports = router;
const { body, param, query } = require('express-validator');

// Validate chat request
const validateChatRequest = [
    body('studentId')
        .isInt()
        .withMessage('Student ID must be an integer'),
    body('facultyId')
        .isInt()
        .withMessage('Faculty ID must be an integer')
];

// Validate message sending
const validateSendMessage = [
    body('chatId')
        .isString()
        .withMessage('Chat ID must be a string'),
    body('content')
        .isString()
        .withMessage('Message content must be a string'),
    body('attachments')
        .optional()
        .isArray()
        .withMessage('Attachments must be an array'),
    body('replyTo')
        .optional()
        .isString()
        .withMessage('ReplyTo must be a string')
];

// Validate message editing
const validateEditMessage = [
    param('messageId')
        .isString()
        .withMessage('Message ID must be a string'),
    body('newContent')
        .isString()
        .withMessage('New content must be a string')
];

// Validate message deletion
const validateDeleteMessage = [
    param('messageId')
        .isString()
        .withMessage('Message ID must be a string')
];

// Validate chat details retrieval
const validateGetChatDetails = [
    param('chatId')
        .isString()
        .withMessage('Chat ID must be a string')
];

// Validate listing chats
const validateListChats = [
    // No specific validation needed for listing chats
];

// Validate loading more messages
const validateLoadMoreMessages = [
    param('chatId')
        .isString()
        .withMessage('Chat ID must be a string'),
    param('messageId')
        .isString()
        .withMessage('Message ID must be a string'),
    param('n')
        .isInt()
        .withMessage('Number of messages must be an integer')
];

// Validate loading last n messages
const validateLoadLastNMessages = [
    param('chatId')
        .isString()
        .withMessage('Chat ID must be a string'),
    param('n')
        .isInt()
        .withMessage('Number of messages must be an integer')
];

// Validate search messages
const validateSearchMessages = [
    query('query')
        .isString()
        .withMessage('Search query must be a string'),
    query('page')
        .optional()
        .isInt()
        .withMessage('Page must be an integer'),
    query('limit')
        .optional()
        .isInt()
        .withMessage('Limit must be an integer')
];

// Validate getting messages up to a specific message
const validateGetMessagesUpTo = [
    param('messageId')
        .isString()
        .withMessage('Message ID must be a string')
];

module.exports = {
    validateChatRequest,
    validateSendMessage,
    validateEditMessage,
    validateDeleteMessage,
    validateGetChatDetails,
    validateListChats,
    validateLoadMoreMessages,
    validateLoadLastNMessages,
    validateSearchMessages,
    validateGetMessagesUpTo
}; 
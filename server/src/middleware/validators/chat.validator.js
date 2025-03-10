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
    body('attachments.*.url')
        .optional()
        .isString()
        .withMessage('Attachment URL must be a string'),
    body('attachments.*.type')
        .optional()
        .isString()
        .isIn(['image', 'file', 'audio', 'video'])
        .withMessage('Attachment type must be one of: image, file, audio, video'),
    body('attachments.*.name')
        .optional()
        .isString()
        .withMessage('Attachment name must be a string'),
    body('attachments.*.size')
        .optional()
        .isNumeric()
        .withMessage('Attachment size must be a number'),
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

// Validate faculty search
const validateFacultySearch = [
    query('query')
        .isString()
        .withMessage('Search query must be a string')
];

// Validate chat request rejection
const validateRejectChatRequest = [
    param('chatId')
        .isString()
        .withMessage('Chat ID must be a string')
];

// Validate pending chat requests
const validatePendingRequests = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be a positive integer between 1 and 100'),
    query('sortBy')
        .optional()
        .isString()
        .isIn(['createdAt', 'studentName', 'studentId'])
        .withMessage('Sort by must be one of: createdAt, studentName, studentId'),
    query('sortOrder')
        .optional()
        .isString()
        .isIn(['asc', 'desc'])
        .withMessage('Sort order must be one of: asc, desc'),
    query('search')
        .optional()
        .isString()
        .withMessage('Search query must be a string')
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
    validateGetMessagesUpTo,
    validateFacultySearch,
    validateRejectChatRequest,
    validatePendingRequests
}; 
const chatService = require('../services/chat.service');
const notificationService = require('../services/notification.service');
const prisma = require('../lib/prisma');

// Request a chat
const requestChat = async (req, res, next) => {
    const { studentId, facultyId } = req.body;
    try {
        const chat = await chatService.requestChat(studentId, facultyId);
        res.status(201).json(chat);
    } catch (error) {
        next(error);
    }
};

// Approve a chat request
const approveChatRequest = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const chat = await chatService.approveChatRequest(chatId);
        res.status(200).json(chat);
    } catch (error) {
        next(error);
    }
};

// Send a message
const sendMessage = async (req, res, next) => {
    const { chatId, content, attachments, replyTo } = req.body;
    const senderId = req.user.id;
    try {
        const message = await chatService.sendMessage(chatId, senderId, content, attachments, replyTo);
        // Send notification to the receiver
        const chat = await prisma.chat.findUnique({
            where: { id: chatId }
        });
        if (chat) {
            const receiverId = chat.facultyId === senderId ? chat.studentId : chat.facultyId;
            // Assuming there's a notification service to send notifications
            await notificationService.sendNotification(receiverId, `New message from ${senderId}`);
        }
        res.status(201).json(message);
    } catch (error) {
        next(error);
    }
};

// Edit a message
const editMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const { newContent } = req.body;
    try {
        const message = await chatService.editMessage(messageId, newContent);
        res.status(200).json(message);
    } catch (error) {
        next(error);
    }
};

// Delete a message
const deleteMessage = async (req, res, next) => {
    const { messageId } = req.params;
    try {
        await chatService.deleteMessage(messageId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Load previous n messages before a specific message
const loadMoreMessages = async (req, res, next) => {
    const { chatId, messageId, n } = req.params;
    try {
        const messages = await chatService.loadMoreMessages(chatId, messageId, parseInt(n));
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// Load the last n messages from a chat
const loadLastNMessages = async (req, res, next) => {
    const { chatId, n } = req.params;
    try {
        const messages = await chatService.loadLastNMessages(chatId, parseInt(n));
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// Search messages in chats
const searchMessages = async (req, res, next) => {
    const { query, page = 1, limit = 10 } = req.query;
    try {
        const messages = await chatService.searchMessages(query, parseInt(page), parseInt(limit));
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

// Get messages up to a specific message
const getMessagesUpTo = async (req, res, next) => {
    const { messageId } = req.params;
    try {
        const messages = await chatService.getMessagesUpTo(messageId);
        res.status(200).json(messages);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    requestChat,
    approveChatRequest,
    sendMessage,
    editMessage,
    deleteMessage,
    loadMoreMessages,
    loadLastNMessages,
    searchMessages,
    getMessagesUpTo
}; 
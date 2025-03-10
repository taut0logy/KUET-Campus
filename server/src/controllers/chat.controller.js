const chatService = require('../services/chat.service');
const realtimeService = require('../services/realtime.service');
const { prisma } = require('../services/database.service');
const { sendError } = require('../utils/response.util');
const { validationResult } = require('express-validator');
const { logger } = require('../utils/logger.util');


// Search faculty members
const searchFaculty = async (req, res, next) => {
    const { query } = req.query;
    try {
        const faculty = await chatService.searchFaculty(query);
        res.status(200).json(faculty);
    } catch (error) {
        next(error);
    }
};

// Request a chat
const requestChat = async (req, res, next) => {
    const { studentId, facultyId } = req.body;
    try {
        const chat = await chatService.requestChat(studentId, facultyId);

        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { name: true }
        });
        
        res.status(201).json(chat);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }


        next(error);
    }
};

// Approve a chat request
const approveChatRequest = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const chat = await chatService.approveChatRequest(chatId);

        const student = await prisma.user.findUnique({
            where: { id: chat.studentId },
            select: { name: true }
        });
        
        res.status(200).json(chat);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Reject a chat request
const rejectChatRequest = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const chat = await chatService.rejectChatRequest(chatId);

        const faculty = await prisma.user.findUnique({
            where: { id: chat.facultyId },
            select: { name: true }
        });
        
        res.status(200).json(chat);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Send a message
const sendMessage = async (req, res, next) => {
    const { chatId, content, attachments, replyTo } = req.body;
    const senderId = req.user.id;
    try {
        const message = await chatService.sendMessage(chatId, senderId, content, attachments, replyTo);

        realtimeService.emitChatMessage(chatId, message);
        
        res.status(201).json(message);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Edit a message
const editMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const { newContent } = req.body;
    try {
        const message = await chatService.editMessage(messageId, newContent);
        
        // Emit real-time event to chat room
        realtimeService.emitMessageUpdate(message.chatId, message);
        
        res.status(200).json(message);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Delete a message
const deleteMessage = async (req, res, next) => {
    const { messageId } = req.params;
    try {
        const message = await chatService.deleteMessage(messageId);
        
        // Emit real-time event to chat room
        realtimeService.emitMessageDeletion(message.chatId, messageId);
        
        res.status(204).send();
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Get chat details
const getChatDetails = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const chat = await chatService.getChatDetails(chatId);
        res.status(200).json(chat);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// List all chats for a user
const listChats = async (req, res, next) => {
    const userId = req.user.id;
    try {
        const chats = await chatService.listChats(userId);
        res.status(200).json(chats);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

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
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

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
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

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
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

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
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Get user online status
const getUserOnlineStatus = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const isOnline = realtimeService.isUserOnline(userId);
        res.status(200).json({ userId, isOnline });
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Get pending chat requests for faculty
const getPendingRequests = async (req, res, next) => {
    const facultyId = req.user.id;
    const { 
        page = 1, 
        limit = 10, 
        sortBy = 'createdAt', 
        sortOrder = 'desc',
        search = ''
    } = req.query;

    try {
        // Check if user is a faculty member
        const isFaculty = req.user.roles.includes('FACULTY');
        if (!isFaculty) {
            return res.status(403).json({
                status: 'error',
                message: 'Only faculty members can access pending chat requests'
            });
        }

        const result = await chatService.getPendingRequests(
            facultyId,
            parseInt(page),
            parseInt(limit),
            sortBy,
            sortOrder,
            search
        );

        res.status(200).json(result);
    } catch (error) {
        if (error.status === 400 || error.status === 500) {
            return sendError(res, error.message, error.status);
        }

        next(error);
    }
};

// Mark messages as seen
const markMessagesSeen = async (req, res, next) => {
    const { chatId } = req.params;
    const userId = req.user.id;
    
    try {
        const result = await chatService.markMessagesSeen(chatId, userId);
        
        // Emit real-time event to notify the sender that their messages have been seen
        if (result.count > 0) {
            // Get chat details
            const chat = await prisma.chat.findUnique({
                where: { id: chatId },
                include: {
                    student: {
                        select: { id: true, name: true }
                    },
                    faculty: {
                        select: { id: true, name: true }
                    }
                }
            });
            
            if (chat) {
                // Determine the sender ID (the other participant)
                const senderId = chat.studentId === userId ? chat.facultyId : chat.studentId;
                
                // Emit messages seen event
                realtimeService.emitToChatRoom(chatId, 'messages_seen', {
                    chatId,
                    seenBy: userId,
                    count: result.count,
                    timestamp: new Date()
                });
            }
        }
        
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    searchFaculty,
    requestChat,
    approveChatRequest,
    rejectChatRequest,
    sendMessage,
    editMessage,
    deleteMessage,
    getChatDetails,
    listChats,
    loadMoreMessages,
    loadLastNMessages,
    searchMessages,
    getMessagesUpTo,
    getUserOnlineStatus,
    getPendingRequests,
    markMessagesSeen
}; 
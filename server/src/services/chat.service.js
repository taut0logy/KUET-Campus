const { prisma } = require('./database.service');
const { uploadAttachment } = require('./attachment.service'); // Assuming there's an attachment service
const { realtimeService } = require('./realtime.service'); // Assuming there's a realtime service

// Request a chat from student to faculty
const requestChat = async (studentId, facultyId) => {
    const channelId = `${studentId}-${facultyId}`; // Create a unique channel ID
    const chat = await prisma.chat.create({
        data: {
            studentId,
            facultyId,
            channelId,
            status: 'PENDING'
        }
    });

    const student = await prisma.user.findUnique({
        where: { id: studentId },
        select: {
            name: true
        }
    });

    realtimeService.createNotification({
        userId: facultyId,
        title: 'New Chat Request',
        message: `You have a new chat request from ${student.name}`,
        type: 'INFO',
        metadata: { chatId: chat.id }
    });


    return chat;
};

// Approve a chat request by faculty
const approveChatRequest = async (chatId) => {
    const chat = await prisma.chat.update({
        where: { id: chatId },
        data: { status: 'ACTIVE' }
    });

    const student = await prisma.user.findUnique({
        where: { id: chat.studentId },
        select: {
            name: true
        }
    });

    realtimeService.createNotification({
        userId: chat.studentId,
        title: 'Chat Approved',
        message: `Your chat with ${student.name} has been approved`,
        type: 'SUCCESS',
        metadata: { chatId: chat.id }
    });

    return chat;
};

// Send a message in a chat
const sendMessage = async (chatId, senderId, content, attachments, replyTo) => {
    const message = await prisma.message.create({
        data: {
            chatId,
            senderId,
            content,
            attachments: attachments ? { create: attachments } : undefined,
            replyToId: replyTo // Set the replyToId if provided
        }
    });

    // Send message to the channel
    const chat = await prisma.chat.findUnique({
        where: { id: chatId }
    });
    if (chat) {
        const channelId = chat.channelId;
        realtimeService.sendMessageToChannel(channelId, message);
    }

    return message;
};

// Edit a message
const editMessage = async (messageId, newContent) => {
    const message = await prisma.message.update({
        where: { id: messageId },
        data: { content: newContent }
    });

    // Notify the channel about the edited message
    const chat = await prisma.chat.findUnique({
        where: { id: message.chatId }
    });
    if (chat) {
        const channelId = chat.channelId;
        realtimeService.sendMessageToChannel(channelId, message);
    }

    return message;
};

// Delete a message
const deleteMessage = async (messageId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        include: { attachments: true }
    });
    await prisma.messageAttachment.deleteMany({ where: { messageId: messageId } });
    await prisma.message.update({
        where: { id: messageId },
        data: { isDeleted: true }
    });

    // Notify the channel about the deleted message
    const chat = await prisma.chat.findUnique({
        where: { id: message.chatId }
    });
    if (chat) {
        const channelId = chat.channelId;
        realtimeService.sendMessageToChannel(channelId, message);
    }

    return message;
};

// Get chat details
const getChatDetails = async (chatId) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: { messages: true }
    });
    return chat;
};

// List all chats for a user
const listChats = async (userId) => {
    const chats = await prisma.chat.findMany({
        where: {
            OR: [
                { studentId: userId },
                { facultyId: userId }
            ]
        },
        include: { messages: true }
    });
    return chats;
};

// Full-text search for chat messages
const searchMessages = async (query, page, limit) => {
    const messages = await prisma.message.findMany({
        where: {
            content: {
                contains: query,
                mode: 'insensitive'
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
    });
    return messages;
};

// Retrieve messages from the latest up to a specific message
const getMessagesUpTo = async (messageId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    });

    if (!message) {
        throw new Error('Message not found');
    }

    const messages = await prisma.message.findMany({
        where: {
            createdAt: {
                gte: message.createdAt
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return messages;
};

module.exports = {
    requestChat,
    approveChatRequest,
    sendMessage,
    editMessage,
    deleteMessage,
    getChatDetails,
    listChats,
    searchMessages,
    getMessagesUpTo
}; 
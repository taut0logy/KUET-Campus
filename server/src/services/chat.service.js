const { prisma } = require('./database.service');
const realtimeService = require('./realtime.service');
const { uploadAttachment } = require('./storage.service');
const createError = require('http-errors');

// Search faculty members
const searchFaculty = async (query) => {
    const faculty = await prisma.user.findMany({
        where: {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
            ],
            roles: { has: 'FACULTY' }
        },
        select: {
            id: true,
            name: true,
            email: true,
            facultyInfo: {
                select: {
                    employeeId: true,
                    designation: true,
                    department: {
                        select: {
                            name: true,
                            alias: true
                        }
                    }
                }
            }
        },
        take: 10
    });
    
    return faculty;
};

// Request a chat from student to faculty
const requestChat = async (studentId, facultyId) => {
    // Verify that the users exist and have the correct roles
    const student = await prisma.user.findFirst({
        where: { 
            id: studentId,
            roles: { has: 'STUDENT' }
        }
    });
    
    if (!student) {
        throw createError(400, 'Invalid student ID');
    }
    
    const faculty = await prisma.user.findFirst({
        where: { 
            id: facultyId,
            roles: { has: 'FACULTY' }
        }
    });
    
    if (!faculty) {
        throw createError(400, 'Invalid faculty ID');
    }
    
    // Check if a chat already exists between these users
    const existingChat = await prisma.chat.findFirst({
        where: {
            studentId,
            facultyId
        }
    });
    
    if (existingChat) {
        return existingChat;
    }
    
    // Create a unique channel ID
    const channelId = `chat_${studentId}_${facultyId}`;
    
    // Create the chat
    const chat = await prisma.chat.create({
        data: {
            studentId,
            facultyId,
            channelId,
            status: 'PENDING'
        }
    });

    // Create a notification for the faculty
    await realtimeService.createNotification({
        userId: facultyId,
        title: `New Chat Request`,
        message: `You have a new chat request from ${student.name}`,
        type: 'INFO',
        metadata: {
            chatId: chat.id
        }
    });
    
    return chat;
};

// Approve a chat request by faculty
const approveChatRequest = async (chatId) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId }
    });
    
    if (!chat) {
        throw createError(404, 'Chat not found');
    }
    
    if (chat.status !== 'PENDING') {
        throw createError(400, 'Chat is not in pending status');
    }
    
    const updatedChat = await prisma.chat.update({
        where: { id: chatId },
        data: { status: 'ACTIVE' }
    });

    // Send a notification to the student
    await realtimeService.createNotification({
        userId: chat.studentId,
        title: `Chat Request Approved`,
        message: `Your chat request has been approved`,
        type: 'SUCCESS',
        metadata: {
            chatId: chatId
        }
    });

    return updatedChat;
};

// Reject a chat request by faculty
const rejectChatRequest = async (chatId) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId }
    });
    
    if (!chat) {
        throw createError(404, 'Chat not found');
    }
    
    if (chat.status !== 'PENDING') {
        throw createError(400, 'Chat is not in pending status');
    }
    
    await prisma.chat.update({
        where: { id: chatId },
        data: { status: 'REJECTED' }
    });

    // Send a notification to the student
    await realtimeService.createNotification({
        userId: chat.studentId,
        title: `Chat Request Rejected`,
        message: `Your chat request has been rejected by ${faculty.name}`,
        type: 'ERROR',
        metadata: { chatId: chat.id }
    });
    
    return chat;
};

// Send a message in a chat
const sendMessage = async (chatId, senderId, content, attachments = [], replyTo = null) => {
    // Verify that the chat exists and is active
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
    
    if (!chat) {
        throw createError(404, 'Chat not found');
    }
    
    if (chat.status !== 'ACTIVE') {
        throw createError(400, 'Chat is not active');
    }
    
    // Verify that the sender is part of the chat
    if (chat.studentId !== senderId && chat.facultyId !== senderId) {
        throw createError(403, 'You are not a participant in this chat');
    }
    
    // Process attachments if any
    let processedAttachments = [];
    if (attachments && attachments.length > 0) {
        processedAttachments = attachments.map(attachment => ({
            url: attachment.url,
            name: attachment.name,
            type: attachment.type,
            size: attachment.size
        }));
    }
    
    // Create the message
    const message = await prisma.message.create({
        data: {
            chatId,
            senderId,
            content,
            replyToId: replyTo,
            attachments: {
                create: processedAttachments
            }
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sender: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

    // Determine receiver ID
    const receiverId = chat.facultyId === senderId ? chat.studentId : chat.facultyId;
    const senderName = chat.facultyId === senderId ? chat.faculty.name : chat.student.name;
    
    // Send notification to the receiver
    await realtimeService.createNotification({
        userId: receiverId,
        title: 'New Message',
        message: `You have a new message from ${senderName}`,
        type: 'INFO',
        metadata: { chatId, messageId: message.id }
    });
    
    return message;
};

// Edit a message
const editMessage = async (messageId, newContent) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    });
    
    if (!message) {
        throw createError(404, 'Message not found');
    }
    
    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { 
            content: newContent,
            editedAt: new Date()
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sender: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    
    return updatedMessage;
};

// Delete a message
const deleteMessage = async (messageId) => {
    const message = await prisma.message.findUnique({
        where: { id: messageId }
    });
    
    if (!message) {
        throw createError(404, 'Message not found');
    }

    // delete all the attachments of the message
    await prisma.messageAttachment.deleteMany({
        where: { messageId }
    });
    
    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { 
            isDeleted: true,
            content: 'This message has been deleted',
            updatedAt: new Date()
        }
    });
    
    return updatedMessage;
};

// Get chat details
const getChatDetails = async (chatId) => {
    const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    studentInfo: {
                        select: {
                            studentId: true,
                            department: {
                                select: {
                                    name: true,
                                    alias: true
                                }
                            }
                        }
                    }
                }
            },
            faculty: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    facultyInfo: {
                        select: {
                            employeeId: true,
                            designation: true,
                            department: {
                                select: {
                                    name: true,
                                    alias: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    if (!chat) {
        throw createError(404, 'Chat not found');
    }
    
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
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            faculty: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            messages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1,
                include: {
                    attachments: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
    
    return chats;
};

// Load previous n messages before a specific message
const loadMoreMessages = async (chatId, messageId, n = 20) => {
    // Get the reference message
    const referenceMessage = await prisma.message.findUnique({
        where: { id: messageId },
        select: { createdAt: true }
    });
    
    if (!referenceMessage) {
        throw createError(404, 'Reference message not found');
    }
    
    // Get messages before the reference message
    const messages = await prisma.message.findMany({
        where: {
            chatId,
            createdAt: {
                lt: referenceMessage.createdAt
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: n,
        include: {
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sender: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    
    return messages.reverse();
};

// Load the last n messages from a chat
const loadLastNMessages = async (chatId, n = 20) => {
    const messages = await prisma.message.findMany({
        where: {
            chatId
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: n,
        include: {
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sender: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    
    return messages.reverse();
};

// Search messages in chats
const searchMessages = async (query, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    
    const messages = await prisma.message.findMany({
        where: {
            content: {
                contains: query,
                mode: 'insensitive'
            },
            isDeleted: false
        },
        orderBy: {
            createdAt: 'desc'
        },
        skip,
        take: limit,
        include: {
            chat: true,
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true
        }
    });
    
    const total = await prisma.message.count({
        where: {
            content: {
                contains: query,
                mode: 'insensitive'
            },
            isDeleted: false
        }
    });
    
    return {
        messages,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Get messages up to a specific message
const getMessagesUpTo = async (messageId) => {
    // Get the reference message
    const referenceMessage = await prisma.message.findUnique({
        where: { id: messageId },
        select: { chatId: true, createdAt: true }
    });
    
    if (!referenceMessage) {
        throw createError(404, 'Reference message not found');
    }
    
    // Get messages up to the reference message
    const messages = await prisma.message.findMany({
        where: {
            chatId: referenceMessage.chatId,
            createdAt: {
                lte: referenceMessage.createdAt
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true
                }
            },
            attachments: true,
            replyTo: {
                select: {
                    id: true,
                    content: true,
                    senderId: true,
                    sender: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });
    
    return messages;
};

// Get pending chat requests for faculty
const getPendingRequests = async (facultyId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '') => {
    const skip = (page - 1) * limit;
    
    // Build the where clause
    const where = {
        facultyId,
        status: 'PENDING'
    };
    
    // Add search functionality
    if (search) {
        where.student = {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { studentInfo: { studentId: { contains: search, mode: 'insensitive' } } }
            ]
        };
    }
    
    // Build the orderBy object
    let orderBy = {};
    
    if (sortBy === 'createdAt') {
        orderBy.createdAt = sortOrder;
    } else if (sortBy === 'studentName') {
        orderBy.student = { name: sortOrder };
    } else if (sortBy === 'studentId') {
        orderBy.student = { studentInfo: { studentId: sortOrder } };
    }
    
    // Get total count for pagination
    const total = await prisma.chat.count({ where });
    
    // Get the chat requests
    const requests = await prisma.chat.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
            student: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    studentInfo: {
                        select: {
                            studentId: true,
                            batch: true,
                            section: true,
                            department: {
                                select: {
                                    name: true,
                                    alias: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    
    return {
        data: requests,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    };
};

// Mark messages as seen
const markMessagesSeen = async (chatId, userId) => {
  try {
    // Get the chat to determine if the user is a participant
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { studentId: true, facultyId: true }
    });
    
    if (!chat) {
      throw createError(404, 'Chat not found');
    }
    
    // Check if the user is a participant in the chat
    if (chat.studentId !== userId && chat.facultyId !== userId) {
      throw createError(403, 'User is not a participant in this chat');
    }
    
    // Determine the sender ID (the other participant)
    const senderId = chat.studentId === userId ? chat.facultyId : chat.studentId;
    
    // Mark all messages from the other participant as seen
    const result = await prisma.message.updateMany({
      where: {
        chatId,
        senderId,
        seen: false
      },
      data: {
        seen: true,
        seenAt: new Date()
      }
    });
    
    // Get the updated messages
    const messages = await prisma.message.findMany({
      where: {
        chatId,
        senderId,
        seen: true,
        seenAt: { not: null }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return {
      count: result.count,
      messages
    };
  } catch (error) {
    throw error;
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
    getPendingRequests,
    markMessagesSeen
}; 
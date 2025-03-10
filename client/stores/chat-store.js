import {create} from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import axios from '@/lib/axios';
import eventBus, { ChatEvents } from '@/lib/eventBus';

const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    chats: [],
    loading: false,
    error: null,
    selectedChat: null,
    onlineUsers: new Map(), // userId -> true
    lastSeenAt: new Map(), // userId -> timestamp
    pendingRequests: [],
    user: null,
    
    // Set selected chat
    setSelectedChat: (chatId) => {
      const chat = get().chats.find(c => c.id === chatId);
      set({ selectedChat: chat || null });
    },
    
    // Handle individual user status update
    handleUserStatusUpdate: (data) => {
      const { userId, isOnline, lastSeen } = data;
      
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);
        const newLastSeen = new Map(state.lastSeenAt);
        
        if (isOnline) {
          newOnlineUsers.set(userId, true);
          newLastSeen.delete(userId);
        } else {
          newOnlineUsers.delete(userId);
          if (lastSeen) {
            newLastSeen.set(userId, lastSeen);
          }
        }
        
        return {
          onlineUsers: newOnlineUsers,
          lastSeenAt: newLastSeen
        };
      });
    },
    
    // Handle batch status update
    handleBatchStatusUpdate: (data) => {
      const { onlineUsers: onlineUserIds, timestamp } = data;
      
      set((state) => {
        const newOnlineUsers = new Map();
        const newLastSeen = new Map(state.lastSeenAt);
        
        // First, mark all current online users as offline if they're not in the new list
        state.onlineUsers.forEach((_, userId) => {
          if (!onlineUserIds.includes(userId)) {
            newLastSeen.set(userId, timestamp);
          }
        });
        
        // Then set new online users
        onlineUserIds.forEach(userId => {
          newOnlineUsers.set(userId, true);
          newLastSeen.delete(userId);
        });
        
        return {
          onlineUsers: newOnlineUsers,
          lastSeenAt: newLastSeen
        };
      });
    },
    
    // Request status for specific users
    requestUsersStatus: (socket, userIds) => {
      if (socket) {
        socket.emit('request_users_status', userIds);
      }
    },
    
    // Check if user is online
    isUserOnline: (userId) => {
      if (!userId) return false;
      return get().onlineUsers.has(userId.toString());
    },
    
    // Get user's last seen time
    getLastSeen: (userId) => {
      if (!userId) return null;
      return get().lastSeenAt.get(userId.toString());
    },

    // Fetch all chats for the current user
    fetchChats: async () => {
      set({ loading: true });
      try {
        const response = await axios.get('/chat/chats');
        set({ chats: response.data, loading: false });
      } catch (error) {
        console.error('Error fetching chats:', error);
        set({ error: error.message, loading: false });
      }
    },
    
    // Fetch pending chat requests for faculty
    fetchPendingRequests: async (page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '') => {
      try {
        const response = await axios.get('/chat/requests/pending', {
          params: {
            page,
            limit,
            sortBy,
            sortOrder,
            search
          }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching pending requests:', error);
        throw error;
      }
    },

    // Search faculty members
    searchFaculty: async (query) => {
      try {
        const response = await axios.get(`/chat/faculty/search?query=${query}`);
        return response.data;
      } catch (error) {
        console.error('Error searching faculty:', error);
        return [];
      }
    },

    // Request a chat with a faculty member
    requestChat: async (studentId, facultyId) => {
      try {
        const response = await axios.post('/chat/request', { studentId, facultyId });
        set((state) => ({ chats: [...state.chats, response.data] }));
        
        // Publish to EventBus
        // eventBus.publish(ChatEvents.CHAT_REQUEST, {
        //   chatId: response.data.id,
        //   studentId,
        //   facultyId
        // });
        
        return response.data;
      } catch (error) {
        console.error('Error requesting chat:', error);
        throw error;
      }
    },

    // Approve a chat request
    approveChatRequest: async (chatId) => {
      try {
        const response = await axios.post(`/chat/approve/${chatId}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, status: 'ACTIVE' } : chat
          ),
          pendingRequests: state.pendingRequests.filter(req => req.id !== chatId)
        }));
        
        // Publish to EventBus
        // eventBus.publish(ChatEvents.CHAT_APPROVED, {
        //   chatId,
        //   chat: response.data
        // });
        
        return response.data;
      } catch (error) {
        console.error('Error approving chat:', error);
        throw error;
      }
    },
    
    // Reject a chat request
    rejectChatRequest: async (chatId) => {
      try {
        const response = await axios.post(`/chat/reject/${chatId}`);
        set((state) => ({
          chats: state.chats.filter(chat => chat.id !== chatId),
          pendingRequests: state.pendingRequests.filter(req => req.id !== chatId)
        }));
        
        // Publish to EventBus
        // eventBus.publish(ChatEvents.CHAT_REJECTED, {
        //   chatId
        // });
        
        return response.data;
      } catch (error) {
        console.error('Error rejecting chat:', error);
        throw error;
      }
    },

    // Send a message
    sendMessage: async (chatId, content, attachments = [], replyTo = null) => {
      try {
        // First upload any attachments
        const processedAttachments = [];
        
        if (attachments.length > 0) {
          for (const file of attachments) {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadResponse = await axios.post('/storage/upload', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            processedAttachments.push({
              url: uploadResponse.data.url,
              type: file.type.startsWith('image/') ? 'image' : 
                    file.type.startsWith('audio/') ? 'audio' : 
                    file.type.startsWith('video/') ? 'video' : 'file',
              name: file.name,
              size: file.size
            });
          }
        }
        
        const response = await axios.post('/chat/message/send', {
          chatId,
          content,
          attachments: processedAttachments,
          replyTo,
        });
        
        return response.data;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },

    // Edit a message
    editMessage: async (messageId, newContent) => {
      try {
        const response = await axios.put(`/chat/message/edit/${messageId}`, { newContent });
        
        return response.data;
      } catch (error) {
        console.error('Error editing message:', error);
        throw error;
      }
    },

    // Delete a message
    deleteMessage: async (messageId) => {
      try {
        // Find the chat that contains this message before deleting
        const chatId = get().chats.find(chat => 
          chat.messages && chat.messages.some(msg => msg.id === messageId)
        )?.id;
        
        const response = await axios.delete(`/chat/message/delete/${messageId}`);
        
        return response.data;
      } catch (error) {
        console.error('Error deleting message:', error);
        throw error;
      }
    },

    // Get chat details
    getChatDetails: async (chatId) => {
      try {
        const response = await axios.get(`/chat/chat/${chatId}`);
        
        set((state) => {
          // Update the chat in the list
          const updatedChats = state.chats.map((chat) =>
            chat.id === chatId ? response.data : chat
          );
          
          // Also update the selected chat if it's the current one
          const selectedChat = state.selectedChat && state.selectedChat.id === chatId ? 
            response.data : state.selectedChat;
          
          return { 
            chats: updatedChats,
            selectedChat
          };
        });
        
        return response.data;
      } catch (error) {
        console.error('Error fetching chat details:', error);
        throw error;
      }
    },

    // Load more messages
    loadMoreMessages: async (chatId, messageId, count = 20) => {
      try {
        const response = await axios.get(`/chat/load-more/${chatId}/${messageId}/${count}`);
        
        set((state) => {
          // Update the chat in the list
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId && chat.messages) {
              return {
                ...chat,
                messages: [...response.data, ...chat.messages]
              };
            }
            return chat;
          });
          
          // Also update the selected chat if it's the current one
          let selectedChat = state.selectedChat;
          if (selectedChat && selectedChat.id === chatId && selectedChat.messages) {
            selectedChat = {
              ...selectedChat,
              messages: [...response.data, ...selectedChat.messages]
            };
          }
          
          return { 
            chats: updatedChats,
            selectedChat
          };
        });
        
        return response.data;
      } catch (error) {
        console.error('Error loading more messages:', error);
        throw error;
      }
    },

    // Load last N messages
    loadLastMessages: async (chatId, count = 20) => {
      try {
        const response = await axios.get(`/chat/messages/last/${chatId}/${count}`);
        
        set((state) => {
          // Update the chat in the list
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: response.data
              };
            }
            return chat;
          });
          
          // Also update the selected chat if it's the current one
          let selectedChat = state.selectedChat;
          if (selectedChat && selectedChat.id === chatId) {
            selectedChat = {
              ...selectedChat,
              messages: response.data
            };
          }
          
          return { 
            chats: updatedChats,
            selectedChat
          };
        });
        
        return response.data;
      } catch (error) {
        console.error('Error loading last messages:', error);
        throw error;
      }
    },
    
    // Handle new message from socket
    handleNewMessage: (chatId, message) => {
      set((state) => {
        // Find the chat
        const chatIndex = state.chats.findIndex(c => c.id === chatId);
        
        if (chatIndex === -1) {
          // If chat doesn't exist, fetch all chats again
          get().fetchChats();
          return state;
        }
        
        // Update the chat with the new message
        const updatedChats = [...state.chats];
        const chat = updatedChats[chatIndex];
        
        if (chat.messages) {
          // If the message already exists, don't add it again
          if (chat.messages.some(m => m.id === message.id)) {
            return state;
          }
          
          updatedChats[chatIndex] = {
            ...chat,
            messages: [...chat.messages, message],
            updatedAt: new Date().toISOString()
          };
        } else {
          updatedChats[chatIndex] = {
            ...chat,
            messages: [message],
            updatedAt: new Date().toISOString()
          };
        }
        
        // Also update the selected chat if it's the current one
        let selectedChat = state.selectedChat;
        if (selectedChat && selectedChat.id === chatId) {
          if (selectedChat.messages) {
            // If the message already exists, don't add it again
            if (!selectedChat.messages.some(m => m.id === message.id)) {
              selectedChat = {
                ...selectedChat,
                messages: [...selectedChat.messages, message],
                updatedAt: new Date().toISOString()
              };
            }
          } else {
            selectedChat = {
              ...selectedChat,
              messages: [message],
              updatedAt: new Date().toISOString()
            };
          }
        }
        
        return {
          chats: updatedChats,
          selectedChat
        };
      });
      
      // Publish to EventBus
      //eventBus.publish(ChatEvents.NEW_MESSAGE, { chatId, message });
    },
    
    // Handle message update from socket
    handleMessageUpdate: (chatId, updatedMessage) => {
      set((state) => {
        // Update the message in all chats
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === chatId && chat.messages) {
            return {
              ...chat,
              messages: chat.messages.map((msg) =>
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            };
          }
          return chat;
        });
        
        // Also update the selected chat if it contains this message
        let selectedChat = state.selectedChat;
        if (selectedChat && selectedChat.id === chatId && selectedChat.messages) {
          selectedChat = {
            ...selectedChat,
            messages: selectedChat.messages.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          };
        }
        
        return {
          chats: updatedChats,
          selectedChat
        };
      });
      
      // Publish to EventBus
      //eventBus.publish(ChatEvents.MESSAGE_UPDATED, { chatId, message: updatedMessage });
    },
    
    // Handle message deletion from socket
    handleMessageDeletion: (chatId, messageId) => {
      set((state) => {
        // Update all chats to mark the message as deleted
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === chatId && chat.messages) {
            return {
              ...chat,
              messages: chat.messages.map((msg) => 
                msg.id === messageId 
                  ? { ...msg, isDeleted: true, content: '', attachments: [] }
                  : msg
              )
            };
          }
          return chat;
        });
        
        // Also update the selected chat if it contains this message
        let selectedChat = state.selectedChat;
        if (selectedChat && selectedChat.id === chatId && selectedChat.messages) {
          selectedChat = {
            ...selectedChat,
            messages: selectedChat.messages.map((msg) => 
              msg.id === messageId 
                ? { ...msg, isDeleted: true, content: '', attachments: [] }
                : msg
            )
          };
        }
        
        return {
          chats: updatedChats,
          selectedChat
        };
      });
      
      // Publish to EventBus
     // eventBus.publish(ChatEvents.MESSAGE_DELETED, { chatId, messageId });
    },

    // Mark messages as seen
    markMessagesSeen: async (chatId) => {
      // Check if there are any unseen messages to mark
      const unseenMessages = get().chats
        .find(chat => chat.id === chatId)?.messages
        ?.filter(msg => !msg.seen && msg.senderId !== get().user?.id);
      
      // If no unseen messages, skip the API call
      if (!unseenMessages || unseenMessages.length === 0) {
        return { count: 0, messages: [] };
      }
      
      try {
        const response = await axios.post(`/chat/messages/seen/${chatId}`);
        
        // Update the chat messages to mark them as seen
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId && chat.messages) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  // Only mark messages from other users as seen
                  if (msg.senderId !== get().user?.id && !msg.seen) {
                    return {
                      ...msg,
                      seen: true,
                      seenAt: msg.seen ? msg.seenAt : new Date().toISOString()
                    };
                  }
                  return msg;
                }),
                unreadCount: 0
              };
            }
            return chat;
          });
          
          // Also update the selected chat if it's the current one
          let selectedChat = state.selectedChat;
          if (selectedChat && selectedChat.id === chatId && selectedChat.messages) {
            selectedChat = {
              ...selectedChat,
              messages: selectedChat.messages.map((msg) => {
                // Only mark messages from other users as seen
                if (msg.senderId !== get().user?.id && !msg.seen) {
                  return {
                    ...msg,
                    seen: true,
                    seenAt: msg.seen ? msg.seenAt : new Date().toISOString()
                  };
                }
                return msg;
              }),
              unreadCount: 0
            };
          }
          
          return {
            chats: updatedChats,
            selectedChat
          };
        });
        
        return response.data;
      } catch (error) {
        console.error('Error marking messages as seen:', error);
        throw error;
      }
    },
    
    // Handle messages seen event from socket
    handleMessagesSeen: (chatId, data) => {
      set((state) => {
        // Update the chat messages to mark them as seen
        const updatedChats = state.chats.map((chat) => {
          if (chat.id === chatId && chat.messages) {
            return {
              ...chat,
              messages: chat.messages.map((msg) => {
                // Only update messages sent by the current user
                // The seenBy is the ID of the user who saw the message
                // We want to mark messages as seen where the current user is the sender
                if (msg.senderId !== data.seenBy) {
                  return {
                    ...msg,
                    seen: true,
                    seenAt: data.timestamp
                  };
                }
                return msg;
              })
            };
          }
          return chat;
        });
        
        // Also update the selected chat if it's the current one
        let selectedChat = state.selectedChat;
        if (selectedChat && selectedChat.id === chatId && selectedChat.messages) {
          selectedChat = {
            ...selectedChat,
            messages: selectedChat.messages.map((msg) => {
              // Only update messages sent by the current user
              if (msg.senderId !== data.seenBy) {
                return {
                  ...msg,
                  seen: true,
                  seenAt: data.timestamp
                };
              }
              return msg;
            })
          };
        }
        
        return {
          chats: updatedChats,
          selectedChat
        };
      });
      
      // Publish to EventBus
      //eventBus.publish(ChatEvents.MESSAGES_SEEN, { chatId, ...data });
    },

    // Set the current user
    setUser: (user) => {
      set({ user });
    }
  }))
);

export default useChatStore; 
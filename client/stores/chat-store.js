import {create} from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import axios from '@/lib/axios';

const useChatStore = create(
  subscribeWithSelector((set) => ({
    chats: [],
    loading: false,
    error: null,

    fetchChats: async () => {
      set({ loading: true });
      try {
        const response = await axios.get('/chats');
        set({ chats: response.data, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    requestChat: async (studentId, facultyId) => {
      try {
        const response = await axios.post('/request', { studentId, facultyId });
        set((state) => ({ chats: [...state.chats, response.data] }));
      } catch (error) {
        console.error('Error requesting chat:', error);
      }
    },

    approveChatRequest: async (chatId) => {
      try {
        const response = await axios.post(`/approve/${chatId}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, status: 'ACTIVE' } : chat
          ),
        }));
      } catch (error) {
        console.error('Error approving chat:', error);
      }
    },

    sendMessage: async (chatId, content, attachments, replyTo) => {
      try {
        const response = await axios.post('/message/send', {
          chatId,
          content,
          attachments,
          replyTo,
        });
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...chat.messages, response.data] } : chat
          ),
        }));
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },

    editMessage: async (messageId, newContent) => {
      try {
        const response = await axios.put(`/message/edit/${messageId}`, { newContent });
        set((state) => ({
          chats: state.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.map((msg) =>
              msg.id === messageId ? { ...msg, content: response.data.content } : msg
            ),
          })),
        }));
      } catch (error) {
        console.error('Error editing message:', error);
      }
    },

    deleteMessage: async (messageId) => {
      try {
        await axios.delete(`/message/delete/${messageId}`);
        set((state) => ({
          chats: state.chats.map((chat) => ({
            ...chat,
            messages: chat.messages.filter((msg) => msg.id !== messageId),
          })),
        }));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    },

    getChatDetails: async (chatId) => {
      try {
        const response = await axios.get(`/chat/${chatId}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? response.data : chat
          ),
        }));
      } catch (error) {
        console.error('Error fetching chat details:', error);
      }
    },

    loadMoreMessages: async (chatId, messageId, n) => {
      try {
        const response = await axios.get(`/load-more/${chatId}/${messageId}/${n}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...response.data, ...chat.messages] } : chat
          ),
        }));
      } catch (error) {
        console.error('Error loading more messages:', error);
      }
    },

    loadLastNMessages: async (chatId, n) => {
      try {
        const response = await axios.get(`/messages/last/${chatId}/${n}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, messages: [...response.data, ...chat.messages] } : chat
          ),
        }));
      } catch (error) {
        console.error('Error loading last messages:', error);
      }
    },

    searchMessages: async (query, page, limit) => {
      try {
        const response = await axios.get(`/search`, { params: { query, page, limit } });
        // Handle search results
      } catch (error) {
        console.error('Error searching messages:', error);
      }
    },

    getMessagesUpTo: async (messageId) => {
      try {
        const response = await axios.get(`/messages/up-to/${messageId}`);
        // Handle messages up to a specific message
      } catch (error) {
        console.error('Error getting messages up to:', error);
      }
    },

  }))
);

export default useChatStore; 
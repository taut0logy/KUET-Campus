import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import axios from '@/lib/axios';

const useNotificationStore = create(
  devtools((set, get) => ({
    notifications: [],
    unreadCount: 0,
    selectedNotification: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },

    // Actions
    setNotifications: (notifications) => set({ notifications }),
    setUnreadCount: (count) => set({ unreadCount: count }),
    setSelectedNotification: (notification) => set({ selectedNotification: notification }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setPagination: (pagination) => set({ pagination }),

    // Add a new notification to the list
    addNotification: (notification) =>
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      })),

    // Mark a notification as read
    markAsRead: async (notificationId) => {
      try {
        await axios.patch(`/notifications/${notificationId}/read`);
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    },

    // Mark all notifications as read
    markAllAsRead: async () => {
      try {
        await axios.patch('/notifications/read/all');
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
      } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
      }
    },

    // Fetch notifications with pagination
    fetchNotifications: async (page = 1, limit = 10, unreadOnly = false) => {
      set({ loading: true, error: null });
      try {
        const response = await axios.get('/notifications', {
          params: { page, limit, unreadOnly },
        });
        set({
          notifications: response.data.notifications,
          pagination: response.data.pagination,
          loading: false,
        });
      } catch (error) {
        set({
          error: error.response?.data?.message || 'Failed to fetch notifications',
          loading: false,
        });
      }
    },

    // Fetch unread count
    fetchUnreadCount: async () => {
      try {
        const response = await axios.get('/notifications/unread/count');
        set({ unreadCount: response.data.count });
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    },

    // Clear notifications
    clearNotifications: () =>
      set({
        notifications: [],
        unreadCount: 0,
        selectedNotification: null,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      }),
  }))
);

export { useNotificationStore }; 
import { create } from 'zustand';
import { toast } from 'sonner';
import axios from '@/lib/axios';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  loading: false,
  error: null,
  hasMore: true,
  page: 1,
  pageSize: 10,

  // Add a new notification
  addNotification: (notification) => {
    set((state) => {
      // Check if notification already exists
      const exists = state.notifications.some(n => n.id === notification.id);
      if (exists) {
        return state;
      }

      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });

    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  },

  // Remove a notification
  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      if (!notification) {
        return state;
      }

      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: notification.isRead ? state.unreadCount : Math.max(0, state.unreadCount - 1)
      };
    });
  },

  // Update unread count
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Set connection status
  setConnected: (status) => set({ isConnected: status }),

  // Fetch notifications with pagination
  fetchNotifications: async (page = 1) => {
    try {
      set({ loading: true, error: null });
      
      // Get token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('/notifications', {
        params: {
          page,
          limit: get().pageSize
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.data?.notifications) {
        throw new Error('Invalid response format');
      }

      const { notifications, pagination } = response.data;

      set(state => ({
        notifications: page === 1 ? notifications : [...state.notifications, ...notifications],
        page: pagination.page,
        hasMore: pagination.page < pagination.pages,
        loading: false
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch notifications', 
        loading: false 
      });
    }
  },

  // Load more notifications
  loadMore: async () => {
    const { page, hasMore, loading } = get();
    if (!hasMore || loading) return;

    await get().fetchNotifications(page + 1);
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.patch(`/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      set((state) => {
        const notification = state.notifications.find(n => n.id === notificationId);
        if (!notification || notification.isRead) {
          return state;
        }

        return {
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.patch('/notifications/read/all', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to mark all notifications as read');
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.delete(`/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      get().removeNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to delete notification');
    }
  },

  // Set all notifications
  setNotifications: (notifications) => set({ notifications }),

  // Clear all notifications
  clearAll: () => {
    set({ 
      notifications: [], 
      unreadCount: 0, 
      page: 1, 
      hasMore: true,
      error: null 
    });
  },

  // Reset store state
  reset: () => {
    set({
      notifications: [],
      unreadCount: 0,
      isConnected: false,
      loading: false,
      error: null,
      hasMore: true,
      page: 1
    });
  }
})); 
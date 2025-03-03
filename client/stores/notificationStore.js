import { create } from 'zustand';
import { toast } from 'sonner';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,

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

  // Update unread count
  setUnreadCount: (count) => set({ unreadCount: count }),

  // Set connection status
  setConnected: (status) => set({ isConnected: status }),

  // Mark a notification as read
  markAsRead: (notificationId) => {
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
  },

  // Mark all notifications as read
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0
    }));
  },

  // Set all notifications
  setNotifications: (notifications) => set({ notifications }),
})); 
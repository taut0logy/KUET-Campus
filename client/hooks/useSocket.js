import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useNotificationStore } from '@/stores/notificationStore';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const eventHandlersRef = useRef(new Set());
  const {
    setConnected,
    addNotification,
    setUnreadCount,
  } = useNotificationStore();

  useEffect(() => {
    let socketInstance = null;

    const connectSocket = async () => {
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, skipping socket connection');
        return;
      }

      // If socket already exists, don't create a new one
      if (socketRef.current?.connected) {
        console.log('Socket already connected');
        return;
      }

      console.log('Initializing socket connection to:', `${SOCKET_URL}/notifications`);

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Create socket instance with auth and connect to notifications namespace
      socketInstance = io(`${SOCKET_URL}/notifications`, {
        path: '/socket.io',
        transports: ['websocket'],
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        withCredentials: true
      });

      // Helper function to register event handler only once
      const registerEventHandler = (event, handler) => {
        if (!eventHandlersRef.current.has(event)) {
          socketInstance.on(event, handler);
          eventHandlersRef.current.add(event);
        }
      };

      // Socket event handlers
      registerEventHandler('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        setConnected(false);
      });

      registerEventHandler('connect', () => {
        console.log('Socket connected successfully, socket id:', socketInstance.id);
        console.log('Waiting for authentication...');
      });

      registerEventHandler('auth_error', (error) => {
        console.error('Socket authentication error:', error);
        setConnected(false);
      });

      registerEventHandler('authenticated', () => {
        console.log('Socket authenticated successfully');
        setConnected(true);
      });

      registerEventHandler('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        setConnected(false);
      });

      registerEventHandler('error', (error) => {
        console.error('Socket error:', error);
        setConnected(false);
      });

      // Notification event handlers
      registerEventHandler('notification', (notification) => {
        console.log('Received notification:', notification);
        addNotification(notification);
      });

      registerEventHandler('channel_notification', (data) => {
        console.log('Received channel notification:', data);
        addNotification({
          ...data.notification,
          metadata: { ...data.notification.metadata, channel: data.channel }
        });
      });

      registerEventHandler('unread_count', (count) => {
        console.log('Received unread count:', count);
        setUnreadCount(count);
      });

      socketRef.current = socketInstance;
    };

    connectSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        console.log('Cleaning up socket connection');
        // Remove all event handlers
        eventHandlersRef.current.forEach(event => {
          socketRef.current.off(event);
        });
        eventHandlersRef.current.clear();
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
    };
  }, [user, isAuthenticated, setConnected, addNotification, setUnreadCount]);

  // Channel subscription methods
  const subscribeToChannel = (channelName) => {
    if (socketRef.current?.connected) {
      console.log(`Subscribing to channel: ${channelName}`);
      socketRef.current.emit('subscribe', channelName);
    }
  };

  const unsubscribeFromChannel = (channelName) => {
    if (socketRef.current?.connected) {
      console.log(`Unsubscribing from channel: ${channelName}`);
      socketRef.current.emit('unsubscribe', channelName);
    }
  };

  // Notification actions
  const markAsRead = (notificationId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_read', notificationId);
    }
  };

  const markAllAsRead = () => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('mark_all_read');
    }
  };

  return {
    socket: socketRef.current,
    subscribeToChannel,
    unsubscribeFromChannel,
    markAsRead,
    markAllAsRead,
  };
} 
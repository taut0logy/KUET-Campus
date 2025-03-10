import { useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { useNotificationStore } from '@/stores/notification-store';
import useChatStore from '@/stores/chat-store';
import io from 'socket.io-client';
import eventBus, { ChatEvents } from '@/lib/eventBus';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const notificationSocketRef = useRef(null);
  const chatSocketRef = useRef(null);
  const eventHandlersRef = useRef(new Set());
  const chatEventHandlersRef = useRef(new Set());
  
  const {
    setConnected,
    addNotification,
    setUnreadCount,
    removeNotification,
  } = useNotificationStore();
  
  const {
    handleNewMessage,
    handleMessageUpdate,
    handleMessageDeletion,
    setUserOnline,
    handleMessagesSeen
  } = useChatStore();

  useEffect(() => {
    let notificationSocketInstance = null;
    let chatSocketInstance = null;

    const connectSockets = async () => {
      if (!isAuthenticated || !user) {
        console.log('Not authenticated, skipping socket connection');
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No auth token found');
        return;
      }

      // Connect to notifications namespace if not already connected
      if (!notificationSocketRef.current?.connected) {
        console.log('Initializing socket connection to:', `${SOCKET_URL}/notifications`);
        
        // Create socket instance with auth and connect to notifications namespace
        notificationSocketInstance = io(`${SOCKET_URL}/notifications`, {
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
        const registerNotificationHandler = (event, handler) => {
          if (!eventHandlersRef.current.has(event)) {
            notificationSocketInstance.on(event, handler);
            eventHandlersRef.current.add(event);
          }
        };

        // Socket event handlers
        registerNotificationHandler('connect_error', (error) => {
          console.error('Notification socket connection error:', error.message);
          setConnected(false);
        });

        registerNotificationHandler('connect', () => {
          console.log('Notification socket connected successfully, socket id:', notificationSocketInstance.id);
          console.log('Waiting for authentication...');
        });

        registerNotificationHandler('auth_error', (error) => {
          console.error('Notification socket authentication error:', error);
          setConnected(false);
        });

        registerNotificationHandler('authenticated', () => {
          console.log('Notification socket authenticated successfully');
          setConnected(true);
        });

        registerNotificationHandler('disconnect', (reason) => {
          console.log('Notification socket disconnected:', reason);
          setConnected(false);
        });

        registerNotificationHandler('error', (error) => {
          console.error('Notification socket error:', error);
          setConnected(false);
        });

        // Notification event handlers
        registerNotificationHandler('notification', (notification) => {
          console.log('Received notification:', notification);
          addNotification(notification);
        });

        registerNotificationHandler('channel_notification', (data) => {
          console.log('Received channel notification:', data);
          addNotification({
            ...data.notification,
            metadata: { ...data.notification.metadata, channel: data.channel }
          });
        });

        registerNotificationHandler('unread_count', (count) => {
          console.log('Received unread count:', count);
          setUnreadCount(count);
        });

        registerNotificationHandler('notification_deleted', (notificationId) => {
          console.log('Received notification deletion:', notificationId);
          removeNotification(notificationId);
        });

        notificationSocketRef.current = notificationSocketInstance;
      }
      
      // Connect to chat namespace if not already connected
      if (!chatSocketRef.current?.connected) {
        console.log('Initializing socket connection to:', `${SOCKET_URL}/chat`);
        
        // Create socket instance with auth and connect to chat namespace
        chatSocketInstance = io(`${SOCKET_URL}/chat`, {
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
        
        // Helper function to register chat event handler only once
        const registerChatHandler = (event, handler) => {
          if (!chatEventHandlersRef.current.has(event)) {
            chatSocketInstance.on(event, handler);
            chatEventHandlersRef.current.add(event);
          }
        };
        
        // Chat socket event handlers
        registerChatHandler('connect_error', (error) => {
          console.error('Chat socket connection error:', error.message);
        });

        registerChatHandler('connect', () => {
          console.log('Chat socket connected successfully, socket id:', chatSocketInstance.id);
          console.log('Waiting for chat authentication...');
        });

        registerChatHandler('auth_error', (error) => {
          console.error('Chat socket authentication error:', error);
        });

        registerChatHandler('authenticated', () => {
          console.log('Chat socket authenticated successfully');
          
          // Publish user online status via EventBus
          if (user) {
            eventBus.publish(ChatEvents.USER_ONLINE, { userId: user.id });
          }
        });

        registerChatHandler('disconnect', (reason) => {
          console.log('Chat socket disconnected:', reason);
          
          // Publish user offline status via EventBus
          if (user) {
            eventBus.publish(ChatEvents.USER_OFFLINE, { userId: user.id });
          }
        });

        registerChatHandler('error', (error) => {
          console.error('Chat socket error:', error);
        });
        
        // Chat event handlers
        registerChatHandler('new_message', (data) => {
          console.log('Received new message:', data);
          handleNewMessage(data.chatId, data.message);
        });
        
        registerChatHandler('message_updated', (data) => {
          console.log('Received message update:', data);
          handleMessageUpdate(data.chatId, data.message);
        });
        
        registerChatHandler('message_deleted', (data) => {
          console.log('Received message deletion:', data);
          handleMessageDeletion(data.chatId, data.messageId);
        });
        
        registerChatHandler('user_status', (data) => {
          console.log('Received user status update:', data);
          setUserOnline(data.userId, data.isOnline);
        });
        
        registerChatHandler('messages_seen', (data) => {
          console.log('Messages seen:', data);
          handleMessagesSeen(data.chatId, data);
        });
        
        registerChatHandler('user_typing', (data) => {
          console.log('User typing:', data);
          eventBus.publish(ChatEvents.USER_TYPING, data);
        });
        
        registerChatHandler('user_stopped_typing', (data) => {
          console.log('User stopped typing:', data);
          eventBus.publish(ChatEvents.USER_STOPPED_TYPING, data);
        });
        
        chatSocketRef.current = chatSocketInstance;
      }
    };

    connectSockets();

    // Cleanup on unmount
    return () => {
      if (notificationSocketRef.current) {
        console.log('Cleaning up notification socket connection');
        // Remove all event handlers
        eventHandlersRef.current.forEach(event => {
          notificationSocketRef.current.off(event);
        });
        eventHandlersRef.current.clear();
        notificationSocketRef.current.disconnect();
        notificationSocketRef.current = null;
        setConnected(false);
      }
      
      if (chatSocketRef.current) {
        console.log('Cleaning up chat socket connection');
        // Remove all event handlers
        chatEventHandlersRef.current.forEach(event => {
          chatSocketRef.current.off(event);
        });
        chatEventHandlersRef.current.clear();
        chatSocketRef.current.disconnect();
        chatSocketRef.current = null;
        
        // Publish user offline status via EventBus
        if (user) {
          eventBus.publish(ChatEvents.USER_OFFLINE, { userId: user.id });
        }
      }
    };
  }, [user, isAuthenticated, setConnected, addNotification, setUnreadCount, handleNewMessage, handleMessageUpdate, handleMessageDeletion, setUserOnline, handleMessagesSeen]);

  // Channel subscription methods
  const subscribeToChannel = (channelName) => {
    if (notificationSocketRef.current?.connected) {
      console.log(`Subscribing to channel: ${channelName}`);
      notificationSocketRef.current.emit('subscribe', channelName);
    }
  };

  const unsubscribeFromChannel = (channelName) => {
    if (notificationSocketRef.current?.connected) {
      console.log(`Unsubscribing from channel: ${channelName}`);
      notificationSocketRef.current.emit('unsubscribe', channelName);
    }
  };
  
  // Chat room subscription methods
  const joinChatRoom = (chatId) => {
    if (chatSocketRef.current?.connected) {
      console.log(`Joining chat room: ${chatId}`);
      chatSocketRef.current.emit('join_chat', chatId);
    }
  };
  
  const leaveChatRoom = (chatId) => {
    if (chatSocketRef.current?.connected) {
      console.log(`Leaving chat room: ${chatId}`);
      chatSocketRef.current.emit('leave_chat', chatId);
    }
  };

  // Notification actions
  const markAsRead = (notificationId) => {
    if (notificationSocketRef.current?.connected) {
      notificationSocketRef.current.emit('mark_read', notificationId);
    }
  };

  const markAllAsRead = () => {
    if (notificationSocketRef.current?.connected) {
      notificationSocketRef.current.emit('mark_all_read');
    }
  };
  
  // Chat-specific socket methods
  const sendTypingStatus = (chatId, isTyping) => {
    if (!chatId) {
      console.warn('Cannot send typing status: No chatId provided');
      return;
    }
    
    if (chatSocketRef.current?.connected) {
      console.log(`Emitting ${isTyping ? 'typing_start' : 'typing_stop'} event for chat ${chatId}`);
      chatSocketRef.current.emit(isTyping ? 'typing_start' : 'typing_stop', { chatId });
    } else {
      console.warn('Cannot send typing status: Chat socket not connected');
    }
  };
  
  const requestUserStatus = (userId) => {
    if (chatSocketRef.current?.connected) {
      chatSocketRef.current.emit('request_user_status', { userId });
    }
  };

  return {
    notificationSocket: notificationSocketRef.current,
    chatSocket: chatSocketRef.current,
    subscribeToChannel,
    unsubscribeFromChannel,
    joinChatRoom,
    leaveChatRoom,
    markAsRead,
    markAllAsRead,
    sendTypingStatus,
    requestUserStatus,
  };
} 
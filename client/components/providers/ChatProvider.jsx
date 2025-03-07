import React, { createContext, useContext, useEffect } from 'react';
import useChatStore from '../../stores/chat-store';
import { useSocket } from '../providers/socket-provider'; // Assuming you have a SocketProvider

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { subscribeToChannel, unsubscribeFromChannel } = useSocket();
  const fetchChats = useChatStore((state) => state.fetchChats);

  useEffect(() => {
    fetchChats();

    // Subscribe to chat channels
    subscribeToChannel('chat-channel');

    return () => {
      unsubscribeFromChannel('chat-channel');
    };
  }, [fetchChats, subscribeToChannel, unsubscribeFromChannel]);

  return (
    <ChatContext.Provider value={{}}
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
}; 
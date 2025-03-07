import { useEffect } from 'react';
import useChatStore from '../stores/chat-store';
import { useSocket } from '../providers/socket-provider';

export const useChat = () => {
  const fetchChats = useChatStore((state) => state.fetchChats);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const requestChat = useChatStore((state) => state.requestChat);
  const approveChatRequest = useChatStore((state) => state.approveChatRequest);
  const editMessage = useChatStore((state) => state.editMessage);
  const deleteMessage = useChatStore((state) => state.deleteMessage);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const subscribeToChat = (chatId) => {
    const { subscribeToChannel } = useSocket();
    subscribeToChannel(`chat:${chatId}`);
  };

  const unsubscribeFromChat = (chatId) => {
    const { unsubscribeFromChannel } = useSocket();
    unsubscribeFromChannel(`chat:${chatId}`);
  };

  return { sendMessage, requestChat, approveChatRequest, editMessage, deleteMessage, subscribeToChat, unsubscribeFromChat };
}; 
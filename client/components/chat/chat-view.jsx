"use client";

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import useChatStore from '@/stores/chat-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, MoreVertical, Search } from 'lucide-react';
import ChatHeader from './chat-header';
import ChatMessages from './chat-messages';
import ChatInput from './chat-input';
import ChatInfo from './chat-info';

export default function ChatView({ chat, user, onBack }) {
  const { socket, subscribeToChannel, unsubscribeFromChannel } = useSocket();
  const { loadMoreMessages } = useChatStore();
  
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  
  // Subscribe to chat channel for real-time updates
  useEffect(() => {
    if (chat?.channelId) {
      subscribeToChannel(chat.channelId);
      
      // Load last 20 messages
      loadMoreMessages(chat.id, null, 20);
    }
    
    return () => {
      if (chat?.channelId) {
        unsubscribeFromChannel(chat.channelId);
      }
    };
  }, [chat?.id, chat?.channelId, subscribeToChannel, unsubscribeFromChannel, loadMoreMessages]);
  
  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);
  
  // Handle infinite scroll to load more messages
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    
    if (scrollTop === 0 && !isLoading && chat.messages && chat.messages.length > 0) {
      setIsLoading(true);
      
      const oldestMessageId = chat.messages[0]?.id;
      
      loadMoreMessages(chat.id, oldestMessageId, 20).finally(() => {
        setIsLoading(false);
      });
    }
  };
  
  // Get other participant info
  const otherUser = user?.id === chat?.studentId ? chat?.faculty : chat?.student;
  
  return (
    <>
      <ChatHeader 
        user={otherUser}
        onBack={onBack}
        onInfoClick={() => setIsInfoOpen(true)}
        online={true} // This should come from socket status in production
      />
      
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1"
        onScroll={handleScroll}
      >
        <ChatMessages 
          messages={chat?.messages || []}
          currentUserId={user?.id}
          onReply={setReplyTo}
          onEdit={setEditingMessage}
        />
        <div ref={messagesEndRef} />
      </ScrollArea>
      
      <ChatInput 
        chatId={chat?.id}
        replyTo={replyTo}
        onReplyCancel={() => setReplyTo(null)}
        editingMessage={editingMessage}
        onEditCancel={() => setEditingMessage(null)}
      />
      
      <ChatInfo 
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        chat={chat}
        otherUser={otherUser}
      />
    </>
  );
}
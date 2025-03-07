"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useSocket } from '@/components/providers/socket-provider';
import useChatStore from '@/stores/chat-store';
import ChatList from '@/components/chat/chat-list';
import ChatView from '@/components/chat/chat-view';
import ChatEmpty from '@/components/chat/chat-empty';
import { Separator } from '@/components/ui/separator';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { socket, subscribeToChannel, unsubscribeFromChannel } = useSocket();
  const { chats, loading, fetchChats } = useChatStore();

  const [selectedChatId, setSelectedChatId] = useState(searchParams.get('id') || null);
  const [isMobileView, setIsMobileView] = useState(false);
  
  // Check screen size for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch chats on component mount
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Handle chat selection
  const handleSelectChat = (chatId) => {
    setSelectedChatId(chatId);
    
    // Update URL without full page reload
    router.push(`/chat?id=${chatId}`, { scroll: false });
    
    // On mobile, hide the chat list when a chat is selected
    if (isMobileView) {
      document.getElementById('chat-container').classList.add('chat-view-active');
    }
  };
  
  // Handle back button on mobile
  const handleBackToList = () => {
    setSelectedChatId(null);
    router.push('/chat', { scroll: false });
    if (isMobileView) {
      document.getElementById('chat-container').classList.remove('chat-view-active');
    }
  };

  // Find selected chat
  const selectedChat = selectedChatId ? chats.find(chat => chat.id === selectedChatId) : null;

  return (
    <div id="chat-container" className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {/* Chat list sidebar */}
      <div className={`chat-list ${isMobileView && selectedChatId ? 'hidden md:block' : ''} w-full md:w-1/3 lg:w-1/4 border-r`}>
        <ChatList 
          chats={chats}
          loading={loading}
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          userId={user?.id}
        />
      </div>

      {/* Chat view */}
      <div className={`chat-view ${isMobileView && !selectedChatId ? 'hidden md:flex' : ''} flex-1 flex flex-col`}>
        {selectedChat ? (
          <ChatView
            chat={selectedChat}
            user={user}
            onBack={isMobileView ? handleBackToList : null}
          />
        ) : (
          <ChatEmpty />
        )}
      </div>
    </div>
  );
}
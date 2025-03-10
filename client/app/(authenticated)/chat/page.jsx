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
import NewChatDialog from '@/components/chat/new-chat-dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { socket, subscribeToChannel, unsubscribeFromChannel } = useSocket();
  const { 
    chats, 
    loading, 
    fetchChats, 
    setSelectedChat, 
    selectedChat,
    handleNewMessage,
    handleMessageUpdate,
    handleMessageDeletion,
    setUserOnline,
    fetchPendingRequests
  } = useChatStore();

  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
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
    if (user && user.roles.includes('FACULTY')) {
      fetchPendingRequests();
    }
  }, [fetchChats, fetchPendingRequests, user]);
  
  // Set selected chat from URL parameter
  useEffect(() => {
    const chatId = searchParams.get('id');
    if (chatId) {
      setSelectedChat(chatId);
    }
  }, [searchParams, setSelectedChat]);

  // No need to subscribe to socket events here as they are handled in the useSocket hook
  
  // Handle selecting a chat
  const handleSelectChat = (chatId) => {
    setSelectedChat(chatId);
    
    // Update URL without full page reload
    router.push(`/chat?id=${chatId}`, { scroll: false });
    
    // On mobile, hide the chat list when a chat is selected
    if (isMobileView) {
      document.getElementById('chat-container').classList.add('chat-view-active');
    }
  };
  
  // Handle back button in mobile view
  const handleBackToList = () => {
    setSelectedChat(null);
    router.push('/chat', { scroll: false });
    if (isMobileView) {
      document.getElementById('chat-container').classList.remove('chat-view-active');
    }
  };

  return (
    <div id="chat-container" className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      
      {/* Chat interface */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat list sidebar */}
        <div className={`chat-list ${isMobileView && selectedChat ? 'hidden md:block' : ''} w-full md:w-[40%] lg:w-1/3 border-r overflow-hidden flex flex-col`}>
          <ChatList 
            chats={chats}
            loading={loading}
            selectedChatId={selectedChat?.id}
            onSelectChat={handleSelectChat}
            userId={user?.id}
          />
        </div>

        {/* Chat view */}
        <div className={`chat-view ${isMobileView && !selectedChat ? 'hidden md:flex' : ''} flex-1 flex flex-col overflow-hidden`}>
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
      
      {/* New chat dialog */}
      <NewChatDialog 
        isOpen={isNewChatDialogOpen} 
        onClose={() => setIsNewChatDialogOpen(false)}
        userId={user?.id}
      />
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import NewChatDialog from './new-chat-dialog';
import OnlineStatusIndicator from './online-status-indicator';


export default function ChatList({ chats, loading, selectedChatId, onSelectChat, userId }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  // Filter chats by search query
  const filteredChats = chats.filter(chat => {
    const otherUser = userId === chat.studentId ? chat.faculty : chat.student;
    return otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the most recent message for a chat
  const getLastMessage = (chat) => {
    if (!chat.messages || chat.messages.length === 0) return null;
    
    // Find the last non-deleted message
    for (let i = chat.messages.length - 1; i >= 0; i--) {
      const message = chat.messages[i];
      if (!message.deleted) {
        return message;
      }
    }
    
    // If all messages are deleted, return the last one
    return chat.messages[chat.messages.length - 1];
  };

  // Get the name of the other participant in the chat
  const getOtherParticipant = (chat) => {
    return userId === chat.studentId ? chat.faculty : chat.student;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between bg-background sticky top-0 z-10">
        <h2 className="text-xl font-bold">Chats</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsNewChatDialogOpen(true)}>
          <Plus className="w-5 h-5" />
        </Button>
      </div>
      
      {/* Search */}
      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search contacts"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Chat list */}
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin mr-2" />
            Loading chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground p-4">
            <p>No chats found</p>
            <Button 
              variant="link" 
              onClick={() => setIsNewChatDialogOpen(true)}
              className="mt-2"
            >
              Start a new chat
            </Button>
          </div>
        ) : (
          <div>
            {filteredChats.map(chat => {
              const otherUser = getOtherParticipant(chat);
              const lastMessage = getLastMessage(chat);
              const isActive = chat.id === selectedChatId;

              return (
                <div
                  key={chat.id}
                  className={`flex items-center p-4 cursor-pointer hover:bg-muted/50 transition-colors
                    ${isActive ? 'bg-muted' : ''}`}
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="relative w-12 h-12 mr-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser?.profileImage} />
                    <AvatarFallback>
                      {otherUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <OnlineStatusIndicator className="absolute bottom-0 right-0" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{otherUser?.name}</h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(lastMessage.createdAt), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.deleted ? (
                          <span className="italic">This message was deleted</span>
                        ) : (
                          lastMessage?.content || lastMessage?.attachments?.length > 0 ? 'Sent Attachments' : 'No messages yet'
                        )}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="default" className="rounded-full ml-2">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
      
      <NewChatDialog 
        isOpen={isNewChatDialogOpen}
        onClose={() => setIsNewChatDialogOpen(false)}
        userId={userId}
      />
    </div>
  );
}
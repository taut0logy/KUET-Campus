"use client";

import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Reply, Edit, Trash2, Copy, CheckCheck, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ChatMessages({ messages = [], currentUserId, onReply, onEdit, onDelete }) {
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const longPressTimeoutRef = useRef(null);
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  const handleMessageLongPress = (messageId) => {
    setIsSelectionMode(true);
    toggleMessageSelection(messageId);
  };
  
  const toggleMessageSelection = (messageId) => {
    const newSelection = new Set(selectedMessages);
    if (newSelection.has(messageId)) {
      newSelection.delete(messageId);
      if (newSelection.size === 0) {
        setIsSelectionMode(false);
      }
    } else {
      newSelection.add(messageId);
    }
    setSelectedMessages(newSelection);
  };
  
  const handleTouchStart = (messageId) => {
    longPressTimeoutRef.current = setTimeout(() => {
      handleMessageLongPress(messageId);
    }, 500);
  };
  
  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
  };
  
  const handleMessageClick = (message, event) => {
    if (isSelectionMode) {
      event.preventDefault();
      toggleMessageSelection(message.id);
    }
  };
  
  // Get display name for message sender
  const getSenderName = (message) => {
    return message.senderId === currentUserId ? 'You' : message.sender?.name || 'Unknown';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Render date groups */}
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-2">
          {/* Date header */}
          <div className="flex justify-center">
            <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs">
              {format(new Date(date), 'MMMM d, yyyy')}
            </div>
          </div>
          
          {/* Messages */}
          {dateMessages.map((message) => {
            const isSelfMessage = message.senderId === currentUserId;
            const isSelected = selectedMessages.has(message.id);
            
            return (
              <div 
                key={message.id} 
                className={cn(
                  "flex",
                  isSelfMessage ? "justify-end" : "justify-start",
                  isSelected ? "bg-accent/30" : ""
                )}
              >
                <div 
                  className={cn(
                    "max-w-[75%] group relative",
                    isSelectionMode && "select-none"
                  )}
                  onTouchStart={() => handleTouchStart(message.id)}
                  onTouchEnd={handleTouchEnd}
                  onClick={(e) => handleMessageClick(message, e)}
                >
                  {/* Reply reference */}
                  {message.replyTo && (
                    <div className={cn(
                      "px-3 pt-2 pb-0",
                      isSelfMessage 
                        ? "bg-primary text-primary-foreground rounded-t-lg" 
                        : "bg-muted rounded-t-lg"
                    )}>
                      <div className="border-l-2 border-accent-foreground pl-2 text-sm opacity-80">
                        <p className="font-medium">{getSenderName(message.replyTo)}</p>
                        <p className="line-clamp-1">{message.replyTo.deleted ? "This message was deleted" : message.replyTo.content}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div 
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      message.replyTo && "rounded-t-none",
                      isSelfMessage 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}
                  >
                    {/* Message header in group chats */}
                    {!isSelfMessage && message.isGroupChat && (
                      <p className="font-medium text-sm">{message.sender?.name}</p>
                    )}
                    
                    {/* Message content */}
                    {message.deleted ? (
                      <p className="italic text-muted-foreground">This message was deleted</p>
                    ) : (
                      <>
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mb-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <MessageAttachment key={index} attachment={attachment} />
                            ))}
                          </div>
                        )}
                        
                        {/* Text content */}
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </>
                    )}
                    
                    {/* Message metadata */}
                    <div className="flex justify-end items-center mt-1 space-x-1">
                      <span className="text-[10px] opacity-70">
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                      
                      {/* Message status (sent, delivered, read) */}
                      {isSelfMessage && !message.deleted && (
                        <span className="text-[10px]">
                          {message.read 
                            ? <CheckCheck className="w-3 h-3" /> 
                            : message.delivered 
                              ? <Check className="w-3 h-3" /> 
                              : <Check className="w-3 h-3 opacity-50" />}
                        </span>
                      )}
                      
                      {/* Edited indicator */}
                      {message.edited && !message.deleted && (
                        <span className="text-[10px] opacity-70">edited</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Message actions menu */}
                  {!isSelectionMode && !message.deleted && (
                    <div className={cn(
                      "absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity",
                      isSelfMessage ? "left-0 transform -translate-x-full -translate-y-1/2" : "right-0 transform translate-x-full -translate-y-1/2"
                    )}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-background hover:bg-accent">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={isSelfMessage ? "start" : "end"}>
                          <DropdownMenuItem onClick={() => onReply && onReply(message)}>
                            <Reply className="w-4 h-4 mr-2" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {isSelfMessage && (
                            <>
                              <DropdownMenuItem onClick={() => onEdit && onEdit(message)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => onDelete && onDelete(message.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-32 text-center text-muted-foreground">
          <p>No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
}

// Message Attachment Component
function MessageAttachment({ attachment }) {
  const isImage = attachment.type?.startsWith('image/');
  const isVideo = attachment.type?.startsWith('video/');
  
  if (isImage) {
    return (
      <div className="rounded-md overflow-hidden">
        <img 
          src={attachment.url} 
          alt={attachment.name || "Image"} 
          className="max-h-60 max-w-full object-contain cursor-pointer"
        />
      </div>
    );
  }
  
  if (isVideo) {
    return (
      <video 
        src={attachment.url} 
        className="max-h-60 max-w-full rounded-md"
        controls
      />
    );
  }
  
  // Default file attachment
  return (
    <a 
      href={attachment.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center p-2 bg-background/50 rounded-md"
    >
      <div className="mr-2 p-2 bg-primary/10 rounded">
        <FileIcon className="h-6 w-6 text-primary" />
      </div>
      <div className="overflow-hidden">
        <p className="truncate text-sm">{attachment.name || "File"}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.size)}
        </p>
      </div>
    </a>
  );
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (!bytes) return "Unknown size";
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb * 10) / 10} KB`;
  }
  const mb = kb / 1024;
  return `${Math.round(mb * 10) / 10} MB`;
}
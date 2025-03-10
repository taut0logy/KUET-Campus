"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import eventBus, { ChatEvents } from '@/lib/eventBus';

/**
 * TypingIndicator - A component to display when users are typing in a chat
 * 
 * @param {Object} props
 * @param {string} props.chatId - The ID of the chat to check typing status for
 * @param {Object} props.usersMap - Map of user IDs to user objects with names
 * @param {string} [props.className] - Additional CSS classes
 */
const TypingIndicator = ({ 
  chatId,
  usersMap = {},
  className
}) => {
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Listen for real-time typing status updates
  useEffect(() => {
    if (!chatId) return;
    
    // Handle user typing event
    const handleUserTyping = (data) => {
      if (data.chatId === chatId) {
        console.log(`User ${data.userId} is typing in chat ${chatId}`);
        setTypingUsers(prev => {
          // Add user to typing users if not already there
          if (!prev.includes(data.userId)) {
            return [...prev, data.userId];
          }
          return prev;
        });
      }
    };
    
    // Handle user stopped typing event
    const handleUserStoppedTyping = (data) => {
      if (data.chatId === chatId) {
        console.log(`User ${data.userId} stopped typing in chat ${chatId}`);
        setTypingUsers(prev => prev.filter(userId => userId !== data.userId));
      }
    };
    
    // Subscribe to events
    const unsubscribeUserTyping = eventBus.subscribe(ChatEvents.USER_TYPING, handleUserTyping);
    const unsubscribeUserStoppedTyping = eventBus.subscribe(ChatEvents.USER_STOPPED_TYPING, handleUserStoppedTyping);
    
    return () => {
      // Unsubscribe from events
      unsubscribeUserTyping();
      unsubscribeUserStoppedTyping();
    };
  }, [chatId]);
  
  if (!typingUsers.length) {
    return null;
  }
  
  // Get user names from the map
  const typingUserNames = typingUsers
    .map(userId => usersMap[userId]?.name || 'Someone')
    .filter(Boolean);
  
  // Format the message based on how many users are typing
  let message = '';
  if (typingUserNames.length === 1) {
    message = `${typingUserNames[0]} is typing...`;
  } else if (typingUserNames.length === 2) {
    message = `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
  } else if (typingUserNames.length === 3) {
    message = `${typingUserNames[0]}, ${typingUserNames[1]}, and ${typingUserNames[2]} are typing...`;
  } else {
    message = `${typingUserNames.length} people are typing...`;
  }
  
  return (
    <div className={cn("text-xs text-gray-500 italic flex items-center", className)}>
      <span className="mr-2">{message}</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator; 
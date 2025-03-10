"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ChatHeader from "@/components/chat/chat-header";
import ChatMessages from "@/components/chat/chat-messages";
import ChatInput from "@/components/chat/chat-input";
import MessageSkeleton from "@/components/chat/message-skeleton";
import TypingIndicator from "@/components/chat/typing-indicator";
import useChatStore from "@/stores/chat-store";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSocket } from '@/hooks/useSocket';

export default function ChatView({ chat, user, onBack }) {
  const { 
    sendMessage, 
    editMessage, 
    deleteMessage, 
    loadLastMessages, 
    loadMoreMessages,
    markMessagesSeen,
    setUser
  } = useChatStore();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [usersMap, setUsersMap] = useState({});
  
  const { joinChatRoom, leaveChatRoom } = useSocket();
  const messagesRef = useRef(null);
  
  // Get the other user in the chat (not the current user)
  const otherUser = chat.studentId === user.id ? chat.faculty : chat.student;
  
  // Create a map of users for the typing indicator
  useEffect(() => {
    const newUsersMap = {};
    
    if (chat.student) {
      newUsersMap[chat.student.id] = chat.student;
    }
    
    if (chat.faculty) {
      newUsersMap[chat.faculty.id] = chat.faculty;
    }
    
    setUsersMap(newUsersMap);
  }, [chat.student, chat.faculty]);
  
  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        await loadLastMessages(chat.id, 20);
        
      } catch (error) {
        console.error("Error loading messages:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [chat.id, loadLastMessages, otherUser]);
  
  // Join the chat room when the component mounts
  useEffect(() => {
    if (chat?.id) {
      joinChatRoom(chat.id);
      
      // Leave the chat room when the component unmounts
      return () => {
        leaveChatRoom(chat.id);
      };
    }
  }, [chat?.id, joinChatRoom, leaveChatRoom]);
  
  // Mark messages as seen when the chat is viewed
  useEffect(() => {
    if (chat?.id && !loading) {
      // Mark messages as seen
      markMessagesSeen(chat.id).catch(error => {
        console.error('Error marking messages as seen:', error);
      });
    }
  }, [chat?.id, loading, markMessagesSeen]);
  
  // Set the current user in the chat store
  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);
  
  // Handle sending a message
  const handleSendMessage = async (messageData) => {
    setSending(true);
    try {
      await sendMessage(
        chat.id,
        messageData.content,
        messageData.attachments,
        messageData.replyToId
      );
      
      // Clear reply state after sending
      setReplyingTo(null);
      
      // Scroll to bottom after sending a message
      if (messagesRef.current) {
        messagesRef.current.scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };
  
  // Handle editing a message
  const handleEditMessage = async (messageData) => {
    setSending(true);
    try {
      await editMessage(messageData.editMessageId, messageData.content);
      setEditingMessage(null);
      
      // Scroll to bottom after editing a message
      if (messagesRef.current) {
        messagesRef.current.scrollToBottom();
      }
    } catch (error) {
      console.error("Error editing message:", error);
      toast.error("Failed to edit message");
    } finally {
      setSending(false);
    }
  };
  
  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    try {
      await deleteMessage(messageId);
      toast.success("Message deleted");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };
  
  // Handle loading more messages
  const handleLoadMoreMessages = async () => {
    if (!chat.messages || chat.messages.length === 0 || loadingMoreMessages) return;
    
    setLoadingMoreMessages(true);
    try {
      const firstMessageId = chat.messages[0].id;
      const moreMessages = await loadMoreMessages(chat.id, firstMessageId, 20);
      
      // If we got fewer messages than requested, there are no more to load
      if (!moreMessages || moreMessages.length < 20) {
        setHasMoreMessages(false);
      }
      
      // Small delay to prevent rapid consecutive calls
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error loading more messages:", error);
      toast.error("Failed to load more messages");
    } finally {
      setLoadingMoreMessages(false);
    }
  };
  
  // Handle message actions
  const handleReply = (message) => {
    setReplyingTo(message);
    setEditingMessage(null);
  };
  
  const handleEdit = (message) => {
    setEditingMessage(message);
    setReplyingTo(null);
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Back button for mobile */}
      <div className="lg:hidden p-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Chat header */}
      <ChatHeader 
        name={otherUser?.name || 'Unknown User'}
        avatarUrl={otherUser?.avatarUrl}
        userId={otherUser?.id}
      />
      
      {/* Messages area */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
        {loading ? (
          <div className="p-4 space-y-4">
            <MessageSkeleton isSelf={false} />
            <MessageSkeleton isSelf={true} />
            <MessageSkeleton isSelf={false} />
          </div>
        ) : (
          <ChatMessages 
            messages={chat.messages || []}
            currentUserId={user.id}
            onReply={handleReply}
            onEdit={handleEdit}
            onDelete={handleDeleteMessage}
            onLoadMore={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            loadingMoreMessages={loadingMoreMessages}
            chatId={chat.id}
            ref={messagesRef}
          />
        )}
      </div>
      
      {/* Typing indicator */}
      <div className="px-4 h-6">
        {chat.id && (
          <TypingIndicator 
            chatId={chat.id} 
            usersMap={usersMap}
          />
        )}
      </div>
      
      {/* Input area */}
      {chat.status === 'ACTIVE' ? (
        <ChatInput 
          chatId={chat.id}
          onSendMessage={(messageData) => {
            if (editingMessage) {
              handleEditMessage(messageData);
            } else {
              handleSendMessage(messageData);
            }
          }}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
          disabled={loading}
          loading={sending}
        />
      ) : (
        <div className="p-4 text-center border-t">
          {chat.status === 'PENDING' ? (
            <p className="text-muted-foreground">
              Chat request is pending approval from faculty
            </p>
          ) : chat.status === 'REJECTED' ? (
            <p className="text-destructive">
              Chat request was rejected
            </p>
          ) : (
            <p className="text-muted-foreground">
              This chat is no longer active
            </p>
          )}
        </div>
      )}
    </div>
  );
}
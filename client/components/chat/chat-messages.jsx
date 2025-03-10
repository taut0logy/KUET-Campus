"use client";

import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Reply, 
  Edit, 
  Trash2, 
  Copy, 
  CheckCheck, 
  Check,
  Download,
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import useChatStore from '@/stores/chat-store';

const ChatMessages = forwardRef(function ChatMessages({ 
  messages = [], 
  currentUserId, 
  onReply, 
  onEdit, 
  onDelete,
  onLoadMore,
  hasMoreMessages,
  loadingMoreMessages,
  chatId
}, ref) {
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(null);
  const messagesEndRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const topMessageRef = useRef(null);
  const messageObserverRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const unseenMessageRefs = useRef({});
  const audioRefs = useRef({});
  const longPressTimeoutRef = useRef(null);
  const { isUserOnline, markMessagesSeen } = useChatStore();
  const [isNearTop, setIsNearTop] = useState(false);
  const [scrollFromBottom, setScrollFromBottom] = useState(null);
  const previousMessagesLengthRef = useRef(messages.length);
  
  // Track if this is the initial load
  const isInitialLoadRef = useRef(true);
  
  // Expose scrollToBottom function via ref
  useImperativeHandle(ref, () => ({
    scrollToBottom: () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }));
  
  // Function to scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Setup Intersection Observer for marking messages as seen
  useEffect(() => {
    // Create a set of unseen message IDs from other users
    const unseenMessageIds = messages
      .filter(msg => msg.senderId !== currentUserId && !msg.seen)
      .map(msg => msg.id);
    
    if (unseenMessageIds.length === 0) return;
    
    // Create an observer for unseen messages
    const observerOptions = {
      root: scrollAreaRef.current,
      rootMargin: '0px',
      threshold: 0.5, // Message is considered seen when 50% visible
    };
    
    const handleIntersection = (entries) => {
      const visibleUnseenMessages = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => entry.target.dataset.messageId)
        .filter(Boolean);
      
      if (visibleUnseenMessages.length > 0 && chatId) {
        // Mark messages as seen
        markMessagesSeen(chatId).catch(error => {
          console.error('Error marking messages as seen:', error);
        });
      }
    };
    
    messageObserverRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    
    // Observe all unseen message elements
    unseenMessageIds.forEach(messageId => {
      const element = unseenMessageRefs.current[messageId];
      if (element) {
        messageObserverRef.current.observe(element);
      }
    });
    
    return () => {
      if (messageObserverRef.current) {
        messageObserverRef.current.disconnect();
      }
    };
  }, [messages, currentUserId, markMessagesSeen, chatId]);
  
  // Setup Intersection Observer for loading more messages
  useEffect(() => {
    if (!hasMoreMessages || loadingMoreMessages || messages.length === 0) return;
    
    const observerOptions = {
      root: scrollAreaRef.current,
      rootMargin: '50px',
      threshold: 0.1,
    };
    
    const handleIntersection = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsNearTop(true);
        if (hasMoreMessages && !loadingMoreMessages) {
          // Store current scroll position before loading more messages
          const scrollArea = scrollAreaRef.current;
          if (scrollArea) {
            const scrollHeight = scrollArea.scrollHeight;
            const scrollTop = scrollArea.scrollTop;
            const clientHeight = scrollArea.clientHeight;
            const fromBottom = scrollHeight - scrollTop - clientHeight;
            setScrollFromBottom(fromBottom);
          }
          
          onLoadMore();
        }
      } else {
        setIsNearTop(false);
      }
    };
    
    loadMoreObserverRef.current = new IntersectionObserver(handleIntersection, observerOptions);
    
    if (topMessageRef.current) {
      loadMoreObserverRef.current.observe(topMessageRef.current);
    }
    
    return () => {
      if (loadMoreObserverRef.current) {
        loadMoreObserverRef.current.disconnect();
      }
    };
  }, [hasMoreMessages, loadingMoreMessages, messages, onLoadMore]);
  
  // Handle scroll position after messages update
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) return;

    // If this is a new message (messages length increased by 1 at the end)
    if (messages.length === previousMessagesLengthRef.current + 1) {
      // Scroll to bottom for new messages
      scrollToBottom();
    } 
    // If we loaded more messages (messages length increased by more than 1 at the start)
    else if (messages.length > previousMessagesLengthRef.current && scrollFromBottom !== null) {
      // Restore scroll position relative to bottom
      const newScrollHeight = scrollArea.scrollHeight;
      scrollArea.scrollTop = newScrollHeight - scrollFromBottom - scrollArea.clientHeight;
    }
    // If this is the initial load
    else if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      scrollToBottom();
    }

    previousMessagesLengthRef.current = messages.length;
  }, [messages.length, scrollFromBottom]);
  
  // Handle audio playback
  useEffect(() => {
    // Pause any playing audio when component unmounts
    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        if (audio && !audio.paused) {
          audio.pause();
        }
      });
    };
  }, []);
  
  // Set ref for unseen messages
  const setUnseenMessageRef = useCallback((messageId, element) => {
    if (element) {
      unseenMessageRefs.current[messageId] = element;
    } else {
      delete unseenMessageRefs.current[messageId];
    }
  }, []);
  
  // Handle long press for message selection
  const handleMessageLongPress = (messageId) => {
    setIsSelectionMode(true);
    toggleMessageSelection(messageId);
  };
  
  // Toggle message selection
  const toggleMessageSelection = (messageId) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
        if (newSet.size === 0) {
          setIsSelectionMode(false);
        }
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };
  
  // Handle touch start for long press detection
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
  
  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };
  
  const handlePlayAudio = (audioId) => {
    const audio = audioRefs.current[audioId];
    
    // Pause any currently playing audio
    if (audioPlaying && audioPlaying !== audioId) {
      const currentlyPlaying = audioRefs.current[audioPlaying];
      if (currentlyPlaying && !currentlyPlaying.paused) {
        currentlyPlaying.pause();
      }
    }
    
    if (audio) {
      if (audio.paused) {
        audio.play();
        setAudioPlaying(audioId);
      } else {
        audio.pause();
        setAudioPlaying(null);
      }
    }
  };
  
  const handleAudioEnded = (audioId) => {
    if (audioPlaying === audioId) {
      setAudioPlaying(null);
    }
  };
  
  // Get display name for message sender
  const getSenderName = (message) => {
    return message.senderId === currentUserId ? 'You' : message.sender?.name || 'Unknown';
  };
  
  // Format time for message timestamp
  const formatMessageTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className="flex-1 p-4 h-full overflow-y-auto"
      style={{ maxHeight: 'calc(100vh - 200px)' }}
    >
      {/* Load more indicator */}
      {loadingMoreMessages && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            Loading more messages...
          </div>
        </div>
      )}
      
      {/* No messages state */}
      {messages.length === 0 && !loadingMoreMessages && (
        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
          <p className="mb-2">No messages yet</p>
          <p className="text-sm">Start the conversation by sending a message</p>
        </div>
      )}
      
      {/* Render date groups, make message id as key */}
      {Object.entries(groupedMessages).map(([date, dateMessages], groupIndex) => (
        <div key={date} className="space-y-4">
          {/* Date header */}
          <div className="flex justify-center">
            <div className="bg-accent text-accent-foreground rounded-full px-3 py-1 text-xs">
              {format(new Date(date), 'MMMM d, yyyy')}
            </div>
          </div>
          
          {/* Messages */}
          {dateMessages.map((message, messageIndex) => {
            const isSelfMessage = message.senderId === currentUserId;
            const isSelected = selectedMessages.has(message.id);
            const senderName = getSenderName(message);
            const senderOnline = isUserOnline(message.senderId);
            const isFirstMessage = groupIndex === 0 && messageIndex === 0;
            const isUnseenFromOther = !isSelfMessage && !message.seen;
            
            return (
              <div 
                key={`${message.id}-${Date.parse(message.updatedAt || message.createdAt)}`} 
                className={cn(
                  "group flex mb-2 mt-4",
                  isSelfMessage ? "justify-end" : "justify-start",
                  isSelected ? "bg-accent/30 rounded-lg" : ""
                )}
                onTouchStart={() => handleTouchStart(message.id)}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => handleMessageClick(message, e)}
                ref={isFirstMessage ? topMessageRef : null}
              >
                <div 
                  className={cn(
                    "flex max-w-[80%]",
                    isSelfMessage ? "flex-row-reverse" : "flex-row"
                  )}
                  ref={isUnseenFromOther ? (el) => setUnseenMessageRef(message.id, el) : null}
                  data-message-id={message.id}
                >
                  {/* Avatar */}
                  {!isSelfMessage && (
                    <div className="flex flex-col items-center mr-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender?.avatarUrl} />
                        <AvatarFallback>
                          {message.sender?.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                  
                  {/* Message content */}
                  <div 
                    className={cn(
                      "flex flex-col",
                      isSelfMessage ? "items-end mr-2" : "items-start ml-2"
                    )}
                  >
                    {/* Sender name */}
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium">
                        {senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.createdAt)}
                      </span>
                      {isSelfMessage && (
                        <span className="text-xs text-muted-foreground ml-1">
                          {message.seen ? (
                            <span className="text-primary flex items-center" title={`Seen at ${message.seenAt ? formatMessageTime(message.seenAt) : 'unknown time'}`}>
                              <CheckCheck className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="text-muted-foreground flex items-center" title="Delivered">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    
                    {/* Reply reference */}
                    {message.replyTo && (
                      <div 
                        className={cn(
                          "flex items-center gap-1 text-xs mb-1 p-1 rounded border-l-2",
                          isSelfMessage ? "border-primary/50 bg-primary/10" : "border-accent bg-accent/20"
                        )}
                      >
                        <Reply className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {message.replyTo.senderId === currentUserId ? 'You' : message.replyTo.sender?.name || 'Unknown'}:
                        </span>
                        <span className="truncate max-w-[150px]">
                          {message.replyTo.content}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={cn(
                        "rounded-lg p-3 break-words",
                        isSelfMessage 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-accent text-accent-foreground",
                        message.isDeleted && "bg-muted text-muted-foreground italic"
                      )}
                    >
                      {/* Message content with markdown */}
                      {message.isDeleted ? (
                        <span>This message was deleted</span>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {message.attachments.map((attachment, index) => (
                            <MessageAttachment 
                              key={index} 
                              attachment={attachment}
                              messageId={message.id}
                              onPlayAudio={handlePlayAudio}
                              isPlaying={audioPlaying === `${message.id}-${index}`}
                              onAudioEnded={() => handleAudioEnded(`${message.id}-${index}`)}
                              setAudioRef={(ref) => {
                                audioRefs.current[`${message.id}-${index}`] = ref;
                              }}
                              isSelfMessage={isSelfMessage}
                            />
                          ))}
                        </div>
                      )}
                      
                      {/* Edited indicator */}
                      {message.editedAt && message.editedAt !== message.createdAt && !message.isDeleted && (
                        <div className="text-xs mt-1 opacity-70">
                          (edited)
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Message actions */}
                  <div className={cn(
                    "opacity-0 group-hover:opacity-100 transition-opacity self-end",
                    isSelfMessage ? "mr-2" : "ml-2"
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isSelfMessage ? "end" : "start"}>
                        <DropdownMenuItem onClick={() => onReply(message)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        {isSelfMessage && !message.isDeleted && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit(message)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(message.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Invisible element to scroll to bottom */}
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
});

function MessageAttachment({ 
  attachment, 
  messageId, 
  onPlayAudio, 
  isPlaying, 
  onAudioEnded,
  setAudioRef,
  isSelfMessage
}) {
  const isImage = attachment.type === 'image';
  const isAudio = attachment.type === 'audio';
  const isVideo = attachment.type === 'video';
  const isFile = attachment.type === 'file';
  
  const handleDownload = () => {
    window.open(attachment.url, '_blank');
  };
  
  if (isImage) {
    return (
      <div className="relative group rounded-md overflow-hidden">
        <img 
          src={attachment.url} 
          alt="Image attachment" 
          className="max-h-60 rounded-md object-contain"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white"
            onClick={() => window.open(attachment.url, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
  
  if (isAudio) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        isSelfMessage ? "bg-primary/20" : "bg-accent/50"
      )}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPlayAudio(`${messageId}-${attachment.url}`)}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <audio 
            src={attachment.url} 
            ref={setAudioRef}
            onEnded={onAudioEnded}
            className="hidden"
          />
          <div className="text-xs font-medium truncate">
            {attachment.name || "Voice message"}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  if (isVideo) {
    return (
      <div className="relative group rounded-md overflow-hidden">
        <video 
          src={attachment.url} 
          controls
          className="max-h-60 max-w-full rounded-md"
        />
      </div>
    );
  }
  
  if (isFile) {
    return (
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-md",
        isSelfMessage ? "bg-primary/20" : "bg-accent/50"
      )}>
        <div className="flex-1">
          <div className="text-xs font-medium truncate">
            {attachment.name}
          </div>
          <div className="text-xs text-muted-foreground">
            {formatFileSize(attachment.size)}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return null;
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default ChatMessages;


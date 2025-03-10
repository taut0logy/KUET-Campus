"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Smile,
  Paperclip,
  Mic,
  Send,
  X,
  Image as ImageIcon,
  File as FileIcon,
  Camera,
  Video,
  Loader2,
  StopCircle,
  Trash2,
  Maximize2,
  Minimize2,
  ExternalLink,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import EmojiPicker from 'emoji-picker-react';
import { cn } from "@/lib/utils";
import ReactMarkdown from 'react-markdown';
import { useSocket } from "@/hooks/useSocket";
import { useDebounce } from "@/hooks/use-debounce";

export default function ChatInput({
  chatId,
  onSendMessage,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  disabled,
  loading = false
}) {
  const { sendTypingStatus } = useSocket();
  const [message, setMessage] = useState(editingMessage?.content || "");
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Debounce the typing status to avoid too many updates
  const debouncedIsTyping = useDebounce(isTyping, 500);
  
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Set initial message content when editing
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || "");
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [editingMessage]);

  // Reset form when replyingTo or editingMessage is cleared
  useEffect(() => {
    if (!replyingTo && !editingMessage && message === "") {
      setAttachments([]);
      setAudioBlob(null);
    }
  }, [replyingTo, editingMessage, message]);
  
  // Show preview when message has content
  useEffect(() => {
    if (message.trim().length > 0) {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  }, [message]);
  
  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isRecording]);
  
  // Send typing status when it changes
  useEffect(() => {
    if (chatId) {
      console.log(`Sending typing status: ${debouncedIsTyping ? 'typing' : 'stopped typing'} for chat ${chatId}`);
      sendTypingStatus(chatId, debouncedIsTyping);
    }
    
    // When user stops typing, set a timeout to reset typing status
    if (!debouncedIsTyping && isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        if (chatId) {
          // Ensure we send the stopped typing status
          sendTypingStatus(chatId, false);
        }
      }, 5000); // Reset typing status after 5 seconds of inactivity
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Make sure we send stopped typing when component unmounts
      if (isTyping && chatId) {
        sendTypingStatus(chatId, false);
      }
    };
  }, [chatId, debouncedIsTyping, isTyping, sendTypingStatus]);

  const handleEmojiSelect = (emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleMessageChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    // Set typing status
    if (newMessage.trim().length > 0 && !isTyping) {
      console.log('User started typing');
      setIsTyping(true);
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } else if (newMessage.trim().length === 0 && isTyping) {
      console.log('User stopped typing (empty message)');
      setIsTyping(false);
    }
  };

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0 || audioBlob) && !loading) {
      const allAttachments = [...attachments];
      
      // Add audio attachment if exists
      if (audioBlob) {
        const audioFile = new File([audioBlob], "voice-message.webm", { 
          type: "audio/webm" 
        });
        allAttachments.push(audioFile);
      }
      
      onSendMessage({
        content: message.trim(),
        attachments: allAttachments,
        replyToId: replyingTo?.id,
        editMessageId: editingMessage?.id,
      });
      
      setMessage("");
      setAttachments([]);
      setAudioBlob(null);
      setShowPreview(false);
      setIsTyping(false);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments(prev => [...prev, ...files]);
      e.target.value = null; // Reset input
    }
  };
  
  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };
  
  const removeAudioAttachment = () => {
    setAudioBlob(null);
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setIsRecording(false);
        clearInterval(recordingTimerRef.current);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };
  
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const togglePreviewExpanded = () => {
    setPreviewExpanded(!previewExpanded);
  };
  
  const openPreviewDialog = () => {
    setShowPreviewDialog(true);
  };

  return (
    <div className="p-3 border-t">
      {/* Reply/Edit Info */}
      {(replyingTo || editingMessage) && (
        <div className="mb-2 p-2 rounded-md bg-accent flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium">
              {replyingTo ? "Replying to" : "Editing"}{" "}
              <span className="text-primary">
                {replyingTo?.sender?.name || editingMessage?.sender?.name || "message"}
              </span>
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {replyingTo?.content || editingMessage?.content}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={replyingTo ? onCancelReply : onCancelEdit}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Attachments Preview */}
      {(attachments.length > 0 || audioBlob) && (
        <ScrollArea className="max-h-32 mb-2">
          <div className="flex flex-wrap gap-2 p-1">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="relative group rounded-md border overflow-hidden"
                style={{ width: file.type.startsWith('image/') ? '80px' : '150px' }}
              >
                {file.type.startsWith('image/') ? (
                  <div className="h-20 w-20 relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Attachment"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : file.type.startsWith('video/') ? (
                  <div className="h-20 w-full flex items-center justify-center bg-accent">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="h-20 w-full flex items-center justify-center bg-accent">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="p-1 text-xs truncate">
                  {file.name.length > 15 ? `${file.name.substring(0, 12)}...` : file.name}
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            
            {audioBlob && (
              <div className="relative group rounded-md border overflow-hidden p-2 flex items-center gap-2" style={{ width: '150px' }}>
                <Mic className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="text-xs font-medium">Voice message</div>
                  <audio src={URL.createObjectURL(audioBlob)} controls className="h-6 w-full" />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={removeAudioAttachment}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      )}
      
      {/* Message Preview */}
      {showPreview && (
        <div className="mb-2 relative">
          <div className="absolute top-1 right-1 flex gap-1 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/80 backdrop-blur-sm"
              onClick={togglePreviewExpanded}
              title={previewExpanded ? "Collapse preview" : "Expand preview"}
            >
              {previewExpanded ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 bg-background/80 backdrop-blur-sm"
              onClick={openPreviewDialog}
              title="Open in full screen"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
          <div 
            className={cn(
              "p-2 rounded-md border bg-background/80 backdrop-blur-sm",
              previewExpanded ? "max-h-60" : "max-h-20"
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Message Preview</p>
            </div>
            <ScrollArea className={cn("w-full", previewExpanded ? "h-56" : "h-16")}>
              <div className="prose prose-sm dark:prose-invert max-w-none p-1">
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
      
      {/* Full Screen Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Message Preview</DialogTitle>
          </DialogHeader>
          <ScrollArea className="mt-2 max-h-[60vh]">
            <div className="prose dark:prose-invert max-w-none p-4 bg-accent/20 rounded-md">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
            <Button onClick={handleSend} disabled={!message.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Message Input */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            className="min-h-10 resize-none pr-10"
            disabled={disabled || isRecording || loading}
          />
          <div className="absolute bottom-2 right-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  disabled={disabled || isRecording || loading}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-full p-0 border-none"
              >
                <EmojiPicker
                  onEmojiClick={handleEmojiSelect}
                  width="100%"
                  height={350}
                  previewConfig={{ showPreview: false }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Attachment Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={handleAttachmentClick}
                  disabled={disabled || isRecording || loading}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={disabled || isRecording || loading}
          />
          
          {/* Voice Recording Button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {isRecording ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={stopRecording}
                    disabled={disabled || loading}
                  >
                    <StopCircle className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full"
                    onClick={startRecording}
                    disabled={disabled || loading || audioBlob !== null}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {isRecording 
                  ? `Recording... ${formatRecordingTime(recordingTime)}`
                  : audioBlob 
                    ? "Recording ready to send" 
                    : "Record voice message"
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Send Button */}
          <Button
            variant="default"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={handleSend}
            disabled={
              disabled || 
              loading || 
              (message.trim() === "" && attachments.length === 0 && !audioBlob)
            }
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
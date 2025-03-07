"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
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
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import EmojiPicker from 'emoji-picker-react';

export default function ChatInput({
  onSendMessage,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  disabled,
  loading = false
}) {
  const [message, setMessage] = useState(editingMessage?.content || "");
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

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
    }
  }, [replyingTo, editingMessage, message]);

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

  const handleSend = () => {
    if ((message.trim() || attachments.length > 0) && !loading) {
      onSendMessage({
        content: message.trim(),
        attachments,
        replyToId: replyingTo?.id,
        editMessageId: editingMessage?.id,
      });
      setMessage("");
      setAttachments([]);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Preview files
      const newAttachments = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 
              file.type.startsWith('video/') ? 'video' : 'file',
        name: file.name,
        size: file.size
      }));
      
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Handle textarea auto-expand
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className="p-3 border-t">
      {/* Reply or Edit indicator */}
      {(replyingTo || editingMessage) && (
        <div className="mb-2 p-2 bg-accent rounded-md flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-primary">
                {replyingTo ? "Replying to" : "Editing message"}
              </span>
              <span className="text-xs">{replyingTo?.sender?.name || editingMessage?.sender?.name}</span>
            </div>
            <p className="text-sm line-clamp-1 text-muted-foreground">
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
      
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <ScrollArea className="flex max-h-32 mb-2 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {attachments.map((attachment, index) => (
              <div key={index} className="relative group">
                <div className="w-24 h-24 rounded-md border overflow-hidden relative bg-background">
                  {attachment.type === 'image' && (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  {attachment.type === 'video' && (
                    <div className="h-full w-full flex items-center justify-center bg-black">
                      <Video className="h-8 w-8 text-white" />
                    </div>
                  )}
                  {attachment.type === 'file' && (
                    <div className="h-full w-full flex flex-col items-center justify-center p-2">
                      <FileIcon className="h-8 w-8 text-primary" />
                      <p className="text-xs truncate w-full text-center mt-1">
                        {attachment.name}
                      </p>
                    </div>
                  )}
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="h-5 w-5 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeAttachment(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
      
      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="p-0">
            <EmojiPicker
              onEmojiClick={handleEmojiSelect}
              width={320}
              height={350}
              previewConfig={{ showPreview: false }}
            />
          </PopoverContent>
        </Popover>
        
        {/* Attachment Button */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Paperclip className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-56">
            <div className="flex flex-col gap-2">
              <Button 
                variant="ghost" 
                className="flex justify-start gap-2" 
                onClick={handleAttachmentClick}
                data-type="image"
              >
                <ImageIcon className="h-4 w-4" />
                <span>Photos & Videos</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex justify-start gap-2"
                onClick={handleAttachmentClick} 
                data-type="file"
              >
                <FileIcon className="h-4 w-4" />
                <span>Documents</span>
              </Button>
              <Button 
                variant="ghost" 
                className="flex justify-start gap-2"
              >
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="image/*,video/*,application/*"
        />
        
        {/* Text Input */}
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className={cn(
            "flex-1 min-h-10 max-h-32 resize-none",
            "py-2.5 px-3 rounded-md border"
          )}
          disabled={disabled || loading}
        />
        
        {/* Send or Record Button */}
        {message.trim() || attachments.length > 0 ? (
          <Button 
            className="h-10 w-10"
            onClick={handleSend}
            disabled={disabled || loading}
          >
            {loading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        ) : (
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-10 w-10"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Mic className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
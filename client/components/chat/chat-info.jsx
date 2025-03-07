"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Trash2, AlertTriangle, FileImage } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ChatInfo({ isOpen, onClose, chat, otherUser }) {
  if (!chat || !otherUser) return null;
  
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md p-0 flex flex-col h-full">
        <SheetHeader className="p-6 text-left border-b">
          <SheetTitle>Contact Info</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* User info section */}
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={otherUser.profileImage} />
                <AvatarFallback className="text-xl">
                  {otherUser.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-semibold">{otherUser.name}</h2>
              <p className="text-muted-foreground">{otherUser.role || "Student"}</p>
              
              {/* Show department/batch info if available */}
              {otherUser.department && (
                <div className="mt-2 text-center">
                  <p className="text-sm">{otherUser.department}</p>
                  {otherUser.batch && <p className="text-sm">Batch: {otherUser.batch}</p>}
                </div>
              )}
            </div>
            
            <Separator className="my-6" />
            
            {/* Chat actions section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Chat Actions</h3>
              
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="mr-2 h-4 w-4" />
                Mute notifications
              </Button>
              
              <Button variant="ghost" className="w-full justify-start">
                <FileImage className="mr-2 h-4 w-4" />
                Media, links, and docs
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete chat
              </Button>
              
              <Button variant="ghost" className="w-full justify-start text-amber-500 hover:text-amber-500 hover:bg-amber-500/10">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report
              </Button>
            </div>
            
            <Separator className="my-6" />
            
            {/* Status section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">About</h3>
              <p className="text-sm">{otherUser.about || "No status information"}</p>
            </div>
            
            <Separator className="my-6" />
            
            {/* Chat info section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Chat Info</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-muted-foreground">Created:</p>
                <p>{new Date(chat.createdAt).toLocaleDateString()}</p>
                
                <p className="text-muted-foreground">Status:</p>
                <p>
                  <Badge variant={chat.status === "ACTIVE" ? "default" : "outline"}>
                    {chat.status}
                  </Badge>
                </p>
                
                <p className="text-muted-foreground">Messages:</p>
                <p>{chat.messages?.length || 0}</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
"use client";


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowLeft, MoreVertical, Info, Phone, Video } from "lucide-react";
import OnlineStatusIndicator from "@/components/chat/online-status-indicator";
import useChatStore from "@/stores/chat-store";

export default function ChatHeader({ 
  name, 
  status, 
  onBack, 
  avatarUrl,
  userId
}) {
  // Use both hooks for redundancy
  
  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar>
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>
                {name?.split(" ").map(n => n[0]).join("").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {/* <div className="absolute bottom-0 right-0">
              <OnlineStatusIndicator userId={userId} size="sm" />
            </div> */}
          </div>
          
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <div className="flex items-center gap-1.5">
              <OnlineStatusIndicator userId={userId} showLabel={true} />
              {status === 'PENDING' && (
                <span className="text-xs text-muted-foreground">• Pending approval</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        {status === 'ACTIVE' && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={!online}
              title={online ? "Voice call" : "User is offline"}
            >
              <Phone className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              disabled={!online}
              title={online ? "Video call" : "User is offline"}
            >
              <Video className="h-4 w-4" />
            </Button>
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Info className="h-4 w-4 mr-2" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Block user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
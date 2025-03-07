
"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ArrowLeft, MoreVertical, Search, Phone, Video } from 'lucide-react';

export default function ChatHeader({ user, onBack, onInfoClick, online }) {
  if (!user) return null;
  
  return (
    <div className="p-3 border-b flex items-center bg-background sticky top-0 z-10">
      {onBack && (
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2 md:hidden">
          <ArrowLeft className="w-5 h-5" />
        </Button>
      )}
      
      <Avatar className="h-10 w-10 mr-3">
        <AvatarImage src={user.profileImage} />
        <AvatarFallback>
          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0" onClick={onInfoClick}>
        <h3 className="font-medium truncate">{user.name}</h3>
        <p className="text-xs text-muted-foreground">
          {online ? 'Online' : 'Offline'}
        </p>
      </div>
      
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <Search className="w-5 h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onInfoClick}>
              Contact info
            </DropdownMenuItem>
            <DropdownMenuItem>
              Select messages
            </DropdownMenuItem>
            <DropdownMenuItem>
              Mute notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              Clear chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
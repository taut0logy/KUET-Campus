"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useChatStore from "@/stores/chat-store";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewChatDialog({ isOpen, onClose, userId }) {
  const router = useRouter();
  const { user } = useAuth();
  const { requestChat } = useChatStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [requesting, setRequesting] = useState(false);

  // Fetch users when dialog opens or search changes
  useEffect(() => {
    if (isOpen && searchQuery.length > 0) {
      fetchUsers(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      // Replace with your API call to search users
      const response = await fetch(`/api/users/search?q=${query}`);
      const data = await response.json();
      
      // Filter out current user and existing chats
      const filteredUsers = data.filter(u => u.id !== userId);
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedUserId) return;
    
    setRequesting(true);
    try {
      // Determine who is student and who is faculty
      let studentId, facultyId;
      
      if (user.role === 'STUDENT') {
        studentId = userId;
        facultyId = selectedUserId;
      } else {
        studentId = selectedUserId;
        facultyId = userId;
      }
      
      await requestChat(studentId, facultyId);
      
      toast({
        title: "Chat requested",
        description: "Your chat request has been sent",
      });
      
      onClose();
      router.push('/chat');
    } catch (error) {
      toast.error("Failed to request chat");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Search for students or faculty to start a conversation.
          </DialogDescription>
        </DialogHeader>
        
        {/* Search Box */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or ID"
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* User Results */}
        <ScrollArea className="h-72 border rounded-md">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-4 text-muted-foreground">
              {searchQuery ? "No users found" : "Type to search for users"}
            </div>
          ) : (
            <div className="p-1">
              {users.map((user) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-accent ${
                    selectedUserId === user.id ? "bg-accent" : ""
                  }`}
                  onClick={() => setSelectedUserId(user.id)}
                >
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>
                      {user.name?.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{user.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                    {user.department && (
                      <p className="text-xs text-muted-foreground">
                        {user.department} {user.batch ? `• Batch ${user.batch}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="ghost" onClick={onClose} disabled={requesting}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartChat} 
            disabled={!selectedUserId || requesting}
          >
            {requesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Request Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
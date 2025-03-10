"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useChatStore from "@/stores/chat-store";
import { useAuth } from "@/components/providers/auth-provider";
import { useDebounce } from "@/hooks/use-debounce";
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
import { Search, Loader2, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NewChatDialog({ isOpen, onClose, userId }) {
  const router = useRouter();
  const { user } = useAuth();
  const { requestChat, searchFaculty } = useChatStore();
  
  const [searchInputValue, setSearchInputValue] = useState("");
  const searchQuery = useDebounce(searchInputValue, 500);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const [requesting, setRequesting] = useState(false);

  // Fetch faculty when dialog opens or search changes
  useEffect(() => {
    if (isOpen && searchQuery.length > 2) {
      fetchFaculty(searchQuery);
    } else if (isOpen && searchQuery.length === 0) {
      setFaculty([]);
    }
  }, [isOpen, searchQuery]);

  const fetchFaculty = async (query) => {
    setLoading(true);
    try {
      const results = await searchFaculty(query);
      setFaculty(results);
    } catch (error) {
      console.error("Failed to fetch faculty:", error);
      toast.error("Failed to fetch faculty");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!selectedFacultyId) return;
    
    setRequesting(true);
    try {
      // As a student, request chat with faculty
      await requestChat(userId, selectedFacultyId);
      
      toast.success("Chat request sent", {
        description: "Your chat request has been sent to the faculty member"
      });
      
      onClose();
    } catch (error) {
      toast.error("Failed to request chat", {
        description: error.message || "Please try again later"
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleFacultySelect = (facultyId) => {
    setSelectedFacultyId(facultyId === selectedFacultyId ? null : facultyId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
          <DialogDescription>
            Search for faculty members to start a conversation.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search faculty by name or department..."
              className="pl-8"
              value={searchInputValue}
              onChange={(e) => setSearchInputValue(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="h-[300px] mt-2">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              {searchInputValue.length > 0 ? (
                <>
                  <p className="text-muted-foreground">No faculty found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different search term</p>
                </>
              ) : (
                <>
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Search for faculty members</p>
                  <p className="text-sm text-muted-foreground mt-1">Type at least 3 characters to search</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-2 p-1">
              {faculty.map((facultyMember) => (
                <div
                  key={facultyMember.id}
                  className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${
                    selectedFacultyId === facultyMember.id
                      ? "bg-primary/10"
                      : "hover:bg-accent"
                  }`}
                  onClick={() => handleFacultySelect(facultyMember.id)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={facultyMember.avatarUrl} alt={facultyMember.name} />
                    <AvatarFallback>
                      {facultyMember.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate">{facultyMember.name}</p>
                      {selectedFacultyId === facultyMember.id && (
                        <UserCheck className="h-4 w-4 ml-2 text-primary" />
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="truncate">
                        {facultyMember.facultyInfo?.designation.replace('_', ' ')}
                      </span>
                      {facultyMember.facultyInfo?.department && (
                        <>
                          <span className="mx-1">•</span>
                          <span className="truncate">
                            {facultyMember.facultyInfo.department.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartChat} 
            disabled={!selectedFacultyId || requesting}
            className="min-w-[100px]"
          >
            {requesting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Request Chat"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
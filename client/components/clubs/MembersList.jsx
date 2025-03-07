import React, { useState } from 'react';
import { 
  MoreVertical, 
  Shield, 
  User, 
  UserPlus,
  Ban,
  Check,
  X
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';


import useClubStore from '@/stores/club-store';


export default function MembersList({ club, isManager, onMemberUpdate }) {
  const { addUserToClub, removeUserFromClub, changeUserRoleInClub, changeUserStatusInClub } = useClubStore();
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddMember = async () => {
    if (!newMemberEmail.trim()) {
      toast.error("Email is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would search for a user by email first to get their ID
      // This is simplified for the example
      const userId = 123; // Placeholder - would come from user search
      
      const result = await addUserToClub(club.id, userId, newMemberRole);
      
      // Update the club object with the new member
      // In a real app, you would refetch the club data or update it properly
      const updatedClub = {
        ...club,
        members: [
          ...(club.members || []),
          {
            id: userId.toString(),
            name: newMemberEmail, // Simplified, would be actual user data
            email: newMemberEmail,
            role: newMemberRole,
            status: 'ACTIVE'
          }
        ]
      };
      
      onMemberUpdate(updatedClub);
      
      toast({
        title: "Member added",
        description: `${newMemberEmail} was added to the club.`
      });
      
      setIsAddMemberDialogOpen(false);
      setNewMemberEmail('');
      setNewMemberRole('MEMBER');
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveMember = async (userId, userName) => {
    try {
      await removeUserFromClub(club.id, userId);
      
      // Update the club object by removing the member
      const updatedClub = {
        ...club,
        members: (club.members || []).filter(member => member.id !== userId)
      };
      
      onMemberUpdate(updatedClub);
      
      toast({
        title: "Member removed",
        description: `${userName} has been removed from the club.`
      });
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member. Please try again.");
    }
  };
  
  const handleChangeRole = async (userId, userName, newRole) => {
    try {
      await changeUserRoleInClub(club.id, userId, newRole);
      
      // Update the club object with the new role
      const updatedClub = {
        ...club,
        members: (club.members || []).map(member => 
          member.id === userId 
            ? { ...member, role: newRole }
            : member
        )
      };
      
      onMemberUpdate(updatedClub);
      
      toast.success(`${userName}'s role has been updated to ${newRole.toLowerCase()}.`);
    } catch (error) {
      console.error("Error changing role:", error);
      toast.error("Failed to change role. Please try again.");
    }
  };
  
  const handleChangeStatus = async (userId, userName, newStatus) => {
    try {
      await changeUserStatusInClub(club.id, userId, newStatus);
      
      // Update the club object with the new status
      const updatedClub = {
        ...club,
        members: (club.members || []).map(member => 
          member.id === userId 
            ? { ...member, status: newStatus }
            : member
        )
      };
      
      onMemberUpdate(updatedClub);
      
      toast({
        title: "Status updated",
        description: `${userName}'s status has been updated to ${newStatus.toLowerCase()}.`
      });
    } catch (error) {
      console.error("Error changing status:", error);
      toast.error("Failed to change status. Please try again.");
    }
  };
  
  // Helper to get icon by role
  const getRoleIcon = (role) => {
    switch (role) {
      case 'MODERATOR':
        return <Shield className="h-4 w-4 text-primary" />;
      case 'MANAGER':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'INACTIVE':
        return <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">Inactive</Badge>;
      case 'BANNED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Banned</Badge>;
      default:
        return null;
    }
  };
  
  const moderator = club.moderator;
  const members = club.members || [];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Club Members</h3>
        {isManager && (
          <Button onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {/* Moderator */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>{moderator?.name?.slice(0, 2).toUpperCase() || 'NA'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center">
                    <p className="font-medium">{moderator?.name}</p>
                    <Badge variant="secondary" className="ml-2">Moderator</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{moderator?.email}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t my-4" />
            
            {/* Members */}
            <div className="space-y-4">
              {members.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No members yet</p>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center">
                          <p className="font-medium">{member.name}</p>
                          <div className="flex items-center ml-2 space-x-1">
                            {getRoleIcon(member.role)}
                            <span className="text-xs text-muted-foreground">{member.role.toLowerCase()}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(member.status)}
                      
                      {isManager && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            {/* Role management */}
                            <DropdownMenuItem 
                              onClick={() => handleChangeRole(member.id, member.name, 'MANAGER')}
                              disabled={member.role === 'MANAGER'}
                            >
                              Make Manager
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleChangeRole(member.id, member.name, 'MEMBER')}
                              disabled={member.role === 'MEMBER'}
                            >
                              Make Regular Member
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Status management */}
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(member.id, member.name, 'ACTIVE')}
                              disabled={member.status === 'ACTIVE'}
                            >
                              <Check className="h-3.5 w-3.5 mr-2 text-green-600" />
                              Set Active
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(member.id, member.name, 'INACTIVE')}
                              disabled={member.status === 'INACTIVE'}
                            >
                              <X className="h-3.5 w-3.5 mr-2 text-gray-500" />
                              Set Inactive
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleChangeStatus(member.id, member.name, 'BANNED')}
                              disabled={member.status === 'BANNED'}
                            >
                              <Ban className="h-3.5 w-3.5 mr-2 text-red-600" />
                              Ban Member
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            {/* Remove member */}
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleRemoveMember(member.id, member.name)}
                            >
                              Remove from Club
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add Member Dialog */}
      <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
            <DialogDescription>
              Add a new member to {club.name}. You can set their role and they'll be notified of their membership.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="member@example.com"
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newMemberRole}
                onValueChange={setNewMemberRole}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Regular Member</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddMemberDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={isSubmitting}
            >
              {isSubmitting && <span className="mr-2 h-4 w-4 animate-spin">●</span>}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

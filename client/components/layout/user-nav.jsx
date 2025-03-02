"use client";

import Link from "next/link";
import useAuthStore from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function UserNav() {
  // Get user and logout directly from the store
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const getUserRoles = useAuthStore(state => state.getUserRoles);

  // If no user or the user isn't fully loaded yet, don't render the dropdown
  if (!user) return null;

  // Get first letter of first name and last name
  const firstInitial = user.firstName ? user.firstName[0] : '';
  const lastInitial = user.lastName ? user.lastName[0] : '';
  
  // Use initials from firstName and lastName if available
  // Fall back to email initial if names aren't available
  const initials = (firstInitial || lastInitial) 
    ? `${firstInitial}${lastInitial}`.toUpperCase()
    : user.email 
      ? user.email[0].toUpperCase() 
      : "U";
  
  // Format full name for display
  const fullName = [user.firstName, user.lastName]
    // .filter(Boolean)
    .join(' ') || 'User';
    
  // Get user roles
  const userRoles = getUserRoles();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{fullName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email || ''}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {userRoles.map((role, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {role.toLowerCase().replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile">Profile</Link>
          </DropdownMenuItem>
          {/* <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem> */}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onSelect={(event) => {
            event.preventDefault();
            logout();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuthStore from "@/stores/auth-store";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  MessageSquare, 
  BarChart, 
  Bell, 
  Bus, 
  Coffee,
  Menu,
  X,
  BookOpen
} from "lucide-react";

// Reuse the route generation logic from main-nav.jsx
const getRoutes = (user) => {
  const isAdmin = user?.roles?.includes('admin');
  const isManager = user?.roles?.includes('manager');
  const isStaff = isAdmin || isManager;

  if (isAdmin) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        requireAuth: true,
      },
      {
        href: "/admin/staff",
        label: "Staff Management",
        icon: Users,
        requireAuth: true,
      },
      {
        href: "/admin/users",
        label: "User Management",
        icon: Users,
        requireAuth: true,
      },
      {
        href: "/campaigns/manage",
        label: "Manage Campaigns",
        icon: Calendar,
        requireAuth: true,
      },
      {
        href: "/contact-messages",
        label: "Contact Messages",
        icon: MessageSquare,
        requireAuth: true,
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: BarChart,
        requireAuth: true,
      },
      {
        href: "/assignments",
        label: "Assignments",
        icon: BookOpen,
        requireAuth: true,
      },
    ];
  }

  if (isManager) {
    return [
      {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        requireAuth: true,
      },
      {
        href: "/manager/users",
        label: "User Management",
        icon: Users,
        requireAuth: true,
      },
      {
        href: "/campaigns/manage",
        label: "Manage Campaigns",
        icon: Calendar,
        requireAuth: true,
      },
      {
        href: "/contact-messages",
        label: "Contact Messages",
        icon: MessageSquare,
        requireAuth: true,
      },
      {
        href: "/dashboard/analytics",
        label: "Analytics",
        icon: BarChart,
        requireAuth: true,
      },
      {
        href: "/assignments",
        label: "Assignments",
        icon: BookOpen,
        requireAuth: true,
      },
    ];
  }

  // Regular user routes
  return [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      requireAuth: true,
    },
    {
      href: "/notices",
      label: "Notices & Announcements",
      icon: Bell,
      requireAuth: true,
    },
    {
      href: "/bus",
      label: "Bus Schedule",
      icon: Bus,
      requireAuth: true,
    },
    {
      href: "/cafeteria",
      label: "Cafeteria",
      icon: Coffee,
      requireAuth: true,
    },
    {
      href: "/assignments",
      label: "Assignments",
      icon: BookOpen,
      requireAuth: true,
    },
  ];
};

export function Sidebar({ className }) {
  const pathname = usePathname();
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const getUserRoles = useAuthStore(state => state.getUserRoles);
  const [collapsed, setCollapsed] = React.useState(false);
  
  const routes = getRoutes(user);
  
  // Get user initials for avatar (from user-nav.jsx)
  const firstInitial = user?.firstName ? user.firstName[0] : '';
  const lastInitial = user?.lastName ? user.lastName[0] : '';
  const initials = (firstInitial || lastInitial) 
    ? `${firstInitial}${lastInitial}`.toUpperCase()
    : user?.email 
      ? user.email[0].toUpperCase() 
      : "U";
  
  // Format full name for display
  const fullName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(' ') || 'User';
    
  // Get user roles
  const userRoles = getUserRoles();

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background border-r transition-all duration-300",
      collapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <Link href="/" className="font-bold text-xl">
            KUET Campus
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed ? "mx-auto" : "")}
        >
          {collapsed ? <Menu /> : <X />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          {routes
            .filter((route) => !route.requireAuth || user)
            .map((route) => {
              const Icon = route.icon;
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    pathname === route.href
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed ? "justify-center" : "justify-start"
                  )}
                >
                  {Icon && <Icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />}
                  {!collapsed && <span>{route.label}</span>}
                </Link>
              );
            })}
        </nav>
      </div>
      
      <div className={cn(
        "p-4 border-t",
        collapsed ? "flex justify-center" : ""
      )}>
        {collapsed ? (
          <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setCollapsed(false)}>
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        ) : (
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium">{fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {userRoles.map((role, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {role.toLowerCase().replace('_', ' ')}
                </Badge>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-red-600 hover:text-red-700 hover:bg-red-100 w-full justify-start"
              onClick={logout}
            >
              Log out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
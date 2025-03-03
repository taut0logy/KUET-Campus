"use client";

import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Trash2, Check } from "lucide-react";
import { useNotificationStore } from "@/stores/notification-store";
import { useSocket } from "@/hooks/useSocket";
import { formatDistanceToNow } from "date-fns";

export function NotificationList() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    setUnreadCount,
    setConnected,
    removeNotification
  } = useNotificationStore();

  const socket = useSocket();
  const observer = useRef();
  const isInitializedRef = useRef(false);

  const lastNotificationRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  // Handle socket events
  useEffect(() => {
    if (!socket?.connected || isInitializedRef.current) return;

    const handleNotification = (notification) => {
      addNotification(notification);
    };

    const handleChannelNotification = (notification) => {
      addNotification(notification);
    };

    const handleUnreadCount = (count) => {
      setUnreadCount(count);
    };

    const handleNotificationDeleted = (notificationId) => {
      removeNotification(notificationId);
    };

    // Set up listeners
    socket.on('notification', handleNotification);
    socket.on('channel_notification', handleChannelNotification);
    socket.on('unread_count', handleUnreadCount);
    socket.on('notification_deleted', handleNotificationDeleted);

    setConnected(true);
    isInitializedRef.current = true;

    // Cleanup
    return () => {
      if (socket?.off) {
        socket.off('notification', handleNotification);
        socket.off('channel_notification', handleChannelNotification);
        socket.off('unread_count', handleUnreadCount);
        socket.off('notification_deleted', handleNotificationDeleted);
      }
      setConnected(false);
      isInitializedRef.current = false;
    };
  }, [socket, addNotification, setUnreadCount, setConnected, removeNotification]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (error) {
    return (
      <div className="p-4 text-center text-destructive">
        Error loading notifications: {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No notifications yet
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Notifications</h3>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              ref={index === notifications.length - 1 ? lastNotificationRef : null}
              className={`flex items-start gap-4 p-4 rounded-lg border transition-colors duration-200 ${
                !notification.read ? "bg-accent/80 hover:bg-accent" : "hover:bg-accent/50"
              }`}
            >
              <div className="flex-shrink-0">
                <Bell className={`w-5 h-5 ${!notification.read ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium leading-none ${!notification.read ? "text-primary" : ""}`}>
                    {notification.title}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-red-500/60 hover:text-white rounded-md transition-colors duration-200 cursor-pointer"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {loading && (
        <div className="p-4 text-center text-muted-foreground">
          Loading more notifications...
        </div>
      )}
    </div>
  );
} 
import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notification';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationList() {
  const {
    notifications,
    loading,
    error,
    pagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  if (loading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!notifications.length) {
    return <div className="p-4 text-center text-muted-foreground">No notifications</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllAsRead()}
          className="text-xs"
        >
          Mark all as read
        </Button>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="flex flex-col gap-2 p-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      </ScrollArea>
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === 1}
            onClick={() => fetchNotifications(pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page === pagination.pages}
            onClick={() => fetchNotifications(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead }) {
  const getTypeStyles = (type) => {
    switch (type.toUpperCase()) {
      case 'ERROR':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'SUCCESS':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`flex items-start gap-4 p-3 rounded-lg border ${
        getTypeStyles(notification.type)
      } ${!notification.isRead ? 'opacity-100' : 'opacity-70'}`}
    >
      <div className="flex-1">
        <h4 className="font-medium">{notification.title}</h4>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </span>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMarkAsRead(notification.id)}
          className="h-8 w-8"
        >
          <Check className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 
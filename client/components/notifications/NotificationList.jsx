import { useEffect } from 'react';
import { useNotificationStore } from '@/stores/notificationStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Check, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationList() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationStore();

  if (!notifications.length) {
    return <div className="p-4 text-center text-muted-foreground">No notifications</div>;
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs"
          >
            Mark all as read
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px]">
        <div className="flex flex-col gap-2 p-4">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const getTypeStyles = (type) => {
    switch (type?.toUpperCase()) {
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
      <div className="flex items-center gap-1">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-8 w-8"
            title="Mark as read"
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(notification.id)}
          className="h-8 w-8 text-destructive hover:text-destructive"
          title="Delete notification"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 
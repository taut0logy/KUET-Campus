import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotificationStore } from '@/stores/notification';
import { Badge } from '@/components/ui/badge';

export function NotificationBell({ onClick }) {
  const { unreadCount } = useNotificationStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={onClick}
      aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
} 
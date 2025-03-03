import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NotificationBell } from './NotificationBell';
import { NotificationList } from './NotificationList';

export function NotificationPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <NotificationBell />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
} 
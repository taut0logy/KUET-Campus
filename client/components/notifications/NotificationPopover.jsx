"use client";

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
      <PopoverTrigger>
        <NotificationBell />
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end" sideOffset={5}>
        <NotificationList />
      </PopoverContent>
    </Popover>
  );
} 
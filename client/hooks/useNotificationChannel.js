import { useEffect } from 'react';
import socketService from '@/lib/socket';

export function useNotificationChannel(channelName) {
  useEffect(() => {
    if (channelName) {
      // Subscribe to channel
      socketService.subscribeToChannel(channelName);

      // Cleanup: unsubscribe from channel
      return () => {
        socketService.unsubscribeFromChannel(channelName);
      };
    }
  }, [channelName]);

  return {
    subscribe: () => socketService.subscribeToChannel(channelName),
    unsubscribe: () => socketService.unsubscribeFromChannel(channelName),
  };
}
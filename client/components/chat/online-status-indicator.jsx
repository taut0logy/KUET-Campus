import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import useChatStore from '@/stores/chat-store';
import { useSocket } from '@/hooks/useSocket';

/**
 * OnlineStatusIndicator - A component to display a user's online status
 * 
 * @param {Object} props
 * @param {string} props.userId - The ID of the user to check status for
 * @param {string} [props.size='md'] - Size of the indicator (sm, md, lg)
 * @param {boolean} [props.showLabel=false] - Whether to show a text label
 * @param {string} [props.className] - Additional CSS classes
 */
const OnlineStatusIndicator = ({ 
  userId, 
  size = 'md', 
  showLabel = false,
  className
}) => {
  const { isUserOnline, getLastSeen, handleUserStatusUpdate, handleBatchStatusUpdate, requestUsersStatus } = useChatStore();
  const { socket } = useSocket();
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  // Get the size in pixels
  const sizeMap = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };
  
  // Update local state when online status changes
  useEffect(() => {
    if (!userId) return;
    
    const updateLocalStatus = () => {
      setIsOnline(isUserOnline(userId));
      setLastSeen(getLastSeen(userId));
    };
    
    // Initial status check
    updateLocalStatus();
    
    // Request initial status
    if (socket) {
      requestUsersStatus(socket, [userId]);
    }
    
    // Subscribe to status updates
    if (socket) {
      // Handle individual user status updates
      socket.on('user_status_update', (data) => {
        if (data.userId === userId) {
          handleUserStatusUpdate(data);
          updateLocalStatus();
        }
      });
      
      // Handle batch status updates
      socket.on('users_status_batch', (data) => {
        handleBatchStatusUpdate(data);
        updateLocalStatus();
      });
      
      // Handle direct status response
      socket.on('user_status_response', (data) => {
        if (data.userId === userId) {
          handleUserStatusUpdate(data);
          updateLocalStatus();
        }
      });
      
      // Handle batch status response
      socket.on('users_status_response', (statuses) => {
        const userStatus = statuses.find(status => status.userId === userId);
        if (userStatus) {
          handleUserStatusUpdate(userStatus);
          updateLocalStatus();
        }
      });
    }
    
    // Cleanup socket listeners
    return () => {
      if (socket) {
        socket.off('user_status_update');
        socket.off('users_status_batch');
        socket.off('user_status_response');
        socket.off('users_status_response');
      }
    };
  }, [userId, socket, isUserOnline, getLastSeen, handleUserStatusUpdate, handleBatchStatusUpdate, requestUsersStatus]);
  
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now - date) / 36e5; // Convert to hours
    
    if (diffInHours < 24) {
      return `Last seen ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    return `Last seen on ${format(date, 'MMM d, yyyy')} at ${format(date, 'h:mm a')}`;
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1.5", className)}>
            <div 
              className={cn(
                "rounded-full", 
                sizeMap[size] || sizeMap.md,
                isOnline ? "bg-green-500" : "bg-gray-400"
              )}
            />
            {showLabel && (
              <span className="text-xs text-gray-600">
                {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isOnline ? (
            <span>Online</span>
          ) : lastSeen ? (
            <span>{formatLastSeen(lastSeen)}</span>
          ) : (
            <span>Offline</span>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default OnlineStatusIndicator; 
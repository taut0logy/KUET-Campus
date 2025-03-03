"use client";

import { useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useNotificationStore } from '@/stores/notificationStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from '@/lib/axios';

export default function NotificationsTestPage() {
  const [channelName, setChannelName] = useState('test-channel');
  const { subscribeToChannel, unsubscribeFromChannel } = useSocket();
  const { notifications, unreadCount, isConnected, markAllAsRead } = useNotificationStore();

  const sendTestNotification = async () => {
    try {
      await axios.post('/notifications/test', {
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'INFO'
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast.error('Failed to send notification');
    }
  };

  const sendChannelNotification = async () => {
    try {
      await axios.post('/notifications/test/channel', {
        channelName,
        title: 'Test Channel Notification',
        message: `This is a test notification for channel: ${channelName}`,
        type: 'INFO'
      });
    } catch (error) {
      console.error('Failed to send channel notification:', error);
      toast.error('Failed to send channel notification');
    }
  };

  const showFileOperationToasts = () => {
    toast.success('File uploaded successfully!', {
      description: 'document.pdf (2.5MB)',
    });

    setTimeout(() => {
      toast.info('File shared with you', {
        description: 'John shared "presentation.pptx" with you',
      });
    }, 1000);

    setTimeout(() => {
      toast.error('File deletion failed', {
        description: "You don't have permission to delete this file",
      });
    }, 2000);
  };

  const showProgressToast = () => {
    const toastId = toast.loading('Uploading file...', {
      description: '0%',
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (progress > 100) {
        clearInterval(interval);
        toast.success('File uploaded successfully!', {
          id: toastId,
        });
        return;
      }
      toast.loading('Uploading file...', {
        id: toastId,
        description: `${progress}%`,
      });
    }, 1000);
  };

  const showPromiseToast = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Processing...',
        success: 'Operation completed!',
        error: 'Operation failed!',
      }
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Notifications Test Page</h1>

      {/* Connection Status */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </Card>

      {/* Basic Toasts */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Basic Toasts</h2>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => toast.info('This is an info message')}>
            Info Toast
          </Button>
          <Button onClick={() => toast.success('Operation successful!')}>
            Success Toast
          </Button>
          <Button onClick={() => toast.warning('Please be careful!')}>
            Warning Toast
          </Button>
          <Button onClick={() => toast.error('Something went wrong!')}>
            Error Toast
          </Button>
        </div>
      </Card>

      {/* File Operation Toasts */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">File Operation Toasts</h2>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={showFileOperationToasts}>
            Show File Operations
          </Button>
          <Button variant="secondary" onClick={showProgressToast}>
            Show Upload Progress
          </Button>
          <Button variant="secondary" onClick={showPromiseToast}>
            Show Promise Toast
          </Button>
        </div>
      </Card>

      {/* Real-time Notification Test */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Real-time Notifications</h2>
        <div className="space-y-4">
          <div>
            <Button onClick={sendTestNotification}>
              Send Test Notification
            </Button>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="border p-2 rounded"
              placeholder="Channel name"
            />
            <div className="space-x-2">
              <Button onClick={() => subscribeToChannel(channelName)}>
                Subscribe to Channel
              </Button>
              <Button onClick={() => unsubscribeFromChannel(channelName)} variant="outline">
                Unsubscribe from Channel
              </Button>
              <Button onClick={sendChannelNotification}>
                Send Channel Notification
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications List */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Notifications ({unreadCount} unread)</h2>
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            Mark All as Read
          </Button>
        </div>
        <div className="space-y-2">
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications yet</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded border ${
                  notification.isRead ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(notification.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-600">{notification.message}</p>
                {notification.metadata?.channel && (
                  <span className="text-sm text-gray-500">
                    Channel: {notification.metadata.channel}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
} 
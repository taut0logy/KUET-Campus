# Notification System Documentation

## Overview
The notification system provides real-time notifications using Socket.IO for instant updates and a REST API for fetching historical notifications. It supports both user-specific and channel-based notifications.

## Demo Page

**test/notifications**


## Architecture

### Components
1. **Socket.IO Server**
   - Handles real-time connections
   - Manages user authentication
   - Handles channel subscriptions
   - Emits notifications to specific users or channels

2. **REST API**
   - Manages notification persistence
   - Handles notification status updates
   - Provides historical notification access

3. **Client-Side Hook (`useSocket`)**
   - Manages socket connections
   - Handles authentication
   - Manages channel subscriptions
   - Prevents duplicate connections and event handlers

4. **Notification Store**
   - Manages notification state
   - Prevents duplicate notifications
   - Handles notification status updates
   - Provides toast notifications

## Configuration

### Server Configuration
1. **Environment Variables**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=8000

   # Client Configuration
   CLIENT_URL=http://localhost:3000

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=1d

   # Database Configuration (if using)
   DATABASE_URL=your_database_url
   ```

2. **Socket.IO Setup**
   ```javascript
   const io = new Server(server, {
     cors: {
       origin: process.env.CLIENT_URL,
       methods: ['GET', 'POST'],
       credentials: true
     },
     path: '/socket.io'
   });
   ```

### Client Configuration
1. **Environment Variables**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   NEXT_PUBLIC_SOCKET_URL=http://localhost:8000
   ```

2. **Socket Provider Setup**
   ```javascript
   <SocketProvider>
     <App />
   </SocketProvider>
   ```

## Authentication Flow

1. **Client Connection**
   ```javascript
   // Client connects with auth token
   socketInstance = io(`${SOCKET_URL}/notifications`, {
     path: '/socket.io',
     auth: { token },
     withCredentials: true
   });
   ```

2. **Server Authentication**
   ```javascript
   // Server verifies token and attaches user
   notificationsNamespace.use((socket, next) => {
     const token = socket.handshake.auth.token;
     if (!token) {
       return next(new Error('Authentication error'));
     }
     // Verify token and attach user
     next();
   });
   ```

## Event Handling

### Server Events
1. **Connection Events**
   - `connection`: New socket connection
   - `disconnect`: Socket disconnection
   - `error`: Socket errors

2. **Authentication Events**
   - `authenticated`: Successful authentication
   - `auth_error`: Authentication failure

3. **Channel Events**
   - `subscribe`: Channel subscription
   - `unsubscribe`: Channel unsubscription

4. **Notification Events**
   - `mark_read`: Mark notification as read
   - `mark_all_read`: Mark all notifications as read

### Client Events
1. **Connection Management**
   ```javascript
   socket.on('connect', () => {
     console.log('Socket connected');
   });

   socket.on('authenticated', () => {
     console.log('Socket authenticated');
   });
   ```

2. **Notification Events**
   ```javascript
   socket.on('notification', (notification) => {
     addNotification(notification);
   });

   socket.on('channel_notification', (data) => {
     addNotification({
       ...data.notification,
       metadata: { ...data.notification.metadata, channel: data.channel }
     });
   });
   ```

## Channel System

### Channel Types
1. **User Channels**
   - Format: `user:${userId}`
   - Used for user-specific notifications

2. **Custom Channels**
   - Format: `channel:${channelName}`
   - Used for group notifications

### Channel Management
1. **Subscribe to Channel**
   ```javascript
   socket.emit('subscribe', channelName);
   ```

2. **Unsubscribe from Channel**
   ```javascript
   socket.emit('unsubscribe', channelName);
   ```

## Notification Store

### State Management
```javascript
const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  
  addNotification: (notification) => {
    set((state) => {
      // Prevent duplicates
      const exists = state.notifications.some(n => n.id === notification.id);
      if (exists) return state;
      
      return {
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    });
  }
}));
```

### Actions
1. **Add Notification**
   - Prevents duplicates
   - Updates unread count
   - Shows toast notification

2. **Mark as Read**
   - Updates notification status
   - Decrements unread count

3. **Mark All as Read**
   - Updates all notifications
   - Resets unread count

## Error Handling

### Client-Side
1. **Connection Errors**
   ```javascript
   socket.on('connect_error', (error) => {
     console.error('Connection error:', error);
     setConnected(false);
   });
   ```

2. **Authentication Errors**
   ```javascript
   socket.on('auth_error', (error) => {
     console.error('Auth error:', error);
     setConnected(false);
   });
   ```

### Server-Side
1. **Authentication Failures**
   ```javascript
   if (!token) {
     return next(new Error('Authentication error'));
   }
   ```

2. **Channel Errors**
   ```javascript
   if (!channelName) {
     return callback(new Error('Channel name is required'));
   }
   ```

## Best Practices

1. **Connection Management**
   - Check for existing connections before creating new ones
   - Clean up event handlers on unmount
   - Handle reconnection attempts

2. **Event Handling**
   - Register event handlers only once
   - Clean up event handlers properly
   - Use consistent event naming

3. **State Management**
   - Prevent duplicate notifications
   - Maintain accurate unread counts
   - Clean up state on disconnect

4. **Error Handling**
   - Log all errors appropriately
   - Handle reconnection gracefully
   - Provide user feedback for errors

## Testing

### Manual Testing
1. **Connection Testing**
   - Verify socket connection
   - Check authentication
   - Test reconnection

2. **Notification Testing**
   - Send test notifications
   - Verify duplicate prevention
   - Check toast notifications

3. **Channel Testing**
   - Subscribe to channels
   - Send channel notifications
   - Verify unsubscription

### Automated Testing
1. **Unit Tests**
   - Test notification store
   - Test socket hook
   - Test channel management

2. **Integration Tests**
   - Test client-server communication
   - Test authentication flow
   - Test notification delivery

## Troubleshooting

### Common Issues
1. **Connection Issues**
   - Check environment variables
   - Verify CORS settings
   - Check network connectivity

2. **Authentication Issues**
   - Verify JWT token
   - Check token expiration
   - Verify token format

3. **Duplicate Notifications**
   - Check notification store
   - Verify event handlers
   - Check channel subscriptions

### Debugging
1. **Client-Side**
   ```javascript
   socket.on('connect', () => {
     console.log('Socket connected:', socket.id);
   });
   ```

2. **Server-Side**
   ```javascript
   socket.on('connection', (socket) => {
     console.log('Client connected:', socket.id);
   });
   ``` 
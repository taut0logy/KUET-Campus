/**
 * EventBus - A simple event bus implementation for handling application-wide events
 * This allows components to subscribe to and publish events without direct coupling
 */
class EventBus {
  constructor() {
    this.subscribers = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name
   * @param {Function} callback - The callback function to execute when the event is published
   * @returns {Function} - Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, new Set());
    }
    
    this.subscribers.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      if (this.subscribers.has(event)) {
        this.subscribers.get(event).delete(callback);
        
        // Clean up if no subscribers left
        if (this.subscribers.get(event).size === 0) {
          this.subscribers.delete(event);
        }
      }
    };
  }

  /**
   * Publish an event with data
   * @param {string} event - The event name
   * @param {any} data - The data to pass to subscribers
   */
  publish(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Clear all subscribers for an event
   * @param {string} event - The event name
   */
  clear(event) {
    if (event) {
      this.subscribers.delete(event);
    } else {
      this.subscribers.clear();
    }
  }
}

// Create a singleton instance
const eventBus = new EventBus();

// Define standard event names as constants
export const ChatEvents = {
  NEW_MESSAGE: 'chat:new_message',
  MESSAGE_UPDATED: 'chat:message_updated',
  MESSAGE_DELETED: 'chat:message_deleted',
  CHAT_CREATED: 'chat:chat_created',
  CHAT_UPDATED: 'chat:chat_updated',
  CHAT_DELETED: 'chat:chat_deleted',
  CHAT_REQUEST: 'chat:request',
  CHAT_APPROVED: 'chat:approved',
  CHAT_REJECTED: 'chat:rejected',
  USER_ONLINE: 'chat:user_online',
  USER_OFFLINE: 'chat:user_offline',
  USER_TYPING: 'chat:user_typing',
  USER_STOPPED_TYPING: 'chat:user_stopped_typing',
  MESSAGES_SEEN: 'chat:messages_seen',
};

export default eventBus; 
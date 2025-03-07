import { create } from 'zustand';
import axios from '@/lib/axios';

const EVENT_STATES = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  LOADED: "LOADED",
  ERROR: "ERROR",
};

const useEventStore = create((set, get) => ({
  // State
  events: [],
  currentEvent: null,
  eventTags: [],
  eventState: EVENT_STATES.IDLE,
  error: null,

  // Computed properties
  isLoading: () => get().eventState === EVENT_STATES.LOADING,
  hasError: () => !!get().error,

  // Actions

  // Create a new event (POST /api/v1/events)
  createEvent: async (eventData) => {
    try {
      set({ eventState: EVENT_STATES.LOADING });
      const response = await axios.post('/api/v1/events', eventData);
      // Optionally add the new event to the events list
      set((state) => ({
        events: [response.data.data.event, ...state.events],
        eventState: EVENT_STATES.LOADED,
      }));
      return response.data.data.event;
    } catch (error) {
      set({ eventState: EVENT_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Update an event (PUT /api/v1/events/:id)
  updateEvent: async (id, eventData) => {
    try {
      set({ eventState: EVENT_STATES.LOADING });
      const response = await axios.put(`/api/v1/events/${id}`, eventData);
      set({ currentEvent: response.data.data.event, eventState: EVENT_STATES.LOADED });
      // Update the event in the events list if it exists
      set((state) => ({
        events: state.events.map((event) =>
          event.id === id ? response.data.data.event : event
        ),
      }));
      return response.data.data.event;
    } catch (error) {
      set({ eventState: EVENT_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Follow an event (POST /api/v1/events/:eventId/follow)
  followEvent: async (eventId) => {
    try {
      const response = await axios.post(`/api/v1/events/${eventId}/follow`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Unfollow an event (DELETE /api/v1/events/:eventId/unfollow)
  unfollowEvent: async (eventId) => {
    try {
      const response = await axios.delete(`/api/v1/events/${eventId}/unfollow`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Log a user's visit to an event (POST /api/v1/events/:eventId/visit)
  logUserVisit: async (eventId) => {
    try {
      const response = await axios.post(`/api/v1/events/${eventId}/visit`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get concise info of an event (GET /api/v1/events/:eventId/info)
  getEventInfo: async (eventId) => {
    try {
      const response = await axios.get(`/api/v1/events/${eventId}/info`);
      set({ currentEvent: response.data.data.event });
      return response.data.data.event;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get detailed info of an event (GET /api/v1/events/:eventId/details)
  getEventDetails: async (eventId) => {
    try {
      const response = await axios.get(`/api/v1/events/${eventId}/details`);
      set({ currentEvent: response.data.data.event });
      return response.data.data.event;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get event analytics (GET /api/v1/events/:eventId/analytics)
  getEventAnalytics: async (eventId, params = {}) => {
    try {
      set({ eventState: EVENT_STATES.LOADING });
      const response = await axios.get(`/api/v1/events/${eventId}/analytics`, { params });
      set({ eventState: EVENT_STATES.LOADED });
      return response.data.data;
    } catch (error) {
      set({ eventState: EVENT_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Search events (GET /api/v1/events/search)
  searchEvents: async (params = {}) => {
    try {
      set({ eventState: EVENT_STATES.LOADING });
      const response = await axios.get('/api/v1/events/search', { params });
      set({ events: response.data.data.events, eventState: EVENT_STATES.LOADED });
      return response.data.data.events;
    } catch (error) {
      set({ eventState: EVENT_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get short details of an event (GET /api/v1/events/:eventId/short)
  getEventShortDetails: async (eventId) => {
    try {
      const response = await axios.get(`/api/v1/events/${eventId}/short`);
      return response.data.data.event;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get paginated and sortable list of events (GET /api/v1/events/list)
  getPaginatedEvents: async (params = {}) => {
    try {
      set({ eventState: EVENT_STATES.LOADING });
      const response = await axios.get('/api/v1/events/list', { params });
      set({ events: response.data.data.events, eventState: EVENT_STATES.LOADED });
      return response.data.data.events;
    } catch (error) {
      set({ eventState: EVENT_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Clear any errors
  clearError: () => set({ error: null }),
}));

export default useEventStore;

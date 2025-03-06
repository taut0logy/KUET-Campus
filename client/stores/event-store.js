import create from 'zustand';
import axios from '../lib/axios';

const useEventStore = create((set) => ({
  events: [],
  totalCount: 0,
  fetchEvents: async (queryParams) => {
    const response = await axios.get('/events', { params: queryParams });
    set({ events: response.data.events, totalCount: response.data.totalCount });
  },
  followEvent: async (eventId) => {
    await axios.post(`/events/${eventId}/follow`);
    // Optionally update local state or refetch events
  },
  unfollowEvent: async (eventId) => {
    await axios.delete(`/events/${eventId}/unfollow`);
    // Optionally update local state or refetch events
  },
  fetchEventDetails: async (eventId) => {
    const response = await axios.get(`/events/${eventId}/details`);
    set({ eventDetails: response.data.event });
  }
}));

export default useEventStore; 
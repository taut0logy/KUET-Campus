import { create } from 'zustand';
import axios from '@/lib/axios';

const initialState = {
  announcements: [],
  loading: false,
  error: null,
};

const useAnnouncementStore = create((set, get) => ({
  ...initialState,

  // Create a new announcement (admin only)
  createAnnouncement: async (announcementData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/admin/announcements', announcementData);
      
      set(state => ({
        announcements: [response.data.data.announcement, ...state.announcements],
        loading: false,
      }));
      
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create announcement',
        loading: false,
      });
      throw error;
    }
  },

  // Fetch all announcements
  fetchAnnouncements: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/admin/announcements');
      
      set({
        announcements: response.data.data,
        loading: false,
      });
      
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch announcements',
        loading: false,
      });
      throw error;
    }
  },

  // Delete an announcement (admin only)
  deleteAnnouncement: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/admin/announcements/${id}`);
      
      set(state => ({
        announcements: state.announcements.filter(announcement => announcement.id !== id),
        loading: false,
      }));
      
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete announcement',
        loading: false,
      });
      throw error;
    }
  },

  // Reset store state
  reset: () => set(initialState),
}));

export default useAnnouncementStore; 
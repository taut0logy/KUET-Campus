import { create } from 'zustand';
import { toast } from 'sonner';
import axios from '@/lib/axios';

export const useUserStore = create((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  // Fetch user profile
  fetchProfile: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/users/profile');
      set({ profile: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to fetch profile',
        loading: false 
      });
      toast.error('Failed to fetch profile');
    }
  },

  // Update profile
  updateProfile: async (data) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.patch('/users/profile', data);
      set({ profile: response.data, loading: false });
      toast.success('Profile updated successfully');
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to update profile',
        loading: false 
      });
      toast.error('Failed to update profile');
      throw error;
    }
  },

  // Change password
  changePassword: async (data) => {
    try {
      set({ loading: true, error: null });
      await axios.patch('/users/password', data);
      set({ loading: false });
      toast.success('Password changed successfully');
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message || 'Failed to change password',
        loading: false 
      });
      toast.error('Failed to change password');
      throw error;
    }
  },

  // Reset store state
  reset: () => {
    set({
      profile: null,
      loading: false,
      error: null
    });
  }
})); 
import { create } from 'zustand';
import axios from '@/lib/axios';

const CLUB_STATES = {
  IDLE: "IDLE",
  LOADING: "LOADING",
  LOADED: "LOADED",
  ERROR: "ERROR",
};

const useClubStore = create((set, get) => ({
  // State
  clubs: [],
  currentClub: null,
  clubTags: [],
  clubState: CLUB_STATES.IDLE,
  error: null,

  // Computed properties
  isLoading: () => get().clubState === CLUB_STATES.LOADING,
  hasError: () => !!get().error,

  // Actions

  // Create a new club (POST /api/v1/clubs)
  createClub: async (clubData) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.post('/api/v1/clubs', clubData);
      // Optionally prepend the new club to the clubs list
      set((state) => ({
        clubs: [response.data.data.club, ...state.clubs],
        clubState: CLUB_STATES.LOADED,
      }));
      return response.data.data.club;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get all clubs (GET /api/v1/clubs)
  getAllClubs: async (params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get('/api/v1/clubs', { params });
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Search clubs (GET /api/v1/clubs/search)
  searchClubs: async (params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get('/api/v1/clubs/search', { params });
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get all club tags (GET /api/v1/clubs/tags)
  getClubTags: async () => {
    try {
      const response = await axios.get('/api/v1/clubs/tags');
      set({ clubTags: response.data.data.clubTags });
      return response.data.data.clubTags;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get clubs by tag (GET /api/v1/clubs/tags/:tagId)
  getClubsByTag: async (tagId, params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get(`/api/v1/clubs/tags/${tagId}`, { params });
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get clubs followed by current user (GET /api/v1/clubs/followed)
  getUserFollowedClubs: async (params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get('/api/v1/clubs/followed', { params });
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get clubs where current user is a member (GET /api/v1/clubs/member)
  getUserMemberClubs: async (params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get('/api/v1/clubs/member', { params });
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get clubs managed by current user (GET /api/v1/clubs/managed)
  getUserManagedClubs: async () => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get('/api/v1/clubs/managed');
      set({ clubs: response.data.data.clubs, clubState: CLUB_STATES.LOADED });
      return response.data.data.clubs;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get club by ID (GET /api/v1/clubs/:id)
  getClubById: async (id) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get(`/api/v1/clubs/${id}`);
      set({ currentClub: response.data.data.club, clubState: CLUB_STATES.LOADED });
      return response.data.data.club;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get club by slug (GET /api/v1/clubs/slug/:slug)
  getClubBySlug: async (slug) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get(`/api/v1/clubs/slug/${slug}`);
      set({ currentClub: response.data.data.club, clubState: CLUB_STATES.LOADED });
      return response.data.data.club;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Update a club (PUT /api/v1/clubs/:id)
  updateClub: async (id, clubData) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.put(`/api/v1/clubs/${id}`, clubData);
      set({ currentClub: response.data.data.club, clubState: CLUB_STATES.LOADED });
      // Update clubs list if applicable
      set((state) => ({
        clubs: state.clubs.map((club) => club.id === id ? response.data.data.club : club)
      }));
      return response.data.data.club;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Delete a club (DELETE /api/v1/clubs/:id)
  deleteClub: async (id) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      await axios.delete(`/api/v1/clubs/${id}`);
      set((state) => ({
        clubs: state.clubs.filter((club) => club.id !== id),
        clubState: CLUB_STATES.LOADED,
      }));
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Follow a club (POST /api/v1/clubs/:id/follow)
  followClub: async (id) => {
    try {
      const response = await axios.post(`/api/v1/clubs/${id}/follow`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Unfollow a club (DELETE /api/v1/clubs/:id/follow)
  unfollowClub: async (id) => {
    try {
      const response = await axios.delete(`/api/v1/clubs/${id}/follow`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Add a user to club (POST /api/v1/clubs/:id/members)
  addUserToClub: async (id, userData) => {
    try {
      const response = await axios.post(`/api/v1/clubs/${id}/members`, userData);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Remove a user from club (DELETE /api/v1/clubs/:id/members/:userId)
  removeUserFromClub: async (id, userId) => {
    try {
      const response = await axios.delete(`/api/v1/clubs/${id}/members/${userId}`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Change a user's role in club (PUT /api/v1/clubs/:id/members/:userId/role)
  changeUserRoleInClub: async (id, userId, role) => {
    try {
      const response = await axios.put(`/api/v1/clubs/${id}/members/${userId}/role`, { role });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Change a user's status in club (PUT /api/v1/clubs/:id/members/:userId/status)
  changeUserStatusInClub: async (id, userId, status) => {
    try {
      const response = await axios.put(`/api/v1/clubs/${id}/members/${userId}/status`, { status });
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Log a club visit (POST /api/v1/clubs/:id/visit)
  logUserVisit: async (id) => {
    try {
      const response = await axios.post(`/api/v1/clubs/${id}/visit`);
      return response.data.data;
    } catch (error) {
      set({ error: error.response?.data || error });
      throw error;
    }
  },

  // Get club analytics (GET /api/v1/clubs/:id/analytics)
  getClubAnalytics: async (id, params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get(`/api/v1/clubs/${id}/analytics`, { params });
      set({ clubState: CLUB_STATES.LOADED });
      return response.data.data;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Get events for a specific club (GET /api/v1/clubs/:id/events)
  getClubEvents: async (id, params = {}) => {
    try {
      set({ clubState: CLUB_STATES.LOADING });
      const response = await axios.get(`/api/v1/clubs/${id}/events`, { params });
      set({ clubState: CLUB_STATES.LOADED });
      return response.data.data.events;
    } catch (error) {
      set({ clubState: CLUB_STATES.ERROR, error: error.response?.data || error });
      throw error;
    }
  },

  // Clear errors
  clearError: () => set({ error: null }),
}));

export default useClubStore;

import create from 'zustand';
import axios from '../lib/axios';

const useClubStore = create((set) => ({
  clubs: [],
  totalCount: 0,
  fetchClubs: async (queryParams) => {
    const response = await axios.get('/clubs', { params: queryParams });
    set({ clubs: response.data.clubs, totalCount: response.data.totalCount });
  },
  followClub: async (clubId) => {
    await axios.post(`/clubs/${clubId}/follow`);
    // Optionally update local state or refetch clubs
  },
  unfollowClub: async (clubId) => {
    await axios.delete(`/clubs/${clubId}/unfollow`);
    // Optionally update local state or refetch clubs
  }
}));

export default useClubStore; 
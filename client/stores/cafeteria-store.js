import { create } from 'zustand';
import axios from '@/lib/axios';

// Define store state interface
const initialState = {
  meals: [],       // List of meals available in the cafeteria
  menus: [],       // List of menus available (menus can have multiple meals)
  todayMenu: null, // Today's specific menu
  preorders: [],   // List of preorders placed by the user
  loading: false,  // Indicates if a request is being processed
  error: null,     // Stores any errors that occur during API requests
};


// Create cafeteria store with Zustand
const useCafeteriaStore = create((set, get) => ({
  // Spread the initial state into the store
  ...initialState,

  // Actions
  fetchMeals: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/cafeteria/meals');
      set({ meals: response.data.data.meals });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch meals' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchTodayMenu: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/cafeteria/menus/today');
      set({ todayMenu: response.data.data.menu });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch today\'s menu' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchMenus: async (date) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/cafeteria/menus', { params: { date } });
      set({ menus: response.data.data.menus });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch menus' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchUserPreorders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/cafeteria/preorders');
      set({ preorders: response.data.data.preorders });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch preorders' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  createPreorder: async (menuMealId) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/cafeteria/preorders', { menuMealId });
      set(state => ({
        preorders: [response.data.data.preorder, ...state.preorders]
      }));
      return response.data.data.preorder;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create preorder' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  cancelPreorder: async (orderId) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/cafeteria/preorders/${orderId}`);
      set(state => ({
        preorders: state.preorders.filter(order => order.id !== orderId)
      }));
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to cancel preorder' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Reset store state
  reset: () => set(initialState),
}));

export default useCafeteriaStore; 
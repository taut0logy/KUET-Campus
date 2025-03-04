import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const useBusStore = create((set) => ({
  buses: [],
  routes: [],
  loading: false,
  error: null,
  retryCount: 0,
  maxRetries: 3,

  fetchBuses: async () => {
    try {
      set(state => ({ 
        loading: true, 
        error: null,
        retryCount: state.retryCount + 1 
      }));

      const response = await fetch(`${API_URL}/bus/buses`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}): Please try again later`
        );
      }

      const data = await response.json();
      set({ 
        buses: data.data || [],
        loading: false,
        retryCount: 0 // Reset retry count on success
      });
    } catch (error) {
      console.error('Error fetching buses:', error);
      set(state => {
        const shouldRetry = state.retryCount < state.maxRetries;
        if (shouldRetry) {
          // Retry after 1 second
          setTimeout(() => state.fetchBuses(), 1000);
        }
        return { 
          error: shouldRetry ? 'Retrying...' : (error.message || 'Failed to fetch buses'),
          loading: shouldRetry,
        };
      });
    }
  },

  fetchRoutes: async (busId) => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/bus/routes${busId ? `/${busId}` : ''}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}): Please try again later`
        );
      }

      const data = await response.json();
      set({ 
        routes: data.data || [],
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching routes:', error);
      set({ 
        error: error.message || 'Failed to fetch routes',
        loading: false 
      });
    }
  },

  clearError: () => set({ error: null })
}));

export default useBusStore;

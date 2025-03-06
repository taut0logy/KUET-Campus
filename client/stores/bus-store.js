import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const useBusStore = create((set) => ({
  buses: [],
  drivers: [],
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
      console.log('Fetched buses response:', data);

      if (!Array.isArray(data.data.buses)) {
        console.error('Data is not an array:', data.data.buses);
        throw new Error('Expected an array of buses');
      }

      set({ 
        buses: data.data.buses || [],
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

  fetchDrivers: async () => {
    try {
      set({ loading: true, error: null });
      const response = await fetch(`${API_URL}/bus/drivers`, {
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
        drivers: data.data.drivers || [],
        loading: false 
      });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      set({ 
        error: error.message || 'Failed to fetch drivers',
        loading: false 
      });
    }
  },

  createDriver: async (driverData) => {
    try {
      const response = await fetch(`${API_URL}/bus/drivers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}): Please try again later`
        );
      }

      const data = await response.json();
      set((state) => ({
        drivers: [...state.drivers, data.data.driver],
      }));
    } catch (error) {
      console.error('Error creating driver:', error);
      set({ error: error.message || 'Failed to create driver' });
    }
  },

  updateDriver: async (id, driverData) => {
    try {
      const response = await fetch(`${API_URL}/bus/drivers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(driverData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}): Please try again later`
        );
      }

      const data = await response.json();
      set((state) => ({
        drivers: state.drivers.map(driver => 
          driver.id === id ? data.data.driver : driver
        ),
      }));
    } catch (error) {
      console.error('Error updating driver:', error);
      set({ error: error.message || 'Failed to update driver' });
    }
  },

  deleteDriver: async (id) => {
    try {
      const response = await fetch(`${API_URL}/bus/drivers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error (${response.status}): Please try again later`
        );
      }

      set((state) => ({
        drivers: state.drivers.filter(driver => driver.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting driver:', error);
      set({ error: error.message || 'Failed to delete driver' });
    }
  },

  clearError: () => set({ error: null })
}));

export default useBusStore;

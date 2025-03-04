import { create } from 'zustand';
import axios from '@/lib/axios';

const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  createOrder: async (cartItems) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/api/orders', { items: cartItems });
      set(state => ({
        orders: [...response.data.orders, ...state.orders]
      }));
      return response.data.orders;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to create order' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/api/orders');
      set({ orders: response.data.orders });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export default useOrderStore;
import { create } from 'zustand';
import axios from '@/lib/axios';

const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  createOrder: async (cartItems) => {
    try {
      set({ loading: true, error: null });
      
      // Log what's being sent to help debug
      console.log("Sending order with items:", cartItems);
      
      const response = await axios.post('/order', {
        items: cartItems.map(item => ({
          mealId: parseInt(item.mealId), 
          quantity: parseInt(item.quantity) 
        }))
      });
      
      set(state => ({
        orders: [...response.data.orders, ...state.orders]
      }));
      
      return response.data.orders;
    } catch (error) {
      console.error("Order creation error:", error);
      console.error("Error response:", error.response?.data);
      
      set({ 
        error: error.response?.data?.error || 
              error.response?.data?.details || 
              'Failed to create order' 
      });
      
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/order');
      set({ orders: response.data.orders });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchAllOrders: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/order/manage');
      set({ orders: response.data.orders });
      return response.data.orders;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch orders' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (orderId, status, options = {}) => {
    try {
      set({ loading: true, error: null });
      const payload = { status };
  
      // Add optional parameters
      if (options.rejectionReason) {
        payload.rejectionReason = options.rejectionReason;
      }
      
      if (options.pickupTime) {
        payload.pickupTime = options.pickupTime;
      }
  
      const response = await axios.put(`/order/${orderId}/status`, payload);
  
      // Update the local orders state
      set(state => ({
        orders: state.orders.map(order =>
          order.id === orderId ? response.data.order : order
        )
      }));
  
      return response.data.order;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update order status' });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

// Update the verifyOrderPickup function:

verifyOrderPickup: async (verificationCode) => {
  try {
    set({ loading: true, error: null });
    const response = await axios.post('/order/verify', {  
      verificationData: verificationCode
    });

    // Update the local orders state
    set(state => ({
      orders: state.orders.map(order =>
        order.verificationCode === verificationCode ? response.data.order : order
      )
    }));

    return response.data.order;
  } catch (error) {
    set({ error: error.response?.data?.message || 'Failed to verify order' });
    throw error;
  } finally {
    set({ loading: false });
  }
}


}));
export default useOrderStore;
import { create } from 'zustand';
import axios from '@/lib/axios';

const initialState = {
  assignments: [],
  loading: false,
  error: null,
};

const useAssignmentStore = create((set, get) => ({
  ...initialState,

  // Create a new assignment
  createAssignment: async (assignmentData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/assignments/create', assignmentData);
      set(state => ({
        assignments: [...state.assignments, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Fetch all assignments
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/assignments/list');
      set({ assignments: response.data.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch assignments', 
        loading: false 
      });
      throw error;
    }
  },
  // Get assignment by ID
  getAssignmentById: async (id) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`/assignments/${id}`);
      set({ loading: false });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Update an assignment
  updateAssignment: async (id, updateData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put(`/assignments/${id}`, updateData);
      set(state => ({
        assignments: state.assignments.map(assignment => 
          assignment.id === id ? response.data.data : assignment
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Delete an assignment
  deleteAssignment: async (id) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/assignments/${id}`);
      set(state => ({
        assignments: state.assignments.filter(assignment => assignment.id !== id),
        loading: false,
      }));
      return { success: true };
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Reset store state
  reset: () => set(initialState),
}));

export default useAssignmentStore;
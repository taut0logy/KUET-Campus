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
      // Add default status
      const dataWithStatus = { ...assignmentData, status: "due" };
      const response = await axios.post('/assignments/create', dataWithStatus);
      
      // Make sure the response includes the status field
      const newAssignment = {
        ...response.data.data,
        status: response.data.data.status || "due" // Ensure status exists
      };
      
      set(state => ({
        assignments: [...state.assignments, newAssignment],
        loading: false,
      }));
      return newAssignment;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to create assignment',
        loading: false,
      });
      throw error;
    }
  },

  // Fetch all assignments with auto-update of overdue status
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/assignments/list');
      
      // Check for overdue assignments and update their status
      const now = new Date();
      const assignments = response.data.data.map(assignment => {
        // Ensure each assignment has a status field
        const status = assignment.status || "due";
        
        // If deadline has passed and status is still "due", mark as "overdued"
        if (new Date(assignment.deadline) < now && status === "due") {
          // Update the status on the server
          axios.put(`/assignments/${assignment.id}`, { status: "overdued" })
            .catch(err => console.error("Failed to update overdue status:", err));
            
          return { ...assignment, status: "overdued" };
        }
        return { ...assignment, status };
      });
      
      console.log("Fetched assignments:", assignments); // Debug log
      set({ assignments, loading: false });
    } catch (error) {
      console.error("Error fetching assignments:", error); // Debug log
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
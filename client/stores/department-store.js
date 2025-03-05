import { create } from 'zustand';
import axios from '@/lib/axios';

const initialState = {
    departments: [],
    loading: false,
    error: null,
};


const useDepartmentStore = create((set) => ({
    ...initialState,

    fetchDepartments: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axios.get('/departments');
            set({ departments: response.data });
        } catch (error) {
            set({ error: error.response?.data?.message || 'Failed to fetch departments' });
        } finally {
            set({ loading: false });
        }
    },

    reset: () => set(initialState),
}));

export default useDepartmentStore;

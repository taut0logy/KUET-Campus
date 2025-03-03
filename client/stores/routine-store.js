import { create } from 'zustand';
import axios from '@/lib/axios';

const initialState = {
  weeklySchedule: null,
  courses: [],
  loading: false,
  error: null,
};

const useRoutineStore = create((set, get) => ({
  ...initialState,

  // Set weekly schedule
  setWeeklySchedule: async (weekday, schedule) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/routine/set-schedule', {
        weekday,
        ...schedule,
      });
      set(state => ({
        weeklySchedule: {
          ...state.weeklySchedule,
          [weekday]: schedule,
        },
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to set weekly schedule',
        loading: false,
      });
      throw error;
    }
  },

  // Add a new course
  addCourse: async (courseData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/routine/add-course', courseData);
      set(state => ({
        courses: [...state.courses, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add course',
        loading: false,
      });
      throw error;
    }
  },

  // Get weekly schedule
  fetchWeeklySchedule: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/routine/get-schedule');
      set({
        weeklySchedule: response.data.data,
        loading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch weekly schedule',
        loading: false,
      });
      throw error;
    }
  },

  // Get all courses
  fetchCourses: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/routine/get-courses');
      set({
        courses: response.data.data,
        loading: false,
      });
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch courses',
        loading: false,
      });
      throw error;
    }
  },

  // Get schedule for a specific day
  getScheduleForDay: (day) => {
    const state = get();
    return state.weeklySchedule?.[day] || null;
  },

  // Get course by ID
  getCourseById: (courseId) => {
    const state = get();
    return state.courses.find(course => course.id === courseId);
  },

  // Reset store state
  reset: () => set(initialState),
}));

export default useRoutineStore; 
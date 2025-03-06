import { create } from 'zustand';
import axios from '@/lib/axios';

const initialState = {
  weeklySchedule: null,
  courses: [],
  exams: [],
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
  // ... existing code ...

  // Get weekly schedule
  fetchWeeklySchedule: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/routine/get-schedule');
      
      // Transform the array of routine objects into an object with weekdays as keys
      const formattedSchedule = {};
      response.data.data.forEach(routine => {
        formattedSchedule[routine.weekday] = {
          period1: routine.period1 || null,
          period2: routine.period2 || null,
          period3: routine.period3 || null,
          period4: routine.period4 || null,
          period5: routine.period5 || null,
          period6: routine.period6 || null,
          period7: routine.period7 || null,
          period8: routine.period8 || null,
          period9: routine.period9 || null,
        };
      });
      
      set({
        weeklySchedule: formattedSchedule,
        loading: false,
      });
      return formattedSchedule;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch weekly schedule',
        loading: false,
      });
      throw error;
    }
  },

// ... existing code ...

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

  // Add this new function
  fetchExams: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get('/routine/get-exams');
      set(state => ({
        exams: response.data.data,
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to fetch exams',
        loading: false,
      });
      throw error;
    }
  },

  // Add a new exam
  addExam: async (examData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.post('/routine/add-exam', examData);
      set(state => ({
        exams: [...state.exams, response.data.data],
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to add exam',
        loading: false,
      });
      throw error;
    }
  },

  // Update an exam
  updateExam: async (examId, examData) => {
    try {
      set({ loading: true, error: null });
      const response = await axios.put(`/routine/update-exam/${examId}`, examData);
      set(state => ({
        exams: state.exams.map(exam => 
          exam.id === examId ? response.data.data : exam
        ),
        loading: false,
      }));
      return response.data.data;
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to update exam',
        loading: false,
      });
      throw error;
    }
  },

  // Delete an exam
  deleteExam: async (examId) => {
    try {
      set({ loading: true, error: null });
      await axios.delete(`/routine/delete-exam/${examId}`);
      set(state => ({
        exams: state.exams.filter(exam => exam.id !== examId),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Failed to delete exam',
        loading: false,
      });
      throw error;
    }
  },
}));

export default useRoutineStore; 
import axios from "axios";

// Create axios instance with default config
const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    // Add token to headers if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const response = await instance.post('/auth/refresh-token');
        const { accessToken } = response.data.data;

        // Update token in localStorage and cookie
        localStorage.setItem('accessToken', accessToken);
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;

        // Update authorization header
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Retry the original request
        return instance(originalRequest);
      } catch (refreshError) {
        // If refresh fails, trigger auth error event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('authError'));
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      // Handle forbidden access
      console.error('Access forbidden:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default instance; 
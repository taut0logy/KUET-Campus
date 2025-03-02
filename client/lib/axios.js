import axios from "axios";

// API URL from environment or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // For refresh token cookies
});

// Custom event for auth errors that will be handled by our store
const notifyAuthError = () => {
  console.warn("Authentication error detected");
  
  if (typeof window !== 'undefined') {
    // Clean up token
    localStorage.removeItem("accessToken");
    
    // Notify application about auth error through custom event
    // This will be caught by our auth store event listener
    try {
      window.dispatchEvent(new CustomEvent("authError"));
    } catch (e) {
      console.error("Error dispatching auth event:", e);
    }
  }
};

// Token refresh subscribers pattern
const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Helper to safely serialize data and handle problematic characters
const safeSerialize = (data) => {
  try {
    // Filter out any undefined values
    const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
      // Skip undefined values
      if (value !== undefined) {
        // Ensure strings are properly sanitized
        if (typeof value === 'string') {
          acc[key] = value.trim();
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    
    return cleanData;
  } catch (e) {
    console.error("Error serializing data:", e);
    return data;
  }
};

// Add auth token to requests and sanitize data
api.interceptors.request.use(
  config => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("accessToken");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Sanitize request data if it's a POST/PUT/PATCH request with data
    if (config.data && ['post', 'put', 'patch'].includes(config.method?.toLowerCase())) {
      try {
        config.data = safeSerialize(config.data);
      } catch (e) {
        console.error("Error sanitizing request data:", e);
      }
    }
    
    return config;
  },
  error => Promise.reject(error)
);

// Handle response errors and token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Check for and handle JSON parsing errors
    if (error.message && error.message.includes('JSON')) {
      console.error("JSON parsing error in request:", error);
      return Promise.reject(new Error("Invalid data format. Please check your input and try again."));
    }
    
    // Return non-auth errors directly
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }
    
    // Prevent infinite retry loops
    if (originalRequest._retry) {
      notifyAuthError();
      return Promise.reject(error);
    }
    
    // Queue requests while refreshing token
    if (isRefreshing) {
      return new Promise(resolve => {
        addRefreshSubscriber(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(axios(originalRequest));
        });
      });
    }
    
    // Mark as retrying and start refresh
    originalRequest._retry = true;
    isRefreshing = true;
    
    try {
      // Attempt to refresh the token
      const response = await axios.post(
        `${API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true }
      );
      
      const accessToken = response.data?.data?.accessToken;
      
      if (!accessToken) {
        throw new Error("No access token in refresh response");
      }
      
      // Store the new token
      localStorage.setItem("accessToken", accessToken);
      
      // Update request header and notify subscribers
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      onTokenRefreshed(accessToken);
      
      // Reset refresh flag
      isRefreshing = false;
      
      // Retry the original request
      return axios(originalRequest);
    } catch (refreshError) {
      // Reset refresh state
      isRefreshing = false;
      refreshSubscribers = [];
      
      // Notify about auth error
      notifyAuthError();
      
      return Promise.reject(refreshError);
    }
  }
);

export default api; 
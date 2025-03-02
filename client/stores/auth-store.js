import { create } from 'zustand';
import axios from '@/lib/axios';

// Define auth states
const AUTH_STATES = {
  LOADING: "LOADING",
  AUTHENTICATED: "AUTHENTICATED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
};

// Create auth store with Zustand
const useAuthStore = create((set, get) => ({
  // State
  user: null,
  authState: AUTH_STATES.LOADING,

  // Computed properties
  isAuthenticated: () => get().authState === AUTH_STATES.AUTHENTICATED,
  isLoading: () => get().authState === AUTH_STATES.LOADING,
  hasRole: (requiredRole) => {
    const user = get().user;
    if (!user) return false;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    
    return user.role === requiredRole;
  },

  // Actions
  initializeAuth: async () => {
    console.log("🔐 [AUTH] Initializing auth...");
    try {
      const token = localStorage.getItem("accessToken");
      
      // If no token, we're definitely not authenticated
      if (!token) {
        console.log("🔐 [AUTH] No token found, setting state to unauthenticated");
        set({ authState: AUTH_STATES.UNAUTHENTICATED });
        return;
      }
      
      console.log("🔐 [AUTH] Token found, fetching current user...");
      
      // Try to get the current user with the existing token
      const userData = await get().fetchCurrentUser();
      
      if (userData) {
        console.log("🔐 [AUTH] User data received, setting state to authenticated", userData);
        set({ 
          user: userData,
          authState: AUTH_STATES.AUTHENTICATED 
        });
      } else {
        console.log("🔐 [AUTH] Failed to fetch user data, clearing token");
        // Token invalid or expired
        localStorage.removeItem("accessToken");
        set({ authState: AUTH_STATES.UNAUTHENTICATED });
      }
    } catch (error) {
      console.error("🔐 [AUTH] Initialization error:", error);
      localStorage.removeItem("accessToken");
      set({ authState: AUTH_STATES.UNAUTHENTICATED });
    }
  },
  
  fetchCurrentUser: async () => {
    console.log("🔐 [AUTH] Fetching current user...");
    try {
      const response = await axios.get("/auth/me");
      console.log("🔐 [AUTH] Current user response:", response.data);
      return response.data?.data?.user || null;
    } catch (error) {
      console.error("🔐 [AUTH] Error fetching current user:", error);
      // Clear tokens on fetch failure
      localStorage.removeItem("accessToken");

      return null;
    }
  },
  
  login: async (email, password, captchaToken = "test-token") => {
    console.log("🔐 [AUTH] Logging in...");
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      const response = await axios.post("/auth/login", {
        email,
        password,
        captchaToken,
      });

      const { accessToken, user } = response.data.data;
      console.log("🔐 [AUTH] Login successful, user:", user);

      // Update auth state
      set({
        user,
        authState: AUTH_STATES.AUTHENTICATED
      });
      
      // Store token in localStorage for client-side access
      localStorage.setItem("accessToken", accessToken);
      
      // Also set a cookie for middleware access
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Strict`;

      // Return the user
      return user;
    } catch (error) {
      console.error("🔐 [AUTH] Login error:", error);
      // Clear tokens on login failure
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Also clear cookie
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      set({ authState: AUTH_STATES.UNAUTHENTICATED });
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      console.log("🔐 [AUTH] Registering user:", 
        // Log without sensitive data
        {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          // Don't log the password
        }
      );
      
      // Ensure all string values are properly trimmed and sanitized
      const sanitizedData = {
        firstName: String(userData.firstName || '').trim(),
        lastName: String(userData.lastName || '').trim(),
        email: String(userData.email || '').trim(),
        password: userData.password,
        captchaToken: userData.captchaToken || 'test-token'
      };
      
      const response = await axios.post("/auth/register", sanitizedData);
      console.log("🔐 [AUTH] Registration successful");
      return response.data;
    } catch (error) {
      console.error("🔐 [AUTH] Registration error:", error);
      // Clear tokens on registration failure (in case there were any)
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      set({ authState: AUTH_STATES.UNAUTHENTICATED });
      throw error;
    }
  },
  
  logout: async () => {
    console.log("🔐 [AUTH] Logging out...");
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("🔐 [AUTH] Logout API error:", error);
    } finally {
      // Always clear local state even if API call fails
      console.log("🔐 [AUTH] Clearing auth state");
      set({
        user: null,
        authState: AUTH_STATES.UNAUTHENTICATED
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Also clear cookie
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  },
  
  requestPasswordReset: async (email, captchaToken) => {
    const response = await axios.post("/auth/forgot-password", {
      email,
      captchaToken,
    });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await axios.post(`/auth/reset-password/${token}`, {
      password,
    });
    return response.data;
  },
  
  verifyEmail: async (token) => {
    console.log("🔐 [AUTH] Verifying email with token:", token);
    try {
      // Don't change overall auth state during verification
      // Just track verification state locally in the function
      
      if (!token) {
        console.error("🔐 [AUTH] No token provided for email verification");
        throw new Error("Verification token is required");
      }
      
      // Make sure token is a string
      const sanitizedToken = String(token).trim();
      if (!sanitizedToken) {
        console.error("🔐 [AUTH] Empty token after sanitization");
        throw new Error("Invalid verification token");
      }
      
      console.log("🔐 [AUTH] Calling verify API with token");
      let response;
      try {
        response = await axios.get(`/auth/verify-email/${sanitizedToken}`);
        console.log("🔐 [AUTH] Email verification response:", response.data);
      } catch (apiError) {
        console.error("🔐 [AUTH] API error during verification:", apiError);
        
        // Detailed error handling for API errors
        if (apiError.response?.status === 410) {
          console.log("🔐 [AUTH] Verification token expired");
          const expiredError = new Error("Verification token has expired");
          expiredError.response = apiError.response;
          throw expiredError;
        } else if (apiError.response?.status === 404) {
          console.log("🔐 [AUTH] Verification token not found");
          const notFoundError = new Error("Verification token not found");
          notFoundError.response = apiError.response;
          throw notFoundError;
        } else if (apiError.response?.status === 400) {
          console.log("🔐 [AUTH] Invalid verification token");
          const invalidError = new Error("Invalid verification token");
          invalidError.response = apiError.response;
          throw invalidError;
        }
        
        // Re-throw the original error if it doesn't match any of our special cases
        throw apiError;
      }
      
      // If we get here, the verification was successful
      console.log("🔐 [AUTH] Email verification successful, updating user data");
      
      // After verification, refresh user data to update verification status
      // We don't want to fail the whole operation if the refresh fails, so we catch errors
      try {
        await get().refreshUser();
        console.log("🔐 [AUTH] User data refreshed after verification");
      } catch (refreshError) {
        console.error("🔐 [AUTH] Error refreshing user after verification:", refreshError);
        // We don't rethrow here - verification was successful even if refresh fails
      }
      
      return response.data;
    } catch (error) {
      console.error("🔐 [AUTH] Email verification error:", error);
      throw error;
    }
  },
  
  refreshUser: async () => {
    console.log("🔐 [AUTH] Refreshing user data...");
    try {
      const userData = await get().fetchCurrentUser();
      
      if (userData) {
        console.log("🔐 [AUTH] User refresh successful", userData);
        set({
          user: userData,
          authState: AUTH_STATES.AUTHENTICATED
        });
        return true;
      } else {
        console.log("🔐 [AUTH] User refresh failed - no user data");
        set({
          user: null,
          authState: AUTH_STATES.UNAUTHENTICATED
        });
        localStorage.removeItem("accessToken");
        return false;
      }
    } catch (error) {
      console.error("🔐 [AUTH] Error refreshing user:", error);
      set({
        user: null,
        authState: AUTH_STATES.UNAUTHENTICATED
      });
      localStorage.removeItem("accessToken");
      return false;
    }
  },
  
  handleAuthError: () => {
    console.log("🔐 [AUTH] Auth error handler called");
    set({
      user: null,
      authState: AUTH_STATES.UNAUTHENTICATED
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Also clear cookie
    if (typeof document !== 'undefined') {
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
}));

// Initialize auth and set up listeners when this module is imported
if (typeof window !== 'undefined') {
  console.log("🔐 [AUTH] Setting up auth listeners");
  
  // Set up auth error listener
  window.addEventListener("authError", () => {
    console.log("🔐 [AUTH] Auth error event received");
    useAuthStore.getState().handleAuthError();
  });
  
  // Handle storage changes for cross-tab synchronization
  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken") {
      console.log("🔐 [AUTH] Token changed in storage", {
        oldValue: event.oldValue ? "[TOKEN]" : null,
        newValue: event.newValue ? "[TOKEN]" : null
      });
      
      // Token was removed or changed in another tab
      if (!event.newValue) {
        console.log("🔐 [AUTH] Token removed in another tab");
        useAuthStore.setState({
          user: null,
          authState: AUTH_STATES.UNAUTHENTICATED
        });
        // Also clear refresh token when access token is removed in another tab
        localStorage.removeItem("refreshToken");
        // Clear cookie as well
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } else if (event.newValue !== event.oldValue) {
        console.log("🔐 [AUTH] Token updated in another tab, refreshing user");
        // Token was updated, refresh user data
        useAuthStore.getState().refreshUser();
        // Update cookie as well
        document.cookie = `accessToken=${event.newValue}; path=/; max-age=86400; SameSite=Strict`;
      }
    }
  });
  
  // Initialize auth on first load
  console.log("🔐 [AUTH] Triggering initial auth check");
  useAuthStore.getState().initializeAuth();
  
  // Safety timeout to ensure we don't get stuck in loading state
  setTimeout(() => {
    const currentState = useAuthStore.getState();
    if (currentState.authState === AUTH_STATES.LOADING) {
      console.log("🔐 [AUTH] Auth initialization timed out, setting to unauthenticated");
      useAuthStore.setState({
        authState: AUTH_STATES.UNAUTHENTICATED
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Clear cookie
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }, 3000); // Reduced from 5 seconds to 3 seconds for faster error recovery
  
  // Additional safety check to reset loading state if we're still loading after 5 seconds
  setTimeout(() => {
    const currentState = useAuthStore.getState();
    if (currentState.authState === AUTH_STATES.LOADING) {
      console.log("🔐 [AUTH] CRITICAL: Auth still in loading state after timeout, forcing reset");
      // Force a reset of the auth state
      useAuthStore.setState({
        user: null,
        authState: AUTH_STATES.UNAUTHENTICATED
      });
      
      // Try to clear any zombie token
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // Clear cookie
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      
      // Notify user via console
      console.warn("🔐 [AUTH] Authentication system reset due to timeout. Please refresh the page if you experience issues.");
    }
  }, 5000);
}

export default useAuthStore; 
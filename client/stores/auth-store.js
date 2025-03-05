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
    const userRoles = user.roles || [user.role];
    return Array.isArray(requiredRole) 
      ? requiredRole.some(role => userRoles.includes(role))
      : userRoles.includes(requiredRole);
  },
  
  getUserRoles: () => {
    const user = get().user;
    return user ? (user.roles || [user.role]) : [];
  },

  getPrimaryRole: () => {
    const user = get().user;
    return user ? (user.roles && user.roles.length > 0 ? user.roles[0] : user.role) : null;
  },

  // Actions
  initializeAuth: async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        set({ authState: AUTH_STATES.UNAUTHENTICATED });
        return;
      }
      
      const userData = await get().fetchCurrentUser();
      if (userData) {
        set({ 
          user: userData,
          authState: AUTH_STATES.AUTHENTICATED 
        });
      } else {
        get().handleAuthError();
      }
    } catch (error) {
      console.error("🔐 [AUTH] Initialization error:", error);
      get().handleAuthError();
    }
  },
  
  fetchCurrentUser: async () => {
    try {
      const response = await axios.get("/auth/me");
      return response.data?.data?.user || null;
    } catch (error) {
      console.error("🔐 [AUTH] Error fetching current user:", error);
      get().handleAuthError();
      return null;
    }
  },
  
  login: async (email, password, captchaToken = "test-token") => {
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      const response = await axios.post("/auth/login", {
        email,
        password,
        captchaToken,
      });

      const { accessToken, user } = response.data.data;
      get().setAuthState(user, accessToken);
      return user;
    } catch (error) {
      console.error("🔐 [AUTH] Login error:", error);
      get().handleAuthError();
      throw error;
    }
  },
  
  registerEmployee: async (userData) => {
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      const sanitizedData = {
        name: String(userData.name || '').trim(),
        email: String(userData.email || '').trim(),
        password: userData.password,
        captchaToken: userData.captchaToken || 'test-token',
        employeeId: userData.employeeId,
        designation: userData.designation,
      };
      
      const response = await axios.post("/auth/register/employee", sanitizedData);
      
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        get().setAuthState(user, accessToken);
        return user;
      }
      
      return response.data;
    } catch (error) {
      console.error("🔐 [AUTH] Employee Registration error:", error);
      get().handleAuthError();
      throw error;
    }
  },

  registerStudent: async (userData) => {
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      const sanitizedData = {
        name: String(userData.name || '').trim(),
        email: String(userData.email || '').trim(),
        password: userData.password,
        captchaToken: userData.captchaToken || 'test-token',
        studentId: userData.studentId,
        departmentId: userData.departmentId,
        batch: userData.batch,
        section: userData.section,
      };
      
      const response = await axios.post("/auth/register/student", sanitizedData);
      
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        get().setAuthState(user, accessToken);
        return user;
      }
      
      return response.data;
    } catch (error) {
      console.error("🔐 [AUTH] Student Registration error:", error);
      get().handleAuthError();
      throw error;
    }
  },
  
  registerFaculty: async (userData) => {
    try {
      set({ authState: AUTH_STATES.LOADING });
      
      const sanitizedData = {
        name: String(userData.name || '').trim(),
        email: String(userData.email || '').trim(),
        password: userData.password,
        captchaToken: userData.captchaToken || 'test-token',
        employeeId: userData.employeeId,
        designation: userData.designation,
        departmentId: userData.departmentId,
        bio: userData.bio,
        status: userData.status,
      };
      
      const response = await axios.post("/auth/register/faculty", sanitizedData);
      
      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        get().setAuthState(user, accessToken);
        return user;
      }
      
      return response.data;
    } catch (error) {
      console.error("🔐 [AUTH] Faculty Registration error:", error);
      get().handleAuthError();
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("🔐 [AUTH] Logout API error:", error);
    } finally {
      get().handleAuthError();
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
    try {
      const userData = await get().fetchCurrentUser();
      if (userData) {
        set({
          user: userData,
          authState: AUTH_STATES.AUTHENTICATED
        });
        return true;
      }
      get().handleAuthError();
      return false;
    } catch (error) {
      console.error("🔐 [AUTH] Error refreshing user:", error);
      get().handleAuthError();
      return false;
    }
  },
  
  setAuthState: (user, accessToken) => {
    set({
      user,
      authState: AUTH_STATES.AUTHENTICATED
    });
    localStorage.setItem("accessToken", accessToken);
    document.cookie = `accessToken=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
  },
  
  handleAuthError: () => {
    set({
      user: null,
      authState: AUTH_STATES.UNAUTHENTICATED
    });
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    if (typeof document !== 'undefined') {
      document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }
}));

// Initialize auth and set up listeners when this module is imported
if (typeof window !== 'undefined') {
  // Set up auth error listener
  window.addEventListener("authError", () => {
    useAuthStore.getState().handleAuthError();
  });
  
  // Handle storage changes for cross-tab synchronization
  window.addEventListener("storage", (event) => {
    if (event.key === "accessToken") {
      if (!event.newValue) {
        useAuthStore.getState().handleAuthError();
      } else if (event.newValue !== event.oldValue) {
        useAuthStore.getState().refreshUser();
        document.cookie = `accessToken=${event.newValue}; path=/; max-age=86400; SameSite=Strict`;
      }
    }
  });
  
  // Initialize auth on first load
  useAuthStore.getState().initializeAuth();
  
  // Safety timeout to ensure we don't get stuck in loading state
  setTimeout(() => {
    const currentState = useAuthStore.getState();
    if (currentState.authState === AUTH_STATES.LOADING) {
      useAuthStore.getState().handleAuthError();
    }
  }, 3000);
}

export default useAuthStore; 
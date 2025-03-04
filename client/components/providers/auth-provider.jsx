"use client";

import React, { createContext, useContext } from "react";
import useAuthStore from "@/stores/auth-store";

// This provider now serves as a compatibility layer for existing components
// It will help us migrate gradually to the Zustand store
const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  // Get all auth state and methods from the Zustand store
  const {
    user,
    authState,
    isAuthenticated: isAuthenticatedFn,
    isLoading: isLoadingFn,
    login,
    registerStudent,
    registerFaculty,
    registerEmployee,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    refreshUser,
    hasRole: hasRoleFn,
    getUserRoles,
    getPrimaryRole,
  } = useAuthStore();

  // Create the auth values object with the store's state and methods
  const authValues = {
    user,
    // Convert functions to properties for backward compatibility
    isAuthenticated: isAuthenticatedFn(),
    isLoading: isLoadingFn(),
    login,
    registerStudent,
    registerFaculty,
    registerEmployee,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    refreshUser,
    hasRole: hasRoleFn,
    getUserRoles,
    getPrimaryRole,
  };

  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context - remains the same for backward compatibility
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
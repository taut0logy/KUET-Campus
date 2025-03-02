"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import useAuthStore from "@/stores/auth-store";
import { Icons } from "@/components/ui/icons";

/**
 * Authenticated Layout
 * This layout focuses solely on:
 * 1. Verifying the user is authenticated 
 * 2. Loading user data once
 * 3. Showing the contents when authenticated
 * 
 * Redirects are primarily handled by middleware
 */
export default function AuthenticatedLayout({ children }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Get core auth state from store - use individual selectors to prevent infinite loops
  const user = useAuthStore(state => state.user);
  const authState = useAuthStore(state => state.authState);
  const refreshUser = useAuthStore(state => state.refreshUser);
  
  // Simple effect to verify authentication exactly once on mount
  useEffect(() => {
    let mounted = true;
    
    const verifyAuth = async () => {
      console.log("🔒 [LAYOUT] Checking authentication status:", authState);
      
      // If we have an expired token, redirect via middleware
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
      
      // Try to refresh user data if we have a token but no user
      if (hasToken && !user) {
        console.log("🔒 [LAYOUT] Found token but no user, refreshing user data");
        
        try {
          await refreshUser();
        } catch (error) {
          console.error("🔒 [LAYOUT] Failed to refresh user data:", error);
          // Let middleware handle the redirect on the next navigation
        }
      }
      
      // If user is authenticated but email is not verified, redirect
      if (user && user.emailVerified === false) {
        console.log("🔒 [LAYOUT] Email not verified, redirecting to verification page");
        router.push("/verify-email");
        return;
      }
      
      // All checks passed, show content
      if (mounted) {
        setLoading(false);
      }
    };
    
    verifyAuth();
    
    return () => {
      mounted = false;
    };
  }, [user, authState, refreshUser, router]);
  
  // Show simple loading indicator
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="h-8 w-8 mx-auto animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Show authenticated content
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-6 mx-auto px-4">{children}</div>
      </main>
    </div>
  );
} 
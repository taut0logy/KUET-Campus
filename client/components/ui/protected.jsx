'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth-store';
import { Icons } from './icons';

/**
 * Protected component for role-based access control and authentication
 * 
 * Usage examples:
 * <Protected requiredRole="ADMIN">Admin only content</Protected>
 * <Protected requiredRoles={['ADMIN', 'MANAGER']}>Admin or manager content</Protected>
 * <Protected redirectTo="/login">Authenticated user content</Protected>
 * <Protected fallback={<p>Not authorized</p>}>Protected content</Protected>
 * <Protected requireEmailVerified>Email verified content</Protected>
 */
export function Protected({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = '/login',
  fallback = null,
  requireEmailVerified = false,
}) {
  const router = useRouter();
  
  // Use individual selectors to prevent infinite loops
  const user = useAuthStore(state => state.user);
  const authState = useAuthStore(state => state.authState);
  const refreshUser = useAuthStore(state => state.refreshUser);
  const handleAuthError = useAuthStore(state => state.handleAuthError);
  
  const isAuthenticated = authState === 'AUTHENTICATED';
  const isLoading = authState === 'LOADING';

  // Convert role requirements to array format
  const roles = requiredRole 
    ? [requiredRole] 
    : requiredRoles || [];

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // If we have a token but no user, try to refresh
      const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('accessToken');

      if (hasToken && !user) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Failed to refresh user data:", error);
          handleAuthError();
          router.push('/login');
        }
      }

      // Handle email verification requirement
      if (requireEmailVerified && user && !user.emailVerified) {
        router.push('/verify-email');
        return;
      }

      //redirect to homepage if already verified
      if ((window.location.pathname === '/verify-email' 
        || window.location.pathname === '/resend-verification') 
        && user && user.emailVerified) {
        router.push('/');
        return;
      }

      // Handle authentication requirement
      if (!isLoading && !isAuthenticated) {
        // Ensure redirectTo is a string and properly formatted
        const redirectPath = String(redirectTo || '/login');
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        
        const url = new URL(redirectPath, window.location.origin);
        if (currentPath) {
          url.searchParams.set('from', currentPath);
        }
        
        router.push(url.pathname + url.search);
      }
    };

    if (mounted) {
      checkAuth();
    }

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, isLoading, redirectTo, router, user, refreshUser, requireEmailVerified]);

  // While loading, show a loading fallback
  if (isLoading) return <LoadingFallback />;

  // If not authenticated, don't render anything (redirect will happen in useEffect)
  if (!isAuthenticated) return fallback;

  // If email verification is required and not verified, don't render
  if (requireEmailVerified && !user?.emailVerified) return fallback;

  // If roles specified, check if user has required role
  if (roles.length > 0) {
    const hasRequiredRole = roles.some(role => {
      const userRoles = user?.roles || [user?.role];
      return userRoles.includes(role);
    });
    if (!hasRequiredRole) return fallback;
  }

  // User is authenticated and has required role, render children
  return <>{children}</>;
}

/**
 * Withprotection HOC for protecting entire components
 * 
 * Usage:
 * const ProtectedComponent = withProtection(Component, { 
 *   requiredRole: "ADMIN", 
 *   redirectTo: "/login",
 *   requireEmailVerified: true
 * });
 */
export function withProtection(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <Protected {...options}>
        <Component {...props} />
      </Protected>
    );
  };
}

const LoadingFallback = () => {
  return <div className="flex h-screen w-screen items-center justify-center">
    <Icons.spinner className="h-8 w-8 animate-spin" />
    <span className="ml-2">Loading...</span>
  </div>
};

export default LoadingFallback;

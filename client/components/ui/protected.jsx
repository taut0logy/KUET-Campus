'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/auth-store';

/**
 * Protected component for role-based access control
 * 
 * Usage examples:
 * <Protected requiredRole="ADMIN">Admin only content</Protected>
 * <Protected requiredRoles={['ADMIN', 'MANAGER']}>Admin or manager content</Protected>
 * <Protected redirectTo="/login">Authenticated user content</Protected>
 * <Protected fallback={<p>Not authorized</p>}>Protected content</Protected>
 */
export function Protected({
  children,
  requiredRole,
  requiredRoles,
  redirectTo = '/login',
  fallback = null,
}) {
  const router = useRouter();
  
  // Use individual selectors to prevent infinite loops
  const user = useAuthStore(state => state.user);
  const authState = useAuthStore(state => state.authState);
  
  const isAuthenticated = authState === 'AUTHENTICATED';
  const isLoading = authState === 'LOADING';

  // Convert role requirements to array format
  const roles = requiredRole 
    ? [requiredRole] 
    : requiredRoles || [];

  useEffect(() => {
    // Only redirect if:
    // 1. We're done loading auth state, AND
    // 2. User is not authenticated, AND
    // 3. A redirect URL was provided
    if (!isLoading && !isAuthenticated && redirectTo) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, router]);

  // While loading, don't show anything
  if (isLoading) return null;

  // If not authenticated, don't render anything (redirect will happen in useEffect)
  if (!isAuthenticated) return fallback;

  // If roles specified, check if user has required role
  if (roles.length > 0) {
    const hasRequiredRole = roles.includes(user?.role);
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
 *   redirectTo: "/login" 
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
import { NextResponse } from 'next/server'
// import { createClient } from '@supabase/supabase-js'

/**
 * Middleware for handling authentication and routing
 * This acts as a central point for all auth-related redirects
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the token from cookies or localStorage (via cookie alternative)
  const token = request.cookies.get('accessToken')?.value;
  
  // Define route groups
  const isAuthRoute = pathname.startsWith('/login') || 
                      pathname.startsWith('/register') || 
                      pathname.startsWith('/forgot-password') ||
                      pathname.startsWith('/reset-password');
                      
  const isVerificationRoute = pathname.startsWith('/verify-email') || 
                             pathname.startsWith('/resend-verification');
                             
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/profile') || 
                          pathname.startsWith('/settings') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/manager');
  
  // Public routes that don't need any redirects
  const isPublicRoute = pathname === '/' || 
                       pathname.startsWith('/about') || 
                       pathname.startsWith('/contact') ||
                       pathname.startsWith('/api') ||
                       pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js)$/);
  
  // Handle API routes separately - don't redirect these
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // 1. If no token and trying to access protected routes, redirect to login
  if (!token && isProtectedRoute) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // 2. If token exists and trying to access auth routes, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 3. Verification routes are special - we handle token directly in the page
  if (isVerificationRoute && pathname.includes('token=')) {
    // Allow direct access to verification with token
    return NextResponse.next();
  }
  
  // 4. For all other cases, proceed normally
  return NextResponse.next();
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 
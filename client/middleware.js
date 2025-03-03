import { NextResponse } from 'next/server'

/**
 * Middleware for handling authentication and routing
 * This acts as a central point for all auth-related redirects
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;
  
  // Define route groups with regex for better matching
  const routeGroups = {
    auth: /^\/(login|register|forgot-password|reset-password)/,
    verification: /^\/(verify-email|resend-verification)/,
    protected: /^\/(dashboard|profile|settings|admin|manager)/,
    public: /^\/(about|contact)$/,
    static: /\.(jpg|jpeg|png|gif|svg|ico|css|js)$/
  };

  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api') || routeGroups.static.test(pathname)) {
    return NextResponse.next();
  }

  // Handle protected routes
  if (routeGroups.protected.test(pathname)) {
    if (!token) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  // Handle auth routes
  if (routeGroups.auth.test(pathname)) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Handle verification routes
  if (routeGroups.verification.test(pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // For all other routes, proceed normally
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
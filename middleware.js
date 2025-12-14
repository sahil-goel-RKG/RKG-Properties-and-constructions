import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/about',
  '/apartments',
  '/contact',
  '/projects(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/admin/login(.*)'  // Catch-all for admin login routes
]);

// Define admin routes that require authentication
const isAdminRoute = createRouteMatcher([
  '/admin(.*)'
]);

// Admin login page should be public (catch-all pattern)
const isPublicAdminRoute = createRouteMatcher([
  '/admin/login(.*)'  // Catch-all pattern to match all login sub-routes
]);

export default clerkMiddleware(async (auth, request) => {
  // Protect admin routes - require authentication (except login page)
  if (isAdminRoute(request) && !isPublicAdminRoute(request)) {
    const { userId } = await auth();
    if (!userId) {
      const signInUrl = new URL('/admin/login', request.url);
      // Preserve the original URL as returnUrl so user is redirected back after login
      signInUrl.searchParams.set('returnUrl', request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(signInUrl);
    }
  }
  
  // For API routes, ensure auth context is available
  // This helps API routes access the auth session
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Don't block, just ensure auth is available
    // The API route will handle its own authentication
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

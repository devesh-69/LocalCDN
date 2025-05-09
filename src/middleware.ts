import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

// Protected paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/upload', '/images'];

// Auth paths that should redirect to dashboard if already authenticated
const authPaths = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is being accessed
  const isPathProtected = protectedPaths.some((path) => 
    pathname === path || pathname.startsWith(`${path}/`)
  );
  
  const isAuthPath = authPaths.some((path) => pathname === path);

  // For API routes, let the API handle authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public files don't need authentication check
  if (
    pathname.includes('.') || // Files like favicon.ico, manifest.json, etc.
    pathname.startsWith('/_next') || // Next.js files
    pathname.startsWith('/static') // Static files
  ) {
    return NextResponse.next();
  }

  // Get the NextAuth.js session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // If trying to access protected routes without being authenticated
  if (isPathProtected && !isAuthenticated) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  // If trying to access auth paths while already authenticated
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
} 
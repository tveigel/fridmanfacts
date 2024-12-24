import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle dynamic routes
  const { pathname } = request.nextUrl;

  // Add special handling for your dynamic routes
  if (pathname.startsWith('/episode/') || pathname.startsWith('/profile/')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/episode/:path*',
    '/profile/:path*',
  ],
};
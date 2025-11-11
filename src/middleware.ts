import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow access to login page
    if (path.startsWith('/login')) {
      return NextResponse.next();
    }

    // Protect dashboard routes
    if (path.startsWith('/dashboard') || path.startsWith('/employees') || 
        path.startsWith('/leave') || path.startsWith('/attendance') ||
        path.startsWith('/payroll') || path.startsWith('/performance') ||
        path.startsWith('/organization') || path.startsWith('/reports')) {
      if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Temporarily disable middleware for demo
export const config = {
  matcher: [
    // '/dashboard/:path*',
    // '/employees/:path*',
    // '/leave/:path*',
    // '/attendance/:path*',
    // '/payroll/:path*',
    // '/performance/:path*',
    // '/organization/:path*',
    // '/reports/:path*',
  ],
};

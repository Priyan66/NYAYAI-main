// src/middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 👇 Single config – includes both runtime and matcher
export const config = {
  runtime: 'nodejs',      // forces Node.js (default is 'edge')
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

export default async function middleware(req: NextRequest) {
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith('/dashboard') ||
    req.nextUrl.pathname.startsWith('/fight') ||
    req.nextUrl.pathname.startsWith('/score') ||
    req.nextUrl.pathname.startsWith('/history') ||
    req.nextUrl.pathname.startsWith('/settings');

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = Boolean(token);

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('career_auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. CSRF Defense: Block cross-origin mutation requests to API routes
  if (pathname.startsWith('/api/')) {
    const method = request.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host && originHost.split(':')[0] !== host.split(':')[0]) {
            return new NextResponse(
              JSON.stringify({ error: 'Forbidden: Cross-origin mutation request blocked (CSRF protection)' }),
              { status: 403, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden: Invalid request origin' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    }
    return NextResponse.next();
  }

  // 2. Route Authentication Protection
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/recommendations') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin');

  if (isProtected && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/assessment/:path*',
    '/recommendations/:path*',
    '/roadmap/:path*',
    '/resume/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/:path*',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { role?: string; userId?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

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

  const payload = token ? decodeJwtPayload(token) : null;
  const userRole = payload?.role?.toUpperCase() || '';
  const isAdmin = userRole === 'ADMIN';

  // 2. Admin Route Protection
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Candidate attempting to access /admin/* -> Return forbidden and redirect to candidate dashboard
      const dashboardUrl = new URL('/dashboard', request.url);
      dashboardUrl.searchParams.set('denied', 'admin_access_forbidden');
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 3. Candidate Workspace Protection: Prevent Admin from hijacking candidate dashboard
  const isCandidateRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/recommendations') ||
    pathname.startsWith('/roadmap') ||
    pathname.startsWith('/resume') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/skills') ||
    pathname.startsWith('/projects');

  if (isCandidateRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (isAdmin) {
      // Admin should be directed to the Admin Control Center
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. Auth Pages Redirection (/login, /register)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && token) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
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
    '/skills/:path*',
    '/projects/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/:path*',
  ],
};

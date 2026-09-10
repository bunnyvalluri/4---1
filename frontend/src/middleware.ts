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

// Map old candidate routes to their canonical /user/* equivalents
const LEGACY_ROUTE_MAP: Record<string, string> = {
  '/dashboard': '/user/dashboard',
  '/recommendations': '/user/recommendations',
  '/skills': '/user/skills',
  '/assessment': '/user/assessment',
  '/roadmap': '/user/roadmap',
  '/projects': '/user/projects',
  '/resume': '/user/resume',
  '/chat': '/user/chat',
  '/interview': '/user/interview',
  '/market': '/user/market',
  '/applications': '/user/jobs',
  '/jobs': '/user/jobs',
  '/trajectory': '/user/trajectory',
  '/mentors': '/user/mentors',
  '/profile': '/user/settings',
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('career_auth_token')?.value;
  const { pathname, search } = request.nextUrl;

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

  // 2. Canonical /user root redirect
  if (pathname === '/user') {
    return NextResponse.redirect(new URL(`/user/dashboard${search}`, request.url));
  }

  // 3. Legacy Candidate Route Redirects (/dashboard -> /user/dashboard, etc.)
  for (const [legacyPath, canonicalPath] of Object.entries(LEGACY_ROUTE_MAP)) {
    if (pathname === legacyPath || pathname.startsWith(`${legacyPath}/`)) {
      const subPath = pathname.slice(legacyPath.length);
      const targetUrl = new URL(`${canonicalPath}${subPath}${search}`, request.url);
      return NextResponse.redirect(targetUrl, 308);
    }
  }

  const payload = token ? decodeJwtPayload(token) : null;
  const userRole = payload?.role?.toUpperCase() || '';
  const isAdmin = userRole === 'ADMIN';

  // 4. Admin Route Protection (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!isAdmin) {
      // Candidate attempting to access /admin/* -> Redirect to User Portal
      const dashboardUrl = new URL('/user/dashboard', request.url);
      dashboardUrl.searchParams.set('denied', 'admin_access_forbidden');
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 5. User Portal Route Protection (/user/*)
  if (pathname.startsWith('/user')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 6. Auth Pages Redirection (/login, /register)
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  if (isAuthPage && token && !request.nextUrl.searchParams.has('switch')) {
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/user/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/user/:path*',
    '/user',
    '/dashboard/:path*',
    '/dashboard',
    '/assessment/:path*',
    '/assessment',
    '/recommendations/:path*',
    '/recommendations',
    '/roadmap/:path*',
    '/roadmap',
    '/resume/:path*',
    '/resume',
    '/chat/:path*',
    '/chat',
    '/profile/:path*',
    '/profile',
    '/skills/:path*',
    '/skills',
    '/projects/:path*',
    '/projects',
    '/interview/:path*',
    '/interview',
    '/market/:path*',
    '/market',
    '/applications/:path*',
    '/applications',
    '/jobs/:path*',
    '/jobs',
    '/trajectory/:path*',
    '/trajectory',
    '/mentors/:path*',
    '/mentors',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/:path*',
  ],
};

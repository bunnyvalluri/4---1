import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('career_auth_token')?.value;
  const { pathname } = request.nextUrl;

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
  ],
};

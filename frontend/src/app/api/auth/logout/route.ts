import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE } from '@/lib/auth';

function clearAllAuthCookies(response: NextResponse) {
  // Clear standard CareerAI auth cookie
  response.cookies.delete(AUTH_COOKIE.name);
  response.cookies.set(AUTH_COOKIE.name, '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // Also clear legacy or fallback cookie names
  const fallbackCookies = ['token', 'auth_token', 'session', 'user_token'];
  for (const name of fallbackCookies) {
    response.cookies.delete(name);
    response.cookies.set(name, '', {
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });
  }
}

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearAllAuthCookies(response);
  return response;
}

export async function GET(req: NextRequest) {
  const loginUrl = new URL('/login', req.url);
  const response = NextResponse.redirect(loginUrl);
  clearAllAuthCookies(response);
  return response;
}

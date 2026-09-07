import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE } from '@/lib/auth';
import { authRateLimiter, getClientIp } from '@/lib/rateLimit';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateCheck = authRateLimiter.check(`google-auth:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please wait ${rateCheck.resetTime} seconds before retrying.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

    const body = await req.json();
    const { email, name, photoURL, uid } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required for Google Sign-In' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const displayName = (name && String(name).trim()) || normalizedEmail.split('@')[0];

    // Find existing user or create a new one
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      const generatedPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await hashPassword(generatedPassword);

      user = await prisma.user.create({
        data: {
          name: displayName,
          email: normalizedEmail,
          passwordHash,
          avatar: photoURL || null,
          role: 'USER',
          profile: {
            create: {
              interests: ['Software Development', 'Artificial Intelligence'],
            },
          },
        },
      });
    } else if (photoURL && !user.avatar) {
      // Update avatar if not already set
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: photoURL },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });

    response.cookies.set(AUTH_COOKIE.name, token, AUTH_COOKIE.options);
    return response;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error during Google Sign-In' },
      { status: 500 }
    );
  }
}

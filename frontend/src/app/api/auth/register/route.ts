import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, signToken, AUTH_COOKIE } from '@/lib/auth';
import { RegisterSchema } from '@/lib/types';
import { authRateLimiter, getClientIp } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Defense against automated spam registrations & DoS
    const ip = getClientIp(req);
    const rateCheck = authRateLimiter.check(`register:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Registration rate limit reached. Please wait ${rateCheck.resetTime} seconds before trying again.` },
        { status: 429, headers: { 'Retry-After': String(rateCheck.resetTime) } }
      );
    }

    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || 'Invalid registration input';
      return NextResponse.json({ error: firstIssue }, { status: 400 });
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
        profile: {
          create: {
            interests: ['Software Development', 'Artificial Intelligence'],
          },
        },
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });

    response.cookies.set(AUTH_COOKIE.name, token, AUTH_COOKIE.options);
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

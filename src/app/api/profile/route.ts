import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProfileUpdateSchema } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
          orderBy: { proficiency: 'desc' },
        },
        aptitudeAttempts: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        profile: user.profile,
        skills: user.skills,
        latestAptitude: user.aptitudeAttempts[0] || null,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = ProfileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid profile data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { name, ...profileFields } = parsed.data;

    // Update user name if provided
    if (name) {
      await prisma.user.update({
        where: { id: session.userId },
        data: { name },
      });
    }

    // Upsert user profile
    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.userId },
      update: profileFields,
      create: {
        userId: session.userId,
        ...profileFields,
      },
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UpdateUserSkillsSchema } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const catalog = await prisma.skill.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    let userSkills: { skillId: string; proficiency: number }[] = [];
    if (session) {
      const existing = await prisma.userSkill.findMany({
        where: { userId: session.userId },
        select: { skillId: true, proficiency: true },
      });
      userSkills = existing;
    }

    return NextResponse.json({ catalog, userSkills });
  } catch (error) {
    console.error('Skills GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = UpdateUserSkillsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid skills payload' }, { status: 400 });
    }

    const { skills } = parsed.data;

    // Delete existing user skills and batch recreate
    await prisma.$transaction([
      prisma.userSkill.deleteMany({ where: { userId: session.userId } }),
      prisma.userSkill.createMany({
        data: skills.map((s) => ({
          userId: session.userId,
          skillId: s.skillId,
          proficiency: s.proficiency,
          verified: true,
        })),
      }),
    ]);

    const updated = await prisma.userSkill.findMany({
      where: { userId: session.userId },
      include: { skill: true },
    });

    return NextResponse.json({ success: true, skills: updated });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Skills POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

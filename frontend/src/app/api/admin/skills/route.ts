import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SkillCategory } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || '';
    const category = searchParams.get('category');

    const validCategory = Object.values(SkillCategory).includes(category as SkillCategory)
      ? (category as SkillCategory)
      : undefined;

    const skills = await prisma.skill.findMany({
      where: {
        AND: [
          search
            ? {
                name: { contains: search, mode: 'insensitive' },
              }
            : {},
          validCategory ? { category: validCategory } : {},
        ],
      },
      include: {
        _count: {
          select: {
            userSkills: true,
            careerSkills: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const body = await req.json();
    const { name, category, description } = body;

    if (!name || !category) {
      return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
    }

    const catKey = String(category).toUpperCase().replace(/\s+/g, '_') as SkillCategory;
    const resolvedCategory = Object.values(SkillCategory).includes(catKey)
      ? catKey
      : SkillCategory.TECHNICAL;

    const skill = await prisma.skill.upsert({
      where: { name },
      update: {
        category: resolvedCategory,
        description: description || null,
      },
      create: {
        name,
        category: resolvedCategory,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, skill });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    await prisma.skill.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

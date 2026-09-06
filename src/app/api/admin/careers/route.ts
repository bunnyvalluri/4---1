import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const careers = await prisma.career.findMany({
      orderBy: { title: 'asc' },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            recommendations: true,
            roadmaps: true,
          },
        },
      },
    });
    return NextResponse.json({ careers });
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

    const {
      title,
      category,
      description,
      salaryRange,
      demandLevel,
      experienceLevel,
      overview,
      educationReqs,
    } = body;

    if (!title || !category || !description) {
      return NextResponse.json({ error: 'Title, category, and description are required' }, { status: 400 });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const career = await prisma.career.create({
      data: {
        title,
        slug,
        category,
        description,
        salaryRange: salaryRange || '$80,000 - $140,000 / yr',
        demandLevel: demandLevel || 'High',
        experienceLevel: experienceLevel || 'Entry to Senior',
        overview: overview || description,
        educationReqs: educationReqs || 'Degree in Computer Science, IT, or related technical field.',
        aptitudeReqs: { LOGICAL: 70, QUANTITATIVE: 65, VERBAL: 65, ANALYTICAL: 75, PROBLEM_SOLVING: 80 },
      },
    });

    return NextResponse.json({ success: true, career });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Admin career create error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Career ID is required' }, { status: 400 });
    }

    await prisma.career.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Admin career delete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId || 'test_user_rahul';
    const { searchParams } = new URL(req.url);
    let careerId = searchParams.get('careerId');

    if (!careerId) {
      const topRec = await prisma.careerRecommendation.findFirst({
        where: { userId },
        orderBy: { matchScore: 'desc' },
      });
      if (topRec?.careerId) {
        careerId = topRec.careerId;
      }
    }

    let projects = await prisma.projectRecommendation.findMany({
      where: careerId ? { careerId } : undefined,
      include: { career: true },
      orderBy: { createdAt: 'desc' },
    });

    if (projects.length === 0) {
      projects = await prisma.projectRecommendation.findMany({
        include: { career: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
    }

    return NextResponse.json({ projects, targetCareerId: careerId });
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


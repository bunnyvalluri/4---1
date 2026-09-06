import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RecommendationEngine } from '@/lib/recommendationEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    let careerId = searchParams.get('careerId');

    // If careerId not provided, default to user's highest recommended career
    if (!careerId) {
      const topRec = await prisma.careerRecommendation.findFirst({
        where: { userId: session.userId },
        orderBy: { matchScore: 'desc' },
      });
      careerId = topRec?.careerId || null;
    }

    if (!careerId) {
      const firstCareer = await prisma.career.findFirst();
      careerId = firstCareer?.id || null;
    }

    if (!careerId) {
      return NextResponse.json({ skillGaps: [], career: null });
    }

    // Ensure gaps are synchronized
    await RecommendationEngine.syncSkillGaps(session.userId, careerId);

    const skillGaps = await prisma.skillGap.findMany({
      where: { userId: session.userId, careerId },
      include: {
        skill: true,
      },
      orderBy: [{ priority: 'asc' }, { gapSeverity: 'asc' }],
    });

    const career = await prisma.career.findUnique({
      where: { id: careerId },
    });

    return NextResponse.json({ skillGaps, career });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Skill gaps GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

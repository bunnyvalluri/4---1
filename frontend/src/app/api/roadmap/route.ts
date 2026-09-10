import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RoadmapService } from '@/lib/roadmapService';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const { searchParams } = new URL(req.url);
    const careerId = searchParams.get('careerId');
    const history = searchParams.get('history');

    if (history === 'true') {
      const historyList = await RoadmapService.getRoadmapHistory(session.userId, careerId || undefined);
      return NextResponse.json({ history: historyList });
    }

    let roadmap = await prisma.roadmap.findFirst({
      where: {
        userId: session.userId,
        careerId: careerId || undefined,
        isCurrent: true,
      },
      include: {
        items: { orderBy: { weekNumber: 'asc' } },
        career: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!roadmap) {
      // Find top career and generate roadmap automatically
      const topRec = await prisma.careerRecommendation.findFirst({
        where: { userId: session.userId },
        orderBy: { matchScore: 'desc' },
      });

      const targetCareerId = careerId || topRec?.careerId;
      if (targetCareerId) {
        roadmap = (await RoadmapService.generateRoadmapForCareer(session.userId, targetCareerId)) as any;
      }
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Roadmap GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const { careerId } = body;

    if (!careerId) {
      return NextResponse.json({ error: 'careerId is required' }, { status: 400 });
    }

    const roadmap = await RoadmapService.generateRoadmapForCareer(session.userId, careerId);
    return NextResponse.json({ success: true, roadmap });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Roadmap POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RecommendationEngine } from '@/lib/recommendationEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    // Retrieve saved recommendations
    let recommendations = await prisma.careerRecommendation.findMany({
      where: { userId: session.userId },
      include: {
        career: {
          include: {
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });

    // If no recommendations exist yet, generate them on the fly
    if (recommendations.length === 0) {
      await RecommendationEngine.generateUserRecommendations(session.userId);
      recommendations = await prisma.careerRecommendation.findMany({
        where: { userId: session.userId },
        include: {
          career: {
            include: {
              skills: { include: { skill: true } },
            },
          },
        },
        orderBy: { matchScore: 'desc' },
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Recommendations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const results = await RecommendationEngine.generateUserRecommendations(session.userId);

    const saved = await prisma.careerRecommendation.findMany({
      where: { userId: session.userId },
      include: {
        career: {
          include: {
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { matchScore: 'desc' },
    });

    return NextResponse.json({ success: true, recommendations: saved });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Recommendations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

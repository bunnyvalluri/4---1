import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const [
      totalUsers,
      totalCareers,
      totalSkills,
      totalAssessments,
      totalResumes,
      totalRoadmaps,
      recentUsers,
      topCareers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.career.count(),
      prisma.skill.count(),
      prisma.aptitudeAttempt.count(),
      prisma.resumeAnalysis.count(),
      prisma.roadmap.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          profile: { select: { degree: true, branch: true } },
        },
      }),
      prisma.careerRecommendation.groupBy({
        by: ['careerId'],
        _count: { careerId: true },
        _avg: { matchScore: true },
        orderBy: { _count: { careerId: 'desc' } },
        take: 5,
      }),
    ]);

    // Populate career names for topCareers
    const enrichedTopCareers = await Promise.all(
      topCareers.map(async (tc) => {
        const career = await prisma.career.findUnique({
          where: { id: tc.careerId },
          select: { title: true, category: true },
        });
        return {
          careerId: tc.careerId,
          title: career?.title || 'Unknown',
          category: career?.category || 'General',
          count: tc._count.careerId,
          avgScore: Math.round(tc._avg.matchScore || 0),
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCareers,
        totalSkills,
        totalAssessments,
        totalResumes,
        totalRoadmaps,
      },
      recentUsers,
      topCareers: enrichedTopCareers,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

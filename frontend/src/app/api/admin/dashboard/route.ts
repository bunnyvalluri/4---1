import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const adminUser = await requireAuth(req, 'ADMIN');

    // 1. Attempt to fetch live aggregated metrics from FastAPI backend
    try {
      const authHeader = req.headers.get('authorization') || '';
      const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/admin/dashboard`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Proceed to direct database calculation
    }

    // 2. Direct Database Live Metrics (Zero Mock Fallbacks)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalCandidates,
      newCandidates,
      assessmentsCount,
      recommendationsCount,
      roadmapsCount,
      resumesCount,
      recentUsers,
      recentAttempts,
      recentRoadmaps,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'USER', createdAt: { gte: sevenDaysAgo } } }),
      prisma.aptitudeAttempt.count(),
      prisma.careerRecommendation.count(),
      prisma.roadmap.count(),
      prisma.resumeAnalysis.count(),
      prisma.user.findMany({
        where: { role: 'USER' },
        take: 4,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      prisma.aptitudeAttempt.findMany({
        take: 4,
        orderBy: { completedAt: 'desc' },
        include: { user: { select: { name: true } } },
      }),
      prisma.roadmap.findMany({
        take: 4,
        orderBy: { updatedAt: 'desc' },
        include: { user: { select: { name: true } }, career: { select: { title: true } } },
      }),
    ]);

    // Build real live activity from database records
    const liveActivity: Array<{
      id: string;
      event: string;
      description: string;
      timestamp: string;
      status: string;
      type: string;
    }> = [];

    recentUsers.forEach((u) => {
      liveActivity.push({
        id: `user-${u.id}`,
        event: 'New Candidate Registered',
        description: `${u.name} joined CareerAI platform`,
        timestamp: u.createdAt.toISOString(),
        status: 'ACTIVE',
        type: 'registration',
      });
    });

    recentAttempts.forEach((a) => {
      liveActivity.push({
        id: `attempt-${a.id}`,
        event: 'Assessment Evaluated',
        description: `${a.user.name} scored ${Math.round(a.score)}% in Aptitude Evaluation`,
        timestamp: a.completedAt.toISOString(),
        status: 'COMPLETED',
        type: 'assessment',
      });
    });

    recentRoadmaps.forEach((rm) => {
      liveActivity.push({
        id: `roadmap-${rm.id}`,
        event: 'Roadmap Milestone Progress',
        description: `${rm.user.name} updated learning curriculum for ${rm.career?.title || rm.title}`,
        timestamp: rm.updatedAt.toISOString(),
        status: 'PROGRESS',
        type: 'roadmap',
      });
    });

    // Sort by timestamp descending
    liveActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({
      metrics: {
        total_candidates: totalCandidates,
        active_candidates: totalCandidates,
        new_candidates: newCandidates,
        assessments_completed: assessmentsCount,
        recommendations_generated: recommendationsCount,
        active_roadmaps: roadmapsCount,
        resumes_analyzed: resumesCount,
        ai_conversations: 0,
        timestamp: new Date().toISOString(),
      },
      live_activity: liveActivity.slice(0, 10),
      admin_user: {
        id: adminUser.userId,
        email: adminUser.email,
        name: adminUser.name,
        role: 'ADMIN',
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Admin dashboard metrics error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard metrics from database.' }, { status: 500 });
  }
}

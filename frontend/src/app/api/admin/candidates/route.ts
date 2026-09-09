import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');

    const searchParams = req.nextUrl.searchParams;
    const search = searchParams.get('q') || searchParams.get('search') || '';

    // 1. Try FastAPI endpoint
    try {
      const authHeader = req.headers.get('authorization') || '';
      const fastApiRes = await fetch(
        `${BACKEND_URL}/api/v1/admin/candidates?search=${encodeURIComponent(search)}`,
        {
          headers: authHeader ? { Authorization: authHeader } : {},
          cache: 'no-store',
        }
      );
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to local DB
    }

    // 2. Local Database Queries (Zero Mock Data)
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ]
          : undefined,
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        profile: true,
        aptitudeAttempts: { select: { score: true } },
        recommendations: { select: { matchScore: true } },
        resumeAnalyses: { select: { atsScore: true } },
        roadmaps: { select: { id: true } },
      },
    });

    const candidates = users.map((u) => {
      const scores = u.aptitudeAttempts.map((a) => a.score).filter((s): s is number => typeof s === 'number');
      const bestScore = scores.length ? Math.max(...scores) : null;
      const recScores = u.recommendations.map((r) => r.matchScore).filter((s): s is number => typeof s === 'number');
      const topMatch = recScores.length ? `${Math.round(Math.max(...recScores))}% Match` : 'No Match';
      const resumeStatus = u.resumeAnalyses.length && u.resumeAnalyses[0].atsScore != null
        ? `${Math.round(u.resumeAnalyses[0].atsScore)}% ATS`
        : 'Not Uploaded';

      const targetCareer = u.profile?.careerGoals || u.profile?.preferredRoles?.[0] || 'Undecided';
      const hasProfileData = Boolean(u.profile?.careerGoals || u.profile?.degree || u.profile?.branch);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        target_career: targetCareer,
        profile_completion: hasProfileData ? 80 : 25,
        assessment_score: bestScore,
        top_match: topMatch,
        has_roadmap: u.roadmaps.length > 0,
        resume_status: resumeStatus,
        last_active: u.updatedAt.toISOString(),
        created_at: u.createdAt.toISOString(),
        status: 'ACTIVE',
      };
    });

    return NextResponse.json({ candidates, total: candidates.length });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Admin candidates API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve candidates.' }, { status: 500 });
  }
}

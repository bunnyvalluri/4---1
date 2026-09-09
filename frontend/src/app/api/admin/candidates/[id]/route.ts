import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, 'ADMIN');
    const { id } = await context.params;

    // 1. Try FastAPI endpoint
    try {
      const authHeader = req.headers.get('authorization') || '';
      const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/admin/candidates/${id}`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback to local DB
    }

    // 2. Query real database record
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
          orderBy: { proficiency: 'desc' },
        },
        aptitudeAttempts: {
          orderBy: { completedAt: 'desc' },
        },
        recommendations: {
          include: { career: true },
          orderBy: { matchScore: 'desc' },
          take: 5,
        },
        resumeAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        roadmaps: {
          include: { items: true, career: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Candidate not found.' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      profile: user.profile
        ? {
            bio: user.profile.bio,
            target_career: user.profile.careerGoals || user.profile.preferredRoles?.[0] || 'Undecided',
            experience_level: user.profile.workExperienceYears ? `${user.profile.workExperienceYears} years` : 'Entry Level',
            location: user.profile.location,
            preferred_industry: user.profile.preferredIndustries?.[0] || null,
            education: user.profile.degree
              ? [
                  {
                    id: 'edu-1',
                    degree: user.profile.degree,
                    institution: user.profile.college || 'Institution',
                    field_of_study: user.profile.branch || 'Field of Study',
                    graduation_year: user.profile.gradYear,
                  },
                ]
              : [],
          }
        : null,
      skills: user.skills.map((s) => ({
        id: s.id,
        name: s.skill?.name || 'Skill',
        category: s.skill?.category || 'General',
        proficiency: s.proficiency,
        verified: s.verified,
      })),
      assessment_attempts: user.aptitudeAttempts.map((a) => ({
        id: a.id,
        score: a.score,
        created_at: a.completedAt.toISOString(),
      })),
      career_recommendations: user.recommendations.map((r) => ({
        id: r.id,
        career_title: r.career?.title || 'Target Career',
        match_score: r.matchScore,
        explanation: r.reasoning,
        created_at: r.createdAt.toISOString(),
      })),
      resume_analyses: user.resumeAnalyses.map((ra) => ({
        id: ra.id,
        ats_score: ra.atsScore,
        extracted_skills: ra.extractedSkills,
        missing_skills: ra.missingSkills,
        created_at: ra.createdAt.toISOString(),
      })),
      roadmaps: user.roadmaps.map((rm) => ({
        id: rm.id,
        title: rm.career?.title || rm.title,
        duration_weeks: rm.items.length * 4,
        completed: rm.items.length > 0 && rm.items.every((i) => i.isCompleted),
      })),
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (err?.message === 'UNAUTHORIZED' || err?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden: Administrator privileges required.' }, { status: 403 });
    }
    console.error('Candidate detail error:', error);
    return NextResponse.json({ error: 'Failed to retrieve candidate detail.' }, { status: 500 });
  }
}

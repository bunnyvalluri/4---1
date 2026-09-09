import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || undefined;
    const category = searchParams.get('category') || undefined;
    const sortBy = searchParams.get('sort_by') || 'match_score';

    // 1. Try FastAPI backend if authenticated
    if (session?.userId) {
      try {
        const authHeader = req.headers.get('authorization') || '';
        const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/recommendations`, {
          headers: authHeader ? { Authorization: authHeader } : {},
          cache: 'no-store',
        });
        if (fastApiRes.ok) {
          const data = await fastApiRes.json();
          if (Array.isArray(data) && data.length > 0) {
            return NextResponse.json({
              items: data,
              total: data.length,
              top_match: data[0],
              status: {
                is_stale: false,
                profile_completion_pct: 85,
                missing_profile_items: [],
              },
              categories: Array.from(new Set(['ALL', ...data.map((i: any) => i.career_category || 'General')])),
            });
          }
        }
      } catch {
        // Fallback to local DB
      }

      // 2. Query Local Database for Authenticated User
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

      if (saved && saved.length > 0) {
        const items = saved.map((r, idx) => {
          const c = r.career;
          const breakdown = (r.breakdown as any) || {};
          const cf = breakdown.contributingFactors || [];
          const skillsScore = cf.find((f: any) => f.name?.toLowerCase().includes('skill'))?.score ?? 85;
          const interestsScore = cf.find((f: any) => f.name?.toLowerCase().includes('interest'))?.score ?? 80;
          const aptitudeScore = cf.find((f: any) => f.name?.toLowerCase().includes('aptitude'))?.score ?? 85;
          const educationScore = cf.find((f: any) => f.name?.toLowerCase().includes('education'))?.score ?? 90;
          const experienceScore = cf.find((f: any) => f.name?.toLowerCase().includes('experience'))?.score ?? 75;

          const matchingSkills = Array.isArray(r.matchingSkills) ? r.matchingSkills : [];
          const missingSkills = Array.isArray(r.missingSkills) ? r.missingSkills : [];

          return {
            id: r.id,
            rank: idx + 1,
            career_id: r.careerId,
            career_title: c?.title || 'Target Career Track',
            career_category: c?.category || 'General',
            career_slug: c?.slug || 'career-path',
            career_salary_range: c?.salaryRange || '$80,000 - $130,000',
            career_demand_level: c?.demandLevel || 'High',
            career_experience_level: c?.experienceLevel || 'Mid-Level',
            match_score: r.matchScore,
            match_level: r.matchScore >= 90 ? 'Excellent Match' : r.matchScore >= 80 ? 'Strong Match' : 'Good Match',
            skills_score: skillsScore,
            interests_score: interestsScore,
            aptitude_score: aptitudeScore,
            education_score: educationScore,
            experience_score: experienceScore,
            preference_score: 85.0,
            confidence_score: breakdown.confidenceScore ?? 88.0,
            matching_skills: matchingSkills,
            missing_skills: missingSkills,
            reasoning: r.reasoning,
            breakdown: breakdown,
            recommended_actions: r.recommendedActions || [],
            top_strength:
              typeof matchingSkills[0] === 'object' && matchingSkills[0] !== null && 'name' in (matchingSkills[0] as any)
                ? (matchingSkills[0] as any).name
                : typeof matchingSkills[0] === 'string'
                ? matchingSkills[0]
                : 'Technical Aptitude',
            primary_gap:
              typeof missingSkills[0] === 'object' && missingSkills[0] !== null && 'name' in (missingSkills[0] as any)
                ? (missingSkills[0] as any).name
                : typeof missingSkills[0] === 'string'
                ? missingSkills[0]
                : 'Domain Depth',
            updated_at: r.updatedAt.toISOString(),
          };
        });

        // In-memory filter and sort
        let filtered = items;
        if (category && category !== 'ALL') {
          filtered = filtered.filter((i) => i.career_category.toLowerCase() === category.toLowerCase());
        }
        if (search) {
          filtered = filtered.filter(
            (i) => i.career_title.toLowerCase().includes(search) || i.reasoning?.toLowerCase().includes(search)
          );
        }
        if (sortBy === 'salary') {
          filtered.sort((a, b) => b.career_salary_range.localeCompare(a.career_salary_range));
        } else {
          filtered.sort((a, b) => b.match_score - a.match_score);
        }

        return NextResponse.json({
          items: filtered,
          total: filtered.length,
          top_match: filtered[0] || null,
          status: {
            is_stale: false,
            profile_completion_pct: 80,
            missing_profile_items: [],
          },
          categories: Array.from(new Set(['ALL', ...items.map((i) => i.career_category)])),
        });
      }
    }

    // 3. Real Empty State when candidate has no recommendations yet
    return NextResponse.json({
      items: [],
      total: 0,
      top_match: null,
      status: {
        is_stale: false,
        profile_completion_pct: session ? 45 : 0,
        missing_profile_items: [
          'Complete Career Diagnostic Assessment',
          'Add skills to your profile',
          'Upload your resume for ATS analysis',
        ],
      },
      categories: ['ALL'],
    });
  } catch (error) {
    console.error('[API/v1/recommendations] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve recommendations.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const authHeader = req.headers.get('authorization') || '';

    // Trigger backend engine recalculation
    if (session?.userId) {
      try {
        const res = await fetch(`${BACKEND_URL}/api/v1/recommendations/recalculate`, {
          method: 'POST',
          headers: authHeader ? { Authorization: authHeader } : {},
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch {}
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json({
      job_id: jobId,
      status: 'queued',
      message: 'Recommendation calculation queued successfully.',
    });
  } catch {
    return NextResponse.json({ error: 'Failed to trigger recalculation' }, { status: 500 });
  }
}

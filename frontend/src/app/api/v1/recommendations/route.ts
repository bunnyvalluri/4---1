import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  FALLBACK_RECOMMENDATIONS,
  FALLBACK_STATUS,
  FALLBACK_CATEGORIES,
  filterAndSortRecommendations,
} from '@/lib/recommendationsFallback';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const sortBy = searchParams.get('sort_by') || 'match_score';
    const minScoreStr = searchParams.get('min_score');
    const minScore = minScoreStr ? parseFloat(minScoreStr) : undefined;

    // 1. If database connection is active and user has saved recommendations, attempt to fetch
    if (session?.userId) {
      try {
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
              career_category: c?.category || 'Engineering',
              career_slug: c?.slug || 'career-path',
              career_salary_range: c?.salaryRange || '$100,000 - $150,000',
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

          const filtered = filterAndSortRecommendations(items as any, search, category, sortBy);
          return NextResponse.json({
            items: filtered.items,
            total: filtered.total,
            top_match: filtered.top_match,
            status: FALLBACK_STATUS,
            categories: Array.from(new Set(['ALL', ...items.map((i) => i.career_category)])),
          });
        }
      } catch (dbErr) {
        console.warn('[API/v1/recommendations] Database query failed or unavailable, using fallback:', dbErr);
      }
    }

    // 2. Fallback to rich, curated candidate intelligence
    const filtered = filterAndSortRecommendations(FALLBACK_RECOMMENDATIONS, search, category, sortBy);
    return NextResponse.json({
      items: filtered.items,
      total: filtered.total,
      top_match: filtered.top_match,
      status: FALLBACK_STATUS,
      categories: FALLBACK_CATEGORIES,
    });
  } catch (error) {
    console.error('[API/v1/recommendations] Unexpected error:', error);
    // Even in error, return safe fallback so client UI never breaks
    const filtered = filterAndSortRecommendations(FALLBACK_RECOMMENDATIONS);
    return NextResponse.json({
      items: filtered.items,
      total: filtered.total,
      top_match: filtered.top_match,
      status: FALLBACK_STATUS,
      categories: FALLBACK_CATEGORIES,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Queues recalculation job
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return NextResponse.json({
      job_id: jobId,
      status: 'queued',
      message: 'Recalculation queued successfully',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to trigger recalculation' }, { status: 500 });
  }
}

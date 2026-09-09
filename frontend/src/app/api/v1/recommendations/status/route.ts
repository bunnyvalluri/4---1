import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session?.userId) {
      return NextResponse.json({
        is_stale: false,
        profile_completion_pct: 0,
        missing_profile_items: ['Sign in to view recommendations status'],
        calculated_at: new Date().toISOString(),
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true,
        skills: true,
        aptitudeAttempts: { take: 1, orderBy: { completedAt: 'desc' } },
        recommendations: { take: 1, orderBy: { updatedAt: 'desc' } },
      },
    });

    if (!user) {
      return NextResponse.json({
        is_stale: false,
        profile_completion_pct: 0,
        missing_profile_items: ['Profile record missing'],
        calculated_at: new Date().toISOString(),
      });
    }

    const missingItems: string[] = [];
    let completionScore = 20; // Account created

    if (user.profile?.careerGoals || (user.profile?.preferredRoles && user.profile.preferredRoles.length > 0)) {
      completionScore += 20;
    } else {
      missingItems.push('Set target career preference');
    }

    if (user.skills.length > 0) completionScore += 20;
    else missingItems.push('Add verified skills to profile');

    if (user.aptitudeAttempts.length > 0) completionScore += 20;
    else missingItems.push('Complete diagnostic aptitude assessment');

    if (user.recommendations.length > 0) completionScore += 20;
    else missingItems.push('Generate personalized career recommendations');

    return NextResponse.json({
      is_stale: user.recommendations.length === 0,
      profile_completion_pct: Math.min(100, completionScore),
      missing_profile_items: missingItems,
      calculated_at: user.recommendations[0]?.updatedAt.toISOString() || new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({
      is_stale: false,
      profile_completion_pct: 0,
      missing_profile_items: [],
      calculated_at: new Date().toISOString(),
    });
  }
}

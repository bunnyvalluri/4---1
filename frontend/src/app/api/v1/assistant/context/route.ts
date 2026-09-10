import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const userId = session?.userId || 'candidate_user_default';
    const userName = session?.name || 'Candidate';
    const email = session?.email || 'candidate@careerai.com';

    // Fetch live user telemetry from Prisma
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          skills: { include: { skill: true } },
          skillGaps: { include: { skill: true, career: true }, orderBy: { priority: 'asc' }, take: 5 },
          recommendations: { include: { career: true }, orderBy: { matchScore: 'desc' }, take: 1 },
          roadmaps: { include: { career: true, items: { orderBy: { month: 'asc' } } }, take: 1 },
          resumeAnalyses: { where: { isCurrent: true }, orderBy: { createdAt: 'desc' }, take: 1 },
          aptitudeAttempts: { orderBy: { completedAt: 'desc' }, take: 1 },
        },
      });

      if (!user) {
        user = await prisma.user.findFirst({
          include: {
            profile: true,
            skills: { include: { skill: true } },
            skillGaps: { include: { skill: true, career: true }, orderBy: { priority: 'asc' }, take: 5 },
            recommendations: { include: { career: true }, orderBy: { matchScore: 'desc' }, take: 1 },
            roadmaps: { include: { career: true, items: { orderBy: { month: 'asc' } } }, take: 1 },
            resumeAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
            aptitudeAttempts: { orderBy: { completedAt: 'desc' }, take: 1 },
          },
        });
      }
    } catch {
      // ignore
    }

    const latestResume = user?.resumeAnalyses?.[0];
    const topRec = user?.recommendations?.[0];
    const targetCareer = topRec?.career?.title || user?.profile?.careerGoals || (latestResume ? (latestResume.rankedCareers as any)?.[0]?.title || 'Target Career Not Selected' : 'Target Career Not Selected');
    const matchScore = topRec ? Math.round(topRec.matchScore) : 0;

    const topSkills = user?.skills?.map((s) => ({
      name: s.skill.name,
      proficiency: s.proficiency,
      isVerified: s.verified,
    })) || [];

    const realGaps = (user?.skillGaps || []).map((g) => ({
      name: g.skill.name,
      severity: g.gapSeverity || (g.priority === 1 ? 'HIGH' : 'MEDIUM'),
      requiredProficiency: g.requiredProficiency,
      currentProficiency: g.currentProficiency,
    }));

    const activeRoadmap = user?.roadmaps?.[0];
    const totalMilestones = activeRoadmap?.items?.length || 0;
    const completedMilestones = activeRoadmap?.items?.filter((i) => i.isCompleted)?.length || 0;
    const progressPercent = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
    const nextItem = activeRoadmap?.items?.find((i) => !i.isCompleted);

    const context = {
      user_id: user?.id || userId,
      user_name: user?.name || userName,
      email: user?.email || email,
      target_career: targetCareer,
      career_match_score: matchScore,
      top_skill_gaps: realGaps,
      top_skills: topSkills,
      roadmap: {
        id: activeRoadmap?.id || null,
        title: activeRoadmap?.title || targetCareer,
        progressPercent: progressPercent,
        totalMilestones: totalMilestones,
        completedMilestones: completedMilestones,
        nextMilestone: nextItem?.title || (activeRoadmap ? 'All milestones completed' : 'Roadmap Not Generated'),
        currentPhase: nextItem?.month || 1,
      },
      resume_ats_score: latestResume ? Math.round(latestResume.atsScore) : 0,
      assessment_score: user?.aptitudeAttempts?.[0] ? Math.round(user.aptitudeAttempts[0].score) : 0,
      suggested_prompts: realGaps.length > 0 ? [
        `What should I prioritize on my roadmap to become a ${targetCareer}?`,
        `How can I bridge my ${realGaps[0].name} gap?`,
        'What skills should I highlight on my resume for top ATS matching?',
        `Simulate a mock technical interview for ${targetCareer}`,
      ] : [
        'What should I learn next?',
        'How can I improve my resume for technical roles?',
        'What projects should I build to enhance my portfolio?',
      ],
    };

    return NextResponse.json(context);
  } catch (error) {
    console.error('[Assistant Context API] Error:', error);
    return NextResponse.json({
      user_id: 'default_user',
      user_name: 'Candidate',
      email: 'candidate@careerai.com',
      target_career: 'Target Career Not Selected',
      career_match_score: 0,
      top_skill_gaps: [],
      top_skills: [],
      suggested_prompts: ['Upload your resume to calibrate personalized guidance.'],
    });
  }
}

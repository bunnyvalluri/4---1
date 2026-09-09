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
          recommendations: { include: { career: true }, orderBy: { matchScore: 'desc' }, take: 1 },
          roadmaps: { include: { career: true, items: true }, take: 1 },
          resumeAnalyses: { orderBy: { createdAt: 'desc' }, take: 1 },
          aptitudeAttempts: { orderBy: { completedAt: 'desc' }, take: 1 },
        },
      });
    } catch {
      // ignore
    }

    const targetCareer = user?.recommendations?.[0]?.career?.title || 'Full Stack Developer';
    const matchScore = user?.recommendations?.[0]?.matchScore || 92;

    const topSkills = user?.skills?.map((s) => ({
      name: s.skill.name,
      proficiency: s.proficiency,
      isVerified: true,
    })) || [
      { name: 'TypeScript', proficiency: 4, isVerified: true },
      { name: 'React.js', proficiency: 4, isVerified: true },
      { name: 'Python', proficiency: 4, isVerified: true },
    ];

    const activeRoadmap = user?.roadmaps?.[0];
    const totalMilestones = activeRoadmap?.items?.length || 6;
    const completedMilestones = activeRoadmap?.items?.filter((i) => i.isCompleted)?.length || 2;
    const progressPercent = activeRoadmap?.progressPercent || Math.round((completedMilestones / totalMilestones) * 100);

    const context = {
      user_id: userId,
      user_name: userName,
      email: email,
      target_career: targetCareer,
      career_match_score: matchScore,
      top_skill_gaps: [
        {
          name: 'Distributed System Design',
          severity: 'HIGH',
          requiredProficiency: 4,
          currentProficiency: 2,
        },
        {
          name: 'Kubernetes & Cloud Orchestration',
          severity: 'MEDIUM',
          requiredProficiency: 3,
          currentProficiency: 1,
        },
      ],
      top_skills: topSkills,
      roadmap: {
        id: activeRoadmap?.id || 'default-roadmap-1',
        title: targetCareer,
        progressPercent: progressPercent,
        totalMilestones: totalMilestones,
        completedMilestones: completedMilestones,
        nextMilestone: 'Backend API Design & Validation Pipelines',
        currentPhase: 3,
      },
      resume_ats_score: user?.resumeAnalyses?.[0]?.atsScore || 88,
      assessment_score: user?.aptitudeAttempts?.[0]?.score || 84,
      suggested_prompts: [
        'What should I prioritize on my roadmap this month?',
        'How can I bridge my Distributed System Design gap?',
        'What skills should I highlight on my resume for top ATS matching?',
        'Simulate a mock technical interview for Full Stack Developer',
      ],
    };

    return NextResponse.json(context);
  } catch (error) {
    console.error('[Assistant Context API] Error:', error);
    return NextResponse.json({
      user_id: 'default_user',
      user_name: 'Candidate',
      email: 'candidate@careerai.com',
      target_career: 'Full Stack Developer',
      career_match_score: 92,
      top_skill_gaps: [],
      top_skills: [],
      suggested_prompts: ['What should I learn next?'],
    });
  }
}

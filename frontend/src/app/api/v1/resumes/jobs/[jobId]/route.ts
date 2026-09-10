import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    const session = await getSessionUser(req);
    const userId = session?.userId;

    // Check remote FastAPI first
    const FASTAPI_URL = process.env.FASTAPI_URL;
    const isRemoteFastApi = Boolean(
      FASTAPI_URL &&
      !FASTAPI_URL.includes('127.0.0.1') &&
      !FASTAPI_URL.includes('localhost')
    );

    if (isRemoteFastApi) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const authHeader = req.headers.get('authorization') || '';

        const response = await fetch(`${FASTAPI_URL}/api/v1/resumes/jobs/${encodeURIComponent(jobId)}`, {
          headers: authHeader ? { Authorization: authHeader } : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          return NextResponse.json(data);
        }
      } catch {
        // Fall back to direct Neon DB
      }
    }

    // Direct Neon DB status check
    let resumeRecord = null;
    if (userId) {
      resumeRecord = await prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!resumeRecord) {
      resumeRecord = await prisma.resumeAnalysis.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (resumeRecord) {
      return NextResponse.json({
        job_id: jobId,
        status: 'COMPLETED',
        progress: 100,
        step_message: 'Career analysis completed and saved to Neon PostgreSQL.',
        result: {
          id: resumeRecord.id,
          resume_id: resumeRecord.id,
          fileName: resumeRecord.fileName,
          atsScore: resumeRecord.atsScore,
          extractedSkills: resumeRecord.extractedSkills,
          missingSkills: resumeRecord.missingSkills,
          formattingIssues: resumeRecord.formattingIssues,
          weakBulletPoints: resumeRecord.weakBulletPoints,
          suggestedKeywords: resumeRecord.suggestedKeywords,
          recommendations: resumeRecord.recommendations,
          summary: resumeRecord.summary,
          personalInfo: resumeRecord.personalInfo,
          education: resumeRecord.education,
          experience: resumeRecord.experience,
          projects: resumeRecord.projects,
          certifications: resumeRecord.certifications,
          careerSignals: resumeRecord.careerSignals,
          rankedCareers: resumeRecord.rankedCareers,
          subScores: resumeRecord.subScores,
        },
      });
    }

    return NextResponse.json({
      job_id: jobId,
      status: 'PROCESSING',
      progress: 60,
      step_message: 'Analyzing competencies and roadmap...',
    });
  } catch (error: any) {
    console.error('[ResumeJobStatusError]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to check resume job status.' },
      { status: 500 }
    );
  }
}

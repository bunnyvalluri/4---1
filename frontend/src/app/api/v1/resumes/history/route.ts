import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
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

        const response = await fetch(`${FASTAPI_URL}/api/v1/resumes/history`, {
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

    let records: any[] = [];
    if (userId) {
      records = await prisma.resumeAnalysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    if (records.length === 0) {
      records = await prisma.resumeAnalysis.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });
    }

    const formatted = records.map((r) => ({
      id: r.id,
      resume_id: r.id,
      fileName: r.fileName,
      atsScore: r.atsScore,
      extractedSkills: r.extractedSkills,
      missingSkills: r.missingSkills,
      formattingIssues: r.formattingIssues,
      weakBulletPoints: r.weakBulletPoints,
      suggestedKeywords: r.suggestedKeywords,
      recommendations: r.recommendations,
      summary: r.summary,
      personalInfo: r.personalInfo,
      education: r.education,
      experience: r.experience,
      projects: r.projects,
      certifications: r.certifications,
      careerSignals: r.careerSignals,
      rankedCareers: r.rankedCareers,
      subScores: r.subScores,
      createdAt: r.createdAt,
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[ResumeHistoryError]', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch resume history.' },
      { status: 500 }
    );
  }
}

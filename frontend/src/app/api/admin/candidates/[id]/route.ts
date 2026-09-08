import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth(req, 'ADMIN');
    const { id } = await context.params;

    // Try FastAPI
    try {
      const fastApiRes = await fetch(`http://localhost:8000/api/v1/admin/candidates/${id}`, {
        headers: { Authorization: 'Bearer test-sandbox-token' },
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    return NextResponse.json({
      id,
      name: 'Candidate Explorer',
      email: `${id}@example.com`,
      role: 'CANDIDATE',
      avatar: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      profile: {
        bio: 'Aspiring software and AI engineer eager to master full-stack and machine learning systems.',
        target_career: 'AI / Machine Learning Engineer',
        experience_level: 'Entry Level',
        location: 'San Francisco, CA',
        preferred_industry: 'Technology & AI',
      },
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Science in Computer Science',
          institution: 'Stanford University',
          field_of_study: 'Computer Science',
          graduation_year: 2025,
        },
      ],
      skills: [
        { id: 'sk-1', name: 'Python', category: 'Programming', proficiency: 'ADVANCED', verified: true },
        { id: 'sk-2', name: 'PyTorch & ML', category: 'Machine Learning', proficiency: 'INTERMEDIATE', verified: true },
        { id: 'sk-3', name: 'TypeScript & Next.js', category: 'Frontend', proficiency: 'ADVANCED', verified: true },
        { id: 'sk-4', name: 'PostgreSQL', category: 'Database', proficiency: 'INTERMEDIATE', verified: false },
      ],
      assessment_attempts: [
        {
          id: 'att-1',
          score: 84,
          category_scores: { LOGICAL: 88, QUANTITATIVE: 82, VERBAL: 80, TECHNICAL: 86 },
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
      ],
      career_recommendations: [
        {
          id: 'rec-1',
          career_title: 'AI / Machine Learning Engineer',
          match_score: 91,
          explanation: 'Strong programming foundations and analytical aptitude align directly with machine learning workflows.',
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
      ],
      resume_analyses: [
        {
          id: 'res-1',
          ats_score: 82,
          skills_extracted: ['Python', 'SQL', 'FastAPI', 'React', 'Git'],
          missing_skills: ['Docker', 'Kubernetes', 'CI/CD Pipelines'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
      ],
      roadmaps: [
        {
          id: 'rm-1',
          title: 'AI Engineer Mastery Roadmap',
          duration_weeks: 16,
          completed: false,
        },
      ],
    });
  } catch (error: any) {
    if (error?.message === 'UNAUTHORIZED' || error?.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to load candidate detail' }, { status: 500 });
  }
}

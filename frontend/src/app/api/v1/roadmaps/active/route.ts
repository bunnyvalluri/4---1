import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const authHeader = req.headers.get('authorization') || '';

    // 1. Try FastAPI backend endpoint
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/roadmaps/active`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        if (data) return NextResponse.json(data);
      }
    } catch {}

    // 2. Query Local Database for Authenticated User
    if (session?.userId) {
      const roadmap = await prisma.roadmap.findFirst({
        where: { userId: session.userId },
        include: {
          items: {
            orderBy: { month: 'asc' },
          },
          career: true,
        },
        orderBy: { updatedAt: 'desc' },
      });

      if (roadmap) {
        const completedItems = roadmap.items.filter((i) => i.isCompleted).length;
        const totalItems = roadmap.items.length || 1;
        const progress = Math.round((completedItems / totalItems) * 100);
        const careerTitle = roadmap.career?.title || roadmap.title;

        return NextResponse.json({
          id: roadmap.id,
          career_title: careerTitle,
          career_slug: roadmap.career?.slug || careerTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          progress_percent: progress,
          duration_weeks: totalItems * 4,
          current_phase: 'Active Learning Curriculum',
          phases: roadmap.items.map((item, idx) => ({
            id: item.id,
            title: item.title,
            description: item.description,
            month: item.month || idx + 1,
            is_completed: item.isCompleted,
            resources: item.tasks,
          })),
        });
      }
    }

    // 3. Real Empty State: User has not generated a roadmap yet
    return NextResponse.json(null, { status: 404 });
  } catch (err) {
    console.error('Active roadmap error:', err);
    return NextResponse.json({ error: 'Failed to retrieve active roadmap.' }, { status: 500 });
  }
}

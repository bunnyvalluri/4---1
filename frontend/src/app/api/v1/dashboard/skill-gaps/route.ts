import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    const authHeader = req.headers.get('authorization') || '';

    // 1. Try FastAPI endpoint
    try {
      const fastApiRes = await fetch(`${BACKEND_URL}/api/v1/dashboard/skill-gaps`, {
        headers: authHeader ? { Authorization: authHeader } : {},
        cache: 'no-store',
      });
      if (fastApiRes.ok) {
        const data = await fastApiRes.json();
        return NextResponse.json(data);
      }
    } catch {}

    // 2. Database query for candidate's actual skill gaps
    if (session?.userId) {
      const gaps = await prisma.skillGap.findMany({
        where: { userId: session.userId },
        include: { skill: true },
        take: 10,
        orderBy: { priority: 'asc' },
      });

      if (gaps && gaps.length > 0) {
        return NextResponse.json(
          gaps.map((g) => {
            const gapVal = Math.max(0, g.requiredProficiency - g.currentProficiency);
            return {
              id: g.id,
              skill: g.skill.name,
              category: g.skill.category,
              current_proficiency: g.currentProficiency,
              required_proficiency: g.requiredProficiency,
              gap: gapVal,
              priority: g.gapSeverity || (gapVal >= 3 ? 'Critical' : gapVal >= 2 ? 'High' : 'Medium'),
            };
          })
        );
      }
    }

    // Real empty state
    return NextResponse.json([]);
  } catch (error) {
    console.error('Skill gaps error:', error);
    return NextResponse.json([]);
  }
}

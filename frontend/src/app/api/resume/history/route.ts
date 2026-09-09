import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    let userId = 'test_user_rahul';
    try {
      const session = await requireAuth(req);
      if (session?.userId) {
        userId = session.userId;
      }
    } catch {
      // Guest candidate session fallback
    }

    const history = await prisma.resumeAnalysis.findMany({
      where: {
        OR: [
          { userId },
          { userId: 'test_user_rahul' },
        ],
      },
      include: { career: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ history: history || [] });
  } catch (error) {
    console.error('Resume history error:', error);
    return NextResponse.json({ history: [] });
  }
}

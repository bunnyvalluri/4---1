import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth(req);

    const history = await prisma.resumeAnalysis.findMany({
      where: { userId: session.userId },
      include: { career: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({ history });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Resume history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    // 1. Try FastAPI endpoint
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/assessments/questions`, {
        headers,
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch {}

    // 2. Query Local Database for real questions (strictly omit correct answers)
    const questions = await prisma.aptitudeQuestion.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        category: true,
        question: true,
        options: true,
        difficulty: true,
      },
    });

    return NextResponse.json(questions);
  } catch (err) {
    console.error('Questions error:', err);
    return NextResponse.json({ error: 'Failed to load assessment questions.' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const questions = await prisma.aptitudeQuestion.findMany({
      where: category ? { category: category as any } : undefined,
      select: {
        id: true,
        category: true,
        question: true,
        options: true,
        difficulty: true,
        // Do NOT expose correctOption or explanation before test submission!
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Questions GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

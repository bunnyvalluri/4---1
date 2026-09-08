import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSanitizedQuestions } from '@/lib/assessmentFallback';

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
      },
      orderBy: { id: 'asc' },
    });

    if (questions && questions.length > 0) {
      return NextResponse.json({ questions });
    }
  } catch (error) {
    // Database connection error, fallback gracefully
  }

  return NextResponse.json({ questions: getSanitizedQuestions() });
}

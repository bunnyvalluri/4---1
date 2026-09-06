import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { SubmitAptitudeSchema } from '@/lib/types';
import { AptitudeCategory } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth(req);
    const body = await req.json();
    const parsed = SubmitAptitudeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid assessment submission' }, { status: 400 });
    }

    const { answers } = parsed.data; // { questionId: selectedOptionNumber }
    const questionIds = Object.keys(answers);

    if (questionIds.length === 0) {
      return NextResponse.json({ error: 'No answers provided' }, { status: 400 });
    }

    // Fetch all corresponding questions with correct answers
    const questions = await prisma.aptitudeQuestion.findMany({
      where: { id: { in: questionIds } },
    });

    let correctCount = 0;
    const totalQuestions = questions.length;

    // Track per-category score
    const categoryStats: Record<
      string,
      { total: number; correct: number; percentage: number }
    > = {
      LOGICAL: { total: 0, correct: 0, percentage: 0 },
      QUANTITATIVE: { total: 0, correct: 0, percentage: 0 },
      VERBAL: { total: 0, correct: 0, percentage: 0 },
      ANALYTICAL: { total: 0, correct: 0, percentage: 0 },
      PROBLEM_SOLVING: { total: 0, correct: 0, percentage: 0 },
    };

    const reviewItems: {
      questionId: string;
      question: string;
      category: string;
      userAnswer: number;
      correctOption: number;
      isCorrect: boolean;
      explanation: string;
    }[] = [];

    for (const q of questions) {
      const userChoice = answers[q.id];
      const isCorrect = userChoice === q.correctOption;

      if (!categoryStats[q.category]) {
        categoryStats[q.category] = { total: 0, correct: 0, percentage: 0 };
      }

      categoryStats[q.category].total += 1;
      if (isCorrect) {
        correctCount += 1;
        categoryStats[q.category].correct += 1;
      }

      reviewItems.push({
        questionId: q.id,
        question: q.question,
        category: q.category,
        userAnswer: userChoice,
        correctOption: q.correctOption,
        isCorrect,
        explanation: q.explanation,
      });
    }

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    for (const [cat, stats] of Object.entries(categoryStats)) {
      if (stats.total > 0) {
        stats.percentage = Math.round((stats.correct / stats.total) * 100);
        if (stats.percentage >= 70) {
          strengths.push(cat);
        } else if (stats.percentage < 60) {
          weaknesses.push(cat);
        }
      }
    }

    const overallPercentage = Math.round((correctCount / totalQuestions) * 100);

    // Persist attempt to database
    const attempt = await prisma.aptitudeAttempt.create({
      data: {
        userId: session.userId,
        score: overallPercentage,
        totalQuestions,
        correctCount,
        categoryScores: categoryStats as any,
        strengths,
        weaknesses,
      },
    });

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      score: overallPercentage,
      correctCount,
      totalQuestions,
      categoryScores: categoryStats,
      strengths,
      weaknesses,
      review: reviewItems,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Assessment submit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

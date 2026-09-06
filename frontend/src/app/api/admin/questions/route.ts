import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const questions = await prisma.aptitudeQuestion.findMany({
      where: category ? { category: category as any } : undefined,
      orderBy: { id: 'asc' },
    });

    return NextResponse.json({ questions });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const body = await req.json();
    const { category, question, options, correctOption, explanation, difficulty } = body;

    if (!category || !question || !options || correctOption === undefined) {
      return NextResponse.json({ error: 'Category, question, options, and correctOption are required' }, { status: 400 });
    }

    const newQuestion = await prisma.aptitudeQuestion.create({
      data: {
        category,
        question,
        options,
        correctOption: Number(correctOption),
        explanation: explanation || '',
        difficulty: difficulty || 'MEDIUM',
      },
    });

    return NextResponse.json({ success: true, question: newQuestion });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAuth(req, 'ADMIN');
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Question ID is required' }, { status: 400 });
    }

    await prisma.aptitudeQuestion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

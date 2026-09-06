import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const slug = searchParams.get('slug');

    if (slug) {
      const career = await prisma.career.findUnique({
        where: { slug },
        include: {
          skills: {
            include: { skill: true },
            orderBy: [{ isRequired: 'desc' }, { weight: 'desc' }],
          },
          projectSuggestions: true,
        },
      });

      if (!career) {
        return NextResponse.json({ error: 'Career not found' }, { status: 404 });
      }

      return NextResponse.json({ career });
    }

    const careers = await prisma.career.findMany({
      where: category ? { category } : undefined,
      include: {
        skills: {
          include: { skill: true },
          take: 5,
        },
      },
      orderBy: { title: 'asc' },
    });

    return NextResponse.json({ careers });
  } catch (error) {
    console.error('Careers GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const careersParam = searchParams.get('careers');

  if (!careersParam) {
    return NextResponse.json({
      careers: [],
      best_overall: '',
      lowest_gap: '',
      best_interest_fit: '',
    });
  }

  const careerIds = careersParam.split(',').map((s) => s.trim()).filter(Boolean);
  if (careerIds.length === 0) {
    return NextResponse.json({
      careers: [],
      best_overall: '',
      lowest_gap: '',
      best_interest_fit: '',
    });
  }

  try {
    const careers = await prisma.career.findMany({
      where: {
        OR: [
          { id: { in: careerIds } },
          { slug: { in: careerIds } },
        ],
      },
      include: {
        skills: {
          include: { skill: true },
        },
      },
    });

    if (careers.length === 0) {
      return NextResponse.json({
        careers: [],
        best_overall: '',
        lowest_gap: '',
        best_interest_fit: '',
      });
    }

    const compared = careers.map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      salary_range: c.salaryRange,
      demand_level: c.demandLevel,
      required_skills_count: c.skills.length,
      top_skills: c.skills.slice(0, 5).map((cs) => cs.skill.name),
    }));

    return NextResponse.json({
      careers: compared,
      best_overall: compared[0]?.title || '',
      lowest_gap: compared[0]?.title || '',
      best_interest_fit: compared[0]?.title || '',
    });
  } catch (err) {
    console.error('Comparison error:', err);
    return NextResponse.json({
      careers: [],
      best_overall: '',
      lowest_gap: '',
      best_interest_fit: '',
    });
  }
}

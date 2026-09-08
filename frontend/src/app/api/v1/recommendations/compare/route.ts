import { NextRequest, NextResponse } from 'next/server';
import { buildComparisonMatrix } from '@/lib/recommendationsFallback';

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
  const comparison = buildComparisonMatrix(careerIds);
  return NextResponse.json(comparison);
}

import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_SKILL_GAPS } from '@/lib/recommendationsFallback';

export async function GET(req: NextRequest) {
  return NextResponse.json(FALLBACK_SKILL_GAPS);
}

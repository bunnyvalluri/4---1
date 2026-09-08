import { NextRequest, NextResponse } from 'next/server';
import { FALLBACK_STATUS } from '@/lib/recommendationsFallback';

export async function GET(req: NextRequest) {
  return NextResponse.json(FALLBACK_STATUS);
}

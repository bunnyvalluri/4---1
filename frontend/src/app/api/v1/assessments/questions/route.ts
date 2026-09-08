import { NextRequest, NextResponse } from 'next/server';
import { getSanitizedQuestions } from '@/lib/assessmentFallback';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const headers: Record<string, string> = {};
    if (authHeader) headers['Authorization'] = authHeader;

    const res = await fetch(`${FASTAPI_URL}/api/v1/assessments/questions`, {
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // FastAPI unavailable or timed out, serve fallback questions
  }

  return NextResponse.json(getSanitizedQuestions());
}

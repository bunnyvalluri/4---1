import { NextRequest, NextResponse } from 'next/server';
import { getFallbackRoadmap } from '@/lib/roadmapFallback';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer test-sandbox-token';
    const res = await fetch(`${FASTAPI_URL}/api/v1/roadmaps/active`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data) return NextResponse.json(data);
    }
  } catch (err) {
    // Graceful fallback to rich roadmap demonstration
  }

  return NextResponse.json(getFallbackRoadmap());
}

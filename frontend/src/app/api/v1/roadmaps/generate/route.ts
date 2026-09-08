import { NextRequest, NextResponse } from 'next/server';
import { getFallbackRoadmap } from '@/lib/roadmapFallback';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || 'Bearer test-sandbox-token';
    const body = await req.json();

    const res = await fetch(`${FASTAPI_URL}/api/v1/roadmaps/generate`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(errData || { error: 'Failed to generate roadmap' }, { status: res.status });
  } catch (err) {
    return NextResponse.json(getFallbackRoadmap());
  }
}
